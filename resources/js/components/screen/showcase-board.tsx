import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
import type { Category, Product } from '@/types';

/** How long each card holds the middle before the row glides on. */
const GLIDE_MS = 3500;

/**
 * The open category as a row of big dish cards, the one in the middle large
 * and lit and the rest stepping back either side. Swipe it, tap a card at the
 * side to bring it in, tap the middle one to open it; left alone it glides on
 * a card at a time. Behind it all the category's name is written huge and
 * faint across the screen.
 *
 * The categories run along the top as pills with their icons, the countdown
 * to the next along the open one's foot.
 */
export function ShowcaseBoard({
    categories,
    activeIndex,
    active,
    onSelectCategory,
    onOpenDish,
    progressRef,
    portrait,
    uppercase,
    idle,
    controls,
}: BoardProps) {
    const pillsRef = useRef<HTMLUListElement>(null);
    useKeepActiveInView(pillsRef, activeIndex, 'x');

    return (
        <div className="relative isolate flex size-full flex-col overflow-hidden bg-background">
            {/* The category's name, huge and faint, behind everything. */}
            {active !== null && (
                <span
                    key={active.id}
                    aria-hidden
                    className={cn(
                        'pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 animate-in truncate text-center font-heading leading-none text-primary/[0.07] duration-1000 fade-in',
                        portrait ? 'text-[24vw]' : 'text-[17vw]',
                        uppercase && 'uppercase',
                    )}
                >
                    {active.name}
                </span>
            )}

            <header className="flex shrink-0 items-center gap-5 px-6 pt-5">
                <BoardLogo className="w-24 shrink-0" />

                <ul
                    ref={pillsRef}
                    className="relative no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto py-1"
                >
                    {categories.map((category, index) => (
                        <CategoryPill
                            key={category.id}
                            category={category}
                            active={index === activeIndex}
                            uppercase={uppercase}
                            progressRef={progressRef}
                            onPress={() => onSelectCategory(index)}
                        />
                    ))}
                </ul>

                {controls('dark')}
            </header>

            {active !== null && (
                // A fresh row for every category, so it starts at its first
                // dish rather than wherever the last one stopped.
                <Row
                    key={active.id}
                    category={active}
                    portrait={portrait}
                    idle={idle}
                    onOpenDish={onOpenDish}
                />
            )}
        </div>
    );
}

/** A category along the top: its icon on green, and its name. */
function CategoryPill({
    category,
    active,
    uppercase,
    progressRef,
    onPress,
}: {
    category: Category;
    active: boolean;
    uppercase: boolean;
    progressRef: BoardProps['progressRef'];
    onPress: () => void;
}) {
    return (
        <li className="shrink-0">
            <button
                type="button"
                onClick={onPress}
                aria-pressed={active}
                className={cn(
                    'relative flex items-center gap-2.5 overflow-hidden rounded-full py-1.5 pr-5 pl-1.5 transition-colors duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                    active
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-surface text-foreground/70 shadow-sm hover:text-primary',
                )}
            >
                <span
                    className={cn(
                        'flex size-9 items-center justify-center rounded-full bg-sage',
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
                        'font-heading text-lg whitespace-nowrap',
                        uppercase && 'uppercase',
                    )}
                >
                    {category.name}
                </span>
                {active && (
                    <CountdownBar
                        progressRef={progressRef}
                        className="absolute inset-x-0 bottom-0 h-1 bg-primary-foreground/15"
                    />
                )}
            </button>
        </li>
    );
}

