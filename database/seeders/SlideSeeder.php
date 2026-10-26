<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Slide;
use Illuminate\Database\Seeder;

class SlideSeeder extends Seeder
{
    /**
     * The carousel the menu opens with: the new arrivals and the top sellers,
     * each opening its own product. Keyed by product slug, with the line laid
     * over the picture.
     *
     * No artwork is uploaded for them, so each slide shows its product's own
     * photo until the owner gives it something wider.
     *
     * @var array<string, string>
     */
    private const SLIDES = [
        'sultan-lavoca' => 'New · Already a top seller',
        'dubai-pancake' => 'New on the menu',
        'strawberry-dubai-cup' => 'Top seller',
        'good-morning-plate' => 'New · Made for sharing',
        'dubai-waffle' => 'New on the menu',
        'choco-avoca' => 'Top seller',
    ];

    /**
     * Seed the carousel once. A slide already pointing at a product is left as
     * it is, so reseeding never undoes a caption or an order set in the admin.
     */
    public function run(): void
    {
        $sortOrder = 0;

        foreach (self::SLIDES as $slug => $text) {
            $product = Product::query()->where('slug', $slug)->first();

            if ($product === null) {
                $this->command?->warn("No product with slug [{$slug}] for a slide.");

                continue;
            }

            Slide::query()->firstOrCreate(
                ['product_id' => $product->id],
                ['text' => $text, 'is_active' => true, 'sort_order' => $sortOrder],
            );

            $sortOrder++;
        }
    }
}
