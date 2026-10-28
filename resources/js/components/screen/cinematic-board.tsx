import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { CategoryArt } from '@/components/menu/category-art';
import { ProductImage } from '@/components/menu/product-image';
import { ProductMinimal } from '@/components/menu/product-minimal';
import {
    BoardLogo,
    CountdownBar,
    cheapestVariantIndex,
    useDishPrice,
    useKeepActiveInView,
} from '@/components/screen/screen-kit';
import type { BoardProps } from '@/components/screen/screen-kit';
import { useUppercaseProductTitles } from '@/lib/title-case';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types';

/** How long each dish's photo holds the picture before the next fades in. */
const SCENE_MS = 5000;

/** How long one photo takes to dissolve into the next. */
const FADE_MS = 1400;

/** How long the slow drift across a photo lasts; longer than it is shown. */
const DRIFT_MS = 9000;

/** Dishes to a row beside the picture, written out whole for Tailwind. */
const COLUMNS: Record<number, string> = {
    2: 'grid-cols-2 gap-x-5 gap-y-6',
    3: 'grid-cols-3 gap-x-5 gap-y-6',
    4: 'grid-cols-4 gap-x-4 gap-y-5',
    5: 'grid-cols-5 gap-x-4 gap-y-5',
};

/**
 * Half the screen is a living picture of the open category: its dishes'
 * photos dissolving one into the next, each drifting slowly closer while it
 * is up, under the category's name set large in cream. A card on the picture
 * names the dish on show and opens it.
 *
 * The other half is the menu to use: the categories as chips across the top
 * and the category's dishes in a grid, the one on show in the picture ringed
 * in the sun's yellow, so the two halves move together.
 *
 * Held upright, the picture takes the top of the screen and the dishes the
 * rest.
 */
