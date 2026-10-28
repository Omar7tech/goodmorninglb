import { ChevronLeft, ChevronRight, Pause } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { CategoryArt } from '@/components/menu/category-art';
import { ProductImage } from '@/components/menu/product-image';
import {
    BoardLogo,
    cheapestVariantIndex,
    useDishPrice,
    useKeepActiveInView,
} from '@/components/screen/screen-kit';
import type { BoardProps } from '@/components/screen/screen-kit';
import { useUppercaseProductTitles } from '@/lib/title-case';
import { usePricing } from '@/lib/use-pricing';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types';

/** How long each dish is up before the story moves on. */
const DISH_MS = 6000;

/**
 * The menu told like stories on a phone, which everyone already knows how to
 * use. One dish at a time fills the screen over a blur of its own photo; a
 * bar per dish runs across the top, the one playing filling as it goes. Tap
 * the right of the screen for the next dish, the left to go back, and keep a
 * finger down to hold it. After the last dish it plays on into the next
 * category, whose circle lights up in the row under the bars.
 *
 * It keeps its own time — dish by dish, rather than a whole category to a
 * stretch — and pauses whenever the screen is in use, picking up exactly
 * where it stopped.
 */
export function StoriesBoard({
    categories,
    activeIndex,
    active,
    onSelectCategory,
    onOpenDish,
    portrait,
    uppercase,
    idle,
    autoRotate,
    controls,
}: BoardProps) {
    const products = active?.products ?? [];
    const [dishIndex, setDishIndex] = useState(0);
    const dish = products[Math.min(dishIndex, products.length - 1)] ?? null;

    /** Set when stepping back into a category, to land on its last dish. */
    const startAtEnd = useRef(false);

    useEffect(() => {
        setDishIndex(startAtEnd.current ? Math.max(0, products.length - 1) : 0);
        startAtEnd.current = false;
    }, [active?.id, products.length]);

    const goToCategory = (index: number, atEnd: boolean): void => {
        startAtEnd.current = atEnd;
        onSelectCategory((index + categories.length) % categories.length);
    };

    const next = (): void => {
        if (dishIndex < products.length - 1) {
            setDishIndex(dishIndex + 1);

            return;
        }

        goToCategory(activeIndex + 1, false);
    };

    const previous = (): void => {
        if (dishIndex > 0) {
            setDishIndex(dishIndex - 1);

            return;
        }

        goToCategory(activeIndex - 1, true);
    };

    // The latest `next`, for the bar to call when it fills: the bar's own
    // listener is set once per dish and would otherwise hold a stale one.
    const nextRef = useRef(next);
    nextRef.current = next;

    // The playing bar is the clock. It fills over the dish's time and moves
    // the story on when full; pausing the bar pauses the story, so a dish
    // held halfway carries on from halfway rather than starting again.
    const fillRef = useRef<HTMLSpanElement>(null);
    const animation = useRef<Animation | null>(null);

    useEffect(() => {
        const fill = fillRef.current;

        if (fill === null) {
            return;
        }

        const playing = fill.animate(
            [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
            { duration: DISH_MS, easing: 'linear', fill: 'forwards' },
        );
        playing.pause();
        playing.onfinish = () => nextRef.current();
        animation.current = playing;

        return () => {
            playing.onfinish = null;
            playing.cancel();
        };
    }, [active?.id, dishIndex]);

    const running = idle && autoRotate;

    useEffect(() => {
        const playing = animation.current;

        if (playing === null) {
            return;
        }

        if (running) {
            playing.play();
        } else {
            playing.pause();
        }
    }, [running, active?.id, dishIndex]);

    const ringsRef = useRef<HTMLUListElement>(null);
    useKeepActiveInView(ringsRef, activeIndex, 'x');

    return (
        <div className="relative isolate size-full overflow-hidden bg-[#14110e] text-cream">
            {/* The dish's own photo, blurred right out, as the room it
                stands in. */}
            {dish !== null && (
                <div
                    key={dish.id}
                    aria-hidden
                    className="absolute inset-0 -z-10 animate-in duration-700 fade-in"
                >
                    <ProductImage
                        product={dish}
                        className="size-full scale-125 rounded-none opacity-55 blur-3xl"
                    />
                    <div className="absolute inset-0 bg-black/35" />
                </div>
            )}

            {/* Tapping the screen steps through: the left third back, the
                rest forward. Under the words and buttons, which take their
                own taps. */}
            <button
                type="button"
                aria-label="Previous dish"
                onClick={previous}
                className="absolute inset-y-0 left-0 z-0 w-1/3 cursor-w-resize focus-visible:outline-none"
            />
            <button
                type="button"
                aria-label="Next dish"
                onClick={next}
                className="absolute inset-y-0 right-0 z-0 w-2/3 cursor-e-resize focus-visible:outline-none"
            />

            <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-3 bg-gradient-to-b from-black/55 to-transparent px-6 pt-4 pb-8">
                {/* One bar per dish: those seen full, those to come empty,
                    the one playing filling. */}
                <div className="flex gap-1.5">
                    {products.map((product, index) => (
                        <span
                            key={product.id}
                            className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
                        >
                            <span
                                ref={index === dishIndex ? fillRef : undefined}
                                className={cn(
                                    'block h-full origin-left rounded-full bg-cream',
                                    index < dishIndex
                                        ? 'scale-x-100'
                                        : 'scale-x-0',
                                )}
                            />
                        </span>
                    ))}
                </div>

                <div className="pointer-events-auto flex items-center gap-4">
                    <BoardLogo light className="w-20 shrink-0" />

                    <ul
                        ref={ringsRef}
                        className="relative no-scrollbar flex min-w-0 flex-1 gap-3 overflow-x-auto py-1"
                    >
                        {categories.map((category, index) => (
                            <StoryRing
                                key={category.id}
                                category={category}
                                active={index === activeIndex}
                                uppercase={uppercase}
                                onPress={() => goToCategory(index, false)}
                            />
                        ))}
                    </ul>

                    {!running && autoRotate && (
                        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold">
                            <Pause className="size-3.5" />
                            Paused
                        </span>
                    )}

                    {controls('light')}
                </div>
            </header>

            {/* Arrows at the edges, so it is plain the screen can be
                stepped through. */}
            <button
                type="button"
                onClick={previous}
                aria-label="Previous dish"
                className="absolute top-1/2 left-4 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-cream backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:ring-3 focus-visible:ring-cream/50 focus-visible:outline-none"
            >
                <ChevronLeft className="size-6" />
            </button>
            <button
                type="button"
                onClick={next}
                aria-label="Next dish"
                className="absolute top-1/2 right-4 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-cream backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:ring-3 focus-visible:ring-cream/50 focus-visible:outline-none"
            >
                <ChevronRight className="size-6" />
            </button>

            {dish !== null && active !== null && (
                <Story
                    key={dish.id}
                    product={dish}
                    category={active}
                    portrait={portrait}
                    onOpen={() => onOpenDish(dish, cheapestVariantIndex(dish))}
                />
            )}
        </div>
    );
}

/** A category in the row of circles, ringed in yellow when it is playing. */
function StoryRing({
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
                className="flex w-16 flex-col items-center gap-1 rounded-2xl focus-visible:ring-3 focus-visible:ring-cream/50 focus-visible:outline-none"
            >
                <span
                    className={cn(
                        'rounded-full p-[3px] transition-colors duration-300',
                        active ? 'bg-[#F4C338]' : 'bg-white/25',
                    )}
                >
                    <span className="flex size-12 items-center justify-center rounded-full bg-sage ring-2 ring-[#14110e]">
                        <CategoryArt
                            category={category}
                            className="max-h-[74%]"
                            logoClassName="w-[74%]"
                            imageClassName="aspect-square w-[70%]"
                        />
                    </span>
                </span>
                <span
                    className={cn(
                        'w-full truncate text-center text-[0.7rem] leading-tight',
                        active ? 'font-bold text-cream' : 'text-cream/65',
                        uppercase && 'uppercase',
                    )}
                >
                    {category.name}
                </span>
            </button>
        </li>
    );
}

/**
 * The dish on screen. Held sideways, its photo stands as a tall card beside
 * its words; held upright, the photo fills the screen and the words sit over
 * its foot.
 */
function Story({
    product,
    category,
    portrait,
    onOpen,
}: {
    product: Product;
    category: Category;
    portrait: boolean;
    onOpen: () => void;
}) {
    const price = useDishPrice(product);
    const pricing = usePricing();
    const uppercase = useUppercaseProductTitles();

    const words = (
        <div className="pointer-events-none flex min-w-0 flex-col gap-4">
            <span className="text-sm font-bold tracking-[0.25em] text-[#F4C338] uppercase">
                {category.name}
            </span>

            <h1
                className={cn(
                    'font-heading leading-[0.92] text-cream drop-shadow-lg',
                    portrait ? 'text-6xl' : 'text-6xl xl:text-7xl',
                    uppercase && 'uppercase',
                )}
            >
                {product.name}
            </h1>

            {product.description && (
                <p className="line-clamp-3 max-w-xl text-lg text-cream/80">
                    {product.description}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
                {product.variants.length > 1 ? (
                    product.variants.map((variant) => (
                        <span
                            key={variant.name}
                            className="rounded-full bg-white/12 px-3.5 py-1.5 text-sm font-semibold backdrop-blur-sm"
                        >
                            {variant.name}{' '}
                            <span className="text-[#F4C338] tabular-nums">
                                {pricing.usd(
                                    variant.discountPrice ?? variant.price,
                                )}
                            </span>
                        </span>
                    ))
                ) : (
                    <span className="text-5xl font-bold text-cream tabular-nums">
                        {price.label}
                    </span>
                )}
            </div>

            <button
                type="button"
                onClick={onOpen}
                className="pointer-events-auto mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-cream px-6 py-3 text-base font-bold text-primary shadow-lg transition-[scale] duration-200 hover:scale-[1.03] focus-visible:ring-3 focus-visible:ring-cream/50 focus-visible:outline-none active:scale-95"
            >
                See details
                <ChevronRight className="size-4.5" strokeWidth={2.5} />
            </button>
        </div>
    );

    if (portrait) {
        return (
            <div className="pointer-events-none absolute inset-0 z-10 animate-in duration-500 fade-in">
                <ProductImage
                    product={product}
                    full
                    className="absolute inset-0 size-full rounded-none"
                />
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 px-10 pb-12">
                    {words}
                </div>
            </div>
        );
    }

    return (
        <div className="pointer-events-none absolute inset-0 z-10 flex animate-in items-center gap-12 px-24 pt-32 pb-10 duration-500 fade-in slide-in-from-right-4">
            <div className="h-full shrink-0 overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10">
                <ProductImage
                    product={product}
                    full
                    className="aspect-[9/16] h-full rounded-none"
                />
            </div>
            {words}
        </div>
    );
}
