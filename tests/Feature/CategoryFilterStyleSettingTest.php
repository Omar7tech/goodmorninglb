<?php

use App\Enums\CategoryFilterStyle;
use Inertia\Testing\AssertableInertia;

it('keeps the pills as the default category filter', function (): void {
    $this->get(route('menu.dine-in'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('categoryFilterStyle', CategoryFilterStyle::Pills->value)
        );
});

it('shares whichever category filter the shop has chosen', function (CategoryFilterStyle $style): void {
    settings(['category_filter_style' => $style]);

    $this->get(route('menu.delivery'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('categoryFilterStyle', $style->value)
        );
})->with(CategoryFilterStyle::cases());
