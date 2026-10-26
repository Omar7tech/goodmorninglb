<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class GeneralSettings extends Settings
{
    /**
     * The links listed at the foot of the menu, in the order they are shown.
     * Each row is named by the owner rather than picked from a fixed list, so
     * a platform the shop joins later needs no code change.
     *
     * Each row is a `label` and a `url`. Typed with `@phpstan-var` rather than
     * `@var` on purpose: the settings package reads `@var` to pick a cast for
     * the property, and any nested array type there makes it build a broken
     * cast and throw on boot. Its regex does not see this tag; PHPStan does.
     *
     * @phpstan-var array<int, array{label: string|null, url: string|null}>
     */
    public array $social_links;

    public static function group(): string
    {
        return 'general';
    }

    /**
     * The footer links worth rendering. A half-filled row — a name with no
     * address, or the reverse — is dropped rather than shown as a dead link.
     *
     * @return array<int, array{label: string, url: string}>
     */
    public function usableSocialLinks(): array
    {
        return collect($this->social_links)
            ->filter(fn (array $link): bool => filled($link['label'] ?? null) && filled($link['url'] ?? null))
            ->map(fn (array $link): array => [
                'label' => (string) $link['label'],
                'url' => (string) $link['url'],
            ])
            ->values()
            ->all();
    }
}
