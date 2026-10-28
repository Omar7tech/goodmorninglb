<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        // The menu is priced in dollars only. Deleted only if present, since a
        // fresh install never adds these in the first place.
        $this->migrator->deleteIfExists('general.show_lbp_prices');
        $this->migrator->deleteIfExists('general.lbp_exchange_rate');
        $this->migrator->deleteIfExists('general.price_display');
    }
};
