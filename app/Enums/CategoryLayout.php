<?php

namespace App\Enums;

use BackedEnum;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;
use Filament\Support\Icons\Heroicon;

/**
 * How the menu's landing view draws its categories. Purely a look: every layout
 * lists the same categories in the same order and opens the same products.
 */
enum CategoryLayout: string implements HasIcon, HasLabel
{
    case Grid = 'grid';
    case Rows = 'rows';
    case Popout = 'popout';
    case Bubbles = 'bubbles';
    case Blocks = 'blocks';

    public function getLabel(): string
    {
        return match ($this) {
            self::Grid => 'Grid',
            self::Rows => 'Rows',
            self::Popout => 'Pop-out icons',
            self::Bubbles => 'Bubbles',
            self::Blocks => 'Colour blocks',
        };
    }

    public function getIcon(): BackedEnum
    {
        return match ($this) {
            self::Grid => Heroicon::OutlinedSquares2x2,
            self::Rows => Heroicon::OutlinedBars3,
            self::Popout => Heroicon::OutlinedArrowUpOnSquare,
            self::Bubbles => Heroicon::OutlinedEllipsisHorizontalCircle,
            self::Blocks => Heroicon::OutlinedSwatch,
        };
    }

    /**
     * One line on what the layout looks like, shown under its name in the
     * settings form so the choice can be made without opening the storefront.
     */
    public function getDescription(): string
    {
        return match ($this) {
            self::Grid => 'Square boxes, two or three to a row. The icon sits above the name.',
            self::Rows => 'Full-width bands, one category each. The icon sits on the right, and every band says how many items are inside.',
            self::Popout => 'Short cards in green and red, with the icon bursting out over the top edge like a sticker coming off the card.',
            self::Bubbles => 'Round icons with a ring, four to a row on a phone and the name underneath, like story highlights. The most categories on one screen.',
            self::Blocks => 'Shorter boxes taking turns in the green, red and sun yellow of the logo, with the icon top-right and the name bottom-left.',
        };
    }
}
