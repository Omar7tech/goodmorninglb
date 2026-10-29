<?php

namespace App\Support\Seo;

use App\Models\Product;

/**
 * A dish as the SEO reads it: what it costs, in every size it comes in, and
 * its photo. Kept apart from the storefront's resource so the prices a
 * crawler is told are worked out the same way everywhere they appear.
 */
final class Dish
{
    /**
     * What each size costs, the offer price where there is one. A dish sold
     * in one size is one row with no name.
     *
     * @return non-empty-list<array{name: string|null, price: float}>
     */
    public static function prices(Product $product): array
    {
        $rows = [];

        foreach ($product->variants ?? [] as $variant) {
            if (blank($variant['name'] ?? null)) {
                continue;
            }

            $price = filled($variant['discount_price'] ?? null) ? $variant['discount_price'] : ($variant['price'] ?? 0);

            $rows[] = ['name' => (string) $variant['name'], 'price' => (float) $price];
        }

        if ($rows !== []) {
            return $rows;
        }

        $price = $product->discount_price !== null ? $product->discount_price : $product->price;

        return [['name' => null, 'price' => (float) $price]];
    }

    /** The price as a customer reads it: one figure, or "from" the cheapest size. */
    public static function priceLabel(Product $product): string
    {
        $prices = self::prices($product);
        $cheapest = min(array_column($prices, 'price'));

        return (count($prices) > 1 ? 'from ' : '').self::money($cheapest);
    }

    public static function money(float $amount): string
    {
        return '$'.number_format($amount, 2);
    }

    /** The dish's own photo, or null when it has none yet. */
    public static function image(Product $product): ?string
    {
        return $product->getFirstMediaUrl('image', 'webp') ?: null;
    }
}
