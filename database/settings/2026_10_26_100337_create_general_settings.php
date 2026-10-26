<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        // Footer. Seeded with the links the old Good Morning site showed.
        $this->migrator->add('general.social_links', [
            ['label' => 'WhatsApp', 'url' => 'https://wa.me/96170075017'],
            ['label' => 'Instagram', 'url' => 'https://www.instagram.com/good_morning_aley'],
            ['label' => 'Facebook', 'url' => 'https://www.facebook.com/share/1Cs82o5W1h/'],
        ]);
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.social_links');
    }
};
