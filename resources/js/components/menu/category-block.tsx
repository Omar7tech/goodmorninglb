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
    'bg-sage text-cream shadow-[0_8px_18px_-10px_rgb(113_144_103/0.9)]',
    'bg-berry text-cream shadow-[0_8px_18px_-10px_rgb(182_73_69/0.9)]',
    'bg-[#F4C338] text-foreground shadow-[0_8px_18px_-10px_rgb(244_195_56/0.9)]',
] as const;

/**
 * One category as a block of colour with its icon drawn big and bleeding off
 * the bottom-right corner — tilted, partly cropped by the box, on a soft disc
 * of lighter colour. The name sits in the top-left with how many items are
 * inside under it, so the words and the picture each own a corner and never
 * crowd one another.
 *
 * Pointed at, the box lifts and the icon straightens and grows a little, as if
 * it had turned to face you.
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
    const count = category.products.length;

    return (
        <button
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
                'group relative h-28 overflow-hidden rounded-3xl p-3.5 text-left sm:h-32 sm:p-4',
                'transition-[translate] duration-300 ease-out hover:-translate-y-1 active:translate-y-0 motion-reduce:translate-none',
                'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none',
                COLOURS[colour],
            )}
        >
            {/* The soft disc the icon stands on, cut by the corner. */}
            <span
                aria-hidden
                className="absolute -right-8 -bottom-8 size-28 rounded-full bg-white/15 sm:size-32"
            />

            {/* The icon, big and tilted, half out of the box. */}
            <span
                aria-hidden
                className="absolute -right-3 -bottom-3 flex size-20 -rotate-12 items-center justify-center transition-[rotate,scale] duration-500 ease-out group-hover:scale-110 group-hover:rotate-0 motion-reduce:transition-none sm:size-24"
            >
                <CategoryArt
                    category={category}
                    className="max-h-full drop-shadow-[0_4px_6px_rgb(46_42_36/0.2)]"
                    logoClassName={cn(
                        'w-full',
                        colour === 2 && 'bg-foreground/70',
                    )}
                    imageClassName="aspect-square w-full"
                />
            </span>

            <span className="relative flex max-w-[68%] flex-col gap-1">
                <span
                    className={cn(
                        'font-heading text-xl leading-none text-balance sm:text-2xl',
                        uppercase && 'uppercase',
                    )}
                >
                    {category.name}
                </span>
                <span className="text-[0.7rem] font-medium opacity-75">
                    {count === 1 ? '1 item' : `${count} items`}
                </span>
            </span>
        </button>
    );
}
