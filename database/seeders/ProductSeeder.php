<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * The menu's products as the old Good Morning site listed them, grouped
     * by category title and in menu order. `variants` maps each size to its
     * price, in the order the menu shows them. A product sold in sizes keeps
     * `price` at 0, which the old menu treated as "no single price shown".
     * `is_featured` marks the old site's Top Sellers.
     *
     * @var array<string, list<array{title: string, description?: string, price?: float|int, variants?: array<string, float|int>, is_new?: bool, is_featured?: bool}>>
     */
    private const PRODUCTS = [
        'Cocktails' => [
            ['title' => 'Cocktail Olympic', 'description' => 'Signature fruit selection, juice, avocado, topped with ashta, honey comb', 'variants' => ['M' => 10, 'L' => 12.22, 'XL' => 14.44]],
            ['title' => 'Tahiti', 'description' => 'Pineapple & banana slices, strawberry juice, ice cream on top', 'variants' => ['M' => 7.2, 'L' => 8.3, 'XL' => 10]],
            ['title' => 'Emperor', 'description' => 'Banana & Milk smoothie, banana slices, honey, almonds, Ashta, & fresh cream', 'variants' => ['M' => 6.7, 'L' => 8.3]],
            ['title' => 'Cocktail Light', 'description' => 'Sliced fruits, orange juice, almonds topped with fruits', 'variants' => ['S' => 6.11, 'M' => 7.2, 'L' => 8.3, 'XL' => 10]],
            ['title' => 'Cocktail Zaman 🇱🇧', 'description' => 'A classic Lebanese fruit cocktail featuring simple, well-known fruits, prepared in the traditional old-style manner.', 'variants' => ['S' => 5.55, 'M' => 7.78, 'L' => 9.44, 'XL' => 11.67], 'is_new' => true],
        ],
        'Avocado' => [
            ['title' => 'Classic Avocado', 'description' => 'Blended Pure Avocado, almonds, walnuts, honey & honey Combe, your choice of Astha or fresh cream on top', 'variants' => ['S' => 6.6, 'M' => 8.89, 'L' => 10.56, 'XL' => 13.89]],
            ['title' => 'Choco Avoca', 'description' => 'Blended Pure avocado, Nutella, hazelnuts', 'variants' => ['S' => 7.2, 'M' => 9.4, 'L' => 11.7, 'XL' => 13.3], 'is_featured' => true],
            ['title' => 'Turbo', 'description' => 'Blended avocado, Cocktail Juice, almonds, honey & honey Combe, your choice of Ashta or fresh cream on top', 'variants' => ['S' => 5.5, 'M' => 7.22, 'L' => 8.89, 'XL' => 11.11]],
            ['title' => "Sultan L'Avoca", 'description' => 'Kunafa, avocado, strawberry, pistachio chocolate.', 'variants' => ['S' => 7.22, 'M' => 9.4, 'L' => 11.11, 'XL' => 13.3], 'is_new' => true, 'is_featured' => true],
        ],
        'Plates' => [
            ['title' => 'Classic Ashta Plate', 'description' => 'Ashta, almonds, honey & honey Combe', 'variants' => ['250g' => 5, '500g' => 10, '1 kilo' => 18.9]],
            ['title' => 'Fruit Ashta Plate', 'description' => 'Ashta, fruits, almonds, honey', 'variants' => ['200g' => 7.22, '400g' => 15.5, '800g' => 27.8]],
            ['title' => 'Special Fruit Ashta Plate', 'description' => 'Ashta, honey & honeycomb, almonds, special fruits.', 'price' => 36.70],
            ['title' => 'Fruit Plate', 'description' => 'Mixed fruit plate', 'variants' => ['Small' => 0, 'Large' => 0]],
            ['title' => 'Fruits Plate', 'description' => 'Mixed fruit in a plate.', 'price' => 14.44],
            ['title' => 'Fruit only plate mixxed', 'price' => 15.55],
        ],
        'Fresh Juice' => [
            ['title' => 'Orange Juice', 'variants' => ['S' => 2.5, 'M' => 3.11, 'L' => 3.5, 'XL' => 5.3, '1L' => 6.6, '1.5L' => 9.4]],
            ['title' => 'Carrot Juice', 'variants' => ['S' => 2.78, 'M' => 3.33, 'L' => 3.89, 'XL' => 5.3, '1L' => 7.22, '1.5L' => 10.5]],
            ['title' => 'Pomegranate Juice', 'variants' => ['S' => 2.8, 'M' => 4.4, 'L' => 5.5, '1L' => 8.9, '1.5L' => 13.3]],
            ['title' => 'Lemonade Juice', 'variants' => ['S' => 1.67, 'M' => 2.22, 'L' => 2.78, 'XL' => 3.89, '1L' => 5, '1.5L' => 7.22]],
            ['title' => 'Strawberry Juice', 'variants' => ['S' => 3.33, 'M' => 4.44, 'L' => 5.56, 'XL' => 6.67, '1L' => 10, '1.5L' => 14.44]],
            ['title' => 'Mango Juice', 'variants' => ['S' => 3.33, 'M' => 4.44, 'L' => 5.56, 'XL' => 6.67, '1L' => 10, '1.5L' => 14.44]],
            ['title' => 'Grape-Fruit Juice', 'variants' => ['S' => 2.22, 'M' => 2.78, 'L' => 3.33, 'XL' => 4.44, '1L' => 6.11, '1.5L' => 8.33]],
            ['title' => 'Apple Juice', 'variants' => ['S' => 2.78, 'M' => 3.33, 'L' => 3.89, 'XL' => 5.33, '1L' => 7.2, '1.5L' => 10.5]],
            ['title' => 'Mango & Strawberry Juice', 'variants' => ['S' => 3.33, 'M' => 4.4, 'L' => 5.5, 'XL' => 6.6, '1L' => 10, '1.5L' => 14.44]],
            ['title' => 'Ya Waylee', 'description' => 'Freshly Squeezed Mix of Carrot, Ginger, & Beetroot(shamandar) Juice', 'variants' => ['S' => 2.2, 'M' => 2.8, 'L' => 3.3, 'XL' => 4.4, '1L' => 6.11, '1.5L' => 8.3]],
            ['title' => 'Pineapple Juice', 'variants' => ['S' => 5, 'M' => 6.67, 'L' => 8.3, 'XL' => 10, '1L' => 15, '1.5L' => 21.11]],
            ['title' => 'Kiwi Juice', 'variants' => ['S' => 4.4, 'M' => 5.5, 'L' => 6.7, 'XL' => 7.8, '1L' => 12.2, '1.5L' => 16.7]],
            ['title' => 'Shamam', 'variants' => ['S' => 1.67, 'M' => 3.3, 'L' => 3.89, 'XL' => 4.4, '1L' => 6.11, '1.5L' => 8.9]],
            ['title' => 'Watermelon', 'variants' => ['S' => 2.22, 'M' => 3.33, 'L' => 3.89, 'XL' => 4.44, '1L' => 5, '1.5L' => 8.33]],
            ['title' => 'Orange & Carrot Juice', 'variants' => ['S' => 2.2, 'M' => 2.8, 'L' => 3.3, 'XL' => 4.4, '1L' => 5.55, '1.5L' => 8.33]],
        ],
        'Special Juices' => [
            ['title' => 'Cocktail Juice', 'description' => 'Store Special. Mix of Strawberry, Banana, Avocado, Mango, & Guava Juice.', 'variants' => ['S' => 2.22, 'M' => 2.78, 'L' => 3.33, 'XL' => 4.44, '1L' => 6.11, '1.5L' => 8.3]],
            ['title' => 'Strawberry & Milk Smoothie', 'variants' => ['S' => 3.3, 'M' => 4.4, 'L' => 5.5, 'XL' => 6.6, '1L' => 10, '1.5L' => 14.4]],
            ['title' => 'Avocado & Milk Smoothie', 'variants' => ['S' => 3.3, 'M' => 4.4, 'L' => 5.5, 'XL' => 6.6, '1L' => 10, '1.5L' => 13.9]],
            ['title' => 'Banana & Milk Smoothie', 'variants' => ['S' => 2.8, 'M' => 3.9, 'L' => 5, 'XL' => 6.11, '1L' => 8.9, '1.5L' => 12.2]],
            ['title' => 'Vitamin C', 'description' => 'Your Seasonal Winter Boost. Mix of orange, grapefruit, lemon, pomegranate, & ginger.', 'variants' => ['S' => 3.9, 'M' => 5.5, 'L' => 6.6, 'XL' => 8.3, '1L' => 8.9, '1.5L' => 13.3]],
            ['title' => 'Flamingo', 'description' => 'Nutella, Strawberry, Banana, Milk', 'variants' => ['M' => 4.4, 'L' => 6.11]],
            ['title' => 'Jallab', 'description' => "Ramadan's Special", 'variants' => ['S' => 1.7, 'M' => 2.2, 'L' => 2.8, 'XL' => 3.3, '1L' => 3.8, '1.5L' => 5.5], 'is_new' => true],
            ['title' => 'Jallab + Nuts', 'description' => "Ramadan's Special.", 'variants' => ['S' => 2.8, 'M' => 3.3, 'L' => 3.8, 'XL' => 5, '1L' => 6.7, '1.5L' => 10], 'is_new' => true],
            ['title' => 'Milky Pink', 'description' => 'Banana, strawberry, & milk', 'variants' => ['S' => 3.3, 'M' => 4.4, 'L' => 5.5, 'XL' => 6.6, '1L' => 10, '1.5L' => 14.4]],
            ['title' => 'Mangeria', 'description' => 'Season Featured. Mango, & Pomegranate pearls', 'variants' => ['M' => 6.11, 'L' => 7.8]],
            ['title' => 'Berry Dragon', 'description' => 'Mix of berries, & dragon fruit', 'variants' => ['M' => 5.5, 'L' => 6.6, 'XL' => 8.3], 'is_new' => true],
            ['title' => 'Mango Passion', 'description' => 'Mango, passion fruit', 'variants' => ['S' => 6.11, 'M' => 7.8, 'L' => 8.9, 'XL' => 11.11, '1L' => 16.7, '1.5L' => 22.22]],
            ['title' => 'Pineapple Passion', 'description' => 'Pineapple, passion fruit', 'variants' => ['S' => 6.7, 'M' => 9.5, 'L' => 10.5, 'XL' => 12.2]],
        ],
        'Shakes' => [
            ['title' => 'Chocolate Shake', 'variants' => ['M' => 6.11, 'L' => 7.22]],
            ['title' => 'Oreo Shake', 'variants' => ['M' => 7.22, 'L' => 8.33]],
            ['title' => 'Kinder Shake', 'variants' => ['M' => 7.22, 'L' => 8.33]],
            ['title' => 'Lotus Shake', 'variants' => ['M' => 7.78, 'L' => 8.89]],
            ['title' => 'Cheescake Shake', 'variants' => ['M' => 7.22, 'L' => 8.33]],
            ['title' => 'Strawberry Shake', 'variants' => ['M' => 6.11, 'L' => 7.22]],
            ['title' => 'Mango Shake', 'variants' => ['M' => 6.11, 'L' => 7.22]],
            ['title' => 'Pistachio Shake', 'variants' => ['M' => 7.78, 'L' => 8.89]],
            ['title' => 'Ice-Coffee Shake', 'variants' => ['M' => 6.11, 'L' => 7.22]],
            ['title' => 'Nutella shake', 'variants' => ['M' => 7.22, 'L' => 8.33]],
        ],
        'Crepes' => [
            ['title' => 'Choco-Lava', 'description' => 'Nutella, Kinder, Strawberry, & Nestle on top', 'price' => 8.33],
            ['title' => 'Milk It', 'description' => 'Nutella, Lotus, White chocolate', 'price' => 8.33],
            ['title' => 'Brown Spread', 'description' => 'White-Chocolate, Brownies, Oreo', 'price' => 6.67],
            ['title' => 'Go Sparkly', 'description' => "Nutella, Marshmallow, M&M's", 'price' => 7.78],
            ['title' => 'Die To Try', 'description' => "Nutella, Kinder, Oreo, Hershey's, Lotus, Strawberry", 'price' => 12.78],
        ],
        'Crepe Your Way' => [
            ['title' => 'Pistachio Crepe', 'description' => 'Crepe dough, Pistachio chocolate', 'price' => 5.55],
            ['title' => 'Nutella Crepe', 'description' => 'Crepe dough, Nutella chocolate', 'variants' => ['Regular' => 5.55, 'Mini' => 3.89]],
            ['title' => 'Lotus Crepe', 'description' => 'Crepe dough, Lotus spread & biscuit', 'price' => 5.55],
            ['title' => 'Crepe dough', 'description' => 'Create it as you like', 'price' => 3.33],
        ],
        'Crepe Pro' => [
            ['title' => 'Sweet Rocket', 'description' => 'Eclair, Brownies, Strawberries, Cream cheese, Dipped Belgian Chocolate', 'price' => 10.55],
            ['title' => 'Fettucine Crepe', 'description' => 'Crepe Pasta, Scoop of vanilla ice cream, premium belgian chocolate', 'variants' => ['Regular' => 11.11, 'Mini' => 6.67]],
            ['title' => 'Dubai Dose Crepe', 'description' => 'Pistachio kunafa, premium belgian chocolate', 'price' => 10.00],
            ['title' => 'Chocolate Pouch', 'description' => 'Crepe pouch, cream cheese, brownies, strawberry, premium belgian chocolate.', 'price' => 7.70],
            ['title' => 'Choco Fiesta', 'description' => 'Crepe dough topped with premium belgian chocolate, white drizzle', 'price' => 6.70],
            ['title' => 'Sushi crepe 9 pcs', 'description' => 'Sushi style, filled with cream cheese & brownies, toppings, with premium belgian chocolate dips', 'price' => 8.33],
            ['title' => 'Sushi crepe 18 pcs', 'description' => 'Sushi style, filled with cream cheese & brownies, toppings, with premium belgian chocolate dips', 'price' => 16.67],
            ['title' => 'Knafeh Crepe', 'description' => 'Knafeh, Nutella', 'price' => 7.80],
            ['title' => 'Good Morning Plate', 'description' => 'Mini pancakes, Mini fettuccine crepes, Brownies, Strawberries, Premium Belgian chocolate.', 'price' => 18.30, 'is_new' => true],
            ['title' => 'Lotus Roll Crepe', 'description' => 'Crepe dough, cream cheese, brownies, straberry, lotus spread', 'price' => 8.33, 'is_new' => true],
            ['title' => 'Brownies Crepe', 'description' => 'Brownies, topped with premium Belgian chocolate.', 'price' => 7.22],
        ],
        'Pancakes' => [
            ['title' => 'Classic Pancake', 'description' => '2 pancakes, Astha, Nestle, Maple Syrup', 'price' => 5.00],
            ['title' => 'Berries Pancake', 'price' => 7.20],
            ['title' => 'Champion Pancake', 'description' => '5 pancake layers, lotus spread between, topped with Ice cream scoop & Belgium Chocolate, served with banana & strawberry slices', 'price' => 11.11],
            ['title' => 'Chocolate Burger', 'description' => '2 pancake layers, cream cheese, brownies, strawberry & banana all in between, premium belgian chocolate', 'price' => 9.44],
            ['title' => 'Mini Pancakes', 'description' => '12 mini pancakes, strawberry, banana. Belgian chocolate and your other choice dip', 'price' => 8.33],
            ['title' => 'Nutella Pancake', 'description' => '2 pancakes, Nutella', 'price' => 5.00],
            ['title' => 'Mini Bites', 'description' => '24 Mini pancakes, topped with belgian chocolate, white chocolate, lotus spread, and pistachio chocolate spread.', 'price' => 11.11, 'is_new' => true],
            ['title' => 'Dubai Pancake', 'description' => '2 pancakes, pistachio kunafa, strawberries, premium belgian chocolate', 'price' => 8.90, 'is_new' => true],
        ],
        'Waffle' => [
            ['title' => 'Chocolate Waffle', 'description' => 'Waffle piece, topped with premium belgian chocolate, white drizzle', 'variants' => ['Classic' => 5.55, 'Double' => 11.11]],
            ['title' => 'Fruity Waffle', 'description' => 'Waffle piece, served with mixed fruits, premium belgian chocolate', 'variants' => ['Classic' => 7.77, 'Double' => 15]],
            ['title' => 'Pistachio Waffle', 'description' => 'Waffle piece, pistachio chocolate, premium belgian chocolate', 'variants' => ['Classic' => 7.22, 'Double' => 14.44]],
            ['title' => 'Lotus Waffle', 'description' => 'Waffle piece, topped with lotus spread, premium belgian chocolate', 'variants' => ['Classic' => 7.22, 'Double' => 14.44]],
            ['title' => 'Oreo Waffle', 'description' => 'Waffle piece, topped with crushed oreo, premium belgian chocolate.', 'variants' => ['Classic' => 6.67, 'Double' => 13.33]],
            ['title' => 'Ashta Waffle', 'description' => 'Waffle piece, fresh Ashta, honey, pistachio on top. Available in classic & double size.', 'variants' => ['Classic' => 5, 'Double' => 10]],
            ['title' => 'Crunchy Waffle', 'description' => 'Waffle, premium belgian chocolate, crunchies toppings.', 'variants' => ['Classic' => 6.67, 'Double' => 13.33]],
            ['title' => 'Four Flavor Waffle', 'description' => 'Double Waffle piece, 4 different flavors on every quarter', 'price' => 11.67],
            ['title' => 'Dubai waffle', 'description' => 'Waffle,pistachio kunafa,Premuim belgian chocolate', 'variants' => ['Classic' => 8.33, 'Double' => 16.11], 'is_new' => true],
        ],
        'Special Cups' => [
            ['title' => 'Special Mix', 'description' => 'Fresh cream, strawberry & banana slices, your choice of Nutella or Lotus spread', 'variants' => ['M' => 7.8, 'L' => 8.9], 'is_featured' => true],
            ['title' => 'Strawberry Cup', 'description' => 'Strawberries covered with premium belgian chocolate', 'variants' => ['M' => 7.2, 'L' => 8.9]],
            ['title' => 'Crispy Cup', 'description' => 'Vanilla ice cream, rice crispy, Premium belgian chocolate', 'variants' => ['M' => 8.33], 'is_featured' => true],
            ['title' => 'Chocola-Mou', 'description' => 'Fresh cream, hazelnut, chocolate syrup, chocolate merry cream', 'variants' => ['S' => 5, 'M' => 6.67, 'L' => 7.78, 'XL' => 9.44]],
            ['title' => 'Strawberry Dubai Cup', 'description' => 'Strawberries, pistachio kunafa, premium belgian chocolate', 'price' => 8.30, 'is_featured' => true],
        ],
        'Sweets' => [
            ['title' => 'Eclair piece', 'price' => 0.78],
            ['title' => 'Eclair dozen', 'price' => 8.89],
            ['title' => 'Coconut with cream', 'price' => 1.10],
            ['title' => 'Cake ball', 'price' => 1.10],
            ['title' => 'Cake-piece', 'description' => 'Flavors: Nutella, Lotus, Pistachio, Kinder, Oreo, Crunch, Snickers.', 'price' => 1.80],
            ['title' => 'Cake-dozen', 'description' => '12 pieces of cake', 'price' => 21.10],
            ['title' => 'Brownies', 'price' => 5.00],
            ['title' => 'Cinnamon-Roll', 'price' => 3.30],
            ['title' => 'Cheescake', 'description' => 'Your choice between: Strawberry, Blueberry, Lotus, Oreo & Passion fruit', 'price' => 2.80],
            ['title' => 'Dubai Cheesecake Cup', 'price' => 3.30],
            ['title' => 'Jello', 'price' => 1.70],
            ['title' => 'Birthday Cake 6 pieces', 'description' => 'Flavors: Nutella, Lotus, Pistachio, Kinder, Oreo, Crunch, Snickers, Ferrero Rocher.', 'price' => 11.11],
            ['title' => 'Birthday Cake 12 pieces', 'description' => 'Flavors: Nutella, Lotus, Pistachio, Kinder, Oreo, Crunch, Snickers, Ferrero Rocher.', 'price' => 20.00],
            ['title' => 'Croissant', 'description' => 'Cheese, zaatar or chocolate', 'price' => 1.30],
            ['title' => 'Mini croissant 12 pieces', 'description' => '12 mini croissant bag. Cheese, zaatar, & chocolate.', 'price' => 4.40],
            ['title' => 'Petit Four box 900g', 'price' => 15.00],
            ['title' => 'Petit Four box 700g', 'price' => 12.22],
            ['title' => 'Filled Donuts', 'description' => 'Chocolate, Pistachio, Lotus, cream patisserie', 'price' => 2.40],
            ['title' => 'Topped Donuts', 'price' => 1.90],
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::PRODUCTS as $categoryTitle => $products) {
            $category = Category::where('title', $categoryTitle)->firstOrFail();

            foreach ($products as $sortOrder => $product) {
                Product::updateOrCreate(
                    ['category_id' => $category->id, 'title' => $product['title']],
                    [
                        'description' => $product['description'] ?? null,
                        'price' => $product['price'] ?? 0,
                        'variants' => $this->variants($product['variants'] ?? []),
                        'is_new' => $product['is_new'] ?? false,
                        'is_featured' => $product['is_featured'] ?? false,
                        'sort_order' => $sortOrder,
                    ],
                );
            }
        }
    }

    /**
     * Turn a `size => price` map into the stored `[['name', 'price']]` shape.
     *
     * @param  array<string, float|int>  $sizes
     * @return list<array{name: string, price: float|int}>|null
     */
    private function variants(array $sizes): ?array
    {
        if ($sizes === []) {
            return null;
        }

        $variants = [];

        foreach ($sizes as $name => $price) {
            $variants[] = ['name' => (string) $name, 'price' => $price];
        }

        return $variants;
    }
}
