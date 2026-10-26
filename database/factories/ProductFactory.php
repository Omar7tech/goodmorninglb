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
     * The sizes a product can be sold in, from smallest to largest.
     *
     * @var list<string>
     */
    private const VARIANT_NAMES = ['Small', 'Medium', 'Large', 'XLarge'];

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

    /**
     * A product that occasionally picks up a badge. The odds are deliberately
     * low so a seeded menu shows a sprinkling of them rather than a wall.
     */
    public function randomlyFlagged(): static
    {
        return $this->state(fn (): array => [
            'is_featured' => random_int(1, 100) <= 15,
            'is_new' => random_int(1, 100) <= 20,
        ]);
    }

    /**
     * A product that has a `$chanceInPercent` chance of being sold in 2 to 4
     * sizes, priced up from its own base price. The rest keep a single price,
     * so a seeded menu ends up with a realistic mix of both kinds.
     */
    public function randomlyWithVariants(int $chanceInPercent = 30): static
    {
        return $this->state(function (array $attributes) use ($chanceInPercent): array {
            if (random_int(1, 100) > $chanceInPercent) {
                return ['variants' => null];
            }

            $basePrice = (float) $attributes['price'];
            $names = array_slice(self::VARIANT_NAMES, 0, random_int(2, 4));

            $variants = [];

            foreach ($names as $index => $name) {
                $variants[] = [
                    'name' => $name,
                    'price' => round($basePrice * (1 + ($index * 0.35)), 2),
                ];
            }

            return ['variants' => $variants];
        });
    }
}
