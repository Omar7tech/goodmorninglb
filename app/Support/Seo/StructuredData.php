<?php

namespace App\Support\Seo;

use App\Enums\ShopStatusMode;
use App\Enums\Weekday;
use App\Models\Category;
use App\Models\Product;
use App\Settings\GeneralSettings;
use Illuminate\Support\Collection;

/**
 * The schema.org graph for a page: the shop, the site, the page itself, its
 * breadcrumb trail, and whatever the page is about — on the menu pages, the
 * whole menu, section by section and dish by dish with its prices.
 *
 * One `@graph` rather than loose scripts, so every node points at the others
 * by `@id` and Google reads them as one restaurant with one website and one
 * menu.
 */
final class StructuredData
{
    public function __construct(private readonly GeneralSettings $settings) {}

    /** @return array<string, mixed> */
    public function graph(SeoPage $page): array
    {
        return [
            '@context' => 'https://schema.org',
            '@graph' => [
                $this->restaurant(),
                $this->website(),
                $this->webPage($page),
                $this->breadcrumbs($page),
                ...$page->nodes,
            ],
        ];
    }

    /**
     * A menu as schema.org reads one: a section per category, an item per
     * dish, and an offer per size at its price in dollars. Photos, sizes and
     * calories go in where the dashboard has them, and nothing is published
     * empty.
     *
     * @param  Collection<int, Category>  $categories
     * @return array<string, mixed>
     */
    public function menu(string $id, string $name, string $url, Collection $categories): array
    {
        return [
            '@type' => 'Menu',
            '@id' => $id,
            'name' => Shop::FULL_NAME.' '.strtolower($name),
            'url' => $url,
            'inLanguage' => 'en',
            'hasMenuSection' => $categories->map(fn (Category $category): array => array_filter([
                '@type' => 'MenuSection',
                'name' => $category->title,
                'description' => $category->description,
                'image' => $category->getFirstMediaUrl('image') ?: null,
                'url' => $url.'?category='.$category->slug,
                'hasMenuItem' => $category->products->map(fn (Product $product): array => $this->menuItem($product, $url))->all(),
            ]))->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function menuItem(Product $product, string $url): array
    {
        $offers = array_map(fn (array $row): array => array_filter([
            '@type' => 'Offer',
            'name' => $row['name'],
            'price' => number_format($row['price'], 2, '.', ''),
            'priceCurrency' => 'USD',
            'availability' => 'https://schema.org/InStock',
            'url' => $url,
        ], fn (mixed $value): bool => $value !== null), Dish::prices($product));

        return array_filter([
            '@type' => 'MenuItem',
            'name' => $product->title,
            'description' => $product->description,
            'image' => Dish::image($product),
            'offers' => count($offers) === 1 ? $offers[0] : $offers,
            'nutrition' => $product->calories !== null ? [
                '@type' => 'NutritionInformation',
                'calories' => $product->calories.' calories',
            ] : null,
        ], fn (mixed $value): bool => $value !== null && $value !== '');
    }

    /**
     * The shop: the node Google builds the business panel from. Contact
     * details, hours, the map and the profiles come from the dashboard, and
     * anything left unset is left out rather than published empty.
     *
     * @return array<string, mixed>
     */
    private function restaurant(): array
    {
        $home = route('home');
        $phone = $this->phone();

        return array_filter([
            '@type' => 'Restaurant',
            '@id' => $home.'#restaurant',
            'name' => Shop::FULL_NAME,
            'alternateName' => [Shop::NAME, 'Good Morning Lebanon'],
            'description' => Shop::DESCRIPTION,
            'slogan' => 'Good Choices. Good Morning',
            'url' => $home,
            'logo' => [
                '@type' => 'ImageObject',
                '@id' => $home.'#logo',
                'url' => asset(Shop::LOGO),
                'width' => 512,
                'height' => 512,
                'caption' => Shop::FULL_NAME,
            ],
            'image' => [asset(Shop::IMAGE), asset(Shop::LOGO)],
            'foundingDate' => (string) Shop::FOUNDED,
            'telephone' => $phone,
            'priceRange' => '$',
            'currenciesAccepted' => 'USD',
            'paymentAccepted' => 'Cash',
            'servesCuisine' => Shop::CUISINES,
            'acceptsReservations' => 'False',
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => Shop::LOCALITY,
                'addressRegion' => Shop::REGION,
                'addressCountry' => Shop::COUNTRY,
            ],
            'areaServed' => ['@type' => 'City', 'name' => Shop::LOCALITY],
            'hasMap' => $this->settings->usableLocationUrl(),
            'openingHoursSpecification' => $this->openingHours(),
            'hasMenu' => ['@id' => route('menu.dine-in').'#menu'],
            'menu' => route('menu.dine-in'),
            'potentialAction' => $this->settings->canReceiveOrders() ? [
                '@type' => 'OrderAction',
                'target' => [
                    '@type' => 'EntryPoint',
                    'urlTemplate' => route('menu.delivery'),
                    'inLanguage' => 'en',
                    'actionPlatform' => [
                        'https://schema.org/DesktopWebPlatform',
                        'https://schema.org/MobileWebPlatform',
                    ],
                ],
                'deliveryMethod' => 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet',
            ] : null,
            'sameAs' => $this->sameAs(),
        ], fn (mixed $value): bool => $value !== null && $value !== []);
    }

    /** @return array<string, mixed> */
    private function website(): array
    {
        $home = route('home');

        return [
            '@type' => 'WebSite',
            '@id' => $home.'#website',
            'url' => $home,
            'name' => Shop::FULL_NAME,
            'alternateName' => Shop::NAME,
            'inLanguage' => 'en',
            'publisher' => ['@id' => $home.'#restaurant'],
        ];
    }

    /** @return array<string, mixed> */
    private function webPage(SeoPage $page): array
    {
        $home = route('home');
        $image = $page->images[0] ?? asset(Shop::IMAGE);

        return array_filter([
            '@type' => $page->schemaType,
            '@id' => $page->canonical.'#webpage',
            'url' => $page->canonical,
            'name' => $page->title,
            'description' => $page->description,
            'inLanguage' => 'en',
            'isPartOf' => ['@id' => $home.'#website'],
            'about' => ['@id' => $home.'#restaurant'],
            'mainEntity' => $page->mainEntityId ? ['@id' => $page->mainEntityId] : null,
            'primaryImageOfPage' => ['@type' => 'ImageObject', 'url' => $image],
            'breadcrumb' => ['@id' => $page->canonical.'#breadcrumb'],
        ]);
    }

    /** @return array<string, mixed> */
    private function breadcrumbs(SeoPage $page): array
    {
        return [
            '@type' => 'BreadcrumbList',
            '@id' => $page->canonical.'#breadcrumb',
            'itemListElement' => array_map(fn (array $crumb, int $index): array => [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $crumb['name'],
                'item' => $crumb['url'],
            ], $page->breadcrumbs, array_keys($page->breadcrumbs)),
        ];
    }

    /**
     * The week's hours, days with the same times gathered into one entry.
     * Only published while the shop runs on its schedule: a shop opened and
     * closed by hand has no hours worth promising Google.
     *
     * @return list<array<string, mixed>>
     */
    private function openingHours(): array
    {
        if ($this->settings->status_mode !== ShopStatusMode::Automatic) {
            return [];
        }

        $groups = [];

        foreach ($this->settings->storefrontOpeningHours() as $row) {
            if ($row['isClosed'] || $row['opensAt'] === '' || $row['closesAt'] === '') {
                continue;
            }

            $key = $row['opensAt'].'-'.$row['closesAt'];
            $groups[$key]['opens'] = $row['opensAt'];
            $groups[$key]['closes'] = $row['closesAt'];
            $groups[$key]['days'][] = Weekday::from($row['day'])->getLabel();
        }

        return array_values(array_map(fn (array $group): array => [
            '@type' => 'OpeningHoursSpecification',
            'dayOfWeek' => $group['days'],
            'opens' => $group['opens'],
            'closes' => $group['closes'],
        ], $groups));
    }

    /** The shop's WhatsApp number in international form, or null when unset. */
    private function phone(): ?string
    {
        $digits = preg_replace('/\D/', '', (string) $this->settings->whatsapp_number);

        return $digits !== '' ? '+'.$digits : null;
    }

    /**
     * The shop's profiles elsewhere, so Google can tie them to it. A chat link
     * or a link back to this site is not a profile, and is dropped.
     *
     * @return list<string>
     */
    private function sameAs(): array
    {
        $host = parse_url(route('home'), PHP_URL_HOST);

        $urls = array_filter(
            array_column($this->settings->usableSocialLinks(), 'url'),
            function (string $url) use ($host): bool {
                $urlHost = parse_url($url, PHP_URL_HOST);

                return filter_var($url, FILTER_VALIDATE_URL) !== false
                    && $urlHost !== $host
                    && ! in_array($urlHost, ['wa.me', 'api.whatsapp.com'], true);
            },
        );

        return array_values(array_unique($urls));
    }
}
