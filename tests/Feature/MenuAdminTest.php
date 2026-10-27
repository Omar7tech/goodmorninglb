<?php

use App\Filament\Resources\Categories\Pages\CreateCategory;
use App\Filament\Resources\Categories\Pages\ListCategories;
use App\Filament\Resources\Categories\Pages\ViewCategory;
use App\Filament\Resources\Products\Pages\CreateProduct;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Filament\Resources\Products\Pages\ListProducts;
use App\Filament\Resources\Products\Pages\ViewProduct;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;

beforeEach(function (): void {
    $this->actingAs(User::factory()->create());
});

it('lists categories in menu order', function (): void {
    $second = Category::factory()->create(['sort_order' => 1]);
    $first = Category::factory()->withAddons()->create(['sort_order' => 0]);

    Livewire::test(ListCategories::class)
        ->assertOk()
        ->assertCanSeeTableRecords([$first, $second], inOrder: true);
});

it('creates a category with its tagline and add-ons', function (): void {
    Livewire::test(CreateCategory::class)
        ->fillForm([
            'title' => 'Fresh Juice',
            'description' => 'Fresh...to the very last sip',
            'is_active' => true,
        ])
        ->set('data.addons', [
            'a' => ['name' => 'Add BOOBA', 'price' => 1.1],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $category = Category::query()->where('title', 'Fresh Juice')->sole();

    expect($category->slug)->toBe('fresh-juice')
        ->and($category->description)->toBe('Fresh...to the very last sip')
        ->and($category->addons)->toBe([['name' => 'Add BOOBA', 'price' => 1.1]]);
});

it('shows a category', function (): void {
    $category = Category::factory()->withAddons()->create();

    Livewire::test(ViewCategory::class, ['record' => $category->getRouteKey()])
        ->assertOk()
        ->assertSee($category->title);
});

it('creates a product sold in sizes', function (): void {
    $category = Category::factory()->create();

    Livewire::test(CreateProduct::class)
        ->fillForm([
            'title' => 'Orange Juice',
            'category_id' => $category->id,
            'price' => 0,
            'is_new' => true,
        ])
        ->set('data.variants', [
            'a' => ['name' => 'S', 'price' => 2.5],
            'b' => ['name' => 'M', 'price' => 3.11],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $product = Product::query()->where('title', 'Orange Juice')->sole();

    expect($product->category->is($category))->toBeTrue()
        ->and($product->is_new)->toBeTrue()
        ->and($product->variants)->toBe([
            ['name' => 'S', 'price' => 2.5, 'discount_price' => null],
            ['name' => 'M', 'price' => 3.11, 'discount_price' => null],
        ]);
});

it('requires a title and a category for a product', function (): void {
    Livewire::test(CreateProduct::class)
        ->fillForm(['title' => null, 'category_id' => null])
        ->call('create')
        ->assertHasFormErrors(['title' => 'required', 'category_id' => 'required']);
});

it('shows the size range instead of a zero price in the products table', function (): void {
    $sized = Product::factory()->create([
        'price' => 0,
        'variants' => [
            ['name' => 'S', 'price' => 2.5],
            ['name' => 'XL', 'price' => 9.4],
        ],
    ]);
    $single = Product::factory()->create(['price' => 8.3, 'variants' => null]);

    Livewire::test(ListProducts::class)
        ->assertOk()
        ->assertTableColumnFormattedStateSet('price', '$2.50 – $9.40', record: $sized)
        ->assertTableColumnFormattedStateSet('price', '$8.30', record: $single);
});

it('opens a product to view and edit', function (): void {
    $product = Product::factory()->withVariants()->create();

    Livewire::test(ViewProduct::class, ['record' => $product->getRouteKey()])
        ->assertOk()
        ->assertSee($product->title);

    Livewire::test(EditProduct::class, ['record' => $product->getRouteKey()])
        ->fillForm(['title' => 'Renamed shake'])
        ->call('save')
        ->assertHasNoFormErrors();

    expect($product->refresh()->title)->toBe('Renamed shake');
});

it('stores uploaded images with webp and thumbnail conversions', function (string $model): void {
    Storage::fake('public');

    $record = $model::factory()->create();

    $media = $record
        ->addMedia(UploadedFile::fake()->image('photo.jpg', 1200, 900))
        ->toMediaCollection('image');

    expect($media->hasGeneratedConversion('webp'))->toBeTrue()
        ->and($media->hasGeneratedConversion('thumb'))->toBeTrue()
        ->and($record->getFirstMediaUrl('image', 'webp'))->toEndWith('.webp');
})->with([Product::class]);

it('stores a category icon with the thumbnail conversion only', function (): void {
    Storage::fake('public');

    $category = Category::factory()->create();

    $media = $category
        ->addMedia(UploadedFile::fake()->image('icon.png', 800, 800))
        ->toMediaCollection('image');

    expect(array_keys($media->generated_conversions))->toBe(['thumb']);
});
