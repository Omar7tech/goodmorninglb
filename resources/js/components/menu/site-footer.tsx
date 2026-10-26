import { usePage } from '@inertiajs/react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { CSSProperties } from 'react';

import { ShopHours } from '@/components/menu/shop-hours';
import { hasPublishedHours, useShop } from '@/lib/shop';
import { cn } from '@/lib/utils';

/** The logo's own proportions, taken from the artwork's viewBox. */
const LOGO_ASPECT = '4193 / 2782';

/** The same proportions as a multiplier, for working a height out of a width. */
const LOGO_RATIO = '2782 / 4193';

/**
 * The logo, cut out of the slab rather than drawn on it.
 *
 * Two mask layers: the whole sheet, and the artwork on top of it composited
 * away, which leaves the sheet with the logo missing — so the cream of the page
 * shows through in its shape.
 *
 * Its place is set by numbers the column below already uses — centred and
 * `py-10` from the top — and its width comes in through `--footer-logo-w`,
 * which the space held open for it reads too, so the hole lands on that space
 * without either side measuring the other.
 *
 * The height is worked out from that width and the artwork's own ratio rather
 * than left to `auto`: WebKit answers `auto` for an SVG mask with the size of
 * the box being masked — the whole footer — which stretches the logo from edge
 * to edge on iOS.
 */
const LOGO_KNOCKOUT = {
    maskImage: "url('/images/logo.svg'), linear-gradient(#000, #000)",
    WebkitMaskImage: "url('/images/logo.svg'), linear-gradient(#000, #000)",
    maskPosition: 'center 2.5rem, 0 0',
    WebkitMaskPosition: 'center 2.5rem, 0 0',
    maskSize: `var(--footer-logo-w) calc(var(--footer-logo-w) * ${LOGO_RATIO}), 100% 100%`,
    WebkitMaskSize: `var(--footer-logo-w) calc(var(--footer-logo-w) * ${LOGO_RATIO}), 100% 100%`,
    maskRepeat: 'no-repeat, no-repeat',
    WebkitMaskRepeat: 'no-repeat, no-repeat',
    maskComposite: 'exclude',
    WebkitMaskComposite: 'xor',
} satisfies CSSProperties;

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
 * The foot of the page: one green slab the whole menu comes to rest on, with
 * the logo cut out of it.
 *
 * Below the logo: a button to the shop on a map when an address is set, the
 * week's hours when the shop runs on a schedule, and the links the owner has
 * listed in the dashboard — named rather than drawn as icons, so the logo is
 * the only mark on the slab.
 */
