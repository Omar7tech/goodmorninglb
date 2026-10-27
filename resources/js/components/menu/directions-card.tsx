import { ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * The way to the shop, drawn as a little map rather than written as a button:
 * a few streets in the brand's colours, a park, and a red pin standing on the
 * spot with the logo's sun inside it. The whole card is the link.
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
                {/* A park and a block of buildings, in tints of the green. */}
                <path
                    d="M196 -6C236 -8 262 10 258 34S222 62 196 52 160 22 168 8 182 -4 196 -6Z"
                    className="fill-primary/15"
                />
                <rect
                    x="262"
                    y="78"
                    width="64"
                    height="56"
                    rx="10"
                    className="fill-primary/10"
                />

                {/* Streets: a wide outline in the green under a white road,
                    which is how a printed map draws them. */}
                <g
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="stroke-primary/20"
                    strokeWidth="16"
                >
                    <path d="M120 140C150 100 190 92 230 70S300 30 340 34" />
                    <path d="M150 -10C170 30 200 50 250 66S310 104 330 140" />
                    <path d="M300 -10V140" />
                </g>
                <g
                    fill="none"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="11"
                >
                    <path d="M120 140C150 100 190 92 230 70S300 30 340 34" />
                    <path d="M150 -10C170 30 200 50 250 66S310 104 330 140" />
                    <path d="M300 -10V140" />
                </g>

                {/* The route, dotted in the sun's yellow, arriving at the pin. */}
                <path
                    d="M130 140C155 108 190 98 228 76"
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
                className="absolute top-[38%] right-[23%] flex flex-col items-center"
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
