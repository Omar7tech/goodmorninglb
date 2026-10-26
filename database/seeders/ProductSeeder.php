<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::all()->each(function (Category $category): void {
            Product::factory()
                ->count(random_int(4, 9))
                ->for($category)
                ->randomlyFlagged()
                ->randomlyWithVariants()
                ->state(new Sequence(fn (Sequence $sequence): array => [
                    'sort_order' => $sequence->index,
                ]))
                ->create();
        });
    }
}
