<?php

namespace App\Enums;

use BackedEnum;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;
use Filament\Support\Icons\Heroicon;

/**
 * How the counter screen is coloured. Purely a look: every theme shows the
 * same menu, laid out the same way, and behaves the same.
 */
enum ScreenTheme: string implements HasIcon, HasLabel
{
    case Classic = 'classic';
    case Garden = 'garden';
    case Sunrise = 'sunrise';
    case Paper = 'paper';
    case Night = 'night';

    public function getLabel(): string
    {
        return match ($this) {
            self::Classic => 'Classic',
            self::Garden => 'Garden',
            self::Sunrise => 'Sunrise',
            self::Paper => 'Paper',
            self::Night => 'Night',
        };
    }

    public function getIcon(): BackedEnum
    {
        return match ($this) {
            self::Classic => Heroicon::OutlinedSquares2x2,
            self::Garden => Heroicon::OutlinedSparkles,
            self::Sunrise => Heroicon::OutlinedSun,
            self::Paper => Heroicon::OutlinedDocument,
            self::Night => Heroicon::OutlinedMoon,
        };
    }

    /**
     * One line on what the theme looks like, shown under its name in the
     * settings form so the choice can be made without opening the screen.
     */
    public function getDescription(): string
    {
        return match ($this) {
            self::Classic => 'The menu as customers know it: soft cream all over, with a lighter cream side panel.',
            self::Garden => 'The side panel in the brand green with a cream logo, the dishes on cream. The most on brand.',
            self::Sunrise => 'A sun-yellow side panel beside the cream menu. Bright and cheerful, catches the eye from the door.',
            self::Paper => 'Clean white everywhere with fine lines. Lets the food photos do all the talking.',
            self::Night => 'Dark warm charcoal with cream text. Easy on the eyes in the evening and makes photos glow.',
        };
    }
}
