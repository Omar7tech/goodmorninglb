<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->words(3, true),
            'description' => fake()->sentence(),
            'is_active' => true,
            'is_featured' => false,
            'is_new' => false,
            'sort_order' => 0,
            'price' => fake()->randomFloat(2, 1, 25),
            'variants' => null,
            'category_id' => Category::factory(),
        ];
    }

    /**
     * A product that is hidden from the menu.
     */
    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }

    /**
     * A product sold in several sizes, each shaped `['name', 'price']`.
     */
    public function withVariants(): static
    {
        return $this->state(fn (): array => [
            'variants' => [
                ['name' => 'Small', 'price' => 4],
                ['name' => 'Large', 'price' => 6],
            ],
        ]);
    }
}
