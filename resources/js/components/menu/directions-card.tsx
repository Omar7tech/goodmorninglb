import { ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * The main road through Aley, as it runs past the shop: up from the south-west
 * and on to the north-east. In the drawing's own units (320 × 128), with the
 * shop standing just west of it.
 */
const MAIN_ROAD =
    'M112 150C142 112 176 92 214 84S270 56 292 18 318 -20 330 -40';

/**
 * The streets off it: east from just past the shop, south-east from just
 * before it, and the winding lanes to the west.
 */
const SIDE_STREETS =
    'M246 70C280 62 318 66 350 88M226 92C258 106 286 132 300 160M-10 96C30 92 64 104 96 132S118 160 124 170M60 -10C82 20 110 34 150 22S196 6 232 22M96 132C110 112 132 98 160 96';

/**
 * The way to the shop, drawn as a little map rather than written as a button:
 * the real streets around the shop in Aley, redrawn in the brand's colours, and
 * a red pin standing at the roadside where the shop is, with the logo's sun
 * inside it. The whole card is the link.
 *
 * It is a picture of a map, not a map — nothing here is loaded from a map
 * service, so it costs no request and no cookie banner, and it looks the same
 * whatever the connection. The real map is one tap away.
 *
 * Pointed at, the pin hops and the streets drift a little under it, as if the
 * map had been nudged. Still for anyone who prefers reduced motion.
 */
export function DirectionsCard({
    href,
    className,
}: {
    href: string;
    className?: string;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label="Get directions to Good Morning in Aley"
            className={cn(
                'group relative block h-32 overflow-hidden rounded-3xl bg-cream text-left text-primary shadow-[0_10px_30px_-12px_rgb(46_42_36/0.45)]',
                'transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgb(46_42_36/0.5)] motion-reduce:hover:translate-y-0',
                'focus-visible:ring-3 focus-visible:ring-slab-ink/60 focus-visible:outline-none',
                className,
            )}
        >
            {/* The streets. Sliced to fill the card whatever its width, and
                drifting a few pixels on hover. */}
            <svg
                aria-hidden
                viewBox="0 0 320 128"
                preserveAspectRatio="xMaxYMid slice"
                className="absolute inset-0 size-full transition-transform duration-700 ease-out group-hover:-translate-x-1.5 group-hover:translate-y-0.5 motion-reduce:transform-none"
            >
                {/* Houses, as soft blocks between the streets — enough of them
                    to read as a neighbourhood, none so sharp they compete with
                    the pin. Turned to follow the streets they stand on. */}
                <g className="fill-primary/10">
                    <rect
                        x="150"
                        y="34"
                        width="22"
                        height="16"
                        rx="3"
                        transform="rotate(-28 161 42)"
                    />
                    <rect
                        x="176"
                        y="70"
                        width="20"
                        height="15"
                        rx="3"
                        transform="rotate(-30 186 77)"
                    />
                    <rect
                        x="128"
                        y="66"
                        width="18"
                        height="14"
                        rx="3"
                        transform="rotate(-12 137 73)"
                    />
                    <rect
                        x="292"
                        y="22"
                        width="22"
                        height="18"
                        rx="3"
                        transform="rotate(8 303 31)"
                    />
                    <rect
                        x="300"
                        y="104"
                        width="24"
                        height="18"
                        rx="3"
                        transform="rotate(-18 312 113)"
                    />
                    <rect
                        x="236"
                        y="2"
                        width="16"
                        height="13"
                        rx="3"
                        transform="rotate(-34 244 8)"
                    />
                    <rect
                        x="276"
                        y="114"
                        width="16"
                        height="12"
                        rx="3"
                        transform="rotate(30 284 120)"
                    />
                    <rect
                        x="200"
                        y="104"
                        width="18"
                        height="14"
                        rx="3"
                        transform="rotate(-36 209 111)"
                    />
                    <rect
                        x="88"
                        y="34"
                        width="20"
                        height="15"
                        rx="3"
                        transform="rotate(14 98 41)"
                    />
                </g>

                {/* The streets around the shop in Aley, traced from the map:
                    the main road running up through the town, the street
                    branching off it to the east just past the shop, the one
                    dropping away to the south-east, and the winding lanes to
                    the west. A wide outline in the green under a white road,
                    which is how a printed map draws them. */}
                <g
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="stroke-primary/20"
                >
                    <path strokeWidth="22" d={MAIN_ROAD} />
                    <path strokeWidth="13" d={SIDE_STREETS} />
                </g>
                <g
                    fill="none"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path strokeWidth="17" d={MAIN_ROAD} />
                    <path strokeWidth="9" d={SIDE_STREETS} />
                </g>

                {/* The way in, dotted in the sun's yellow up the main road to
                    the door. */}
                <path
                    d="M130 150C152 112 178 98 208 92"
                    fill="none"
                    stroke="#F4C338"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="1 7"
                />
            </svg>

            {/* The pin, standing where the route ends, with a soft shadow on
                the street under it. */}
            <span
                aria-hidden
                className="absolute top-[26%] right-[33%] flex flex-col items-center"
            >
                <svg
                    viewBox="0 0 40 52"
                    className="w-9 drop-shadow-[0_3px_3px_rgb(46_42_36/0.3)] transition-transform duration-300 ease-out group-hover:-translate-y-1.5 motion-reduce:transform-none"
                >
                    <path
                        d="M20 51C20 51 38 32 38 19A18 18 0 0 0 2 19C2 32 20 51 20 51Z"
                        className="fill-berry"
                    />
                    <circle cx="20" cy="19" r="12" fill="#fffdf6" />
                    <image
                        href="/images/sun-light.svg"
                        x="9"
                        y="8"
                        width="22"
                        height="22"
                    />
                </svg>
                <span className="-mt-1 h-1.5 w-5 rounded-full bg-black/15 blur-[1px] transition-[scale,opacity] duration-300 ease-out group-hover:scale-75 group-hover:opacity-60 motion-reduce:transform-none" />
            </span>

            {/* The words, on a wash of the card's own cream so the streets fade
                out under them rather than running through the letters. */}
            <span className="absolute inset-y-0 left-0 flex w-[62%] flex-col justify-between bg-linear-to-r from-cream from-55% to-transparent p-4">
                <span>
                    <span className="block font-heading text-2xl leading-none">
                        Find us
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                        Good Morning · Aley
                    </span>
                </span>

                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                    Get directions
                    <ArrowUpRight
                        aria-hidden
                        className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                    />
                </span>
            </span>
        </a>
    );
}