export function CinematicBoard({
    categories,
    activeIndex,
    active,
    onSelectCategory,
    onOpenDish,
    progressRef,
    scrollRef,
    portrait,
    uppercase,
    columns,
    idle,
    controls,
}: BoardProps) {
    const products = active?.products ?? [];
    const [scene, setScene] = useState(0);
    const shown = products[scene] ?? null;

    // Each category's picture starts on its first dish.
    useEffect(() => {
        setScene(0);
    }, [active?.id]);

    // The picture moves through the dishes while nobody is using the screen.
    useEffect(() => {
        if (!idle || products.length < 2) {
            return;
        }

        const timer = window.setInterval(() => {
            setScene((index) => (index + 1) % products.length);
        }, SCENE_MS);

        return () => window.clearInterval(timer);
    }, [idle, products.length, active?.id]);

    const chipsRef = useRef<HTMLUListElement>(null);
    useKeepActiveInView(chipsRef, activeIndex, 'x');

    const step = (by: number): void => {
        onSelectCategory(
            (activeIndex + by + categories.length) % categories.length,
        );
    };

    const columnCount = portrait
        ? Math.min(columns, 5)
        : Math.max(2, Math.min(columns - 1, 4));

    return (
        <div
            className={cn(
                'grid size-full overflow-hidden bg-background',
                portrait
                    ? 'grid-rows-[minmax(0,42fr)_minmax(0,58fr)]'
                    : 'grid-cols-[minmax(0,44fr)_minmax(0,56fr)]',
            )}
        >
            {/* The picture. */}
            <section className="relative isolate overflow-hidden bg-[#1d1a16] text-cream">
                {products.map((product, index) => (
                    <Scene
                        key={product.id}
                        product={product}
                        on={index === scene}
                        // Only the photo on show and its neighbours are
                        // loaded: the one fading out, the one up next.
                        mounted={
                            Math.abs(index - scene) <= 1 ||
                            (scene === 0 && index === products.length - 1) ||
                            (scene === products.length - 1 && index === 0)
                        }
                    />
                ))}

                {/* Shades so the words read over any photo, and a wash of the
                    brand green through them. */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/45" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/45 via-transparent to-transparent mix-blend-multiply" />

                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-7">
                    <BoardLogo light className="w-24" />
                    {controls('light')}
                </div>

                {active !== null && (
                    <div
                        key={active.id}
                        className="absolute inset-x-0 bottom-0 flex animate-in flex-col gap-5 p-8 duration-700 fade-in slide-in-from-bottom-4 motion-reduce:animate-none"
                    >
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold tracking-[0.3em] text-[#F4C338] uppercase tabular-nums">
                                {String(activeIndex + 1).padStart(2, '0')} /{' '}
                                {String(categories.length).padStart(2, '0')}
                            </span>
                            <h1
                                className={cn(
                                    'line-clamp-2 font-heading leading-[0.9] text-balance drop-shadow-lg',
                                    portrait
                                        ? 'text-6xl'
                                        : 'text-6xl xl:text-7xl',
                                    uppercase && 'uppercase',
                                )}
                            >
                                {active.name}
                            </h1>
                            {active.description && (
                                <p className="max-w-md text-base text-cream/80">
                                    {active.description}
                                </p>
                            )}
                        </div>

                        {shown !== null && (
                            <NowShowing
                                key={shown.id}
                                product={shown}
                                onOpen={() =>
                                    onOpenDish(
                                        shown,
                                        cheapestVariantIndex(shown),
                                    )
                                }
                            />
                        )}

                        {/* Back and on through the categories, with the time
                            left on this one between. */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => step(-1)}
                                aria-label="Previous category"
                                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/12 text-cream backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:ring-3 focus-visible:ring-cream/50 focus-visible:outline-none"
                            >
                                <ChevronLeft className="size-5" />
                            </button>
                            <CountdownBar
                                progressRef={progressRef}
                                className="h-1 flex-1 rounded-full bg-white/20"
                                fillClassName="rounded-full"
                            />
                            <button
                                type="button"
                                onClick={() => step(1)}
                                aria-label="Next category"
                                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/12 text-cream backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:ring-3 focus-visible:ring-cream/50 focus-visible:outline-none"
                            >
                                <ChevronRight className="size-5" />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* The menu to use. */}
            <section className="flex min-h-0 min-w-0 flex-col">
                <ul
                    ref={chipsRef}
                    className="relative no-scrollbar flex shrink-0 gap-2 overflow-x-auto border-b border-border bg-surface px-6 py-3.5"
                >
                    {categories.map((category, index) => (
                        <Chip
                            key={category.id}
                            category={category}
                            active={index === activeIndex}
                            uppercase={uppercase}
                            onPress={() => onSelectCategory(index)}
                        />
                    ))}
                </ul>

                <div
                    ref={scrollRef}
                    className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-10"
                >
                    {active !== null && (
                        <ul
                            key={active.id}
                            className={cn(
                                'grid animate-in duration-500 fade-in slide-in-from-bottom-3 motion-reduce:animate-none',
                                COLUMNS[columnCount] ?? COLUMNS[3],
                            )}
                        >
                            {products.map((product, index) => (
                                <OnShow
                                    key={product.id}
                                    on={index === scene}
                                    follow={idle}
                                >
                                    <ProductMinimal
                                        product={product}
                                        quantity={0}
                                        onOpen={onOpenDish}
                                    />
                                </OnShow>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}

/**
 * One photo in the picture: dissolving in and out, and drifting slowly
 * closer while it is up.
 */
function Scene({
    product,
    on,
    mounted,
}: {
    product: Product;
    on: boolean;
    mounted: boolean;
}) {
    return (
        <div
            aria-hidden
            style={{
                opacity: on ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease`,
            }}
            className="absolute inset-0"
        >
            {mounted && (
                <div
                    style={{
                        transform: on
                            ? 'scale(1.12) translate3d(-1.5%, -1%, 0)'
                            : 'scale(1)',
                        transition: `transform ${DRIFT_MS}ms linear`,
                    }}
                    className="absolute inset-0 motion-reduce:transform-none!"
                >
                    <ProductImage
                        product={product}
                        full
                        className="absolute inset-0 rounded-none"
                    />
                </div>
            )}
        </div>
    );
}

/** The card on the picture naming the dish on show; tapping it opens it. */
function NowShowing({
    product,
    onOpen,
}: {
    product: Product;
    onOpen: () => void;
}) {
    const price = useDishPrice(product);
    const uppercase = useUppercaseProductTitles();

    return (
        <button
            type="button"
            onClick={onOpen}
            className="flex w-fit max-w-full animate-in items-center gap-3 rounded-2xl bg-white/12 p-2 pr-5 text-left ring-1 ring-white/15 backdrop-blur-md transition-colors duration-200 fade-in hover:bg-white/20 focus-visible:ring-3 focus-visible:ring-cream/50 focus-visible:outline-none"
        >
            <ProductImage
                product={product}
                className="size-12 shrink-0 rounded-xl"
                markClassName="w-9"
            />
            <span className="flex min-w-0 flex-col">
                <span className="text-[0.65rem] font-bold tracking-[0.2em] text-cream/60 uppercase">
                    Now showing
                </span>
                <span
                    className={cn(
                        'truncate text-base font-semibold',
                        uppercase && 'uppercase',
                    )}
                >
                    {product.name}
                </span>
            </span>
            <span className="ml-2 shrink-0 text-lg font-bold text-[#F4C338] tabular-nums">
                {price.from && (
                    <span className="mr-1 text-xs font-medium text-cream/60">
                        from
                    </span>
                )}
                {price.label}
            </span>
        </button>
    );
}

/**
 * A dish in the grid, ringed in the sun's yellow while its photo is the one
 * in the picture, and brought into view when the picture moves on by itself.
 */
function OnShow({
    on,
    follow,
    children,
}: {
    on: boolean;
    follow: boolean;
    children: React.ReactNode;
}) {
    const ref = useRef<HTMLLIElement>(null);

    useEffect(() => {
        if (on && follow) {
            ref.current?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
        }
    }, [on, follow]);

    return (
        <li
            ref={ref}
            className={cn(
                'rounded-[1.4rem] p-1.5 ring-2 transition-[box-shadow,background-color] duration-500',
                on ? 'bg-[#F4C338]/10 ring-[#F4C338]' : 'ring-transparent',
            )}
        >
            {children}
        </li>
    );
}

/** A category across the top of the menu half. */
function Chip({
    category,
    active,
    uppercase,
    onPress,
}: {
    category: Category;
    active: boolean;
    uppercase: boolean;
    onPress: () => void;
}) {
    return (
        <li className="shrink-0">
            <button
                type="button"
                onClick={onPress}
                aria-pressed={active}
                className={cn(
                    'flex items-center gap-2 rounded-full py-1 pr-4 pl-1 transition-colors duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                    active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground/65 hover:bg-primary/10 hover:text-primary',
                )}
            >
                <span
                    className={cn(
                        'flex size-8 items-center justify-center rounded-full bg-sage',
                        active && 'ring-2 ring-cream/70',
                    )}
                >
                    <CategoryArt
                        category={category}
                        className="max-h-[74%]"
                        logoClassName="w-[74%]"
                        imageClassName="aspect-square w-[70%]"
                    />
                </span>
                <span
                    className={cn(
                        'font-heading text-base whitespace-nowrap',
                        uppercase && 'uppercase',
                    )}
                >
                    {category.name}
                </span>
            </button>
        </li>
    );
}
