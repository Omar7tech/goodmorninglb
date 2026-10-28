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
    case Board = 'board';
    case Gallery = 'gallery';
    case Polaroid = 'polaroid';

    public function getLabel(): string
    {
        return match ($this) {
            self::Classic => 'Classic',
            self::Spotlight => 'Spotlight',
            self::Board => 'Menu board',
            self::Gallery => 'Gallery',
            self::Polaroid => 'Polaroid wall',
        };
    }

    public function getIcon(): BackedEnum
    {
        return match ($this) {
            self::Classic => Heroicon::OutlinedSquares2x2,
            self::Spotlight => Heroicon::OutlinedSparkles,
            self::Board => Heroicon::OutlinedListBullet,
            self::Gallery => Heroicon::OutlinedPhoto,
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
            self::Board => 'A café menu board in the brand green: the category big on one side, the dishes as a printed list with dotted lines to their prices. Reads from across the shop.',
            self::Gallery => 'All photos, edge to edge, the first dish twice the size. The categories float in a dock at the bottom, like an app.',
            self::Polaroid => 'The dishes as instant photos taped to the wall at a tilt, the categories as paper tags hung on a string across the top.',
        };
    }
}
