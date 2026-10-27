import { usePage } from '@inertiajs/react';

/**
 * Whether the storefront shouts the names the shop typed.
 *
 * Two questions rather than one: a menu whose categories are set in capitals
 * and whose dishes are not is a real house style, and the shop is the one who
 * knows which it keeps.
 *
 * Both default to false: names are drawn as the shop typed them unless it asks
 * otherwise, which is also what a page rendered before the setting existed
 * gets.
 */
export function useUppercaseCategoryTitles(): boolean {
    return usePage().props.uppercaseCategoryTitles ?? false;
}

export function useUppercaseProductTitles(): boolean {
    return usePage().props.uppercaseProductTitles ?? false;
}

/**
 * Which of a layout's colours a category at `index` takes: turn by turn
 * through all of them while the shop keeps the colourful setting on, the first
 * — the green — for every category when it is off.
 */
export function useCategoryColour(index: number, count: number): number {
    const colourful = usePage().props.colourfulCategories ?? true;

    return colourful ? index % count : 0;
}
