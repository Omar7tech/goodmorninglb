<?php

use App\Enums\ScreenTheme;
use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        // Whether the counter screen turns through the categories on its own.
        $this->migrator->add('general.screen_auto_rotate', true);
        // How long after the last touch before it starts turning again.
        $this->migrator->add('general.screen_resume_seconds', 20);
        $this->migrator->add('general.screen_theme', ScreenTheme::Classic->value);
        // Dishes to a row.
        $this->migrator->add('general.screen_columns', 5);
        $this->migrator->add('general.screen_show_slider', true);
    }

    public function down(): void
    {
        foreach (['screen_auto_rotate', 'screen_resume_seconds', 'screen_theme', 'screen_columns', 'screen_show_slider'] as $name) {
            $this->migrator->deleteIfExists("general.{$name}");
        }
    }
};