/** The swipeable row of one category's dishes. */
function Row({
    category,
    portrait,
    idle,
    onOpenDish,
}: {
    category: Category;
    portrait: boolean;
    idle: boolean;
    onOpenDish: BoardProps['onOpenDish'];
}) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: category.products.length > 2,
        align: 'center',
        skipSnaps: false,
    });
    const [selected, setSelected] = useState(0);

    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        const sync = (): void => setSelected(emblaApi.selectedScrollSnap());

        emblaApi.on('select', sync);
        emblaApi.on('reInit', sync);
        sync();

        return () => {
            emblaApi.off('select', sync);
            emblaApi.off('reInit', sync);
        };
    }, [emblaApi]);

    // Glides on a card at a time while nobody is using the screen.
    useEffect(() => {
        if (!emblaApi || !idle || category.products.length < 2) {
            return;
        }

        const timer = window.setInterval(() => {
            emblaApi.scrollNext();
        }, GLIDE_MS);

        return () => window.clearInterval(timer);
    }, [emblaApi, idle, category.products.length, selected]);

    return (
        <div className="flex min-h-0 flex-1 animate-in flex-col justify-center gap-6 pb-6 duration-500 fade-in">
            <div className="relative">
                <div ref={emblaRef} className="overflow-hidden py-6">
                    <ul className="flex touch-pan-y">
                        {category.products.map((product, index) => (
                            <li
                                key={product.id}
                                className={cn(
                                    'min-w-0 shrink-0 px-3',
                                    portrait ? 'basis-[62%]' : 'basis-[32%]',
                                )}
                            >
                                <Card
                                    product={product}
                                    centred={index === selected}
                                    portrait={portrait}
                                    onPress={() =>
                                        index === selected
                                            ? onOpenDish(
                                                  product,
                                                  cheapestVariantIndex(product),
                                              )
                                            : emblaApi?.scrollTo(index)
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    type="button"
                    onClick={() => emblaApi?.scrollPrev()}
                    aria-label="Previous dish"
                    className="absolute top-1/2 left-5 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-primary shadow-lg transition-[scale] hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95"
                >
                    <ChevronLeft className="size-6" />
                </button>
                <button
                    type="button"
                    onClick={() => emblaApi?.scrollNext()}
                    aria-label="Next dish"
                    className="absolute top-1/2 right-5 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-primary shadow-lg transition-[scale] hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95"
                >
                    <ChevronRight className="size-6" />
                </button>
            </div>

            {/* Where in the category the middle card sits. */}
            {category.products.length > 1 && (
                <div className="flex items-center justify-center gap-1.5">
                    {category.products.map((product, index) => (
                        <button
                            key={product.id}
                            type="button"
                            onClick={() => emblaApi?.scrollTo(index)}
                            aria-label={`Go to ${product.name}`}
                            aria-current={index === selected}
                            className={cn(
                                'h-2 rounded-full transition-all duration-300',
                                index === selected
                                    ? 'w-7 bg-primary'
                                    : 'w-2 bg-primary/25 hover:bg-primary/45',
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/** One dish card: lit and full size in the middle, stepped back at the sides. */
function Card({
    product,
    centred,
    portrait,
    onPress,
}: {
    product: Product;
    centred: boolean;
    portrait: boolean;
    onPress: () => void;
}) {
    const price = useDishPrice(product);
    const uppercase = useUppercaseProductTitles();

    return (
        <button
            type="button"
            onClick={onPress}
            aria-label={centred ? `Open ${product.name}` : product.name}
            className={cn(
                'flex w-full flex-col overflow-hidden rounded-[2rem] bg-card text-left transition-[scale,opacity,box-shadow] duration-500 ease-out focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none',
                centred
                    ? 'scale-100 opacity-100 shadow-2xl'
                    : 'scale-[0.86] opacity-55 shadow-md',
            )}
        >
            <ProductImage
                product={product}
                full={centred}
                className={cn(
                    'w-full rounded-none',
                    portrait ? 'aspect-[4/5]' : 'aspect-[4/5] max-h-[52vh]',
                )}
            />

            <span className="flex flex-col gap-2 p-5">
                <span
                    className={cn(
                        'truncate font-heading text-3xl leading-tight text-foreground',
                        uppercase && 'uppercase',
                    )}
                >
                    {product.name}
                </span>
                <span className="flex items-center justify-between gap-3">
                    <span className="text-2xl font-bold text-primary tabular-nums">
                        {price.from && (
                            <span className="mr-1 text-sm font-medium text-muted-foreground">
                                from
                            </span>
                        )}
                        {price.label}
                    </span>
                    {centred && (
                        <span className="rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary">
                            Tap to open
                        </span>
                    )}
                </span>
            </span>
        </button>
    );
}
