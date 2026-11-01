<?php

use App\Settings\GeneralSettings;
use Inertia\Testing\AssertableInertia;

it('hides the budget picker by default', function (): void {
    expect(app(GeneralSettings::class)->budget_picker_enabled)->toBeFalse();

    $this->get(route('menu.dine-in'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('budgetPicker', false)
        );
});

it('offers the budget picker when the shop turns it on', function (): void {
    settings(['budget_picker_enabled' => true]);

    $this->get(route('menu.delivery'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('budgetPicker', true)
        );
});
