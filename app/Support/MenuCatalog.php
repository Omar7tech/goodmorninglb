<?php

namespace App\Support;

use App\Enums\OrderType;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\Relation;

/**
 * The menu as one order type sells it: the active categories, in the owner's
 * order, each with the active products offered for that order type.
 *
 * Shared by the menu pages and by their SEO, and bound as scoped, so the page
 * a visitor sees and the copy a crawler reads come from the same single query
 * rather than two that could disagree.
 */
final class MenuCatalog
{
    /** @var array<string, Collection<int, Category>> */
    private array $menus = [];

    /**
     * Categories with nothing in them for this order type are dropped, so a
     * pill never opens onto an empty list.
     *
     * @return Collection<int, Category>
     */
    public function categories(OrderType $orderType): Collection
    {
        return $this->menus[$orderType->value] ??= Category::query()
            ->where('is_active', true)
            ->with([
                'media',
                'products' => function (Relation $query) use ($orderType): void {
                    $query
                        ->with('media')
                        ->where('is_active', true)
                        ->whereIn('order_type', [$orderType->value, OrderType::Both->value])
                        ->orderBy('sort_order');
                },
            ])
            ->orderBy('sort_order')
            ->get()
            ->filter(fn (Category $category): bool => $category->products->isNotEmpty())
            ->values();
    }
}
