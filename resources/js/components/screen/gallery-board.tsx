import { useRef } from 'react';

import { CategoryArt } from '@/components/menu/category-art';
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
import type { Product } from '@/types';

/** Dishes to a row, written out whole so Tailwind can see every class. */
const COLUMNS: Record<number, string> = {
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
};

/**
 * Nothing but the food. The open category's photos fill the screen edge to
 * edge with hairline gaps, the first dish twice the size of the rest, each
 * named over a shade at its foot with its price in a cream chip.
 *
 * Everything else floats over the photos: the logo in one corner, the
 * buttons in the other, the open category's name at the top, and the
 * categories in a dock at the bottom like an app's — the open one lifted and
 * named, with the countdown along the dock's foot.
 */
export function GalleryBoard({
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
    controls,
}: BoardProps) {
    const dockRef = useRef<HTMLUListElement>(null);
    useKeepActiveInView(dockRef, activeIndex, 'x');

    // Fewer columns held upright, where the screen is narrower.
    const columnCount = portrait ? Math.max(3, columns - 1) : columns;

    return (
        <div className="relative size-full overflow-hidden bg-foreground">
            <div
                ref={scrollRef}
                className="no-scrollbar size-full overflow-y-auto"
            >
                {active !== null && (
                    <ul
                        key={active.id}
                        className={cn(
                            'grid animate-in gap-1 p-1 pt-24 pb-36 duration-700 fade-in motion-reduce:animate-none',
                            COLUMNS[columnCount] ?? COLUMNS[5],
                        )}
                    >
                        {active.products.map((product, index) => (
                            <GalleryTile
                                key={product.id}
                                product={product}
                                featured={index === 0}
                                onOpen={() =>
                                    onOpenDish(
                                        product,
                                        cheapestVariantIndex(product),
                                    )
                                }
                            />
                        ))}
                    </ul>
                )}
            </div>

            {/* The top: a shade so the floating pieces read over any photo. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-6 px-6 pt-5">
                <BoardLogo light className="w-24 shrink-0" />

                {active !== null && (
                    <h1
                        key={active.id}
                        className={cn(
                            'min-w-0 animate-in truncate pt-1 text-center font-heading text-4xl leading-none text-cream drop-shadow-md duration-500 fade-in slide-in-from-top-2 motion-reduce:animate-none',
                            uppercase && 'uppercase',
                        )}
                    >
                        {active.name}
                    </h1>
                )}

                {controls('light')}
            </div>

            {/* The dock. */}
            <nav className="absolute inset-x-0 bottom-5 flex justify-center px-6">
                <div className="relative max-w-full overflow-hidden rounded-[2rem] bg-cream/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-md">
                    <ul
                        ref={dockRef}
                        className="relative no-scrollbar flex items-end gap-2 overflow-x-auto px-4 pt-3 pb-4"
                    >
                        {categories.map((category, index) => {
                            const isActive = index === activeIndex;

                            return (
                                <li key={category.id} className="shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => onSelectCategory(index)}
                                        aria-pressed={isActive}
                                        aria-label={category.name}
                                        className="flex w-20 flex-col items-center gap-1.5 rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                                    >
                                        <span
                                            className={cn(
                                                'flex items-center justify-center rounded-2xl bg-sage shadow-md transition-[width,height,translate] duration-300 ease-out',
                                                isActive
                                                    ? 'size-16 -translate-y-1 ring-3 ring-[#F4C338]'
                                                    : 'size-13',
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
                                                'w-full truncate text-center text-[0.7rem] leading-tight',
                                                isActive
                                                    ? 'font-bold text-primary'
                                                    : 'font-medium text-foreground/60',
                                            )}
                                        >
                                            {category.name}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    <CountdownBar
                        progressRef={progressRef}
                        className="absolute inset-x-0 bottom-0 h-1 bg-primary/10"
                    />
                </div>
            </nav>
        </div>
    );
}

/** One photo in the gallery, named over a shade at its foot. */
function GalleryTile({
    product,
    featured,
    onOpen,
}: {
    product: Product;
    featured: boolean;
    onOpen: () => void;
}) {
    const price = useDishPrice(product);
    const uppercase = useUppercaseProductTitles();

    return (
        <li className={cn(featured && 'col-span-2 row-span-2')}>
            <button
                type="button"
                onClick={onOpen}
                className={cn(
                    'group relative isolate block w-full overflow-hidden bg-muted text-left focus-visible:ring-3 focus-visible:ring-cream/60 focus-visible:outline-none focus-visible:ring-inset',
                    // The rest are square and set the rows' height; the
                    // featured one fills the two rows and columns it spans.
                    featured ? 'h-full' : 'aspect-square',
                )}
            >
                <ProductImage
                    product={product}
                    full={featured}
                    className="absolute inset-0 -z-10 size-full rounded-none transition-[scale] duration-700 ease-out group-hover:scale-105 motion-reduce:scale-100"
                />

                <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />

                <span
                    className={cn(
                        'absolute inset-x-0 bottom-0 flex items-end justify-between gap-2',
                        featured ? 'p-6' : 'p-3',
                    )}
                >
                    <span
                        className={cn(
                            'min-w-0 leading-tight font-semibold text-white',
                            featured
                                ? 'font-heading text-4xl font-normal'
                                : 'line-clamp-2 text-sm',
                            uppercase && 'uppercase',
                        )}
                    >
                        {product.name}
                    </span>
                    <span
                        className={cn(
                            'shrink-0 rounded-full bg-cream font-bold text-primary tabular-nums',
                            featured
                                ? 'px-4 py-1.5 text-xl'
                                : 'px-2.5 py-0.5 text-xs',
                        )}
                    >
                        {price.from && (
                            <span className="mr-1 font-medium opacity-60">
                                from
                            </span>
                        )}
                        {price.label}
                    </span>
                </span>
            </button>
        </li>
    );
}
