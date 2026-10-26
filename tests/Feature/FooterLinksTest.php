<?php

use Inertia\Testing\AssertableInertia;

it('drops footer links that are missing a name or an address', function (): void {
    $settings = settings([
        'social_links' => [
            ['label' => 'Instagram', 'url' => 'https://www.instagram.com/good_morning_aley'],
            ['label' => '', 'url' => 'https://www.tiktok.com/@goodmorningaley'],
            ['label' => 'Facebook', 'url' => null],
            ['label' => 'WhatsApp', 'url' => 'https://wa.me/96171000000'],
        ],
    ]);

    expect($settings->usableSocialLinks())->toBe([
        ['label' => 'Instagram', 'url' => 'https://www.instagram.com/good_morning_aley'],
        ['label' => 'WhatsApp', 'url' => 'https://wa.me/96171000000'],
    ]);
});

it('shares the footer links with the storefront in the configured order', function (): void {
    settings([
        'social_links' => [
            ['label' => 'WhatsApp', 'url' => 'https://wa.me/96171000000'],
            ['label' => 'Instagram', 'url' => 'https://www.instagram.com/good_morning_aley'],
        ],
    ]);

    $this->get(route('menu.dine-in'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('socialLinks', [
                ['label' => 'WhatsApp', 'url' => 'https://wa.me/96171000000'],
                ['label' => 'Instagram', 'url' => 'https://www.instagram.com/good_morning_aley'],
            ])
        );
});

it('shares an empty list when no footer links are configured', function (): void {
    settings(['social_links' => []]);

    $this->get(route('menu.dine-in'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('socialLinks', [])
        );
});

it('shares the location link with the storefront', function (): void {
    settings(['location_url' => 'https://maps.app.goo.gl/goodmorning']);

    $this->get(route('menu.dine-in'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('locationUrl', 'https://maps.app.goo.gl/goodmorning')
        );
});

it('shares no location link when none is configured', function (?string $configured): void {
    settings(['location_url' => $configured]);

    $this->get(route('menu.dine-in'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('locationUrl', null)
        );
})->with([
    'unset' => null,
    'blank' => '',
    'whitespace' => '   ',
]);
