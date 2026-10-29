<?php

namespace App\Http\Controllers;

use App\Enums\OrderType;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\SlideResource;
use App\Models\Slide;
use App\Settings\GeneralSettings;
use App\Support\MenuCatalog;
use Closure;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function __construct(private readonly MenuCatalog $catalog) {}

    public function dineIn(): Response
    {
        return $this->renderMenu(OrderType::DineIn);
    }

    public function delivery(GeneralSettings $settings): Response|RedirectResponse
    {
        // The delivery menu only exists while online ordering is active;
        // otherwise the shop is dine-in only, so send customers back there.
        if (! $settings->online_ordering_active) {
            return redirect()->route('menu.dine-in');
        }

        return $this->renderMenu(OrderType::Delivery);
    }

    /**
     * Both menus are the same page. The order type is the seam the differences
     * hang off — the delivery menu carries the cart, dine-in only shows prices,
     * and each gets the products offered for it.
     */
    private function renderMenu(OrderType $orderType): Response
    {
        return Inertia::render('menu', [
            'orderType' => $orderType->value,
            'categories' => CategoryResource::collection($this->catalog->categories($orderType))->resolve(),
            'slides' => SlideResource::collection($this->slides($orderType))->resolve(),
        ]);
    }

    /**
     * The dine-in menu on a tablet at the counter: the same categories and
     * slides as the dine-in page, drawn full screen, turning to the next
     * category on its own every few seconds while nobody is using it.
     */
    public function screen(GeneralSettings $settings): Response
    {
        return Inertia::render('screen', [
            'categories' => CategoryResource::collection($this->catalog->categories(OrderType::DineIn))->resolve(),
            'slides' => SlideResource::collection($this->slides(OrderType::DineIn))->resolve(),
            'screen' => [
                'autoRotate' => $settings->screen_auto_rotate,
                'rotateSeconds' => max(3, $settings->screen_rotate_seconds),
                'resumeSeconds' => max(5, $settings->screen_resume_seconds),
                'theme' => $settings->screen_theme->value,
                'columns' => min(6, max(3, $settings->screen_columns)),
                'showSlider' => $settings->screen_show_slider,
            ],
        ]);
    }

    /**
     * The carousel above the menu, in the owner's order.
     *
     * A slide's dish is loaded under the same constraint the menu itself uses,
     * so one pointing at something not sold on this menu comes back with no
     * product and is drawn as a plain picture rather than as a way into a dish
     * the customer cannot order.
     *
     * @return Collection<int, Slide>
     */
    private function slides(OrderType $orderType): Collection
    {
        return Slide::query()
            ->where('is_active', true)
            ->with([
                'media',
                // The constraint brings the dish's own media with it; the
                // category is here for the extras the sheet offers.
                'product' => $this->productsConstraint($orderType),
                'product.category',
            ])
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Constrain a category's eager-loaded products to the active ones offered
     * for this order type, in display order.
     */
    private function productsConstraint(OrderType $orderType): Closure
    {
        return function (Relation $query) use ($orderType): void {
            $query
                ->with('media')
                ->where('is_active', true)
                ->whereIn('order_type', [$orderType->value, OrderType::Both->value])
                ->orderBy('sort_order');
        };
    }
}
