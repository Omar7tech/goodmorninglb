<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::factory()
            ->count(8)
            ->state(new Sequence(fn (Sequence $sequence): array => [
                'sort_order' => $sequence->index,
            ]))
            ->create();
    }
}
