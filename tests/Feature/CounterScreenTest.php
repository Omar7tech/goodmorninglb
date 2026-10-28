<?php

use App\Enums\OrderType;
use App\Models\Category;
use App\Models\Product;
use App\Settings\GeneralSettings;
use Inertia\Testing\AssertableInertia;

it('shows the dine-in menu full screen for the counter tablet', function (): void {
    $category = Category::factory()->create(['title' => 'Waffles']);

    Product::factory()->for($category)->orderType(OrderType::DineIn)->create(['title' => 'Dine in only']);
    Product::factory()->for($category)->orderType(OrderType::Delivery)->create(['title' => 'Delivery only']);

    $this->get(route('menu.screen'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('screen')
            ->count('categories', 1)
            ->count('categories.0.products', 1)
            ->where('categories.0.products.0.name', 'Dine in only')
            ->has('slides')
        );
});

it('turns to the next category every ten seconds by default', function (): void {
    expect(app(GeneralSettings::class)->screen_rotate_seconds)->toBe(10);

    $this->get(route('menu.screen'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('rotateSeconds', 10)
        );
});

it('uses the seconds set in the dashboard, never faster than three', function (int $configured, int $shared): void {
    settings(['screen_rotate_seconds' => $configured]);

    $this->get(route('menu.screen'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('rotateSeconds', $shared)
        );
})->with([
    'slower' => [25, 25],
    'too fast' => [1, 3],
]);
