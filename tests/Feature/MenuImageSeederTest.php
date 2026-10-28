<?php

use App\Models\Category;
use App\Models\Product;
use Database\Seeders\CategorySeeder;
use Database\Seeders\MenuImageSeeder;
use Database\Seeders\ProductSeeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

/**
 * A seeder pointed at a scratch folder of images instead of the shipped one,
 * so a test only has to convert the one or two files it needs.
 */
function menuImageSeederFor(string $directory): MenuImageSeeder
{
    return new class($directory) extends MenuImageSeeder
    {
        public function __construct(private string $directory) {}

        protected function imagesPath(): string
        {
            return $this->directory;
        }
    };
}

function writeWebp(string $path): void
{
    File::ensureDirectoryExists(dirname($path));

    $image = imagecreatetruecolor(40, 30);
    imagewebp($image, $path);
}

beforeEach(function (): void {
    Storage::fake('public');

    $this->directory = storage_path('framework/testing/menu-images-'.uniqid());
});

afterEach(function (): void {
    File::deleteDirectory($this->directory);
});

it('ships an image for a real product with every file', function (): void {
    $this->seed([CategorySeeder::class, ProductSeeder::class]);

    $slugs = collect(File::glob(database_path('seeders/images/products/*.webp')))
        ->map(fn (string $path): string => pathinfo($path, PATHINFO_FILENAME));

    expect($slugs)->toHaveCount(91)
        ->and($slugs->diff(Product::pluck('slug')))->toBeEmpty();
});

it('attaches each image to the product with the same slug and keeps the seed file', function (): void {
    $product = Product::factory()->create(['title' => 'Orange Juice']);
    writeWebp("{$this->directory}/products/orange-juice.webp");

    menuImageSeederFor($this->directory)->run();

    expect($product->refresh()->getFirstMedia('image')?->hasGeneratedConversion('webp'))->toBeTrue()
        ->and($product->getFirstMedia('image')?->hasGeneratedConversion('thumb'))->toBeTrue()
        ->and(File::exists("{$this->directory}/products/orange-juice.webp"))->toBeTrue();
});

it('ships an icon for a real category with every file', function (): void {
    $this->seed(CategorySeeder::class);

    $slugs = collect(File::files(database_path('seeders/images/categories')))
        ->map(fn (SplFileInfo $file): string => $file->getFilenameWithoutExtension());

    expect($slugs)->toHaveCount(13)
        ->and($slugs->diff(Category::pluck('slug')))->toBeEmpty();
});

it('attaches each icon to the category with the same slug', function (): void {
    $category = Category::factory()->create(['title' => 'Fresh Juice']);
    $product = Product::factory()->create(['title' => 'Fresh Juice']);
    writeWebp("{$this->directory}/categories/fresh-juice.webp");

    menuImageSeederFor($this->directory)->run();

    expect($category->refresh()->getFirstMedia('image')?->hasGeneratedConversion('thumb'))->toBeTrue()
        ->and($product->refresh()->hasMedia('image'))->toBeFalse();
});

it('can be rerun without duplicating or replacing an image', function (): void {
    $product = Product::factory()->create(['title' => 'Orange Juice']);
    writeWebp("{$this->directory}/products/orange-juice.webp");

    $seeder = menuImageSeederFor($this->directory);
    $seeder->run();
    $firstImage = $product->refresh()->getFirstMedia('image');

    $seeder->run();

    expect($product->refresh()->getMedia('image'))->toHaveCount(1)
        ->and($product->getFirstMedia('image')?->is($firstImage))->toBeTrue();
});
