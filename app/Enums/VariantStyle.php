<?php

namespace App\Enums;

use BackedEnum;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;
use Filament\Support\Icons\Heroicon;

/**
 * How a product's sizes are offered. Purely a look: every style lists the same
 * sizes in the same order, carries the same prices, and behaves as one radio
 * group however it is drawn.
 */
enum VariantStyle: string implements HasIcon, HasLabel
{
    case Rows = 'rows';
    case Chips = 'chips';
    case Segmented = 'segmented';
    case Bubbles = 'bubbles';

    public function getLabel(): string
    {
        return match ($this) {
            self::Rows => 'Rows',
            self::Chips => 'Chips',
            self::Segmented => 'Segmented bar',
            self::Bubbles => 'Bubbles',
        };
    }

    public function getIcon(): BackedEnum
    {
        return match ($this) {
            self::Rows => Heroicon::OutlinedQueueList,
            self::Chips => Heroicon::OutlinedTag,
            self::Segmented => Heroicon::OutlinedViewColumns,
            self::Bubbles => Heroicon::OutlinedEllipsisHorizontalCircle,
        };
    }

    /**
     * One line on what the style looks like, shown under its name in the
     * settings form so the choice can be made without opening the storefront.
     */
    public function getDescription(): string
    {
        return match ($this) {
            self::Rows => 'A full-width row per size, name on the left and price hard right, ruled between. Best when the names are long or there are many of them.',
            self::Chips => 'Small pills on one line each, name and price together, the chosen one filled solid. Compact, and wraps to as many sizes as there are.',
            self::Segmented => 'One bar split into equal parts, the size over its price in each, the chosen part filled. The most compact, and reads like a switch.',
            self::Bubbles => 'Sizes growing like cups on a counter: the first a circle, each one after it a longer pill, filling the full width with the price under each. List the sizes from small to large.',
        };
    }
}