export function SiteFooter() {
    const { socialLinks, locationUrl } = usePage().props;
    // The hours draw their own rule above them, so the list below only tightens
    // up under the location button when there is nothing in between.
    const hoursShown = hasPublishedHours(useShop());

    return (
        <footer className="relative overflow-hidden rounded-t-[2rem] text-slab-ink shadow-[0_-6px_20px_rgb(0_0_0/0.08)] [--footer-logo-w:min(calc(100vw-6rem),17rem)] lg:[--footer-logo-w:20rem]">
            {/* The green itself, so the logo can be taken out of it. The colour
                cannot sit on the footer: whatever is behind the hole would be
                filled straight back in. */}
            <div
                aria-hidden
                style={LOGO_KNOCKOUT}
                className="absolute inset-0 bg-primary"
            />

            {/* The slab runs edge to edge; only its contents keep to the same
                column the menu above them stands in. */}
            <div className="relative mx-auto w-full max-w-2xl px-6 py-10 lg:max-w-5xl xl:max-w-6xl">
                {/* The room the cut-out logo stands in. It is the page showing
                    through the slab rather than any ink of its own, so there is
                    nothing here to draw — only its name, for readers. */}
                <div
                    role="img"
                    aria-label="Good Morning"
                    style={{
                        aspectRatio: LOGO_ASPECT,
                        width: 'var(--footer-logo-w)',
                    }}
                    className="mx-auto"
                />

                {/* The one thing a menu's foot is actually asked for, so it is
                    a filled block rather than another line in the list: the
                    slab's colours swapped, which on hover swap back and leave
                    the button outlined. Left out entirely when the owner has
                    set no address. */}
                {locationUrl && (
                    <a
                        href={locationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative mt-9 flex items-center justify-center gap-3 rounded-full border border-slab-ink bg-slab-ink px-6 py-3 text-primary transition-colors duration-300 ease-out hover:bg-transparent hover:text-slab-ink focus-visible:bg-transparent focus-visible:text-slab-ink focus-visible:outline-none motion-reduce:transition-none"
                    >
                        <MapPin
                            className="size-5 shrink-0 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 motion-reduce:transform-none"
                            strokeWidth={2.5}
                        />

                        <span className="font-heading text-2xl sm:text-3xl">
                            Find us
                        </span>
                    </a>
                )}

                {/* Where the shop is, then when it is there. */}
                <ShopHours />

                {/* One line per account, ruled like a listing. Nothing changes
                    colour on hover — the row's own rule simply draws itself in
                    under the name, which is all the pointing it needs.

                    With nothing listed the whole rule disappears rather than
                    leaving an empty box under the logo. Keyed by position: two
                    rows may well share a name, and the order is the owner's. */}
                {socialLinks.length > 0 && (
                    <ul
                        className={cn(
                            'relative border-t border-slab-ink/25',
                            // Closer under the button than under the logo: the
                            // two belong to the same block of business.
                            locationUrl && !hoursShown ? 'mt-6' : 'mt-9',
                        )}
                    >
                        {socialLinks.map(({ label, url }, index) => (
                            <li
                                key={index}
                                className="border-b border-slab-ink/25"
                            >
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group relative flex items-center justify-between gap-4 py-3 focus-visible:outline-none"
                                >
                                    {/* Drawn straight over the faint rule the row
                                        already sits on, so the line brightens in
                                        place rather than a second one appearing. */}
                                    <span
                                        aria-hidden
                                        className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-slab-ink transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                                    />

                                    <span className="font-heading text-2xl transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 motion-reduce:transform-none sm:text-3xl">
                                        {label}
                                    </span>

                                    {/* The arrow rides off the corner and a fresh
                                        one climbs in behind it, the same way the
                                        home page buttons handle theirs. */}
                                    <span className="relative flex size-5 items-center justify-center overflow-hidden">
                                        <ArrowUpRight
                                            className="size-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-6 group-hover:-translate-y-6 group-focus-visible:translate-x-6 group-focus-visible:-translate-y-6 motion-reduce:transform-none"
                                            strokeWidth={2.5}
                                        />
                                        <ArrowUpRight
                                            aria-hidden
                                            className="absolute size-5 shrink-0 -translate-x-6 translate-y-6 transition-transform duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 motion-reduce:hidden"
                                            strokeWidth={2.5}
                                        />
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="relative mt-7 flex items-center justify-between gap-4 text-[0.65rem] tracking-wide uppercase opacity-75">
                    <span>© {new Date().getFullYear()} Good Morning</span>
                    <span>Aley, Lebanon</span>
                </div>

                {/* Who built it, under the shop's own line and quieter than it:
                    a credit is the last thing on the page, not a second name
                    over the door. It brightens on hover, which is the only
                    thing marking it as somewhere to go. */}
                <a
                    href="https://yamencreates.com"
                    target="_blank"
                    rel="noreferrer"
                    className="relative mt-4 flex items-center justify-center gap-2 text-[0.65rem] uppercase opacity-55 transition-opacity duration-300 ease-out hover:opacity-90 focus-visible:opacity-90 focus-visible:outline-none motion-reduce:transition-none"
                >
                    <span>Crafted by</span>

                    {/* The mark itself, and the only name it needs: the label
                        is what a reader hears in place of the artwork. */}
                    <span
                        role="img"
                        aria-label="Yamen Creates"
                        style={MAKER_MARK}
                        className="h-2.5 bg-current"
                    />
                </a>
            </div>
        </footer>
    );
}
