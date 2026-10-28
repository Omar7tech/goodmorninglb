<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        // Google's own "write a review" link for the shop, by its place id:
        // it opens the review form straight away, on a phone or a computer.
        $this->migrator->add(
            'general.review_url',
            'https://search.google.com/local/writereview?placeid=ChIJtYerZsEiHxUR5G49Fcco7a8',
        );
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.review_url');
    }
};
