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
    case FullMenu = 'full';
    case Spotlight = 'spotlight';
    case Showcase = 'showcase';
    case Polaroid = 'polaroid';

    public function getLabel(): string
    {
        return match ($this) {
            self::Classic => 'Classic',
            self::FullMenu => 'Full menu',
            self::Spotlight => 'Spotlight',
            self::Showcase => 'Showcase',
            self::Polaroid => 'Polaroid wall',
        };
    }

    public function getIcon(): BackedEnum
    {
        return match ($this) {
            self::Classic => Heroicon::OutlinedSquares2x2,
            self::FullMenu => Heroicon::OutlinedBookOpen,
            self::Spotlight => Heroicon::OutlinedSparkles,
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
            self::FullMenu => 'The whole menu in one long scroll: the slider on top, then every category one after another under its own big heading, its dishes in rows of the size set below. The category bar sticks to the top, follows along as you scroll and jumps on a tap. Left alone, it glides down to the next category by itself.',
            self::Spotlight => 'One dish at a time, big: a large photo with its name and price, taking turns through the category, with the rest of the category listed beside it.',
            self::Showcase => 'The category as a row of big dish cards to swipe through, the one in the middle large and the rest stepping back either side, gliding on by themselves. The category name sits huge and faint behind.',
            self::Polaroid => 'The dishes as instant photos taped to the wall at a tilt, the categories as paper tags hung on a string across the top.',
        };
    }
}
