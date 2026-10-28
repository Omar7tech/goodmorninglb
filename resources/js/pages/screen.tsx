import { Head } from '@inertiajs/react';
import {
    Maximize,
    Minimize,
    MonitorSmartphone,
    RectangleHorizontal,
    RectangleVertical,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { GoodMorningLogo } from '@/components/good-morning-logo';
import { CategoryArt } from '@/components/menu/category-art';
import { MenuSlider } from '@/components/menu/menu-slider';
import { ProductDialog } from '@/components/menu/product-dialog';
import { ProductMinimal } from '@/components/menu/product-minimal';
import { CartProvider } from '@/contexts/cart-context';
import { useUppercaseCategoryTitles } from '@/lib/title-case';
import { cn } from '@/lib/utils';
import type { Addon, Category, Product, Slide } from '@/types';

type ScreenProps = {
    categories: Category[];
    slides: Slide[];
    /** How long a category stays up while nobody is touching the screen. */
    rotateSeconds: number;
};

/** How the board is laid out: following the tablet, or held one way. */
type LayoutMode = 'auto' | 'landscape' | 'portrait';

const LAYOUT_MODES: readonly LayoutMode[] = ['auto', 'landscape', 'portrait'];

/** Where the chosen layout is remembered, on this tablet only. */
const LAYOUT_STORAGE_KEY = 'good-morning:screen-layout';

/**
 * How long an open dish stays open with nobody touching it, before the board
 * closes it and goes back to turning through the menu on its own.
 */
const SHEET_IDLE_MS = 45_000;

/** The least time between two touches counted as separate, for scrolling. */
const TOUCH_THROTTLE_MS = 400;

/**
 * The dine-in menu as a board for a tablet at the counter.
 *
 * One screen, nothing to sign into and nothing to order: the categories down
 * the side (or across the top, held upright), the open one's dishes as plain
 * photo cards, and the carousel over them. Left alone it turns to the next
 * category every few seconds, a bar under the open one filling as the time
 * runs out; the moment anyone touches it, it stops and waits for them, and
 * starts again once they have walked away.
 *
 * Everything else works as on the phone — a dish opens its sheet, the
 * carousel opens its dish — and the board keeps the tablet's screen awake.
 */
export default function Screen(props: ScreenProps) {
    return (
        <CartProvider>
            <ScreenBoard {...props} />
        </CartProvider>
    );
}

function ScreenBoard({ categories, slides, rotateSeconds }: ScreenProps) {
    const uppercase = useUppercaseCategoryTitles();
    const rotateMs = rotateSeconds * 1000;

    const [activeIndex, setActiveIndex] = useState(0);
    const active = categories[activeIndex] ?? null;

    /**
     * Bumped on every touch: it restarts the countdown, so the board only
     * turns once a full stretch has passed with nobody using it.
     */
    const [cycle, setCycle] = useState(0);
    const lastTouch = useRef(0);

    const touch = useCallback((): void => {
        const now = Date.now();

        if (now - lastTouch.current < TOUCH_THROTTLE_MS) {
            return;
        }

        lastTouch.current = now;
        setCycle((value) => value + 1);
    }, []);

    // The open dish, kept after closing so the sheet has something to draw
    // while it animates out.
    const [openProduct, setOpenProduct] = useState<Product | null>(null);
    const [openVariantIndex, setOpenVariantIndex] = useState<number | null>(
        null,
    );
    const [openAddons, setOpenAddons] = useState<Addon[]>([]);
    const [productOpen, setProductOpen] = useState(false);

    const layout = useLayoutMode();
    const portrait = layout.resolved === 'portrait';

    const mainRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLSpanElement>(null);

    const showCategory = useCallback((index: number): void => {
        setActiveIndex(index);
        mainRef.current?.scrollTo({ top: 0 });
    }, []);

    // The countdown: once a full stretch passes untouched, the next category.
    // Held while a dish is open — someone is reading it.
    useEffect(() => {
        if (productOpen || categories.length < 2) {
            return;
        }

        const timer = window.setTimeout(() => {
            showCategory((activeIndex + 1) % categories.length);
        }, rotateMs);

        return () => window.clearTimeout(timer);
    }, [
        activeIndex,
        categories.length,
        cycle,
        productOpen,
        rotateMs,
        showCategory,
    ]);

    // The bar under the open category, run off the same stretch. Driven by
    // the animation API rather than state, so a bar filling ten times a
    // second doesn't redraw the whole board ten times a second.
    useEffect(() => {
        const bar = progressRef.current;

        if (bar === null) {
            return;
        }

        if (productOpen || categories.length < 2) {
            bar.style.transform = 'scaleX(0)';

            return;
        }

        const animation = bar.animate(
            [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
            { duration: rotateMs, easing: 'linear', fill: 'forwards' },
        );

        return () => animation.cancel();
    }, [activeIndex, categories.length, cycle, productOpen, rotateMs]);

    // An open dish left on the screen closes itself, so the board doesn't sit
    // on one sheet all afternoon after the customer has gone.
    useEffect(() => {
        if (!productOpen) {
            return;
        }

        const timer = window.setTimeout(
            () => setProductOpen(false),
            SHEET_IDLE_MS,
        );

        return () => window.clearTimeout(timer);
    }, [productOpen, cycle]);

    useWakeLock();

    const openDish = (
        product: Product,
        variantIndex: number | null,
        addons: Addon[],
    ): void => {
        setOpenProduct(product);
        setOpenVariantIndex(variantIndex);
        setOpenAddons(addons);
        setProductOpen(true);
    };

    const openSlide = (slide: Slide): void => {
        if (slide.product === null) {
            return;
        }

        openDish(
            slide.product,
            slide.product.variants.length > 0 ? 0 : null,
            slide.addons,
        );
    };

    return (
        <>
            <Head title="Counter Screen" />

            {/* Every way a hand can tell the board someone is there. Captured,
                so a touch anywhere counts before whatever it lands on acts.
                Not scrolling itself: the board scrolls its own lists as it
                turns, and that is not a person. A finger dragging a list
                presses first, which is what counts. */}
            <div
                onPointerDownCapture={touch}
                onWheelCapture={touch}
                onKeyDownCapture={touch}
                className={cn(
                    'fixed inset-0 flex overflow-hidden bg-background text-foreground select-none',
                    portrait ? 'flex-col' : 'flex-row',
                )}
            >
                <aside
                    className={cn(
                        'flex shrink-0 bg-surface',
                        portrait
                            ? 'flex-col gap-4 border-b border-border px-6 pt-5 pb-4'
                            : 'w-64 flex-col gap-5 border-r border-border px-4 py-5 xl:w-72',
                    )}
                >
                    {/* The logo, with the two quiet controls tucked into the
                        far corner from it. */}
                    <div className="flex items-start justify-between gap-4">
                        <GoodMorningLogo
                            className={cn(
                                'drop-shadow-sm',
                                portrait ? 'w-28' : 'w-32',
                            )}
                        />

                        <ScreenControls layout={layout} />
                    </div>

                    <CategoryList
                        categories={categories}
                        activeIndex={activeIndex}
                        portrait={portrait}
                        uppercase={uppercase}
                        progressRef={progressRef}
                        onSelect={showCategory}
                    />
                </aside>

                {/* The carousel and the open category's name hold still at
                    the top; only the dishes under them scroll, so whoever is
                    browsing never loses which category they are in. */}
                <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <div
                        className={cn(
                            'flex shrink-0 flex-col gap-5',
                            portrait ? 'px-6 pt-5' : 'px-8 pt-6',
                        )}
                    >
                        {slides.length > 0 && (
                            <MenuSlider
                                slides={slides}
                                onOpen={openSlide}
                                paused={productOpen}
                                compact
                            />
                        )}

                        {active !== null && (
                            // Keyed by the category, so each turn of the
                            // board fades the new one in rather than swapping
                            // it under the reader's eye.
                            <header
                                key={active.id}
                                className="flex animate-in items-end justify-between gap-6 border-b border-border pb-4 duration-500 fade-in motion-reduce:animate-none"
                            >
                                <div className="flex min-w-0 flex-col gap-1.5">
                                    <h1
                                        className={cn(
                                            'font-heading text-4xl leading-none text-primary xl:text-5xl',
                                            uppercase && 'uppercase',
                                        )}
                                    >
                                        {active.name}
                                    </h1>
                                    {active.description && (
                                        <p className="truncate text-sm text-muted-foreground">
                                            {active.description}
                                        </p>
                                    )}
                                </div>

                                <span className="shrink-0 text-sm font-medium text-muted-foreground tabular-nums">
                                    {activeIndex + 1} / {categories.length}
                                </span>
                            </header>
                        )}
                    </div>

                    <div
                        ref={mainRef}
                        className={cn(
                            'no-scrollbar min-h-0 flex-1 overflow-y-auto',
                            portrait ? 'px-6 pt-5 pb-8' : 'px-8 pt-5 pb-8',
                        )}
                    >
                        {active !== null && (
                            <ul
                                key={active.id}
                                className="grid animate-in grid-cols-5 gap-x-5 gap-y-7 duration-500 fade-in slide-in-from-bottom-3 motion-reduce:animate-none"
                            >
                                {active.products.map((product) => (
                                    <li key={product.id}>
                                        <ProductMinimal
                                            product={product}
                                            quantity={0}
                                            onOpen={(item, variantIndex) =>
                                                openDish(
                                                    item,
                                                    variantIndex,
                                                    active.addons,
                                                )
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </main>
            </div>

            <ProductDialog
                product={openProduct}
                addons={openAddons}
                initialVariantIndex={openVariantIndex}
                open={productOpen}
                onOpenChange={setProductOpen}
            />
        </>
    );
}

/**
 * The categories, as a column down the side or a strip across the top. The
 * open one is filled in green, with the countdown filling a bar along its
 * foot, and it is kept in view as the board turns.
 */
function CategoryList({
    categories,
    activeIndex,
    portrait,
    uppercase,
    progressRef,
    onSelect,
}: {
    categories: readonly Category[];
    activeIndex: number;
    portrait: boolean;
    uppercase: boolean;
    progressRef: React.RefObject<HTMLSpanElement | null>;
    onSelect: (index: number) => void;
}) {
    const listRef = useRef<HTMLUListElement>(null);

    // The open category brought into the middle of the list, moving the list
    // alone rather than the page.
    useEffect(() => {
        const list = listRef.current;
        const item = list?.children[activeIndex] as HTMLElement | undefined;

        if (list === null || item === undefined) {
            return;
        }

        if (portrait) {
            list.scrollTo({
                left:
                    item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2,
                behavior: 'smooth',
            });

            return;
        }

        list.scrollTo({
            top: item.offsetTop - (list.clientHeight - item.offsetHeight) / 2,
            behavior: 'smooth',
        });
    }, [activeIndex, portrait]);

    return (
        <ul
            ref={listRef}
            className={cn(
                'relative no-scrollbar flex gap-1',
                portrait
                    ? '-mx-6 overflow-x-auto px-6'
                    : 'min-h-0 flex-1 flex-col overflow-y-auto',
            )}
        >
            {categories.map((category, index) => {
                const isActive = index === activeIndex;

                return (
                    <li key={category.id} className="shrink-0">
                        <button
                            type="button"
                            onClick={() => onSelect(index)}
                            aria-pressed={isActive}
                            className={cn(
                                'relative flex items-center gap-3 overflow-hidden rounded-2xl text-left transition-colors duration-300 ease-out focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                                portrait
                                    ? 'py-1.5 pr-4 pl-1.5'
                                    : 'w-full px-2 py-1.5',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-foreground hover:bg-primary/10',
                            )}
                        >
                            {/* Always on the green: the icons are drawn
                                light, to stand on it as they do on the
                                category boxes, and on anything paler they
                                all but vanish. The open one is ringed in
                                cream to stand off its own green row. */}
                            <span
                                className={cn(
                                    'flex size-11 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm transition-shadow duration-300',
                                    isActive && 'ring-3 ring-cream/70',
                                )}
                            >
                                <CategoryArt
                                    category={category}
                                    className="max-h-[78%]"
                                    logoClassName="w-[76%]"
                                    imageClassName="aspect-square w-[74%]"
                                />
                            </span>

                            <span className="flex min-w-0 flex-col">
                                <span
                                    className={cn(
                                        'truncate font-heading text-lg leading-tight',
                                        uppercase && 'uppercase',
                                    )}
                                >
                                    {category.name}
                                </span>
                                <span
                                    className={cn(
                                        'text-xs tabular-nums',
                                        isActive
                                            ? 'text-primary-foreground/75'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {category.products.length === 1
                                        ? '1 item'
                                        : `${category.products.length} items`}
                                </span>
                            </span>

                            {/* The countdown to the next category, filling
                                along the open one's foot. */}
                            {isActive && (
                                <span
                                    aria-hidden
                                    className="absolute inset-x-0 bottom-0 h-1 bg-primary-foreground/15"
                                >
                                    <span
                                        ref={progressRef}
                                        className="block h-full origin-left scale-x-0 bg-[#F4C338]"
                                    />
                                </span>
                            )}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

/** The layout switch and the full-screen button, quiet in the corner. */
function ScreenControls({
    layout,
}: {
    layout: ReturnType<typeof useLayoutMode>;
}) {
    const fullscreen = useFullscreen();

    const LayoutIcon = {
        auto: MonitorSmartphone,
        landscape: RectangleHorizontal,
        portrait: RectangleVertical,
    }[layout.mode];

    return (
        <div className="flex shrink-0 items-center gap-1">
            <button
                type="button"
                onClick={layout.next}
                aria-label={`Layout: ${layout.mode}. Change layout`}
                title={`Layout: ${layout.mode}`}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
                <LayoutIcon className="size-4.5" />
            </button>

            {fullscreen.supported && (
                <button
                    type="button"
                    onClick={fullscreen.toggle}
                    aria-label={
                        fullscreen.active ? 'Leave full screen' : 'Full screen'
                    }
                    title={
                        fullscreen.active ? 'Leave full screen' : 'Full screen'
                    }
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    {fullscreen.active ? (
                        <Minimize className="size-4.5" />
                    ) : (
                        <Maximize className="size-4.5" />
                    )}
                </button>
            )}
        </div>
    );
}

/**
 * The board's layout. Auto follows the way the tablet is held; the other two
 * hold it one way, for a tablet in a stand that reports its orientation
 * wrongly. The choice is remembered on the tablet.
 */
function useLayoutMode() {
    const [mode, setMode] = useState<LayoutMode>(() => {
        try {
            const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);

            return LAYOUT_MODES.includes(stored as LayoutMode)
                ? (stored as LayoutMode)
                : 'auto';
        } catch {
            return 'auto';
        }
    });

    const [deviceIsPortrait, setDeviceIsPortrait] = useState(
        () => window.matchMedia('(orientation: portrait)').matches,
    );

    useEffect(() => {
        const query = window.matchMedia('(orientation: portrait)');
        const update = (): void => setDeviceIsPortrait(query.matches);

        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    const next = useCallback((): void => {
        setMode((current) => {
            const following =
                LAYOUT_MODES[
                    (LAYOUT_MODES.indexOf(current) + 1) % LAYOUT_MODES.length
                ];

            try {
                window.localStorage.setItem(LAYOUT_STORAGE_KEY, following);
            } catch {
                // Private browsing: the choice lasts until the page reloads.
            }

            return following;
        });
    }, []);

    const resolved: Exclude<LayoutMode, 'auto'> =
        mode === 'auto' ? (deviceIsPortrait ? 'portrait' : 'landscape') : mode;

    return useMemo(() => ({ mode, resolved, next }), [mode, resolved, next]);
}

/** Whether the board fills the screen, and a way to make it. */
function useFullscreen() {
    const [active, setActive] = useState(
        () => document.fullscreenElement !== null,
    );

    useEffect(() => {
        const update = (): void =>
            setActive(document.fullscreenElement !== null);

        document.addEventListener('fullscreenchange', update);

        return () => document.removeEventListener('fullscreenchange', update);
    }, []);

    const toggle = useCallback((): void => {
        if (document.fullscreenElement !== null) {
            void document.exitFullscreen().catch(() => {});

            return;
        }

        void document.documentElement.requestFullscreen().catch(() => {});
    }, []);

    return {
        // Older iPads have no full-screen API for pages; there the button is
        // left out and "Add to Home Screen" does the job instead.
        supported: document.fullscreenEnabled === true,
        active,
        toggle,
    };
}

/**
 * Keeps the tablet's screen from dimming and locking while the board is up.
 * The browser lets the lock go whenever the page is hidden, so it is taken
 * again each time the page comes back. Quietly does nothing where the browser
 * has no screen wake lock.
 */
function useWakeLock(): void {
    useEffect(() => {
        if (!('wakeLock' in navigator)) {
            return;
        }

        let lock: WakeLockSentinel | null = null;

        const request = (): void => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            navigator.wakeLock
                .request('screen')
                .then((sentinel) => {
                    lock = sentinel;
                })
                .catch(() => {});
        };

        request();
        document.addEventListener('visibilitychange', request);

        return () => {
            document.removeEventListener('visibilitychange', request);
            void lock?.release().catch(() => {});
        };
    }, []);
}
