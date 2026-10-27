<?php

use App\Filament\Pages\ManageGeneral;
use App\Models\User;
use App\Settings\GeneralSettings;
use Livewire\Livewire;

it('starts with the old site\'s social links', function (): void {
    expect(app(GeneralSettings::class)->usableSocialLinks())->toBe([
        ['label' => 'WhatsApp', 'url' => 'https://wa.me/96170075017'],
        ['label' => 'Instagram', 'url' => 'https://www.instagram.com/good_morning_aley'],
        ['label' => 'Facebook', 'url' => 'https://www.facebook.com/share/1Cs82o5W1h/'],
    ]);
});

it('saves social links from the settings page in the order given', function (): void {
    $this->actingAs(User::factory()->create());

    Livewire::test(ManageGeneral::class)
        ->assertOk()
        ->set('data.social_links', [
            'a' => ['label' => 'TikTok', 'url' => 'https://www.tiktok.com/@goodmorningaley'],
            'b' => ['label' => 'Instagram', 'url' => 'https://www.instagram.com/good_morning_aley'],
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    expect(app(GeneralSettings::class)->refresh()->usableSocialLinks())->toBe([
        ['label' => 'TikTok', 'url' => 'https://www.tiktok.com/@goodmorningaley'],
        ['label' => 'Instagram', 'url' => 'https://www.instagram.com/good_morning_aley'],
    ]);
});

it('rejects a link that is not a web address', function (): void {
    $this->actingAs(User::factory()->create());

    Livewire::test(ManageGeneral::class)
        ->set('data.social_links', [
            'a' => ['label' => 'Instagram', 'url' => 'not a link'],
        ])
        ->call('save')
        ->assertHasFormErrors(['social_links.a.url' => 'url']);
});

it('leaves half-filled rows out of the footer links', function (): void {
    $settings = app(GeneralSettings::class);
    $settings->social_links = [
        ['label' => 'Instagram', 'url' => 'https://www.instagram.com/good_morning_aley'],
        ['label' => 'TikTok', 'url' => null],
        ['label' => null, 'url' => 'https://example.com'],
    ];

    expect($settings->usableSocialLinks())->toBe([
        ['label' => 'Instagram', 'url' => 'https://www.instagram.com/good_morning_aley'],
    ]);
});

it('sends delivery orders to the old site\'s WhatsApp number by default', function (): void {
    $settings = app(GeneralSettings::class);

    expect($settings->whatsapp_number)->toBe('96170075017')
        ->and($settings->canReceiveOrders())->toBeTrue();
});

it('saves the storefront settings from the settings page', function (): void {
    $this->actingAs(User::factory()->create());

    Livewire::test(ManageGeneral::class)
        ->set('data.whatsapp_number', '96171123456')
        ->set('data.charge_delivery', true)
        ->set('data.delivery_fee', 2)
        ->set('data.category_layout', 'rows')
        ->call('save')
        ->assertHasNoFormErrors();

    $settings = app(GeneralSettings::class)->refresh();

    expect($settings->whatsapp_number)->toBe('96171123456')
        ->and($settings->deliveryFeeUsd())->toBe(2.0)
        ->and($settings->category_layout->value)->toBe('rows');
});
