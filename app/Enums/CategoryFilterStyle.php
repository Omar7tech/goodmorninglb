<?php

namespace App\Enums;

use BackedEnum;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;
use Filament\Support\Icons\Heroicon;

/**
 * How the row of categories above an open category's products is drawn.
 * Purely a look: both list the same categories in the same order, scroll the
 * same way and keep the button back to all categories.
 */
enum CategoryFilterStyle: string implements HasIcon, HasLabel
{
    case Pills = 'pills';
    case Circles = 'circles';

    public function getLabel(): string
    {
        return match ($this) {
            self::Pills => 'Pills',
            self::Circles => 'Story circles',
        };
    }

    public function getIcon(): BackedEnum
    {
        return match ($this) {
            self::Pills => Heroicon::OutlinedRectangleGroup,
            self::Circles => Heroicon::OutlinedEllipsisHorizontalCircle,
        };
    }

    /**
     * One line on what the style looks like, shown under its name in the
     * settings form so the choice can be made without opening the storefront.
     */
    public function getDescription(): string
    {
        return match ($this) {
            self::Pills => 'Rounded pills with the category names, the open one filled green.',
            self::Circles => 'Small round icons with the name underneath, like story highlights. The open one gets a ring and the others dim a little.',
        };
    }
}
