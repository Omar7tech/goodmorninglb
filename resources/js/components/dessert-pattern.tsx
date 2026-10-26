import type { LucideIcon } from 'lucide-react';
import {
    Avocado,
    Blender,
    CakeSlice,
    Citrus,
    Croissant,
    CupSoda,
    createLucideIcon,
    Donut,
    IceCreamBowl,
    IceCreamCone,
    Nut,
} from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Drawn here because the icon set has no waffle or pancakes, two of the
 * menu's biggest categories. Built with Lucide's own helper so the stroke
 * and sizing match the rest of the doodles.
 */
const Waffle = createLucideIcon('waffle', [
    [
        'rect',
        { x: '3', y: '3', width: '18', height: '18', rx: '4', key: 'edge' },
    ],
    ['path', { d: 'M9 3v18', key: 'left' }],
    ['path', { d: 'M15 3v18', key: 'right' }],
    ['path', { d: 'M3 9h18', key: 'top' }],
    ['path', { d: 'M3 15h18', key: 'bottom' }],
]);

const Pancakes = createLucideIcon('pancakes', [
    [
        'rect',
        { x: '3', y: '17', width: '18', height: '4', rx: '2', key: 'base' },
    ],
    [
        'rect',
        { x: '4', y: '13', width: '16', height: '4', rx: '2', key: 'middle' },
    ],
    ['rect', { x: '5', y: '9', width: '14', height: '4', rx: '2', key: 'top' }],
    [
        'rect',
        { x: '10', y: '6', width: '4', height: '3', rx: '1', key: 'butter' },
    ],
]);

/**
 * What the shop actually sells, drawn small: each doodle stands for a part
 * of the menu, from the avocado cocktails to the croissants and donuts.
 */
const DOODLES: LucideIcon[] = [
    Croissant, // Croissants, mini croissants
    Avocado, // The avocado category
    Waffle, // Waffles
    CupSoda, // Juices, smoothies and shakes
    Donut, // Filled and topped donuts
    Pancakes, // Pancakes
    CakeSlice, // Cakes and cheesecake
    Citrus, // Orange, lemonade, Vitamin C
    IceCreamBowl, // Special Cups
    Blender, // Fresh blends
    IceCreamCone, // The ice-cream scoops on crepes and cups
    Nut, // Almonds, walnuts, hazelnuts, pistachio
];

/** Small tilts, so the field reads as placed by hand rather than stamped. */
const TILTS = [-16, 8, -6, 14, -10, 4, 18, -2];

const ROWS = 6;
const COLUMNS = 30;

/**
 * A wallpaper of the menu's desserts rising from the bottom of the screen
 * and fading out before it reaches the content. Rows are offset by half a
 * cell, like bricks, and every third doodle takes the red of the logo
 * instead of its green. Laid out from fixed tables rather than at random,
 * so it is the same pattern on every visit. Purely decorative, so it is
 * hidden from assistive technology.
 */
export function DessertPattern({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cn(
                'pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[40svh] overflow-hidden',
                className,
            )}
            style={{
                maskImage:
                    'linear-gradient(to top, black 10%, transparent 95%)',
            }}
        >
            <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col-reverse">
                {Array.from({ length: ROWS }, (_, row) => (
                    <div
                        key={row}
                        className={cn('flex', row % 2 === 1 && 'translate-x-8')}
                    >
                        {Array.from({ length: COLUMNS }, (_, column) => {
                            const index = row * COLUMNS + column;
                            // Steps of 5 and 7 share no factor with the 12
                            // doodles, so every row cycles through all of them
                            // and no two neighbours ever match.
                            const Doodle =
                                DOODLES[
                                    (row * 7 + column * 5) % DOODLES.length
                                ];

                            return (
                                <span
                                    key={column}
                                    className="flex size-16 items-center justify-center"
                                >
                                    <Doodle
                                        strokeWidth={1.5}
                                        className={cn(
                                            'size-7',
                                            index % 3 === 0
                                                ? 'text-berry/35'
                                                : 'text-sage/40',
                                        )}
                                        style={{
                                            rotate: `${TILTS[(row * 5 + column) % TILTS.length]}deg`,
                                        }}
                                    />
                                </span>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
