import { usePage } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { CategoryArt } from '@/components/menu/category-art';
import { useDragScroll } from '@/lib/use-drag-scroll';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

/**
 * The circles' colours in the story-circles style: the green of "Morning", the
 * red of "Good" and the sun's yellow, taken in turn — or all green when the
 * shop has the colourful setting off, as on the category boxes.
 */
const CIRCLES = [
    { fill: 'bg-sage', ring: 'ring-sage' },
    { fill: 'bg-berry', ring: 'ring-berry' },
    { fill: 'bg-[#F4C338]', ring: 'ring-[#F4C338]' },
] as const;

/**
 * Category filter, shown once a category is open: a button back to the boxes,
 * then one pill per category — or, in the story-circles style the shop can
 * pick in the dashboard, one small round icon per category with its name
 * underneath, the open one ringed and the rest dimmed.
 *
 * In the pill style every pill carries the brand green, the selected one filled
 * and the rest held back to a tint, so the row keeps its stripe of green either
 * way.
 *
 * The row is a plain scroll container rather than a carousel, because
 * `scroll-fade-x` is driven by the element's own scroll position: it needs
 * something that actually scrolls, which a transform-based carousel is not.
 * The fade tracks that position, so the edge with more pills behind it is the
 * edge that softens.
 */
