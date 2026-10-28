<?php

use Inertia\Testing\AssertableInertia;

it('shares dollar-only pricing with the storefront', function (): void {
    settings(['charge_delivery' => true, 'delivery_fee' => 2]);

    $this->get(route('menu.dine-in'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('pricing', ['deliveryFeeUsd' => 2])
        );
});

it('no longer stores any Lebanese pound settings', function (): void {
    $stored = DB::table('settings')->where('group', 'general')->pluck('name');

    expect($stored)->not->toContain('show_lbp_prices')
        ->not->toContain('lbp_exchange_rate')
        ->not->toContain('price_display');
});
