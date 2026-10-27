import { CategoryArt } from '@/components/menu/category-art';
import {
    useCategoryColour,
    useUppercaseCategoryTitles,
} from '@/lib/title-case';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

/**
 * The squares the icons are photographed on, in the logo's colours: the green
 * of "Morning", the red of "Good" and the sun's yellow, taken in turn. All
 * green when the shop has the colourful setting off.
 */
const COLOURS = ['bg-sage', 'bg-berry', 'bg-[#F4C338]'] as const;

/**
 * How far each photo leans, taken in turn — uneven on purpose, so the wall
 * reads as pinned up by hand rather than set out by a machine.
 */
const TILTS = [
    '-rotate-2',
    'rotate-[1.5deg]',
    '-rotate-1',
    'rotate-2',
] as const;

/**
 * One category as an instant photo: the icon on a square of colour in a white
 * frame, the name handwritten in the wide strip at the foot, and a strip of
 * the sun's yellow tape holding it to the page.
 *
 * Each photo leans a little, a different way from its neighbour. Pointed at,
 * it straightens and lifts off the page.
 */
export function CategoryPolaroid({
    category,
    index,
    onSelect,
}: {
    category: Category;
    /** Position in the wall, which picks the colour and the lean. */
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
                'group relative flex w-full flex-col rounded-md bg-white p-2 pb-3 text-left shadow-[0_6px_16px_-6px_rgb(46_42_36/0.35)]',
                'transition-[rotate,translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_14px_28px_-8px_rgb(46_42_36/0.4)] motion-reduce:transition-none',
                'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none',
                TILTS[index % TILTS.length],
            )}
        >
            {/* The tape, a little askew across the top edge. */}
            <span
                aria-hidden
                className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 -rotate-3 bg-[#F4C338]/70 shadow-sm"
            />

            {/* The photo: a square of colour with the icon in it. */}
            <span
                className={cn(
                    'flex aspect-square w-full items-center justify-center rounded-sm',
                    COLOURS[colour],
                )}
            >
                <CategoryArt
                    category={category}
                    className="max-h-[62%]"
                    logoClassName={cn(
                        'w-[70%]',
                        colour === 2 && 'bg-foreground/70',
                    )}
                    imageClassName="aspect-square w-[58%]"
                />
            </span>

            {/* The caption, written in the frame's wide foot. */}
            <span
                className={cn(
                    'mt-2 text-center font-heading text-lg leading-none text-balance text-foreground sm:text-xl',
                    uppercase && 'uppercase',
                )}
            >
                {category.name}
            </span>
        </button>
    );
}
