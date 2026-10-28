<?php

use App\Models\Category;
use App\Models\Product;
use Database\Seeders\CategorySeeder;
use Database\Seeders\ProductSeeder;

it('generates unique slugs from titles', function () {
    $first = Category::factory()->create(['title' => 'Hot Drinks']);
    $second = Category::factory()->create(['title' => 'Hot Drinks']);

    expect($first->slug)->toBe('hot-drinks')
        ->and($second->slug)->not->toBe($first->slug);
});

it('links products to their category and deletes them with it', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->for($category)->withVariants()->create();

    expect($product->category->is($category))->toBeTrue()
        ->and($category->products)->toHaveCount(1)
        ->and($product->variants)->toBe([
            ['name' => 'Small', 'price' => 4, 'discount_price' => null],
            ['name' => 'Large', 'price' => 6, 'discount_price' => 5],
        ]);

    $category->delete();

    expect(Product::find($product->id))->toBeNull();
});

it('seeds the real menu in order', function () {
    $this->seed([CategorySeeder::class, ProductSeeder::class]);

    expect(Category::orderBy('sort_order')->pluck('title')->first())->toBe('Cocktails')
        ->and(Category::orderBy('sort_order')->pluck('title')->last())->toBe('Sweets')
        ->and(Category::count())->toBe(13)
        ->and(Product::count())->toBe(114)
        ->and(Product::where('is_featured', true)->orderBy('title')->pluck('title')->all())->toBe([
            'Choco Avoca', 'Crispy Cup', 'Special Mix', 'Strawberry Dubai Cup', "Sultan L'Avoca",
        ])
        ->and(Product::whereNull('slug')->exists())->toBeFalse();

    $crepeYourWay = Category::where('title', 'Crepe Your Way')->sole();

    expect($crepeYourWay->addons)->toHaveCount(15)
        ->and($crepeYourWay->products()->orderBy('sort_order')->pluck('title')->all())
        ->toBe(['Pistachio Crepe', 'Nutella Crepe', 'Lotus Crepe', 'Crepe dough']);
});

it('seeds every product with a price or a list of sizes', function () {
    $this->seed([CategorySeeder::class, ProductSeeder::class]);

    expect(Product::where('title', 'Orange Juice')->sole()->variants)->toBe([
        ['name' => 'S', 'price' => 2.5],
        ['name' => 'M', 'price' => 3.11],
        ['name' => 'L', 'price' => 3.5],
        ['name' => 'XL', 'price' => 5.3],
        ['name' => '1L', 'price' => 6.6],
        ['name' => '1.5L', 'price' => 9.4],
    ]);

    $unpriced = Product::all()
        ->filter(fn (Product $product): bool => (float) $product->price === 0.0 && empty($product->variants))
        ->pluck('title');

    expect($unpriced)->toBeEmpty();
});

it('can be seeded twice without duplicating the menu', function () {
    $this->seed([CategorySeeder::class, ProductSeeder::class]);
    $this->seed([CategorySeeder::class, ProductSeeder::class]);

    expect(Category::count())->toBe(13)
        ->and(Product::count())->toBe(114);
});
