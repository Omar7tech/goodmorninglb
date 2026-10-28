<?php

namespace App\Enums;

use BackedEnum;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;
use Filament\Support\Icons\Heroicon;

/**
 * How the counter screen presents the menu. Each is its own way of showing it,
 * not a recolouring: every one shows the same dine-in menu, turns through the
 * categories the same way and opens a dish the same way.
 */
enum ScreenTheme: string implements HasIcon, HasLabel
{
    case Classic = 'classic';
    case Spotlight = 'spotlight';
    case Stories = 'stories';
    case Showcase = 'showcase';
    case Polaroid = 'polaroid';

    public function getLabel(): string
    {
        return match ($this) {
            self::Classic => 'Classic',
            self::Spotlight => 'Spotlight',
            self::Stories => 'Stories',
            self::Showcase => 'Showcase',
            self::Polaroid => 'Polaroid wall',
        };
    }

    public function getIcon(): BackedEnum
    {
        return match ($this) {
            self::Classic => Heroicon::OutlinedSquares2x2,
            self::Spotlight => Heroicon::OutlinedSparkles,
            self::Stories => Heroicon::OutlinedPlayCircle,
            self::Showcase => Heroicon::OutlinedRectangleStack,
            self::Polaroid => Heroicon::OutlinedCamera,
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
            self::Spotlight => 'One dish at a time, big: a large photo with its name and price, taking turns through the category, with the rest of the category listed beside it.',
            self::Stories => 'Like stories on a phone: one dish fills the screen at a time with bars across the top, tap the right side for the next and the left to go back, hold to pause. Plays through every dish, then the next category.',
            self::Showcase => 'The category as a row of big dish cards to swipe through, the one in the middle large and the rest stepping back either side, gliding on by themselves. The category name sits huge and faint behind.',
            self::Polaroid => 'The dishes as instant photos taped to the wall at a tilt, the categories as paper tags hung on a string across the top.',
        };
    }
}
