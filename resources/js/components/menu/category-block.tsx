import { ArrowUpRight } from 'lucide-react';

import { CategoryArt } from '@/components/menu/category-art';
import {
    useCategoryColour,
    useUppercaseCategoryTitles,
} from '@/lib/title-case';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

/**
 * The logo's three colours, taken in turn across the grid: the green of
 * "Morning", the red of "Good" and the sun's yellow. The yellow is too light
 * for cream lettering, so it carries the page's dark ink instead. All green
 * when the shop has the colourful setting off.
 */
const COLOURS = [
    'bg-sage text-cream shadow-[0_6px_16px_-8px_rgb(113_144_103/0.9)]',
    'bg-berry text-cream shadow-[0_6px_16px_-8px_rgb(182_73_69/0.9)]',
    'bg-[#F4C338] text-foreground shadow-[0_6px_16px_-8px_rgb(244_195_56/0.9)]',
] as const;

/**
 * One category as a short block of colour: the icon in the top-right corner,
 * the name set hard into the bottom-left, and a small arrow beside it.
 * Graphic rather than pictorial — the colours do most of the work, taking turns
 * across the grid so no two neighbours match.
 *
 * Pointed at, the block lifts and the icon swells a little.
 */
export function CategoryBlock({
    category,
    index,
    onSelect,
}: {
    category: Category;
    /** Position in the grid, which picks the block's colour. */
    index: number;
    onSelect: (id: number) => void;
}) {
    const uppercase = useUppercaseCategoryTitles();
    const colour = useCategoryColour(index, COLOURS.length);

    return (
        <button
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
                'group relative flex h-28 flex-col justify-between overflow-hidden rounded-3xl p-3.5 text-left sm:h-32',
                'transition-[translate] duration-300 ease-out hover:-translate-y-1 active:translate-y-0 motion-reduce:translate-none',
                'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none',
                COLOURS[colour],
            )}
        >
            <span className="flex h-12 justify-end sm:h-14">
                <CategoryArt
                    category={category}
                    className="max-h-full"
                    logoClassName={cn(
                        'w-16',
                        colour === 2 && 'bg-foreground/70',
                    )}
                    imageClassName="aspect-square h-full"
                />
            </span>

            <span className="flex items-end justify-between gap-2">
                <span
                    className={cn(
                        'line-clamp-2 font-heading text-xl leading-none text-balance sm:text-2xl',
                        uppercase && 'uppercase',
                    )}
                >
                    {category.name}
                </span>

                <ArrowUpRight
                    aria-hidden
                    className="size-4 shrink-0 opacity-60 transition-[translate,opacity] duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 motion-reduce:translate-none"
                    strokeWidth={2.5}
                />
            </span>
        </button>
    );
}
