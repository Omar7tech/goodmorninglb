<?php

use App\Enums\OrderType;
use App\Enums\ScreenTheme;
use App\Models\Category;
use App\Models\Product;
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

it('starts out turning every ten seconds in the classic theme', function (): void {
    $this->get(route('menu.screen'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('screen', [
                'autoRotate' => true,
                'rotateSeconds' => 10,
                'resumeSeconds' => 20,
                'theme' => ScreenTheme::Classic->value,
                'columns' => 5,
                'showSlider' => true,
            ])
        );
});

it('shares the options set in the dashboard', function (): void {
    settings([
        'screen_auto_rotate' => false,
        'screen_rotate_seconds' => 25,
        'screen_resume_seconds' => 60,
        'screen_columns' => 4,
        'screen_show_slider' => false,
    ]);

    $this->get(route('menu.screen'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('screen.autoRotate', false)
            ->where('screen.rotateSeconds', 25)
            ->where('screen.resumeSeconds', 60)
            ->where('screen.columns', 4)
            ->where('screen.showSlider', false)
        );
});

it('shares whichever theme the shop has chosen', function (ScreenTheme $theme): void {
    settings(['screen_theme' => $theme]);

    $this->get(route('menu.screen'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('screen.theme', $theme->value)
        );
})->with(ScreenTheme::cases());

it('keeps the timings and columns within what the screen can draw', function (): void {
    settings([
        'screen_rotate_seconds' => 1,
        'screen_resume_seconds' => 1,
        'screen_columns' => 12,
    ]);

    $this->get(route('menu.screen'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('screen.rotateSeconds', 3)
            ->where('screen.resumeSeconds', 5)
            ->where('screen.columns', 6)
        );
});
