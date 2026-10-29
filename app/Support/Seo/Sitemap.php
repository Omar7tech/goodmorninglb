<?php

namespace App\Support\Seo;

use App\Enums\OrderType;
use App\Models\Category;
use App\Models\Product;
use App\Settings\GeneralSettings;
use App\Support\MenuCatalog;
use DateTimeInterface;
use Illuminate\Support\Collection;

/**
 * Every public page a crawler should know about, with when it last changed
 * and the photographs on it, so the dishes reach Google Images alongside the
 * menu they are on.
 *
 * Built from the database on each request: a dish added in the dashboard is
 * in the sitemap the moment it is on the menu, and one taken off is gone from
 * it just as fast.
 */
final class Sitemap
{
    public function __construct(
        private readonly GeneralSettings $settings,
        private readonly MenuCatalog $catalog,
    ) {}

    /**
     * @return list<array{loc: string, lastmod: string|null, images: list<array{loc: string, title: string}>}>
     */
    public function entries(): array
    {
        $dineIn = $this->catalog->categories(OrderType::DineIn);
        $menuChanged = $this->lastChanged($dineIn);

        $entries = [
            $this->entry(route('home'), $menuChanged, [['loc' => asset(Shop::IMAGE), 'title' => Shop::FULL_NAME]]),
            $this->entry(route('menu.dine-in'), $menuChanged, $this->images($dineIn)),
        ];

        if ($this->settings->online_ordering_active) {
            $delivery = $this->catalog->categories(OrderType::Delivery);
            $entries[] = $this->entry(route('menu.delivery'), $this->lastChanged($delivery), $this->images($delivery));
        }

        return $entries;
    }

    /**
     * The lines of robots.txt: everything open but the dashboard and the
     * counter tablet's board, and where the sitemap is.
     *
     * @return list<string>
     */
    public function robots(): array
    {
        return [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /livewire',
            'Disallow: /menu/screen',
            '',
            'Sitemap: '.route('seo.sitemap'),
        ];
    }

    /**
     * @param  list<array{loc: string, title: string}>  $images
     * @return array{loc: string, lastmod: string|null, images: list<array{loc: string, title: string}>}
     */
    private function entry(string $loc, ?string $lastmod = null, array $images = []): array
    {
        return ['loc' => $loc, 'lastmod' => $lastmod, 'images' => $images];
    }

    /**
     * Each dish's photo, titled with the dish, once each.
     *
     * @param  Collection<int, Category>  $categories
     * @return list<array{loc: string, title: string}>
     */
    private function images(Collection $categories): array
    {
        return array_values($categories
            ->flatMap(fn (Category $category) => $category->products)
            ->map(fn (Product $product): ?array => ($image = Dish::image($product)) !== null
                ? ['loc' => $image, 'title' => $product->title]
                : null)
            ->filter()
            ->unique('loc')
            ->all());
    }

    /**
     * When the menu last changed: the newest edit to any of its categories
     * or dishes.
     *
     * @param  Collection<int, Category>  $categories
     */
    private function lastChanged(Collection $categories): ?string
    {
        $dates = $categories
            ->flatMap(fn (Category $category) => [$category->updated_at, ...$category->products->pluck('updated_at')])
            ->filter(fn (mixed $date): bool => $date instanceof DateTimeInterface);

        $latest = $dates->max();

        return $latest instanceof DateTimeInterface ? $latest->format(DateTimeInterface::ATOM) : null;
    }
}
