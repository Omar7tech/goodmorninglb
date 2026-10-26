<?php

use App\Models\Slide;
use Database\Seeders\CategorySeeder;
use Database\Seeders\ProductSeeder;
use Database\Seeders\SlideSeeder;

it('seeds the carousel with products from the real menu, in order', function (): void {
    $this->seed([CategorySeeder::class, ProductSeeder::class, SlideSeeder::class]);

    $slides = Slide::query()->with('product')->orderBy('sort_order')->get();

    expect($slides)->toHaveCount(6)
        ->and($slides->first()->product?->slug)->toBe('sultan-lavoca')
        ->and($slides->pluck('sort_order')->all())->toBe([0, 1, 2, 3, 4, 5])
        ->and($slides->every(fn (Slide $slide): bool => $slide->is_active))->toBeTrue();
});

it('can be rerun without duplicating a slide or undoing an edit', function (): void {
    $this->seed([CategorySeeder::class, ProductSeeder::class, SlideSeeder::class]);

    Slide::query()->orderBy('sort_order')->first()->update(['text' => 'Edited in the admin']);

    $this->seed(SlideSeeder::class);

    expect(Slide::count())->toBe(6)
        ->and(Slide::query()->orderBy('sort_order')->first()->text)->toBe('Edited in the admin');
});
