<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        // The "build my order for a budget" button on the menu. On by default.
        $this->migrator->add('general.budget_picker_enabled', true);
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.budget_picker_enabled');
    }
};
