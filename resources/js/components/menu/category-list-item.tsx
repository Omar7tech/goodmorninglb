import { ChevronRight } from 'lucide-react';

import { CategoryArt } from '@/components/menu/category-art';
import {
    useCategoryColour,
    useUppercaseCategoryTitles,
} from '@/lib/title-case';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

/**
 * The discs the icons sit on and the chevrons beside them, in the logo's
 * colours — the green of "Morning", the red of "Good" and the sun's yellow —
 * taken in turn. All green when the shop has the colourful setting off.
 */
const COLOURS = [
    { disc: 'bg-sage', chevron: 'text-sage' },
    { disc: 'bg-berry', chevron: 'text-berry' },
    { disc: 'bg-[#F4C338]', chevron: 'text-[#c79a14]' },
] as const;

/**
 * One category as a line of a printed menu: a round coloured disc with the
 * icon in it, the name, and the category's tagline underneath — the one place
 * on the menu where the shop's own line about each category is read.
 *
 * A category with no tagline simply shows its name. Pointed at, the row warms
 * a little and the chevron steps forward.
 */
export function CategoryListItem({
    category,
    index,
    onSelect,
}: {
    category: Category;
    /** Position in the list, which picks the row's colour. */
    index: number;
    onSelect: (id: number) => void;
}) {
    const uppercase = useUppercaseCategoryTitles();
    const colour = COLOURS[useCategoryColour(index, COLOURS.length)];

    return (
        <button
            type="button"
            onClick={() => onSelect(category.id)}
            className="group flex w-full items-center gap-3.5 rounded-2xl px-2 py-3 text-left transition-colors duration-200 ease-out hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:gap-4"
        >
            <span
                className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-full shadow-sm sm:size-14',
                    colour.disc,
                )}
            >
                <CategoryArt
                    category={category}
                    className="max-h-[62%]"
                    logoClassName="w-[70%]"
                    imageClassName="aspect-square w-[58%]"
                />
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span
                    className={cn(
                        'font-heading text-xl leading-none text-foreground sm:text-2xl',
                        uppercase && 'uppercase',
                    )}
                >
                    {category.name}
                </span>

                {category.description && (
                    <span className="text-sm leading-snug text-muted-foreground">
                        {category.description}
                    </span>
                )}
            </span>

            <ChevronRight
                aria-hidden
                className={cn(
                    'size-5 shrink-0 transition-[translate] duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:translate-none',
                    colour.chevron,
                )}
                strokeWidth={2.5}
            />
        </button>
    );
}
