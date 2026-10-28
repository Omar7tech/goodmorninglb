import { useRef } from 'react';

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
    3: 'grid-cols-3 gap-x-10 gap-y-12',
    4: 'grid-cols-4 gap-x-8 gap-y-10',
    5: 'grid-cols-5 gap-x-7 gap-y-9',
    6: 'grid-cols-6 gap-x-6 gap-y-8',
};

/** Tilts that never fall into a pattern across a row. */
const TILTS = [
    '-rotate-2',
    'rotate-1',
    '-rotate-1',
    'rotate-2',
    'rotate-[0.5deg]',
    '-rotate-[1.5deg]',
];

/** The tags' own small swing on their string. */
const TAG_TILTS = [
    '-rotate-3',
    'rotate-2',
    '-rotate-1',
    'rotate-3',
    '-rotate-2',
    'rotate-1',
];

/**
 * The dishes as instant photos taped to the wall: a white frame, a strip of
 * the sun's yellow tape across the top, the name written under the picture
 * and the price beside it, each at its own small tilt — straightening when
 * touched.
 *
 * The categories hang across the top as paper tags on a string, swinging a
 * little each their own way; the open one is green, with the countdown along
 * its foot.
 */
export function PolaroidBoard({
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
    const tagsRef = useRef<HTMLUListElement>(null);
    useKeepActiveInView(tagsRef, activeIndex, 'x');

    const columnCount = portrait ? Math.max(3, columns - 1) : columns;

    return (
        <div className="flex size-full flex-col overflow-hidden bg-background">
            <header className="relative shrink-0 px-8 pt-5">
                <div className="flex items-center justify-between gap-6">
                    <BoardLogo className="w-24" />
                    {controls('dark')}
                </div>

                {/* The string the tags hang from. */}
                <div className="relative mt-3">
                    <span
                        aria-hidden
                        className="absolute inset-x-0 top-3 h-px bg-foreground/25"
                    />

                    <ul
                        ref={tagsRef}
                        className="relative no-scrollbar flex gap-4 overflow-x-auto px-2 pt-1 pb-5"
                    >
                        {categories.map((category, index) => {
                            const isActive = index === activeIndex;

                            return (
                                <li
                                    key={category.id}
                                    className="flex shrink-0 flex-col items-center"
                                >
                                    {/* The knot on the string. */}
                                    <span
                                        aria-hidden
                                        className="z-10 size-2.5 rounded-full bg-foreground/40"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => onSelectCategory(index)}
                                        aria-pressed={isActive}
                                        className={cn(
                                            'relative -mt-1 origin-top overflow-hidden rounded-md px-4 pt-3 pb-2 font-heading text-lg whitespace-nowrap shadow-md transition-[rotate,background-color,color] duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                                            uppercase && 'uppercase',
                                            TAG_TILTS[index % TAG_TILTS.length],
                                            isActive
                                                ? 'rotate-0 bg-primary text-primary-foreground'
                                                : 'bg-white text-foreground/75',
                                        )}
                                    >
                                        {/* The tag's punched hole. */}
                                        <span
                                            aria-hidden
                                            className={cn(
                                                'absolute top-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full',
                                                isActive
                                                    ? 'bg-primary-foreground/50'
                                                    : 'bg-foreground/20',
                                            )}
                                        />
                                        {category.name}
                                        {isActive && (
                                            <CountdownBar
                                                progressRef={progressRef}
                                                className="absolute inset-x-0 bottom-0 h-1 bg-primary-foreground/15"
                                            />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </header>

            <div
                ref={scrollRef}
                className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-10 pt-4 pb-12"
            >
                {active !== null && (
                    <div
                        key={active.id}
                        className="flex animate-in flex-col gap-8 duration-500 fade-in slide-in-from-bottom-3 motion-reduce:animate-none"
                    >
                        <div className="flex items-baseline gap-4">
                            <h1
                                className={cn(
                                    'font-heading text-5xl leading-none text-primary',
                                    uppercase && 'uppercase',
                                )}
                            >
                                {active.name}
                            </h1>
                            {active.description && (
                                <p className="truncate text-base text-muted-foreground">
                                    {active.description}
                                </p>
                            )}
                        </div>

                        <ul
                            className={cn(
                                'grid',
                                COLUMNS[columnCount] ?? COLUMNS[5],
                            )}
                        >
                            {active.products.map((product, index) => (
                                <Polaroid
                                    key={product.id}
                                    product={product}
                                    tilt={TILTS[index % TILTS.length]}
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
                )}
            </div>
        </div>
    );
}

/** One dish as an instant photo taped to the wall. */
function Polaroid({
    product,
    tilt,
    onOpen,
}: {
    product: Product;
    tilt: string;
    onOpen: () => void;
}) {
    const price = useDishPrice(product);
    const uppercase = useUppercaseProductTitles();

    return (
        <li>
            <button
                type="button"
                onClick={onOpen}
                className={cn(
                    'relative flex w-full flex-col gap-2.5 bg-white p-2.5 pb-3.5 text-left shadow-[0_6px_18px_rgb(46_42_36/0.14)] transition-[rotate,translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:rotate-0 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:rotate-0 motion-reduce:transition-none',
                    tilt,
                )}
            >
                {/* The tape holding it to the wall. */}
                <span
                    aria-hidden
                    className="absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 -rotate-3 bg-[#F4C338]/70 shadow-sm"
                />

                <ProductImage
                    product={product}
                    className="aspect-square w-full rounded-none"
                    markClassName="w-3/4"
                />

                <span className="flex items-baseline justify-between gap-2 px-0.5">
                    <span
                        className={cn(
                            'min-w-0 truncate font-heading text-lg leading-tight text-foreground',
                            uppercase && 'uppercase',
                        )}
                    >
                        {product.name}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-primary tabular-nums">
                        {price.from && (
                            <span className="mr-0.5 text-[0.65rem] font-medium text-muted-foreground">
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
