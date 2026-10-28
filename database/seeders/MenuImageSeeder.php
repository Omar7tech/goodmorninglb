<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;

class MenuImageSeeder extends Seeder
{
    /**
     * Image types the seed folders may hold.
     *
     * @var list<string>
     */
    private const EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg', 'svg'];

    /**
     * Attach the menu's images: the product photos carried over from the old
     * Good Morning site, in `images/products`, and the category icons, in
     * `images/categories`. Each file is named after the slug of the product
     * or category it belongs to.
     *
     * Anything that already has an image is left alone, so the seeder can be
     * rerun safely and never replaces an image chosen in the admin.
     */
    public function run(): void
    {
        $this->attach(Product::class, "{$this->imagesPath()}/products");
        $this->attach(Category::class, "{$this->imagesPath()}/categories");
    }

    /**
     * Give every model of the class its image from the folder, matched on the
     * file name against the model's slug.
     *
     * @param  class-string<Model&HasMedia>  $model
     */
    private function attach(string $model, string $directory): void
    {
        if (! File::isDirectory($directory)) {
            return;
        }

        foreach (File::files($directory) as $file) {
            if (! in_array(strtolower($file->getExtension()), self::EXTENSIONS, true)) {
                continue;
            }

            $slug = $file->getFilenameWithoutExtension();
            $record = $model::query()->where('slug', $slug)->first();

            if ($record === null) {
                $this->command?->warn('No '.class_basename($model)." with slug [{$slug}] for {$file->getPathname()}.");

                continue;
            }

            if ($record->hasMedia('image')) {
                continue;
            }

            // The media library moves whatever file it is given into storage,
            // so it gets a copy: the seed image stays in the repository for
            // the next seed or deploy.
            $copy = sys_get_temp_dir().DIRECTORY_SEPARATOR.Str::uuid().'.'.$file->getExtension();
            File::copy($file->getPathname(), $copy);

            $record->addMedia($copy)->toMediaCollection('image');
        }
    }

    /**
     * Where the seed images live. Kept in the repository rather than fetched
     * from the old site at deploy time, because the old site is the one
     * being replaced.
     */
    protected function imagesPath(): string
    {
        return database_path('seeders/images');
    }
}
