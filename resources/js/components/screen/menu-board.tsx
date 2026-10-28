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

/**
 * A café menu board in the brand green. The open category is set big on one
 * side, its icon in a cream ring over its name; its dishes are a printed list
 * on the other, each name running on in dotted leaders to its price in the
 * sun's yellow. The categories are written across the top, the open one
 * underlined in a yellow wave, under a thin countdown along the very top.
 *
 * Made to be read from across the shop rather than held: few pictures, big
 * type, and nothing that needs leaning in to see.
 */
export function MenuBoard({
    categories,
    activeIndex,
    active,
    onSelectCategory,
    onOpenDish,
    progressRef,
    scrollRef,
    portrait,
    uppercase,
    controls,
}: BoardProps) {
    const tabsRef = useRef<HTMLUListElement>(null);
    useKeepActiveInView(tabsRef, activeIndex, 'x');

    return (
        <div className="relative flex size-full flex-col overflow-hidden bg-primary text-cream">
            <CountdownBar
                progressRef={progressRef}
                className="absolute inset-x-0 top-0 z-10 h-1"
            />

            <header className="flex shrink-0 items-center gap-6 px-8 pt-6 pb-4">
                <BoardLogo light className="w-24 shrink-0" />

                <ul
                    ref={tabsRef}
                    className="relative no-scrollbar flex min-w-0 flex-1 items-end gap-6 overflow-x-auto pb-2"
                >
                    {categories.map((category, index) => (
                        <li key={category.id} className="shrink-0">
                            <button
                                type="button"
                                onClick={() => onSelectCategory(index)}
                                aria-pressed={index === activeIndex}
                                className={cn(
                                    'rounded-md font-heading text-2xl whitespace-nowrap transition-colors duration-300 focus-visible:ring-3 focus-visible:ring-cream/50 focus-visible:outline-none',
                                    uppercase && 'uppercase',
                                    index === activeIndex
                                        ? 'text-cream underline decoration-[#F4C338] decoration-wavy decoration-2 underline-offset-[10px]'
                                        : 'text-cream/45 hover:text-cream/75',
                                )}
                            >
                                {category.name}
                            </button>
                        </li>
                    ))}
                </ul>

                {controls('light')}
            </header>

            {active !== null && (
                <div
                    key={active.id}
                    className={cn(
                        'flex min-h-0 flex-1 animate-in duration-500 fade-in motion-reduce:animate-none',
                        portrait ? 'flex-col' : 'flex-row',
                    )}
                >
                    {/* The category, set big. */}
                    <section
                        className={cn(
                            'flex shrink-0 flex-col',
                            portrait
                                ? 'flex-row items-center gap-6 px-8 pt-2 pb-5'
                                : 'w-[34%] justify-center gap-6 border-r border-cream/15 px-10 pb-10',
                        )}
                    >
                        <span
                            className={cn(
                                'flex shrink-0 items-center justify-center rounded-full bg-[#5f7c56] shadow-inner ring-4 ring-cream/80',
                                portrait ? 'size-24' : 'size-40',
                            )}
                        >
                            <CategoryArt
                                category={active}
                                className="max-h-[72%]"
                                logoClassName="w-[74%]"
                                imageClassName="aspect-square w-[70%]"
                            />
                        </span>

                        <div className="flex min-w-0 flex-col gap-3">
                            <h1
                                className={cn(
                                    'font-heading leading-[0.95] text-cream',
                                    portrait
                                        ? 'text-5xl'
                                        : 'text-6xl xl:text-7xl',
                                    uppercase && 'uppercase',
                                )}
                            >
                                {active.name}
                            </h1>
                            {active.description && (
                                <p className="text-base text-cream/75">
                                    {active.description}
                                </p>
                            )}
                            <p className="text-sm font-semibold tracking-[0.2em] text-[#F4C338] uppercase">
                                {active.products.length === 1
                                    ? '1 dish'
                                    : `${active.products.length} dishes`}
                            </p>
                        </div>
                    </section>

                    {/* The dishes, as a printed list in two columns. */}
                    <div
                        ref={scrollRef}
                        className={cn(
                            'no-scrollbar min-h-0 flex-1 overflow-y-auto',
                            portrait ? 'px-8 pb-8' : 'px-10 py-4 pb-10',
                        )}
                    >
                        <ul className="columns-2 gap-x-10">
                            {active.products.map((product) => (
                                <BoardLine
                                    key={product.id}
                                    product={product}
                                    onOpen={() =>
                                        onOpenDish(
                                            product,
                                            cheapestVariantIndex(product),
                                        )
                                    }
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

/** One line of the board: a small round photo, the name, leaders, the price. */
function BoardLine({
    product,
    onOpen,
}: {
    product: Product;
    onOpen: () => void;
}) {
    const price = useDishPrice(product);
    const uppercase = useUppercaseProductTitles();

    return (
        <li className="break-inside-avoid">
            <button
                type="button"
                onClick={onOpen}
                className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors duration-200 hover:bg-cream/8 focus-visible:ring-3 focus-visible:ring-cream/50 focus-visible:outline-none"
            >
                <ProductImage
                    product={product}
                    className="size-12 shrink-0 rounded-full ring-2 ring-cream/70"
                    markClassName="w-9"
                />

                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-baseline gap-2">
                        <span
                            className={cn(
                                'min-w-0 truncate text-lg font-semibold',
                                uppercase && 'uppercase',
                            )}
                        >
                            {product.name}
                        </span>
                        <span
                            aria-hidden
                            className="min-w-6 flex-1 translate-y-[-3px] border-b-2 border-dotted border-cream/30"
                        />
                        <span className="shrink-0 font-heading text-2xl leading-none text-[#F4C338] tabular-nums">
                            {price.from && (
                                <span className="mr-1 align-middle font-sans text-xs text-cream/60">
                                    from
                                </span>
                            )}
                            {price.label}
                        </span>
                    </span>
                    {product.description && (
                        <span className="truncate text-xs text-cream/60">
                            {product.description}
                        </span>
                    )}
                </span>
            </button>
        </li>
    );
}
