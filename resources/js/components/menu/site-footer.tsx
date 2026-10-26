import { usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    createLucideIcon,
    Globe,
    MapPin,
    MessageCircle,
    Music2,
} from 'lucide-react';
import { useId } from 'react';
import type { CSSProperties } from 'react';

import { ShopHours } from '@/components/menu/shop-hours';
import { hasPublishedHours, useShop } from '@/lib/shop';
import { cn } from '@/lib/utils';

/**
 * Drawn here because the icon set no longer ships brand marks. Built with
 * Lucide's own helper, in its stroke and grid, so they sit beside the rest
 * as the same family rather than as pasted-in logos.
 */
const Instagram = createLucideIcon('instagram', [
    [
        'rect',
        { x: '2', y: '2', width: '20', height: '20', rx: '5', key: 'frame' },
    ],
    ['circle', { cx: '12', cy: '12', r: '4', key: 'lens' }],
    ['path', { d: 'M17.5 6.5h.01', key: 'flash' }],
]);

const Facebook = createLucideIcon('facebook', [
    [
        'path',
        {
            d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
            key: 'f',
        },
    ],
]);

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
                {/* One narrow column at every width: a footer this short reads
                    best as a single stack, and held to a phone's width on a
                    monitor it stays a footer rather than a spread-out band. */}
                <div className="mx-auto flex w-full max-w-md flex-col items-center px-6 pt-6 pb-6 text-center">
                    <p className="font-heading text-2xl leading-tight text-balance sm:text-3xl">
                        Fresh desserts and drinks in Aley
                    </p>

                    {/* The one solid button on the slab, full width and a
                        thumb's height: of everything down here, finding the
                        shop is what a customer most often came for. */}
                    {locationUrl && (
                        <a
                            href={locationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slab-ink text-sm font-semibold text-primary shadow-sm transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-slab-ink/50 focus-visible:outline-none active:translate-y-0 motion-reduce:hover:translate-y-0"
                        >
                            <MapPin aria-hidden className="size-4" />
                            Get directions
                        </a>
                    )}

                    {/* Equal tiles, icon over name, three to a row: every link
                        the same size and the same reach for a thumb, and no
                        single pill left stranded on a line of its own. Keyed by
                        position — two rows may share a name, and the order is
                        the owner's. */}
                    {socialLinks.length > 0 && (
                        <ul
                            className={cn(
                                'grid w-full grid-cols-3 gap-2',
                                locationUrl ? 'mt-3' : 'mt-6',
                            )}
                        >
                            {socialLinks.map(({ label, url }, index) => {
                                const Icon = socialIcon(url);

                                return (
                                    <li key={index}>
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl bg-slab-ink/10 px-2 py-3 text-xs font-semibold transition-colors duration-200 ease-out hover:bg-slab-ink/20 focus-visible:ring-3 focus-visible:ring-slab-ink/50 focus-visible:outline-none"
                                        >
                                            <Icon
                                                aria-hidden
                                                className="size-5"
                                            />
                                            <span className="max-w-full truncate">
                                                {label}
                                            </span>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {hoursShown && (
                        <ShopHours className="mt-6 w-full rounded-3xl bg-slab-ink/10 p-5 text-left" />
                    )}

                    <div className="mt-8 flex w-full flex-col items-center gap-2 border-t border-slab-ink/20 pt-5 text-xs opacity-75">
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

/**
 * The icon for a link, worked out from where it goes rather than from what the
 * owner called it — "Insta", "IG" and "Instagram" are all the same place.
 * Anything not recognised gets a plain globe.
 */
function socialIcon(url: string): LucideIcon {
    let host = '';

    try {
        host = new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return Globe;
    }

    if (host === 'wa.me' || host.endsWith('whatsapp.com')) {
        return MessageCircle;
    }

    if (host.endsWith('instagram.com')) {
        return Instagram;
    }

    if (host.endsWith('facebook.com') || host === 'fb.com') {
        return Facebook;
    }

    if (host.endsWith('tiktok.com')) {
        return Music2;
    }

    return Globe;
}