export function CategoryPills({
    categories,
    activeId,
    onSelect,
    onClear,
}: {
    categories: readonly Category[];
    activeId: number;
    onSelect: (id: number) => void;
    /** Returns to the category boxes. */
    onClear: () => void;
}) {
    const { ref, dragHandlers } = useDragScroll<HTMLDivElement>();
    const { categoryFilterStyle, colourfulCategories } = usePage().props;
    const circles = categoryFilterStyle === 'circles';

    /** A circle's colours: in turn while colourful, else all green. */
    const circleColour = (index: number) =>
        CIRCLES[(colourfulCategories ?? true) ? index % CIRCLES.length : 0];

    const activeRef = useRef<HTMLButtonElement>(null);
    /** Whether the row has already been placed once, on the first render. */
    const settled = useRef(false);

    /**
     * Bring the open category into the middle of the row. A category picked
     * from the boxes can sit anywhere in this list, including off the end of
     * it, and a filter row that shows no sign of what is filtering it is the
     * same as no marker at all.
     *
     * `scrollLeft` is moved directly rather than through `scrollIntoView`,
     * which would scroll the page as well as the row.
     */
    useEffect(() => {
        const scroller = ref.current;
        const pill = activeRef.current;

        if (scroller === null || pill === null) {
            return;
        }

        const centre = (): void => {
            const row = scroller.getBoundingClientRect();
            const box = pill.getBoundingClientRect();
            const middle =
                scroller.scrollLeft +
                (box.left - row.left) -
                (row.width - box.width) / 2;

            const furthest = scroller.scrollWidth - scroller.clientWidth;
            const left = Math.max(0, Math.min(middle, furthest));

            // The first placement writes `scrollLeft` outright rather than
            // asking for an instant scroll: the row has only just appeared, so
            // there is no movement to follow, and `behavior: 'instant'` is
            // rejected outright by older WebKit rather than ignored.
            if (settled.current) {
                scroller.scrollTo({ left, behavior: 'smooth' });

                return;
            }

            scroller.scrollLeft = left;
        };

        centre();

        // Again on the next frame. The row is measured the moment it appears,
        // which is early enough to catch the display font landing and every
        // pill changing width under the first answer.
        const frame = requestAnimationFrame(() => {
            centre();
            settled.current = true;
        });

        return () => {
            cancelAnimationFrame(frame);
        };
    }, [activeId, ref]);

    return (
        // The way back sits outside the scroller, so it stays put while the
        // categories travel past rather than scrolling away with them. Among
        // pills it is the first pill; above circles it is a "see all" link in
        // a small header, the way an app heads a row of stories — so the row
        // itself holds nothing but categories.
        <div
            className={cn('flex', circles ? 'flex-col' : 'items-center gap-2')}
        >
            {circles ? (
                <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
                        Categories
                    </span>
                    <button
                        type="button"
                        onClick={onClear}
                        aria-label="Back to all categories"
                        className="-mr-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-primary transition-colors duration-200 ease-out hover:bg-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                        <LayoutGrid aria-hidden className="size-3.5" />
                        All categories
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={onClear}
                    aria-label="Back to all categories"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-card py-1.5 pr-4 pl-3 font-heading text-lg text-primary shadow-sm ring-1 ring-primary/15 transition-colors duration-200 ease-out hover:bg-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    <LayoutGrid aria-hidden className="size-4" />
                    All
                </button>
            )}

            {/* Pulled out through the panel's padding on the trailing side, so
                the pills run to the panel's edge and fade out there instead of
                stopping short inside it. The padding puts that distance back,
                so the last pill is still reachable at the end of the scroll.
                The leading edge stays put — the button is already standing
                there. */}
            <div
                ref={ref}
                {...dragHandlers}
                // `scroll-fade-4` pins the fade to 16px. Left alone it is 12% of
                // the row's width, which on a phone eats most of a pill.
                className="-mr-3 no-scrollbar min-w-0 flex-1 scroll-fade-x cursor-grab overflow-x-auto py-2 pr-3 select-none scroll-fade-4 active:cursor-grabbing"
            >
                {/* `w-max` so the row is as wide as its pills, which is what
                    makes the trailing padding reachable at the end of the
                    scroll. */}
                <ul className="flex w-max gap-2">
                    {categories.map((category, index) => {
                        const isActive = category.id === activeId;

                        if (circles) {
                            return (
                                <li key={category.id}>
                                    <button
                                        type="button"
                                        ref={isActive ? activeRef : undefined}
                                        aria-pressed={isActive}
                                        onClick={() => onSelect(category.id)}
                                        className={cn(
                                            'flex w-16 flex-col items-center gap-2 rounded-2xl p-1 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                                            'transition-opacity duration-200 ease-out',
                                            isActive
                                                ? 'opacity-100'
                                                : 'opacity-70 hover:opacity-100',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex size-13 items-center justify-center rounded-full shadow-sm ring-2 ring-offset-2 ring-offset-surface',
                                                'transition-[box-shadow] duration-200 ease-out',
                                                // Every circle is ringed, with a
                                                // gap of the panel's cream: the
                                                // open one in its own colour,
                                                // the rest in a soft grey.
                                                circleColour(index).fill,
                                                isActive
                                                    ? circleColour(index).ring
                                                    : 'ring-foreground/15',
                                            )}
                                        >
                                            <CategoryArt
                                                category={category}
                                                className="max-h-[64%]"
                                                logoClassName="w-[70%]"
                                                imageClassName="aspect-square w-[60%]"
                                            />
                                        </span>
                                        <span
                                            className={cn(
                                                // The body face, small and on one
                                                // line: under a row of round
                                                // icons the name is a label, and
                                                // two-line names in the heading
                                                // face crowded into each other.
                                                'w-full truncate text-center text-[0.7rem] leading-tight',
                                                isActive
                                                    ? 'font-semibold text-primary'
                                                    : 'font-medium text-foreground/80',
                                            )}
                                        >
                                            {category.name}
                                        </span>
                                    </button>
                                </li>
                            );
                        }

                        return (
                            <li key={category.id}>
                                <button
                                    type="button"
                                    ref={isActive ? activeRef : undefined}
                                    aria-pressed={isActive}
                                    onClick={() => onSelect(category.id)}
                                    className={cn(
                                        'rounded-full px-4 py-1.5 font-heading text-lg whitespace-nowrap',
                                        'transition-colors duration-200 ease-out focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                                        // The selected one is the only pill
                                        // filled with the brand green; the
                                        // rest are the same green held back to
                                        // a tint. Weight carries the state, not
                                        // a ring around it, so which category is
                                        // open reads at a glance from across the
                                        // row.
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-primary/10 text-primary hover:bg-primary/20',
                                    )}
                                >
                                    {category.name}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
