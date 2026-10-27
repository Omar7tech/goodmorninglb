import { usePage } from '@inertiajs/react';

import { CategoryBlock } from '@/components/menu/category-block';
import { CategoryBubble } from '@/components/menu/category-bubble';
import { CategoryCard } from '@/components/menu/category-card';
import { CategoryPopout } from '@/components/menu/category-popout';
import { CategoryRow } from '@/components/menu/category-row';
import type { Category, CategoryLayout } from '@/types';

/**
 * The menu's landing view: the categories, drawn however the shop has chosen.
 * Choosing one swaps the page over to that category's products, client-side.
 *
 * The layout is a setting rather than a breakpoint — a menu of six categories
 * and a menu of forty want different things, and only the owner knows which
 * they have. Every one lists the same categories in the same order; they differ
 * in how much of the screen each one is given and what it can therefore say.
 */
export function CategoryGrid({
    categories,
    onSelect,
}: {
    categories: readonly Category[];
    onSelect: (id: number) => void;
}) {
    const layout: CategoryLayout =
        usePage().props.categoryLayout ?? ('grid' as const);

    if (categories.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-muted-foreground">
                The menu is being written. Please check back soon.
            </p>
        );
    }

    if (layout === 'rows') {
        return (
            // Two bands abreast on a monitor. A band is a wide shape by
            // design, but one run across a desk screen has its name at one end
            // and its picture at the other with a stretch of green in
            // between — pairing them keeps each band the proportion it was
            // drawn at.
            <div className="flex flex-col gap-2.5 sm:gap-3 lg:grid lg:grid-cols-2">
                {categories.map((category) => (
                    <CategoryRow
                        key={category.id}
                        category={category}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        );
    }

    if (layout === 'popout') {
        return (
            // Room above every row for the icons to rise into, which is what
            // the large vertical gap and the top padding are for.
            <div className="grid grid-cols-2 gap-x-3 gap-y-12 pt-10 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-14 lg:grid-cols-5">
                {categories.map((category, index) => (
                    <CategoryPopout
                        key={category.id}
                        category={category}
                        index={index}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        );
    }

    if (layout === 'bubbles') {
        return (
            // Four to a row on a phone, more as the screen allows: a bubble
            // is small enough that the whole menu fits on one screen.
            <div className="grid grid-cols-4 gap-x-2 gap-y-5 sm:grid-cols-5 lg:grid-cols-8">
                {categories.map((category, index) => (
                    <CategoryBubble
                        key={category.id}
                        category={category}
                        index={index}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        );
    }

    if (layout === 'blocks') {
        return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {categories.map((category, index) => (
                    <CategoryBlock
                        key={category.id}
                        category={category}
                        index={index}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        );
    }

    return (
        // A little more air than the product list gets: each box now throws a
        // shadow of its own, and boxes packed tighter than that would light one
        // another rather than the panel.
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {categories.map((category) => (
                <CategoryCard
                    key={category.id}
                    category={category}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
