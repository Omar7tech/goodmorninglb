<?php

use App\Settings\GeneralSettings;
use Inertia\Testing\AssertableInertia;

it('offers the budget picker by default', function (): void {
    expect(app(GeneralSettings::class)->budget_picker_enabled)->toBeTrue();

    $this->get(route('menu.dine-in'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('budgetPicker', true)
        );
});

it('hides the budget picker when the shop turns it off', function (): void {
    settings(['budget_picker_enabled' => false]);

    $this->get(route('menu.delivery'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('budgetPicker', false)
        );
});
