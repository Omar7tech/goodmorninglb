<?php

use App\Enums\BannerMode;
use App\Enums\CategoryLayout;
use App\Enums\PriceDisplay;
use App\Enums\ProductCardStyle;
use App\Enums\ShopStatusMode;
use App\Enums\VariantStyle;
use App\Settings\GeneralSettings;
use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * Everything the storefront menu reads: whether the shop is open, the strip
 * across the top, how prices are quoted, how the menu is drawn, and where a
 * delivery order goes.
 */
return new class extends SettingsMigration
{
    public function up(): void
    {
        // Open or closed, by hand or on a weekly schedule.
        $this->migrator->add('general.status_mode', ShopStatusMode::Manual->value);
        $this->migrator->add('general.is_open', true);
        $this->migrator->add('general.opening_hours', GeneralSettings::defaultOpeningHours());

        // The strip across the top of the menu.
        $this->migrator->add('general.show_banner', false);
        $this->migrator->add('general.banner_mode', BannerMode::Fixed->value);
        $this->migrator->add('general.banner_text', 'Welcome to Good Morning');
        $this->migrator->add('general.banner_schedule', GeneralSettings::defaultBannerSchedule());

        // Pricing.
        $this->migrator->add('general.show_lbp_prices', false);
        $this->migrator->add('general.lbp_exchange_rate', null);
        $this->migrator->add('general.price_display', PriceDisplay::Usd->value);

        // How the menu is drawn.
        $this->migrator->add('general.category_layout', CategoryLayout::Grid->value);
        $this->migrator->add('general.product_card_style', ProductCardStyle::Row->value);
        $this->migrator->add('general.variant_style', VariantStyle::Rows->value);
        // Off by default: CK Tipsy and the product names are both written to
        // be read as typed, and the old site never shouted either.
        $this->migrator->add('general.uppercase_category_titles', false);
        $this->migrator->add('general.uppercase_product_titles', false);

        // Delivery. Orders go to the number the old site listed.
        $this->migrator->add('general.online_ordering_active', true);
        $this->migrator->add('general.whatsapp_number', '96170075017');
        $this->migrator->add('general.charge_delivery', false);
        $this->migrator->add('general.delivery_fee', null);

        // Checkout.
        $this->migrator->add('general.require_full_name', false);
        $this->migrator->add('general.require_phone_number', false);
        $this->migrator->add('general.get_client_location', false);

        // Footer.
        $this->migrator->add('general.location_url', null);
    }

    public function down(): void
    {
        foreach ([
            'status_mode', 'is_open', 'opening_hours',
            'show_banner', 'banner_mode', 'banner_text', 'banner_schedule',
            'show_lbp_prices', 'lbp_exchange_rate', 'price_display',
            'category_layout', 'product_card_style', 'variant_style',
            'uppercase_category_titles', 'uppercase_product_titles',
            'online_ordering_active', 'whatsapp_number', 'charge_delivery', 'delivery_fee',
            'require_full_name', 'require_phone_number', 'get_client_location',
            'location_url',
        ] as $name) {
            $this->migrator->deleteIfExists("general.{$name}");
        }
    }
};
