<?php

namespace App\Support\Seo;

use App\Enums\OrderType;
use App\Enums\Weekday;
use App\Models\Category;
use App\Models\Product;
use App\Settings\GeneralSettings;
use App\Support\MenuCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Works out the {@see SeoPage} for the request being answered.
 *
 * The route name says which page it is, and the menu itself supplies the
 * words and photos: the menu pages are titled by what is actually on them
 * and carry every dish, its price and its photo into the head and the plain
 * outline a crawler reads, without a single controller having to know about
 * SEO.
 */
final class PageResolver
{
    /** A description is cut to about what Google prints under a result. */
    private const int DESCRIPTION_LENGTH = 158;

    /** How many dish photos a menu page offers the graph and link previews. */
    private const int IMAGE_LIMIT = 12;

    public function __construct(
        private readonly GeneralSettings $settings,
        private readonly MenuCatalog $catalog,
        private readonly StructuredData $structuredData,
    ) {}

    public function resolve(Request $request): SeoPage
    {
        return match ($request->route()?->getName()) {
            'home' => $this->home(),
            'menu.dine-in' => $this->menu(OrderType::DineIn),
            'menu.delivery' => $this->menu(OrderType::Delivery),
            // The counter tablet's board: the dine-in menu again, for the
            // shop's own screen, and never a page of its own in search.
            'menu.screen' => $this->screen(),
            default => $this->fallback($request),
        };
    }

    private function home(): SeoPage
    {
        $categories = $this->catalog->categories(OrderType::DineIn);

        return new SeoPage(
            title: Shop::FULL_NAME.' | Crepes, Waffles, Fresh Juice & Desserts',
            description: Shop::DESCRIPTION,
            canonical: route('home'),
            heading: Shop::FULL_NAME.': fresh desserts and drinks in Aley',
            breadcrumbs: [$this->crumb('Home', route('home'))],
            images: [asset(Shop::IMAGE)],
            outline: [
                $this->section('Our menus', null, $this->menusOutline()),
                $this->section('What we make', null, array_values($categories->map(fn (Category $category): array => [
                    'label' => $category->title,
                    'url' => route('menu.dine-in', ['category' => $category->slug]),
                    'text' => $category->description,
                ])->all())),
                $this->section('Opening hours', null, $this->hoursOutline()),
                $this->section('Find us', 'Good Morning, '.Shop::LOCALITY.', '.Shop::REGION.', '.Shop::COUNTRY_NAME.'. Serving since '.Shop::FOUNDED.'.', array_values(array_filter([
                    $this->settings->usableLocationUrl() ? ['label' => 'Directions on Google Maps', 'url' => $this->settings->usableLocationUrl()] : null,
                    $this->settings->usableReviewUrl() ? ['label' => 'Leave us a review on Google', 'url' => $this->settings->usableReviewUrl()] : null,
                ]))),
            ],
        );
    }

    /**
     * A menu page: titled and described by what is really on it, with every
     * dish, size and price in the graph as a schema.org Menu and in the plain
     * outline, and the dishes' photos offered to link previews and Google
     * Images.
     *
     * A category picked with `?category=` is the same page opened at a
     * different place, so the canonical is always the bare menu: one URL
     * collects every link to it.
     */
    private function menu(OrderType $orderType): SeoPage
    {
        $delivery = $orderType === OrderType::Delivery;
        $routeName = $delivery ? 'menu.delivery' : 'menu.dine-in';
        $url = route($routeName);
        $categories = $this->catalog->categories($orderType);
        $dishes = $categories->sum(fn (Category $category): int => $category->products->count());
        $names = $categories->pluck('title')->take(4)->implode(', ');

        $title = $delivery
            ? Shop::title('Dessert & Juice Delivery in Aley')
            : Shop::title('Menu & Prices');
        $heading = $delivery ? 'Order for delivery in Aley' : 'Our menu';
        $description = $delivery
            ? "Order {$dishes} desserts and drinks from Good Morning for delivery in Aley: {$names}. Pick on the menu, send your order on WhatsApp."
            : "The full Good Morning menu in Aley with prices: {$dishes} dishes, from {$names} and more. Made fresh since ".Shop::FOUNDED.'.';

        $menuId = $url.'#menu';

        return new SeoPage(
            title: $title,
            description: Str::limit($description, self::DESCRIPTION_LENGTH, '…'),
            canonical: $url,
            heading: $heading,
            schemaType: $delivery ? 'WebPage' : 'CollectionPage',
            breadcrumbs: $this->trail([($delivery ? 'Delivery menu' : 'Menu') => $url]),
            images: $this->menuImages($categories),
            nodes: [$this->structuredData->menu($menuId, $delivery ? 'Delivery menu' : 'Menu', $url, $categories)],
            outline: array_values($categories->map(fn (Category $category): array => $this->section(
                $category->title,
                $category->description,
                array_values($category->products->map(fn (Product $product): array => [
                    'label' => $product->title,
                    'text' => $product->description,
                    'price' => $this->priceOutline($product),
                ])->all()),
            ))->all()),
            mainEntityId: $menuId,
        );
    }

