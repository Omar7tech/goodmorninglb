import { usePage } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import { useId } from 'react';
import type { CSSProperties } from 'react';

import { ShopHours } from '@/components/menu/shop-hours';
import { hasPublishedHours, useShop } from '@/lib/shop';

/** How tall the wavy edge is, in pixels, from crest to trough. */
const WAVE_HEIGHT = 24;

/**
 * One soft wave, crest to crest, repeated along the top of the footer. It runs
 * on past the edge's own height, so the tile below it is green all the way
 * down rather than leaving a seam where one row of tiles meets the next.
 */
const WAVE = {
    width: 220,
    path: 'M0 18C27.5 18 27.5 4 55 4S82.5 18 110 18 137.5 4 165 4 192.5 18 220 18V44H0Z',
};

/**
 * The maker's mark at the foot, painted in the slab's own ink so it follows the
 * line of type beside it rather than being the one white thing on the green.
 */
const MAKER_MARK = {
    maskImage: "url('/images/yamenlogo.svg')",
    WebkitMaskImage: "url('/images/yamenlogo.svg')",
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    /** The artwork's own proportions, from its viewBox. */
    aspectRatio: '1151.2 / 110.92',
} satisfies CSSProperties;

/**
 * The foot of the page: the green of "Morning", rising into the page on a soft
 * wave, with the logo's sun coming up behind it — its lower half sunk below the
 * waterline, like a sunrise over the sea.
 *
 * Under the wave: the shop's line, a button to the shop on a map when an
 * address is set, the shop's own links, and the week's hours when the shop
 * runs on a schedule.
 */
export function SiteFooter() {
    const { socialLinks, locationUrl } = usePage().props;
    const hoursShown = hasPublishedHours(useShop());
    // The patterns need ids of their own; the colons React puts in one are
    // not safe inside `url(#…)`.
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');

    return (
        // `isolate` so the sun can sit on a layer under the waves without
        // dropping behind the page itself.
        <footer className="relative isolate text-slab-ink">
            {/* The sun, centred on the wave's middle line, so the crests run
                across it and the green hides its lower half. Behind the waves
                rather than in front of them — that is the whole sunrise. The
                light 6 KB cut: at this size it reads exactly like the full
                one. */}
            <img
                src="/images/sun-light.svg"
                alt=""
                width={208}
                height={208}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="pointer-events-none absolute -top-[77px] left-1/2 -z-10 size-44 -translate-x-1/2 select-none sm:-top-[93px] sm:size-52"
            />

            {/* Drawn with repeating tiles rather than one stretched picture,
                so a wave is the same shape on a phone as on a monitor. Pulled a
                pixel into the green below, or a hairline of the page shows
                between the two at some zoom levels. */}
            <svg
                aria-hidden
                style={{ height: WAVE_HEIGHT }}
                className="-mb-px block w-full"
            >
                <defs>
                    <pattern
                        id={`${id}-wave`}
                        width={WAVE.width}
                        height={WAVE_HEIGHT + 30}
                        patternUnits="userSpaceOnUse"
                    >
                        <path className="fill-primary" d={WAVE.path} />
                    </pattern>
                </defs>

                <rect
                    width="100%"
                    height={WAVE_HEIGHT}
                    fill={`url(#${id}-wave)`}
                />
            </svg>

            <div className="bg-primary">
                {/* One centred column on a phone. From `lg` it opens out into a
                    row that flanks the sun — the shop's line to the left of it,
                    the ways to reach the shop to the right — so a monitor gets
                    a footer laid out for its width rather than a phone's
                    column marooned in the middle of a green band. */}
                <div className="mx-auto w-full max-w-md px-6 pt-6 pb-6 lg:max-w-5xl lg:px-8 lg:pt-4 xl:max-w-6xl">
                    <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:text-left">
                        <p className="font-heading text-2xl leading-tight text-balance sm:text-3xl lg:text-2xl">
                            Fresh desserts and drinks in Aley
                        </p>

                        <div className="flex w-full flex-col items-center lg:w-auto lg:items-end">
                            {/* The one solid button on the slab, full width and
                                a thumb's height on a phone: of everything down
                                here, finding the shop is what a customer most
                                often came for. A button's own width on a
                                monitor. */}
                            {locationUrl && (
                                <a
                                    href={locationUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slab-ink px-6 text-sm font-semibold text-primary shadow-sm transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-slab-ink/50 focus-visible:outline-none active:translate-y-0 motion-reduce:hover:translate-y-0 lg:mt-0 lg:w-auto"
                                >
                                    <MapPin aria-hidden className="size-4" />
                                    Get directions
                                </a>
                            )}

                            {/* The links as words on one line with a dot of the
                                sun's yellow between each — read like a sign-off
                                rather than clicked like a toolbar. In the body
                                face, so they sit quietly under the line above
                                rather than competing with it. A wavy underline
                                draws in under the one being pointed at, the
                                same wave the footer rises on. Keyed by position
                                — two rows may share a name, and the order is
                                the owner's. */}
                            {socialLinks.length > 0 && (
                                <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 lg:mt-4 lg:justify-end">
                                    {socialLinks.map(
                                        ({ label, url }, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center gap-x-3"
                                            >
                                                {index > 0 && (
                                                    <span
                                                        aria-hidden
                                                        className="size-1 rounded-full bg-[#F4C338]"
                                                    />
                                                )}

                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-md py-1 text-sm font-medium tracking-wide decoration-[#F4C338] decoration-wavy decoration-2 underline-offset-[6px] opacity-90 transition-opacity duration-200 ease-out hover:underline hover:opacity-100 focus-visible:underline focus-visible:opacity-100 focus-visible:outline-none lg:text-base"
                                                >
                                                    {label}
                                                </a>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>

                    {hoursShown && (
                        <ShopHours className="mx-auto mt-6 w-full max-w-md rounded-3xl bg-slab-ink/10 p-5 text-left lg:mt-8" />
                    )}

                    <div className="mt-8 flex flex-col items-center gap-2 border-t border-slab-ink/20 pt-5 text-xs opacity-75 lg:flex-row lg:justify-between">
                        <span>© {new Date().getFullYear()} Good Morning</span>

                        {/* Who built it, quieter than the shop's own line: a
                            credit is the last thing on the page, not a second
                            name over the door. */}
                        <a
                            href="https://yamencreates.com"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 uppercase transition-opacity duration-300 ease-out hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                        >
                            <span className="text-[0.65rem]">Crafted by</span>

                            {/* The mark itself, and the only name it needs:
                                the label is what a reader hears in its place. */}
                            <span
                                role="img"
                                aria-label="Yamen Creates"
                                style={MAKER_MARK}
                                className="h-2.5 bg-current"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
