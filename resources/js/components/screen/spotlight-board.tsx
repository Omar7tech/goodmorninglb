import { useEffect, useRef, useState } from 'react';

import { ProductImage } from '@/components/menu/product-image';
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

/** How long each dish holds the spotlight before the next takes it. */
const HERO_MS = 5000;

/**
 * One dish at a time, big. The open category's dishes take turns in a large
 * photo with their name and price laid over it, and the whole category is
 * listed beside it, the dish in the spotlight marked. A tap on the list puts
 * that dish in the spotlight; a tap on the spotlight opens it.
 *
 * The categories run across the top as tabs, with the countdown to the next
 * one along the bar's foot.
 */
export function SpotlightBoard({
    categories,
    activeIndex,
    active,
    onSelectCategory,
    onOpenDish,
    progressRef,
    scrollRef,
    portrait,
    uppercase,
    idle,
    controls,
}: BoardProps) {
    const products = active?.products ?? [];
    const [heroIndex, setHeroIndex] = useState(0);
    const hero = products[heroIndex] ?? products[0] ?? null;

    // Each category starts on its first dish.
    useEffect(() => {
        setHeroIndex(0);
    }, [active?.id]);

    // The dishes take turns while nobody is using the screen.
    useEffect(() => {
        if (!idle || products.length < 2) {
            return;
        }

        const timer = window.setInterval(() => {
            setHeroIndex((index) => (index + 1) % products.length);
        }, HERO_MS);

        return () => window.clearInterval(timer);
    }, [idle, products.length, active?.id]);

    useKeepActiveInView(scrollRef, heroIndex, 'y');

    const tabsRef = useRef<HTMLUListElement>(null);
    useKeepActiveInView(tabsRef, activeIndex, 'x');

    return (
        <div className="flex size-full flex-col overflow-hidden bg-background">
            <header className="relative flex shrink-0 items-center gap-5 border-b border-border bg-surface px-6 py-3.5">
                <BoardLogo className="w-24 shrink-0" />

                <ul
                    ref={tabsRef}
                    className="relative no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto"
                >
                    {categories.map((category, index) => (
                        <li key={category.id} className="shrink-0">
                            <button
                                type="button"
                                onClick={() => onSelectCategory(index)}
                                aria-pressed={index === activeIndex}
                                className={cn(
                                    'rounded-full px-4 py-1.5 font-heading text-xl whitespace-nowrap transition-colors duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                                    uppercase && 'uppercase',
                                    index === activeIndex
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-foreground/55 hover:bg-primary/10 hover:text-primary',
                                )}
                            >
                                {category.name}
                            </button>
                        </li>
                    ))}
                </ul>

                {controls('dark')}

                <CountdownBar
                    progressRef={progressRef}
                    className="absolute inset-x-0 bottom-0 h-1"
                />
            </header>

            <div
                className={cn(
                    'grid min-h-0 flex-1 gap-5 p-5',
                    portrait
                        ? 'grid-rows-[minmax(0,1.25fr)_minmax(0,1fr)]'
                        : 'grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-6 p-6',
                )}
            >
                {hero !== null && active !== null ? (
                    <Hero
                        key={hero.id}
                        product={hero}
                        category={active}
                        position={heroIndex}
                        count={products.length}
                        onOpen={() =>
                            onOpenDish(hero, cheapestVariantIndex(hero))
                        }
                    />
                ) : (
                    <div className="rounded-[2rem] bg-muted" />
                )}

                {/* The whole category, the spotlit dish marked. */}
                <div
                    ref={scrollRef}
                    className="no-scrollbar flex min-h-0 flex-col gap-1 overflow-y-auto rounded-[2rem] bg-surface p-2.5"
                >
                    {products.map((product, index) => (
                        <ListRow
                            key={product.id}
                            product={product}
                            spotlit={index === heroIndex}
                            onPress={() =>
                                index === heroIndex
                                    ? onOpenDish(
                                          product,
                                          cheapestVariantIndex(product),
                                      )
                                    : setHeroIndex(index)
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/** The dish in the spotlight: its photo, filling the frame, and its words. */
function Hero({
    product,
    category,
    position,
    count,
    onOpen,
}: {
    product: Product;
    category: Category;
    position: number;
    count: number;
    onOpen: () => void;
}) {
    const price = useDishPrice(product);
    const uppercase = useUppercaseProductTitles();

    return (
        <button
            type="button"
            onClick={onOpen}
            className="group relative isolate animate-in overflow-hidden rounded-[2rem] bg-muted text-left shadow-lg duration-700 zoom-in-95 fade-in focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:animate-none"
        >
            <ProductImage
                product={product}
                full
                className="absolute inset-0 -z-10 size-full rounded-none"
            />

            <span className="absolute inset-x-0 bottom-0 -z-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Where in the category this dish sits. */}
            {count > 1 && (
                <span className="absolute top-5 right-5 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white tabular-nums backdrop-blur-sm">
                    {position + 1} / {count}
                </span>
            )}

            <span className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-7">
                <span className="text-xs font-semibold tracking-[0.2em] text-white/75 uppercase">
                    {category.name}
                </span>
                <span
                    className={cn(
                        'font-heading text-5xl leading-[0.95] text-white xl:text-6xl',
                        uppercase && 'uppercase',
                    )}
                >
                    {product.name}
                </span>
                {product.description && (
                    <span className="line-clamp-2 max-w-xl text-sm text-white/80">
                        {product.description}
                    </span>
                )}
                <span className="mt-1 flex items-center gap-3">
                    <span className="rounded-full bg-cream px-4 py-1.5 text-2xl font-bold text-primary tabular-nums">
                        {price.from && (
                            <span className="mr-1.5 text-sm font-semibold opacity-70">
                                from
                            </span>
                        )}
                        {price.label}
                    </span>
                    <span className="text-sm font-medium text-white/80">
                        Tap to see more
                    </span>
                </span>
            </span>
        </button>
    );
}

/** One dish in the list beside the spotlight. */
function ListRow({
    product,
    spotlit,
    onPress,
}: {
    product: Product;
    spotlit: boolean;
    onPress: () => void;
}) {
    const price = useDishPrice(product);
    const uppercase = useUppercaseProductTitles();

    return (
        <button
            type="button"
            onClick={onPress}
            aria-current={spotlit}
            className={cn(
                'flex shrink-0 items-center gap-3 rounded-2xl p-2 text-left transition-colors duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                spotlit
                    ? 'bg-primary/12 ring-1 ring-primary/30'
                    : 'hover:bg-primary/5',
            )}
        >
            <ProductImage
                product={product}
                className="size-16 shrink-0 rounded-xl"
                markClassName="w-11"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span
                    className={cn(
                        'truncate text-base font-semibold',
                        spotlit ? 'text-primary' : 'text-foreground',
                        uppercase && 'uppercase',
                    )}
                >
                    {product.name}
                </span>
                {product.description && (
                    <span className="truncate text-xs text-muted-foreground">
                        {product.description}
                    </span>
                )}
            </span>
            <span className="shrink-0 text-base font-bold text-primary tabular-nums">
                {price.from && (
                    <span className="mr-1 text-[0.7rem] font-medium text-muted-foreground">
                        from
                    </span>
                )}
                {price.label}
            </span>
        </button>
    );
}
