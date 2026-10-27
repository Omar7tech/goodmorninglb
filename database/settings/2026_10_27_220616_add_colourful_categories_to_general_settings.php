<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        // Whether the pop-out, bubble and block layouts take turns in the
        // logo's colours, or keep every category in its green.
        $this->migrator->add('general.colourful_categories', true);
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.colourful_categories');
    }
};
