<?php

use App\Enums\ScreenTheme;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        // The cinematic theme has been removed. A screen left on it goes back
        // to Classic rather than failing to load.
        // Read raw: the migrator would turn the stored name into the enum
        // first, and an old name is exactly what it cannot turn into one.
        $row = DB::table('settings')
            ->where('group', 'general')
            ->where('name', 'screen_theme')
            ->first();

        if ($row === null) {
            return;
        }

        $stored = json_decode((string) $row->payload);

        if (ScreenTheme::tryFrom((string) $stored) !== null) {
            return;
        }

        DB::table('settings')
            ->where('group', 'general')
            ->where('name', 'screen_theme')
            ->update(['payload' => json_encode(ScreenTheme::Classic->value)]);
    }
};
