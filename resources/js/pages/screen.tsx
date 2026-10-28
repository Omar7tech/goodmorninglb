import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType } from 'react';

import { ProductDialog } from '@/components/menu/product-dialog';
import { ClassicBoard } from '@/components/screen/classic-board';
import { PolaroidBoard } from '@/components/screen/polaroid-board';
import {
    ScreenControls,
    useLayoutMode,
    useWakeLock,
} from '@/components/screen/screen-kit';
import type { BoardProps } from '@/components/screen/screen-kit';
import { ShowcaseBoard } from '@/components/screen/showcase-board';
import { SpotlightBoard } from '@/components/screen/spotlight-board';
import { CartProvider } from '@/contexts/cart-context';
import { useUppercaseCategoryTitles } from '@/lib/title-case';
import type {
    Addon,
    Category,
    CounterScreen,
    Product,
    ScreenTheme,
    Slide,
} from '@/types';

type ScreenProps = {
    categories: Category[];
    slides: Slide[];
    screen: CounterScreen;
};

/**
 * How long an open dish stays open with nobody touching it, before the board
 * closes it and goes back to turning through the menu on its own.
 */
const SHEET_IDLE_MS = 45_000;

/** The least time between two touches counted as separate, for scrolling. */
const TOUCH_THROTTLE_MS = 400;

/** Each theme is its own way of drawing the board. */
const BOARDS: Record<ScreenTheme, ComponentType<BoardProps>> = {
    classic: ClassicBoard,
    spotlight: SpotlightBoard,
    showcase: ShowcaseBoard,
    polaroid: PolaroidBoard,
};

/**
 * The dine-in menu as a board for a tablet at the counter.
 *
 * One screen, nothing to sign into and nothing to order. Left alone it turns
 * to the next category every few seconds, a bar filling as the time runs out;
 * the moment anyone touches it, it stops and waits for them, and starts again
 * once they have walked away. A dish opens its sheet, as on the phone.
 *
 * This page is the behaviour and nothing else — which category is up, when to
 * turn, who is using it, which dish is open. How the board looks is the
 * theme's business, chosen in the dashboard.
 */
export default function Screen(props: ScreenProps) {
    return (
        <CartProvider>
            <ScreenEngine {...props} />
        </CartProvider>
    );
}

function ScreenEngine({ categories, slides, screen }: ScreenProps) {
    const uppercase = useUppercaseCategoryTitles();
    const rotateMs = screen.rotateSeconds * 1000;
    const resumeMs = screen.resumeSeconds * 1000;
    const Board = BOARDS[screen.theme] ?? ClassicBoard;

    const [activeIndex, setActiveIndex] = useState(0);
    const active = categories[activeIndex] ?? null;

    /**
     * Bumped on every touch. It is what keeps an open sheet from closing on
     * someone still reading it.
     */
    const [cycle, setCycle] = useState(0);
    /**
     * Set by a touch and cleared once the screen has gone untouched for the
     * resume time: while it is set the board waits for the person using it
     * rather than turning the menu out from under them.
     */
    const [holding, setHolding] = useState(false);
    const lastTouch = useRef(0);
    const holdTimer = useRef<number | undefined>(undefined);

    const touch = useCallback((): void => {
        const now = Date.now();

        if (now - lastTouch.current < TOUCH_THROTTLE_MS) {
            return;
        }

        lastTouch.current = now;
        setCycle((value) => value + 1);
        setHolding(true);
        window.clearTimeout(holdTimer.current);
        holdTimer.current = window.setTimeout(
            () => setHolding(false),
            resumeMs,
        );
    }, [resumeMs]);

    useEffect(() => () => window.clearTimeout(holdTimer.current), []);

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

    const scrollRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLSpanElement>(null);

    const showCategory = useCallback((index: number): void => {
        setActiveIndex(index);
        scrollRef.current?.scrollTo({ top: 0 });
    }, []);

    const idle = !holding && !productOpen;

    // Turning on its own only when the shop wants it, nobody is using the
    // screen, and no dish is open on it.
    const turning = screen.autoRotate && idle && categories.length > 1;

    // The countdown: once a full stretch passes, the next category.
    useEffect(() => {
        if (!turning) {
            return;
        }

        const timer = window.setTimeout(() => {
            showCategory((activeIndex + 1) % categories.length);
        }, rotateMs);

        return () => window.clearTimeout(timer);
    }, [activeIndex, categories.length, rotateMs, showCategory, turning]);

    // The theme's countdown bar, run off the same stretch. Driven by the
    // animation API rather than state, so a bar filling ten times a second
    // doesn't redraw the whole board ten times a second.
    useEffect(() => {
        const bar = progressRef.current;

        if (bar === null) {
            return;
        }

        if (!turning) {
            bar.style.transform = 'scaleX(0)';

            return;
        }

        const animation = bar.animate(
            [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
            { duration: rotateMs, easing: 'linear', fill: 'forwards' },
        );

        return () => animation.cancel();
    }, [activeIndex, rotateMs, turning, portrait]);

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

    /** Extras come from the dish's own category, wherever it was opened. */
    const addonsByProduct = useMemo(() => {
        const lookup = new Map<number, Addon[]>();

        for (const category of categories) {
            for (const product of category.products) {
                lookup.set(product.id, category.addons);
            }
        }

        return lookup;
    }, [categories]);

    const openDish = useCallback(
        (
            product: Product,
            variantIndex: number | null,
            addons?: Addon[],
        ): void => {
            setOpenProduct(product);
            setOpenVariantIndex(variantIndex);
            setOpenAddons(addons ?? addonsByProduct.get(product.id) ?? []);
            setProductOpen(true);
        },
        [addonsByProduct],
    );

    const openSlide = useCallback(
        (slide: Slide): void => {
            if (slide.product === null) {
                return;
            }

            openDish(
                slide.product,
                slide.product.variants.length > 0 ? 0 : null,
                slide.addons,
            );
        },
        [openDish],
    );

    const controls = useCallback(
        (tone: 'dark' | 'light') => (
            <ScreenControls layout={layout} tone={tone} />
        ),
        [layout],
    );

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
                className="fixed inset-0 overflow-hidden bg-background text-foreground select-none"
            >
                <Board
                    categories={categories}
                    activeIndex={activeIndex}
                    active={active}
                    onSelectCategory={showCategory}
                    onOpenDish={openDish}
                    progressRef={progressRef}
                    scrollRef={scrollRef}
                    portrait={portrait}
                    uppercase={uppercase}
                    columns={screen.columns}
                    idle={idle}
                    slides={slides}
                    showSlider={screen.showSlider}
                    onOpenSlide={openSlide}
                    controls={controls}
                />
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
