import { CategoryArt } from '@/components/menu/category-art';
import {
    useCategoryColour,
    useUppercaseCategoryTitles,
} from '@/lib/title-case';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

/**
 * The logo's three colours — green, red and the sun's yellow — taken in turn
 * across the row, each with a ring of its own colour set off by a gap of the
 * panel's cream. All green when the shop has the colourful setting off.
 */
const COLOURS = [
    'bg-sage ring-sage',
    'bg-berry ring-berry',
    'bg-[#F4C338] ring-[#F4C338]',
] as const;

/**
 * One category as a round bubble with its icon in it and its name underneath,
 * like a story highlight. Small enough to sit four to a row on a phone, so the
 * whole menu is on one screen.
 *
 * Pointed at, the bubble grows a touch and its ring draws closer.
 */
export function CategoryBubble({
    category,
    index,
    onSelect,
}: {
    category: Category;
    /** Position in the grid, which picks the bubble's colour. */
    index: number;
    onSelect: (id: number) => void;
}) {
    const uppercase = useUppercaseCategoryTitles();
    const colour = useCategoryColour(index, COLOURS.length);

    return (
        <button
            type="button"
            onClick={() => onSelect(category.id)}
            className="group flex flex-col items-center gap-2 rounded-2xl p-1 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
            <span
                className={cn(
                    'flex size-16 items-center justify-center rounded-full shadow-sm ring-2 ring-offset-3 ring-offset-surface sm:size-20',
                    'transition-[scale] duration-300 ease-out group-hover:scale-105 group-active:scale-95 motion-reduce:scale-100',
                    COLOURS[colour],
                )}
            >
                <CategoryArt
                    category={category}
                    className="max-h-[70%]"
                    logoClassName="w-[70%]"
                    imageClassName="aspect-square w-[64%]"
                />
            </span>

            <span
                className={cn(
                    'line-clamp-2 text-center font-heading text-sm leading-tight text-balance text-foreground sm:text-base',
                    uppercase && 'uppercase',
                )}
            >
                {category.name}
            </span>
        </button>
    );
}
