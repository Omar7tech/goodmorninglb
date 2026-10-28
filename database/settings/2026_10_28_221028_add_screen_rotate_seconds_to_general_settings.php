<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        // How long the counter screen stays on one category before turning to
        // the next, while nobody is touching it.
        $this->migrator->add('general.screen_rotate_seconds', 10);
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.screen_rotate_seconds');
    }
};
