import { useRef } from 'react';

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
 * The menu as customers know it: the categories down a lighter cream side
 * panel (across the top, held upright), the carousel and the open category's
 * name holding still above, and its dishes as plain photo cards scrolling
 * underneath.
 */
export function ClassicBoard({
    categories,
    activeIndex,
    active,
    onSelectCategory,
    onOpenDish,
    progressRef,
    scrollRef,
    portrait,
    uppercase,
    columns,
    slides,
    showSlider,
    onOpenSlide,
    idle,
    controls,
}: BoardProps) {
    return (
        <div
            className={cn(
                'flex size-full overflow-hidden bg-background',
                portrait ? 'flex-col' : 'flex-row',
            )}
        >
            <aside
                className={cn(
                    'flex shrink-0 bg-surface',
                    portrait
                        ? 'flex-col gap-4 border-b border-border px-6 pt-5 pb-4'
                        : 'w-64 flex-col gap-5 border-r border-border px-4 py-5 xl:w-72',
                )}
            >
                {/* The logo, with the two quiet controls tucked into the far
                    corner from it. */}
                <div className="flex items-start justify-between gap-4">
                    <BoardLogo className={portrait ? 'w-28' : 'w-32'} />
                    {controls('dark')}
                </div>

                <CategoryList
                    categories={categories}
                    activeIndex={activeIndex}
                    portrait={portrait}
                    uppercase={uppercase}
                    progressRef={progressRef}
                    onSelect={onSelectCategory}
                />
            </aside>

            {/* The carousel and the open category's name hold still at the
                top; only the dishes under them scroll, so whoever is browsing
                never loses which category they are in. */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <div
                    className={cn(
                        'flex shrink-0 flex-col gap-5',
                        portrait ? 'px-6 pt-5' : 'px-8 pt-6',
                    )}
                >
                    {showSlider && slides.length > 0 && (
                        <MenuSlider
                            slides={slides}
                            onOpen={onOpenSlide}
                            paused={!idle}
                            compact
                        />
                    )}

                    {active !== null && (
                        // Keyed by the category, so each turn of the board
                        // fades the new one in rather than swapping it under
                        // the reader's eye.
                        <header
                            key={active.id}
                            className="flex animate-in items-end justify-between gap-6 border-b border-border pb-4 duration-500 fade-in motion-reduce:animate-none"
                        >
                            <div className="flex min-w-0 flex-col gap-1.5">
                                <h1
                                    className={cn(
                                        'font-heading text-4xl leading-none text-primary xl:text-5xl',
                                        uppercase && 'uppercase',
                                    )}
                                >
                                    {active.name}
                                </h1>
                                {active.description && (
                                    <p className="truncate text-sm text-muted-foreground">
                                        {active.description}
                                    </p>
                                )}
                            </div>

                            <span className="shrink-0 text-sm font-medium text-muted-foreground tabular-nums">
                                {activeIndex + 1} / {categories.length}
                            </span>
                        </header>
                    )}
                </div>

                <div
                    ref={scrollRef}
                    className={cn(
                        'no-scrollbar min-h-0 flex-1 overflow-y-auto',
                        portrait ? 'px-6 pt-5 pb-8' : 'px-8 pt-5 pb-8',
                    )}
                >
                    {active !== null && (
                        <ul
                            key={active.id}
                            className={cn(
                                'grid animate-in duration-500 fade-in slide-in-from-bottom-3 motion-reduce:animate-none',
                                COLUMNS[columns] ?? COLUMNS[5],
                            )}
                        >
                            {active.products.map((product) => (
                                <li key={product.id}>
                                    <ProductMinimal
                                        product={product}
                                        quantity={0}
                                        onOpen={onOpenDish}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}

/**
 * The categories, as a column down the side or a strip across the top. The
 * open one is filled in green, with the countdown filling a bar along its
 * foot, and it is kept in view as the board turns.
 */
function CategoryList({
    categories,
    activeIndex,
    portrait,
    uppercase,
    progressRef,
    onSelect,
}: {
    categories: readonly Category[];
    activeIndex: number;
    portrait: boolean;
    uppercase: boolean;
    progressRef: BoardProps['progressRef'];
    onSelect: (index: number) => void;
}) {
    const listRef = useRef<HTMLUListElement>(null);
    useKeepActiveInView(listRef, activeIndex, portrait ? 'x' : 'y');

    return (
        <ul
            ref={listRef}
            className={cn(
                'relative no-scrollbar flex gap-1',
                portrait
                    ? '-mx-6 overflow-x-auto px-6'
                    : 'min-h-0 flex-1 flex-col overflow-y-auto',
            )}
        >
            {categories.map((category, index) => {
                const isActive = index === activeIndex;

                return (
                    <li key={category.id} className="shrink-0">
                        <button
                            type="button"
                            onClick={() => onSelect(index)}
                            aria-pressed={isActive}
                            className={cn(
                                'relative flex items-center gap-3 overflow-hidden rounded-2xl text-left transition-colors duration-300 ease-out focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                                portrait
                                    ? 'py-1.5 pr-4 pl-1.5'
                                    : 'w-full px-2 py-1.5',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-foreground hover:bg-primary/10',
                            )}
                        >
                            {/* Always on the green: the icons are drawn light,
                                to stand on it as they do on the category
                                boxes, and on anything paler they all but
                                vanish. The open one is ringed in cream to
                                stand off its own green row. */}
                            <span
                                className={cn(
                                    'flex size-11 shrink-0 items-center justify-center rounded-full bg-sage shadow-sm transition-shadow duration-300',
                                    isActive && 'ring-3 ring-cream/70',
                                )}
                            >
                                <CategoryArt
                                    category={category}
                                    className="max-h-[78%]"
                                    logoClassName="w-[76%]"
                                    imageClassName="aspect-square w-[74%]"
                                />
                            </span>

                            <span className="flex min-w-0 flex-col">
                                <span
                                    className={cn(
                                        'truncate font-heading text-lg leading-tight',
                                        uppercase && 'uppercase',
                                    )}
                                >
                                    {category.name}
                                </span>
                                <span
                                    className={cn(
                                        'text-xs tabular-nums',
                                        isActive
                                            ? 'text-primary-foreground/75'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {category.products.length === 1
                                        ? '1 item'
                                        : `${category.products.length} items`}
                                </span>
                            </span>

                            {/* The countdown to the next category, filling
                                along the open one's foot. */}
                            {isActive && (
                                <CountdownBar
                                    progressRef={progressRef}
                                    className="absolute inset-x-0 bottom-0 h-1 bg-primary-foreground/15"
                                />
                            )}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
