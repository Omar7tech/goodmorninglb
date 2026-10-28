import { useEffect, useRef } from 'react';

import { CategoryArt } from '@/components/menu/category-art';
import { MenuSlider } from '@/components/menu/menu-slider';
import { ProductMinimal } from '@/components/menu/product-minimal';
import {
    BoardLogo,
    CountdownBar,
    useKeepActiveInView,
} from '@/components/screen/screen-kit';
import type { BoardProps } from '@/components/screen/screen-kit';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

/** Dishes to a row, written out whole so Tailwind can see every class. */
const COLUMNS: Record<number, string> = {
    3: 'grid-cols-3 gap-x-6 gap-y-8',
    4: 'grid-cols-4 gap-x-5 gap-y-7',
    5: 'grid-cols-5 gap-x-5 gap-y-7',
    6: 'grid-cols-6 gap-x-4 gap-y-6',
};

/**
 * How long a scroll the board started itself is left to finish before the
 * reader takes over again: while it glides, the sections it passes are not
 * the ones being read.
 */
const STEERING_MS = 900;

/**
 * The whole menu in one long scroll, the way a printed menu is read: the
 * carousel on top, then every category one after another under its own big
 * heading, its dishes in rows of the size the shop has set.
 *
 * The category bar sticks to the top of the screen and follows along —
 * scroll into a category and its pill lights up, tap a pill and the menu
 * glides to it. Left alone, the board glides down to the next category on
 * its usual clock, the bar under the lit pill counting down, and from the
 * last back up to the top.
 */
export function FullMenuBoard({
    categories,
    activeIndex,
    onSelectCategory,
    onOpenDish,
    progressRef,
    portrait,
    uppercase,
    columns,
    slides,
    showSlider,
    onOpenSlide,
    idle,
    controls,
}: BoardProps) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLElement>(null);
    const pillsRef = useRef<HTMLUListElement>(null);
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);

    /** The category the scroll position is in, as last reported. */
    const spied = useRef(activeIndex);
    /** Set while the board's own glide is still under way. */
    const steering = useRef<number | undefined>(undefined);

    useKeepActiveInView(pillsRef, activeIndex, 'x');

    // A category chosen some other way than by scrolling to it — a pill, or
    // the clock — is glided to. One the reader scrolled into is already
    // where they are.
    useEffect(() => {
        if (activeIndex === spied.current) {
            return;
        }

        spied.current = activeIndex;

        const scroller = scrollerRef.current;
        const section = sectionRefs.current[activeIndex];

        if (!scroller || !section) {
            return;
        }

        window.clearTimeout(steering.current);
        steering.current = window.setTimeout(() => {
            steering.current = undefined;
        }, STEERING_MS);

        // The first category goes right back to the top, carousel and all,
        // so coming round again starts the menu over.
        scroller.scrollTo({
            top:
                activeIndex === 0
                    ? 0
                    : section.offsetTop -
                      (barRef.current?.offsetHeight ?? 0) -
                      12,
            behavior: 'smooth',
        });
    }, [activeIndex]);

    useEffect(() => () => window.clearTimeout(steering.current), []);

    /** Which category the reader has scrolled into. */
    const spy = (): void => {
        const scroller = scrollerRef.current;

        if (!scroller || steering.current !== undefined) {
            return;
        }

        const atBottom =
            scroller.scrollTop + scroller.clientHeight >=
            scroller.scrollHeight - 4;
        const line =
            scroller.scrollTop + (barRef.current?.offsetHeight ?? 0) + 48;

        let current = 0;

        sectionRefs.current.forEach((section, index) => {
            if (section && section.offsetTop <= line) {
                current = index;
            }
        });

        if (atBottom) {
            current = categories.length - 1;
        }

        if (current !== spied.current) {
            spied.current = current;
            onSelectCategory(current);
        }
    };

    const columnCount = portrait ? Math.max(3, columns - 1) : columns;

    return (
        <div
            ref={scrollerRef}
            onScroll={spy}
            className="relative no-scrollbar size-full overflow-y-auto bg-background"
        >
            <header className="flex items-center justify-between gap-6 px-8 pt-6 pb-2">
                <BoardLogo className="w-32" />
                {controls('dark')}
            </header>

            {showSlider && slides.length > 0 && (
                <div className="px-6 pt-3 pb-4">
                    <MenuSlider
                        slides={slides}
                        onOpen={onOpenSlide}
                        paused={!idle}
                        compact={!portrait}
                    />
                </div>
            )}

            {/* The bar that follows the reader down the menu. */}
            <nav
                ref={barRef}
                className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md"
            >
                <ul
                    ref={pillsRef}
                    className="relative no-scrollbar flex gap-2 overflow-x-auto px-8 py-3"
                >
                    {categories.map((category, index) => (
                        <Pill
                            key={category.id}
                            category={category}
                            active={index === activeIndex}
                            uppercase={uppercase}
                            progressRef={progressRef}
                            onPress={() => onSelectCategory(index)}
                        />
                    ))}
                </ul>
            </nav>

            <div className="flex flex-col gap-14 px-8 pt-7 pb-24">
                {categories.map((category, index) => (
                    <section
                        key={category.id}
                        ref={(element) => {
                            sectionRefs.current[index] = element;
                        }}
                        aria-labelledby={`full-menu-${category.id}`}
                        className="flex flex-col gap-6"
                    >
                        <header className="flex items-center gap-5">
                            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-sage shadow-md ring-4 ring-sage/15">
                                <CategoryArt
                                    category={category}
                                    className="max-h-[76%]"
                                    logoClassName="w-[76%]"
                                    imageClassName="aspect-square w-[72%]"
                                />
                            </span>

                            <div className="flex min-w-0 flex-col gap-1">
                                <h2
                                    id={`full-menu-${category.id}`}
                                    className={cn(
                                        'font-heading text-4xl leading-none text-primary',
                                        uppercase && 'uppercase',
                                    )}
                                >
                                    {category.name}
                                </h2>
                                {category.description && (
                                    <p className="truncate text-sm text-muted-foreground">
                                        {category.description}
                                    </p>
                                )}
                            </div>

                            <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary tabular-nums">
                                {category.products.length === 1
                                    ? '1 item'
                                    : `${category.products.length} items`}
                            </span>
                        </header>

                        <ul
                            className={cn(
                                'grid',
                                COLUMNS[columnCount] ?? COLUMNS[5],
                            )}
                        >
                            {category.products.map((product) => (
                                <li key={product.id}>
                                    <ProductMinimal
                                        product={product}
                                        quantity={0}
                                        onOpen={onOpenDish}
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}

/** A category in the sticky bar: its icon on green, and its name. */
function Pill({
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
                        : 'bg-surface text-foreground/70 shadow-sm ring-1 ring-border hover:text-primary',
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
