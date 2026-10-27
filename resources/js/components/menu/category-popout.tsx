import { CategoryArt } from '@/components/menu/category-art';
import {
    useCategoryColour,
    useUppercaseCategoryTitles,
} from '@/lib/title-case';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

/** The logo's two colours, taken in turn across the grid. */
const COLOURS = [
    'bg-sage shadow-[0_8px_18px_-8px_rgb(113_144_103/0.8)]',
    'bg-berry shadow-[0_8px_18px_-8px_rgb(182_73_69/0.8)]',
] as const;

/** The disc the icon sits on, in the same colour as its card. */
const DISCS = ['bg-sage', 'bg-berry'] as const;

/**
 * One category as a short coloured card with its icon bursting out over the
 * top edge, like a sticker peeling off it. The cards take turns in the green of
 * "Morning" and the red of "Good" — or all stay green, when the shop has the
 * colourful setting off.
 *
 * The icon stands on the card's top edge, half in and half out, so the grid
 * leaves room above every row for it to rise into. Pointed at, the card lifts
 * and the icon rises a little further out of it.
 */
export function CategoryPopout({
    category,
    index,
    onSelect,
}: {
    category: Category;
    /** Position in the grid, which picks the card's colour. */
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
                'group relative flex h-28 w-full flex-col items-center justify-end rounded-3xl px-3 pb-3 text-cream sm:h-32',
                'transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 active:translate-y-0 motion-reduce:translate-none',
                'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none',
                COLOURS[colour],
            )}
        >
            {/* Half above the card's top edge, half on it: a disc of the
                card's own colour with a rim of the panel's cream, so the icon
                — drawn in white — reads as clearly above the card as on it.
                Rises a little further out when pointed at. */}
            <span
                className={cn(
                    'absolute -top-9 left-1/2 flex size-18 -translate-x-1/2 items-center justify-center rounded-full ring-4 ring-surface sm:-top-10 sm:size-20',
                    'shadow-[0_6px_12px_-4px_rgb(46_42_36/0.35)] transition-[translate] duration-300 ease-out group-hover:-translate-y-1 motion-reduce:translate-none',
                    DISCS[colour],
                )}
            >
                <CategoryArt
                    category={category}
                    className="max-h-[66%]"
                    logoClassName="w-[70%]"
                    imageClassName="aspect-square w-[62%]"
                />
            </span>

            <span
                className={cn(
                    'line-clamp-2 text-center font-heading text-xl leading-none text-balance sm:text-2xl',
                    uppercase && 'uppercase',
                )}
            >
                {category.name}
            </span>
        </button>
    );
}
