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
