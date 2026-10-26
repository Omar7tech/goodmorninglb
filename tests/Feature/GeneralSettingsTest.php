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
