<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * The add-ons offered on every crepe, shared by both crepe categories.
     *
     * @var list<array{name: string, price: float}>
     */
    private const CREPE_ADDONS = [
        ['name' => 'Nutella/ Extra Nutella', 'price' => 2.20],
        ['name' => 'Lotus', 'price' => 1.67],
        ['name' => "Hershey's", 'price' => 1.67],
        ['name' => 'Oreo', 'price' => 1.10],
        ['name' => 'Kitkat', 'price' => 1.67],
        ['name' => 'Kinder Bueno', 'price' => 1.67],
        ['name' => 'Strawberry', 'price' => 1.11],
        ['name' => 'Banana', 'price' => 0.56],
        ['name' => 'Kiwi', 'price' => 1.67],
        ['name' => 'Mango', 'price' => 1.67],
        ['name' => 'Pineapple', 'price' => 1.67],
        ['name' => 'Mixed Fruits', 'price' => 3.89],
        ['name' => 'Scoop ice cream', 'price' => 1.11],
        ['name' => 'Toppings /each', 'price' => 0.56],
        ['name' => 'Belgium Chocolate', 'price' => 2.20],
    ];

    /**
     * The menu's categories as the old Good Morning site listed them, in
     * menu order, with each one's tagline and the extras it offers.
     *
     * @var list<array{title: string, description: string|null, addons?: list<array{name: string, price: float}>}>
     */
    private const CATEGORIES = [
        ['title' => 'Cocktails', 'description' => 'Pieces of whole love'],
        ['title' => 'Avocado', 'description' => 'Your Mood-Lifting Blend!'],
        ['title' => 'Plates', 'description' => "You'll turn them back white!"],
        [
            'title' => 'Fresh Juice',
            'description' => 'Fresh...to the very last sip',
            'addons' => [
                ['name' => 'Add BOOBA to any juice (Strawberry/Mango/Passion Fruit/Blueberry)', 'price' => 1.10],
            ],
        ],
        [
            'title' => 'Special Juices',
            'description' => null,
            'addons' => [
                ['name' => 'Add BOOBA to any juice (Strawberry/Mango/Passion Fruit/Blueberry)', 'price' => 1.10],
            ],
        ],
        ['title' => 'Shakes', 'description' => 'Shake the chance to taste it!'],
        ['title' => 'Crepes', 'description' => 'Crepe Creations'],
        [
            'title' => 'Crepe Your Way',
            'description' => 'Go in-crepe-able!',
            'addons' => self::CREPE_ADDONS,
        ],
        [
            'title' => 'Crepe Pro',
            'description' => 'Take your Crepe Into a Pro Level',
            'addons' => [
                ['name' => 'Extra Belgium Chocolate', 'price' => 2.20],
                // The old site said "same add-ons as the crepe section" in a
                // $0 row; listed out here so each one can be ordered.
                ...self::CREPE_ADDONS,
            ],
        ],
        ['title' => 'Pancakes', 'description' => "Here's Your Fantastic Flippin' Pancake!"],
        ['title' => 'Waffle', 'description' => 'Sweet Perfection In Squares'],
        ['title' => 'Special Cups', 'description' => 'Chocolate Style Cups'],
        ['title' => 'Sweets', 'description' => 'Delight in every bite!'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::CATEGORIES as $sortOrder => $category) {
            Category::updateOrCreate(
                ['title' => $category['title']],
                [
                    'description' => $category['description'],
                    'addons' => $category['addons'] ?? null,
                    'sort_order' => $sortOrder,
                ],
            );
        }
    }
}
