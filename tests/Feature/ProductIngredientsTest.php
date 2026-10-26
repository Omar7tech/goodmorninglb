<?php

use App\Models\Product;

it('stores the ingredients as a list and reads them back as one', function (): void {
    $product = Product::factory()->withIngredients()->create();

    expect($product->refresh()->ingredients)->toBe([
        ['name' => 'Nutella'],
        ['name' => 'Banana'],
        ['name' => 'Strawberry'],
    ]);
});

it('keeps the order the kitchen listed them in', function (): void {
    $product = Product::factory()->create([
        'ingredients' => [
            ['name' => 'Waffle'],
            ['name' => 'Lotus spread'],
            ['name' => 'Vanilla ice cream'],
        ],
    ]);

    // A list, not a set: the order is the recipe's, and reordering the repeater
    // in the dashboard has to mean something.
    expect(array_column($product->refresh()->ingredients, 'name'))
        ->toBe(['Waffle', 'Lotus spread', 'Vanilla ice cream']);
});

it('leaves a product that lists nothing as null rather than an empty list', function (): void {
    $product = Product::factory()->create();

    expect($product->refresh()->ingredients)->toBeNull();
});