    /**
     * The two menus, the delivery one only while orders are being taken.
     *
     * @return list<array{label: string, url: string, text: string}>
     */
    private function menusOutline(): array
    {
        $menus = [
            ['label' => 'Dine-in menu', 'url' => route('menu.dine-in'), 'text' => 'Everything we serve at the shop in Aley, with prices.'],
        ];

        if ($this->settings->online_ordering_active) {
            $menus[] = ['label' => 'Order for delivery', 'url' => route('menu.delivery'), 'text' => 'Order on WhatsApp and we bring it to your door.'];
        }

        return $menus;
    }

    private function screen(): SeoPage
    {
        return new SeoPage(
            title: Shop::title('Counter Screen'),
            description: Shop::DESCRIPTION,
            canonical: route('menu.dine-in'),
            heading: 'Counter screen',
            indexable: false,
        );
    }

    /**
     * Any page without its own entry: the shop's own copy, and kept out of
     * search, so an unforeseen page never competes with the real ones.
     */
    private function fallback(Request $request): SeoPage
    {
        return new SeoPage(
            title: Shop::FULL_NAME,
            description: Shop::DESCRIPTION,
            canonical: url()->to($request->path()),
            heading: Shop::FULL_NAME,
            indexable: false,
        );
    }

    /**
     * The best dish photos on a menu: top sellers first, then the rest in
     * menu order, so a shared link leads with what the shop is known for.
     *
     * @param  Collection<int, Category>  $categories
     * @return list<string>
     */
    private function menuImages(Collection $categories): array
    {
        $products = $categories->flatMap(fn (Category $category) => $category->products);

        return array_values($products
            ->sortByDesc(fn (Product $product): bool => (bool) $product->is_featured)
            ->map(fn (Product $product): ?string => Dish::image($product))
            ->filter()
            ->unique()
            ->take(self::IMAGE_LIMIT)
            ->all());
    }

    /** Every size and its price, as a line under the dish. */
    private function priceOutline(Product $product): string
    {
        return collect(Dish::prices($product))
            ->map(fn (array $row): string => ($row['name'] !== null ? $row['name'].' ' : '').Dish::money($row['price']))
            ->implode(' · ');
    }

    /**
     * The week's hours, one line a day, closed days said as much.
     *
     * @return list<array{label: string, text: string}>
     */
    private function hoursOutline(): array
    {
        return array_map(fn (array $row): array => [
            'label' => Weekday::from($row['day'])->getLabel(),
            'text' => $row['isClosed'] ? 'Closed' : $row['opensAt'].' – '.$row['closesAt'],
        ], $this->settings->storefrontOpeningHours());
    }

    /**
     * @param  list<array{label: string, url?: string|null, text?: string|null, price?: string|null}>  $items
     * @return array{heading: string, text: string|null, items: list<array{label: string, url?: string|null, text?: string|null, price?: string|null}>}
     */
    private function section(string $heading, ?string $text, array $items): array
    {
        return ['heading' => $heading, 'text' => $text, 'items' => $items];
    }

    /**
     * Home first, then the given pages in order.
     *
     * @param  array<string, string>  $pages
     * @return list<array{name: string, url: string}>
     */
    private function trail(array $pages): array
    {
        $trail = [$this->crumb('Home', route('home'))];

        foreach ($pages as $name => $url) {
            $trail[] = $this->crumb($name, $url);
        }

        return $trail;
    }

    /** @return array{name: string, url: string} */
    private function crumb(string $name, string $url): array
    {
        return ['name' => $name, 'url' => $url];
    }
}
