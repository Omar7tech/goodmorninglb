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
            ['name' => 'Small', 'price' => 4],
            ['name' => 'Large', 'price' => 6],
        ]);

    $category->delete();

    expect(Product::find($product->id))->toBeNull();
});

it('seeds an ordered menu', function () {
    $this->seed([CategorySeeder::class, ProductSeeder::class]);

    expect(Category::count())->toBe(8)
        ->and(Category::pluck('sort_order')->all())->toBe(range(0, 7));

    Category::with('products')->get()->each(function (Category $category): void {
        expect($category->products->count())->toBeGreaterThanOrEqual(4)
            ->and($category->products->pluck('slug')->filter()->count())
            ->toBe($category->products->count());
    });
});
