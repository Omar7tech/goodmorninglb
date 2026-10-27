<?php

use App\Enums\CategoryFilterStyle;
use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        // The row of categories above an open category's products. Pills is
        // what the menu has always had, so it stays the default.
        $this->migrator->add('general.category_filter_style', CategoryFilterStyle::Pills->value);
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.category_filter_style');
    }
};
