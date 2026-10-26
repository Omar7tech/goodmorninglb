import { usePage } from '@inertiajs/react';
import { useId } from 'react';

/** One tile of the drips, in the drawing's own units; it repeats along the strip. */
const TILE_WIDTH = 320;

/** How far the longest drip hangs below the strip, in pixels. */
const DRIP_DEPTH = 50;

/**
 * Icing running off the foot of the strip. Eight drips across the tile, each
 * narrowing as it leaves the edge and swelling into a round drop at the end,
 * the way a real drip does — at lengths that never repeat a rhythm, with the
 * edge pulled up a little between them where the icing has run into the
 * drops on either side. Generated once and kept as a constant.
 */
const DRIP_PATH =
    'M0 0V8Q5 5.5 10 8C15 8 18.3 11 18.3 21.5C18.3 27.8 16 30.2 16 32A6 6 0 0 0 28 32C28 30.2 25.7 27.8 25.7 21.5C25.7 11 29 8 34 8Q40.8 4.5 47.5 7C53.5 7 53.5 19 58 19C62.5 19 62.5 7 68.5 7Q76.8 4.5 85 9C90 9 93.7 12 93.7 27C93.7 37.1 91 39.9 91 42A7 7 0 0 0 105 42C105 39.9 102.3 37.1 102.3 27C102.3 12 106 9 111 9Q120.5 5.5 130 8C135 8 137.9 11 137.9 16.6C137.9 18.5 136 20.5 136 22A5 5 0 0 0 146 22C146 20.5 144.1 18.5 144.1 16.6C144.1 11 147 8 152 8Q158 4.5 164 7C170 7 170 14 178 14C186 14 186 7 192 7Q198 4.5 204 9C209 9 212.3 12 212.3 24.3C212.3 32.8 210 35.2 210 37A6 6 0 0 0 222 37C222 35.2 219.7 32.8 219.7 24.3C219.7 12 223 9 228 9Q237.8 5.5 247.5 8C252.5 8 255.2 11 255.2 14.8C255.2 15.4 253.5 17.1 253.5 18.5A4.5 4.5 0 0 0 262.5 18.5C262.5 17.1 260.8 15.4 260.8 14.8C260.8 11 263.5 8 268.5 8Q275 5.5 281.5 8C286.5 8 289.6 11 289.6 20.1C289.6 25.6 287.5 27.9 287.5 29.5A5.5 5.5 0 0 0 298.5 29.5C298.5 27.9 296.4 25.6 296.4 20.1C296.4 11 299.5 8 304.5 8Q312.2 5.5 320 8V0Z';

/**
 * A highlight on each of the long drops, up and to the left, as if the light
 * over the counter were catching the icing. Leaning with the drop.
 */
const SHINES = [
    { cx: 19.6, cy: 32.3, rx: 1.4, ry: 2.5 },
    { cx: 95.2, cy: 42.4, rx: 1.7, ry: 2.9 },
    { cx: 139, cy: 22.2, rx: 1.2, ry: 2.1 },
    { cx: 213.6, cy: 37.3, rx: 1.4, ry: 2.5 },
    { cx: 256.2, cy: 18.7, rx: 1.1, ry: 1.9 },
    { cx: 290.8, cy: 29.8, rx: 1.3, ry: 2.3 },
];

/**
 * The shop's one line, across the top of the storefront above everything else,
 * dripping off its lower edge like icing off a cake.
 *
 * The line arrives already chosen — a fixed sentence, or the one behind today
 * on the weekly schedule — so there is nothing here to decide. Null is a shop
 * with nothing to say, and draws no strip at all rather than an empty band of
 * green above the logo.
 */
export function SiteBanner() {
    const { banner } = usePage().props;
    // The pattern needs an id of its own; the colons React puts in one are
    // not safe inside `url(#…)`.
    const patternId = `drips-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

    if (!banner) {
        return null;
    }

    return (
        // Full width of the window, like the footer's slab: it is the top edge
        // of the page rather than something sitting inside the menu's column.
        // Raised so the drips hang over the header below instead of under it.
        <div className="relative z-10 mb-8 bg-primary text-primary">
            <p className="mx-auto max-w-2xl px-5 pt-2 pb-1 text-center font-heading text-lg leading-tight text-primary-foreground sm:text-xl lg:max-w-5xl xl:max-w-6xl">
                {banner}
            </p>

            {/* Hung off the strip rather than inside it, so the drips cost the
                page no height: they fall into the space above the logo that
                the header leaves empty anyway.

                Tucked a pixel up under the strip, or a hairline of the page
                shows between the two at some zoom levels. The pattern is taller
                than the drawing for the same reason at the other end: a tile
                exactly the height of the box lets the next row's top edge bleed
                in along the bottom. */}
            <svg
                aria-hidden
                style={{ height: DRIP_DEPTH }}
                className="pointer-events-none absolute inset-x-0 top-[calc(100%-1px)] w-full drop-shadow-[0_2px_1.5px_rgb(46_42_36/0.18)]"
            >
                <defs>
                    <pattern
                        id={patternId}
                        width={TILE_WIDTH}
                        height={DRIP_DEPTH + 30}
                        patternUnits="userSpaceOnUse"
                    >
                        <path fill="currentColor" d={DRIP_PATH} />
                        <g fill="#fff" opacity={0.35}>
                            {SHINES.map(({ cx, cy, rx, ry }) => (
                                <ellipse
                                    key={cx}
                                    cx={cx}
                                    cy={cy}
                                    rx={rx}
                                    ry={ry}
                                    transform={`rotate(18 ${cx} ${cy})`}
                                />
                            ))}
                        </g>
                    </pattern>
                </defs>

                <rect
                    width="100%"
                    height={DRIP_DEPTH}
                    fill={`url(#${patternId})`}
                />
            </svg>
        </div>
    );
}
