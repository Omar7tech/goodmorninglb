import type { LucideIcon } from 'lucide-react';
import {
    CakeSlice,
    Cherry,
    Citrus,
    Coffee,
    Cookie,
    Croissant,
    CupSoda,
    Donut,
    IceCreamBowl,
    IceCreamCone,
    Popsicle,
} from 'lucide-react';

import { cn } from '@/lib/utils';

/** What the shop sells, drawn small: the doodles the pattern is made of. */
const DOODLES: LucideIcon[] = [
    Croissant,
    IceCreamCone,
    Coffee,
    Donut,
    Cherry,
    CakeSlice,
    Citrus,
    Cookie,
    CupSoda,
    Popsicle,
    IceCreamBowl,
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
                            const Doodle =
                                DOODLES[
                                    (row * 7 + column * 3) % DOODLES.length
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
