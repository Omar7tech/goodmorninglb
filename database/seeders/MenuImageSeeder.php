<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MenuImageSeeder extends Seeder
{
    /**
     * Attach the product photos carried over from the old Good Morning site.
     * Each file in `images/products` is named after the slug of the product
     * it belongs to. Categories get none: they use icons, set in the admin.
     *
     * Products that already have an image are left alone, so the seeder can
     * be rerun safely and never replaces a photo chosen in the admin.
     */
    public function run(): void
    {
        foreach (File::glob("{$this->imagesPath()}/*.webp") as $path) {
            $slug = pathinfo($path, PATHINFO_FILENAME);
            $product = Product::query()->where('slug', $slug)->first();

            if ($product === null) {
                $this->command?->warn("No product with slug [{$slug}] for {$path}.");

                continue;
            }

            if ($product->hasMedia('image')) {
                continue;
            }

            // The media library moves whatever file it is given into storage,
            // so it gets a copy: the seed image stays in the repository for
            // the next seed or deploy.
            $copy = sys_get_temp_dir().DIRECTORY_SEPARATOR.Str::uuid().'.webp';
            File::copy($path, $copy);

            $product->addMedia($copy)->toMediaCollection('image');
        }
    }

    /**
     * Where the seed images live. Kept in the repository rather than fetched
     * from the old site at deploy time, because the old site is the one
     * being replaced.
     */
    protected function imagesPath(): string
    {
        return database_path('seeders/images/products');
    }
}
