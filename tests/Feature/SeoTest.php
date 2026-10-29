<?php

use App\Enums\OrderType;
use App\Enums\ShopStatusMode;
use App\Models\Category;
use App\Models\Product;

/**
 * The schema.org graph a page prints, decoded.
 *
 * @return array<string, mixed>
 */
function schemaGraph(string $html): array
{
    preg_match('#<script data-inertia="schema" type="application/ld\+json">(.*?)</script>#s', $html, $match);

    return json_decode($match[1] ?? '', true, flags: JSON_THROW_ON_ERROR);
}

/**
 * The first node of a type in a graph.
 *
 * @param  array<string, mixed>  $graph
 * @return array<string, mixed>
 */
function schemaNode(array $graph, string $type): array
{
    return collect($graph['@graph'])->firstWhere('@type', $type) ?? [];
}

it('writes the title, description and canonical into the first response', function (): void {
    $this->get(route('home'))
        ->assertOk()
        ->assertSee('<title data-inertia="title">Good Morning Aley | Crepes, Waffles, Fresh Juice &amp; Desserts</title>', escape: false)
        ->assertSee('<link data-inertia="canonical" rel="canonical" href="'.route('home').'">', escape: false)
        ->assertSee('<meta data-inertia="og:image" property="og:image" content="'.asset('og/good-morning.jpg').'">', escape: false)
        ->assertSee('index, follow, max-image-preview:large', escape: false);
});

it('describes the shop as a restaurant in Aley with its menu', function (): void {
    $restaurant = schemaNode(schemaGraph($this->get(route('home'))->getContent()), 'Restaurant');

    expect($restaurant['name'])->toBe('Good Morning Aley')
        ->and($restaurant['address']['addressLocality'])->toBe('Aley')
        ->and($restaurant['hasMenu']['@id'])->toBe(route('menu.dine-in').'#menu')
        ->and($restaurant['priceRange'])->toBe('$');
});

it('puts every dish on the menu into the graph with its prices', function (): void {
    $category = Category::factory()->create(['title' => 'Juices']);
    Product::factory()->for($category)->create(['title' => 'Lemonade', 'price' => 3]);
    Product::factory()->for($category)->create([
        'title' => 'Orange Juice',
        'variants' => [
            ['name' => 'S', 'price' => 2.5],
            ['name' => 'L', 'price' => 3.5],
        ],
    ]);

    $html = $this->get(route('menu.dine-in'))->assertOk()->getContent();
    $menu = schemaNode(schemaGraph($html), 'Menu');
    $items = collect($menu['hasMenuSection'][0]['hasMenuItem'])->keyBy('name');

    expect($menu['hasMenuSection'][0]['name'])->toBe('Juices')
        ->and($items['Lemonade']['offers']['price'])->toBe('3.00')
        ->and($items['Lemonade']['offers']['priceCurrency'])->toBe('USD')
        ->and(collect($items['Orange Juice']['offers'])->pluck('price', 'name')->all())->toBe(['S' => '2.50', 'L' => '3.50']);

    // And the same, in plain HTML, for crawlers that don't run JavaScript.
    expect($html)->toContain('<h2>Juices</h2>')
        ->toContain('<strong>Orange Juice</strong>')
        ->toContain('S $2.50 · L $3.50');
});

it('keeps one canonical for a menu opened at any category', function (): void {
    $category = Category::factory()->create(['title' => 'Waffles']);
    Product::factory()->for($category)->create();

    $this->get(route('menu.dine-in', ['category' => $category->slug]))
        ->assertSee('<link data-inertia="canonical" rel="canonical" href="'.route('menu.dine-in').'">', escape: false);
});

it('keeps the counter screen out of search', function (): void {
    $this->get(route('menu.screen'))
        ->assertOk()
        ->assertSee('<meta data-inertia="robots" name="robots" content="noindex, follow">', escape: false)
        ->assertDontSee('application/ld+json', escape: false);
});

it('publishes the opening hours only while the shop runs on its schedule', function (): void {
    settings(['status_mode' => ShopStatusMode::Automatic]);

    $restaurant = schemaNode(schemaGraph($this->get(route('home'))->getContent()), 'Restaurant');

    expect($restaurant['openingHoursSpecification'])->not->toBeEmpty()
        ->and($restaurant['openingHoursSpecification'][0]['@type'])->toBe('OpeningHoursSpecification');

    settings(['status_mode' => ShopStatusMode::Manual]);

    $restaurant = schemaNode(schemaGraph($this->get(route('home'))->getContent()), 'Restaurant');

    expect($restaurant)->not->toHaveKey('openingHoursSpecification');
});

it('shares the head with the app so it survives client-side visits', function (): void {
    $this->get(route('menu.dine-in'))
        ->assertInertia(fn ($page) => $page->has('head'));
});

it('serves robots.txt pointing at the sitemap and closing off the dashboard', function (): void {
    $this->get('/robots.txt')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('Disallow: /admin')
        ->assertSee('Disallow: /menu/screen')
        ->assertSee('Sitemap: '.route('seo.sitemap'));
});

it('lists the menus in the sitemap, and the delivery menu only while it is open', function (bool $ordering): void {
    settings(['online_ordering_active' => $ordering]);

    $response = $this->get('/sitemap.xml')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertSee('<loc>'.route('home').'</loc>', escape: false)
        ->assertSee('<loc>'.route('menu.dine-in').'</loc>', escape: false);

    $ordering
        ? $response->assertSee('<loc>'.route('menu.delivery').'</loc>', escape: false)
        : $response->assertDontSee('<loc>'.route('menu.delivery').'</loc>', escape: false);
})->with(['ordering open' => true, 'dine-in only' => false]);

it('offers only dishes sold on a menu to that menu', function (): void {
    $category = Category::factory()->create();
    Product::factory()->for($category)->orderType(OrderType::Delivery)->create(['title' => 'Delivery only']);
    Product::factory()->for($category)->orderType(OrderType::DineIn)->create(['title' => 'Dine in only']);

    expect($this->get(route('menu.dine-in'))->getContent())
        ->toContain('<strong>Dine in only</strong>')
        ->not->toContain('<strong>Delivery only</strong>');
});
