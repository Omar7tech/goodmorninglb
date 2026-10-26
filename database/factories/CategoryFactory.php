<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->words(2, true),
            'description' => null,
            'is_active' => true,
            'sort_order' => 0,
            'addons' => null,
        ];
    }

    /**
     * A category that is hidden from the menu.
     */
    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }

    /**
     * A category offering the given extras, each shaped `['name', 'price']`.
     *
     * @param  array<int, array{name: string, price: float|int}>|null  $addons
     */
    public function withAddons(?array $addons = null): static
    {
        return $this->state(fn (): array => [
            'addons' => $addons ?? [
                ['name' => 'Extra cream', 'price' => 1],
                ['name' => 'Nutella', 'price' => 1.5],
            ],
        ]);
    }
}
