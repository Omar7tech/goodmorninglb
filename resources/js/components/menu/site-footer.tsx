import { usePage } from '@inertiajs/react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';

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
 * wave rather than a straight edge.
 *
 * Under the wave: the logo's sun, a button to the shop on a map when an
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
        <footer className="text-slab-ink">
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
                <div className="mx-auto w-full max-w-2xl px-6 pt-4 pb-6 text-center lg:max-w-5xl xl:max-w-6xl">
                    {/* The sun from the logo, whole. The light 6 KB cut, since
                        it is drawn small. */}
                    <img
                        src="/images/sun-light.svg"
                        alt=""
                        width={88}
                        height={88}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="mx-auto size-22 drop-shadow-[0_2px_4px_rgb(46_42_36/0.2)] select-none"
                    />
                    <p className="mt-3 font-heading text-2xl leading-tight sm:text-3xl">
                        Fresh desserts and drinks in Aley
                    </p>

                    {/* Directions first and the shop's own links after it, all
                        the same cream pill: one row of ways to reach the shop
                        rather than a list to read. Keyed by position — two
                        rows may share a name, and the order is the owner's. */}
                    {(locationUrl || socialLinks.length > 0) && (
                        <ul className="mt-6 flex flex-wrap justify-center gap-2">
                            {locationUrl && (
                                <li>
                                    <FooterPill href={locationUrl}>
                                        <MapPin
                                            aria-hidden
                                            className="size-4"
                                        />
                                        Directions
                                    </FooterPill>
                                </li>
                            )}

                            {socialLinks.map(({ label, url }, index) => (
                                <li key={index}>
                                    <FooterPill href={url}>
                                        {label}
                                        <ArrowUpRight
                                            aria-hidden
                                            className="size-3.5 opacity-60 transition-[translate,opacity] duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 motion-reduce:transform-none"
                                        />
                                    </FooterPill>
                                </li>
                            ))}
                        </ul>
                    )}

                    {hoursShown && (
                        <ShopHours className="mx-auto mt-8 max-w-xs rounded-3xl bg-slab-ink/10 p-5 text-left" />
                    )}

                    <div className="mt-8 flex flex-col items-center gap-3 border-t border-slab-ink/20 pt-5 text-xs opacity-75 sm:flex-row sm:justify-between">
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

/** One way to reach the shop: a cream pill on the green, lifting on hover. */
function FooterPill({ href, children }: { href: string; children: ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-full bg-slab-ink px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-slab-ink/50 focus-visible:outline-none motion-reduce:hover:translate-y-0"
        >
            {children}
        </a>
    );
}
