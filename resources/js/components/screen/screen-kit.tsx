import {
    Maximize,
    Minimize,
    MonitorSmartphone,
    RectangleHorizontal,
    RectangleVertical,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';

import { GoodMorningLogo } from '@/components/good-morning-logo';
import { usePricing } from '@/lib/use-pricing';
import { cn } from '@/lib/utils';
import type { Category, Product, Slide } from '@/types';

/**
 * What every counter-screen theme is handed. The screen page owns the
 * behaviour — which category is up, when to turn, who is touching it — and a
 * theme only decides how that looks.
 */
export type BoardProps = {
    categories: readonly Category[];
    activeIndex: number;
    /** The category up now; null only on a menu with no categories at all. */
    active: Category | null;
    onSelectCategory: (index: number) => void;
    /** Opens a dish's sheet, on the size given. */
    onOpenDish: (product: Product, variantIndex: number | null) => void;
    /**
     * Hung on the theme's countdown bar: the page fills it as the time on the
     * category runs out. Every theme draws exactly one.
     */
    progressRef: RefObject<HTMLSpanElement | null>;
    /** Hung on whatever scrolls the dishes, so a new category starts at the top. */
    scrollRef: RefObject<HTMLDivElement | null>;
    portrait: boolean;
    uppercase: boolean;
    /** Dishes to a row, for the themes laid out in a grid. */
    columns: number;
    /** True while nobody is using the screen and no dish is open. */
    idle: boolean;
    /** Whether the shop wants the screen to move on by itself at all. */
    autoRotate: boolean;
    slides: readonly Slide[];
    showSlider: boolean;
    onOpenSlide: (slide: Slide) => void;
    /** The layout and full-screen buttons, for the theme to place. */
    controls: (tone: 'dark' | 'light') => ReactNode;
};

/** How the board is laid out: following the tablet, or held one way. */
export type LayoutMode = 'auto' | 'landscape' | 'portrait';

const LAYOUT_MODES: readonly LayoutMode[] = ['auto', 'landscape', 'portrait'];

/** Where the chosen layout is remembered, on this tablet only. */
const LAYOUT_STORAGE_KEY = 'good-morning:screen-layout';

/** The logo as a cream silhouette, for a dark ground its colours vanish on. */
const LIGHT_LOGO = {
    maskImage: "url('/images/logo.svg')",
    WebkitMaskImage: "url('/images/logo.svg')",
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    aspectRatio: '4193 / 2782',
} satisfies CSSProperties;

/** The Good Morning logo, in its own colours or as a cream silhouette. */
export function BoardLogo({
    light = false,
    className,
}: {
    light?: boolean;
    className?: string;
}) {
    if (light) {
        return (
            <span
                role="img"
                aria-label="Good Morning"
                style={LIGHT_LOGO}
                className={cn('block bg-cream', className)}
            />
        );
    }

    return <GoodMorningLogo className={cn('drop-shadow-sm', className)} />;
}

/**
 * The bar the page fills as the time on a category runs out. Drawn empty;
 * the page animates it.
 */
export function CountdownBar({
    progressRef,
    className,
    fillClassName,
}: {
    progressRef: RefObject<HTMLSpanElement | null>;
    className?: string;
    fillClassName?: string;
}) {
    return (
        <span aria-hidden className={cn('block overflow-hidden', className)}>
            <span
                ref={progressRef}
                className={cn(
                    'block h-full origin-left scale-x-0 bg-[#F4C338]',
                    fillClassName,
                )}
            />
        </span>
    );
}

/**
 * What a dish costs, as the screen quotes it: its own price, or for a dish
 * sold in sizes the cheapest of them, marked "from".
 */
export function useDishPrice(product: Product): {
    label: string;
    from: boolean;
} {
    const pricing = usePricing();

    if (product.variants.length === 0) {
        return {
            label: pricing.usd(product.discountPrice ?? product.price),
            from: false,
        };
    }

    const cheapest = Math.min(
        ...product.variants.map(
            (variant) => variant.discountPrice ?? variant.price,
        ),
    );

    return {
        label: pricing.usd(cheapest),
        from: product.variants.length > 1,
    };
}

/** The size a sheet opens on: the cheapest, matching the price quoted. */
export function cheapestVariantIndex(product: Product): number | null {
    if (product.variants.length === 0) {
        return null;
    }

    return product.variants.reduce(
        (cheapest, variant, index) =>
            (variant.discountPrice ?? variant.price) <
            (product.variants[cheapest].discountPrice ??
                product.variants[cheapest].price)
                ? index
                : cheapest,
        0,
    );
}

/** The layout switch and the full-screen button, quiet in a corner. */
export function ScreenControls({
    layout,
    tone = 'dark',
}: {
    layout: ReturnType<typeof useLayoutMode>;
    /** Light for a dark ground, where the usual grey would be lost. */
    tone?: 'dark' | 'light';
}) {
    const fullscreen = useFullscreen();

    const LayoutIcon = {
        auto: MonitorSmartphone,
        landscape: RectangleHorizontal,
        portrait: RectangleVertical,
    }[layout.mode];

    const button = cn(
        'flex size-9 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none',
        tone === 'light'
            ? 'text-cream/70 hover:bg-cream/15 hover:text-cream focus-visible:ring-cream/50'
            : 'text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-ring/50',
    );

    return (
        <div className="flex shrink-0 items-center gap-1">
            <button
                type="button"
                onClick={layout.next}
                aria-label={`Layout: ${layout.mode}. Change layout`}
                title={`Layout: ${layout.mode}`}
                className={button}
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
                    className={button}
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
export function useLayoutMode() {
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
export function useWakeLock(): void {
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

/**
 * Keeps the open category in view in a list that scrolls on its own, moving
 * the list alone rather than the page.
 */
export function useKeepActiveInView(
    listRef: RefObject<HTMLElement | null>,
    activeIndex: number,
    axis: 'x' | 'y',
): void {
    useEffect(() => {
        const list = listRef.current;
        const item = list?.children[activeIndex] as HTMLElement | undefined;

        if (!list || item === undefined) {
            return;
        }

        if (axis === 'x') {
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
    }, [listRef, activeIndex, axis]);
}
