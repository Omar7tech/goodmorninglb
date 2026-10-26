<?php

namespace Database\Factories;

use App\Enums\OrderType;
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
            'discount_price' => null,
            'order_type' => OrderType::Both,
            'variants' => null,
            'ingredients' => null,
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
     * A product sold in several sizes, each shaped `['name', 'price',
     * 'discount_price']`, with the larger one on offer.
     */
    public function withVariants(): static
    {
        return $this->state(fn (): array => [
            'variants' => [
                ['name' => 'Small', 'price' => 4, 'discount_price' => null],
                ['name' => 'Large', 'price' => 6, 'discount_price' => 5],
            ],
        ]);
    }

    /**
     * A product offered only for the given order type.
     */
    public function orderType(OrderType $orderType): static
    {
        return $this->state(fn (): array => ['order_type' => $orderType]);
    }

    /**
     * A product whose ingredients the customer can take out, each shaped
     * `['name']` as the admin repeater writes them.
     */
    public function withIngredients(): static
    {
        return $this->state(fn (): array => [
            'ingredients' => [
                ['name' => 'Nutella'],
                ['name' => 'Banana'],
                ['name' => 'Strawberry'],
            ],
        ]);
    }
}
