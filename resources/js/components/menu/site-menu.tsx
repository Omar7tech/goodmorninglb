import { useGSAP } from '@gsap/react';
import { Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ArrowUpRight, MessageCircle, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';

import { useShopStatus } from '@/lib/shop';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, SplitText);

/** The logo as a cream silhouette, for the green it opens onto. */
const LIGHT_LOGO = {
    maskImage: "url('/images/logo.svg')",
    WebkitMaskImage: "url('/images/logo.svg')",
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'left center',
    WebkitMaskPosition: 'left center',
    aspectRatio: '4193 / 2782',
} satisfies CSSProperties;

type Destination = {
    label: string;
    note: string;
    href: string;
    /** Leaves the site: opened in a new tab rather than visited in place. */
    external?: boolean;
};

/**
 * Locks the page under the menu. Fixing the body in place rather than only
 * hiding its overflow is what holds iOS Safari still too, which scrolls the
 * page under an open dialog otherwise.
 */
function lockScroll(): void {
    const y = window.scrollY;
    document.body.dataset.menuScroll = String(y);
    document.body.style.position = 'fixed';
    document.body.style.top = `-${y}px`;
    document.body.style.insetInline = '0';
}

function unlockScroll(): void {
    const y = Number(document.body.dataset.menuScroll ?? 0);

    if (document.body.style.position !== 'fixed') {
        return;
    }

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.insetInline = '';
    delete document.body.dataset.menuScroll;
    window.scrollTo(0, y);
}

/**
 * The site's menu, opened by the burger in the header: a sunburst.
 *
 * A disc of the sun's yellow bursts out of the burger and the brand green
 * floods out right behind it, so a ring of sunlight sweeps across the screen
 * ahead of the green. The logo's sun swells up out of the corner, and each
 * place to go is spelled into view a letter at a time — every letter rising
 * and righting itself out of its own slot — with a rule drawing in under it.
 * The details settle in last. Hovering a name just warms it to the sun's
 * yellow and nudges it along.
 *
 * Always one screen: sized to the height of the phone it is on, so the whole
 * menu is there at a glance and nothing scrolls. Closing plays it all back
 * the other way, quicker.
 *
 * Driven by GSAP on transforms, opacity and clip-path alone, which phones
 * animate on the GPU, so it runs as smoothly on a budget Android as on an
 * iPhone; anyone who prefers less motion gets a plain fade.
 */
export function SiteMenu({
    open,
    onClose,
    originRef,
}: {
    open: boolean;
    onClose: () => void;
    /** The button that opened it: where the burst starts, and where focus returns. */
    originRef: RefObject<HTMLButtonElement | null>;
}) {
    const page = usePage();
    const { url } = page;
    const { socialLinks, locationUrl, reviewUrl, whatsappNumber } = page.props;
    const status = useShopStatus();

    const dialogRef = useRef<HTMLDialogElement>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);
    const split = useRef<SplitText | null>(null);

    const destinations: Destination[] = [
        { label: 'Home', note: 'Where the morning starts', href: '/' },
        {
            label: 'The menu',
            note: 'Everything we serve, with prices',
            href: '/menu/dine-in',
        },
        ...(whatsappNumber
            ? [
                  {
                      label: 'Delivery',
                      note: 'Pick it here, we bring it over',
                      href: '/menu/delivery',
                  },
              ]
            : []),
        ...(locationUrl
            ? [
                  {
                      label: 'Find us',
                      note: 'Aley, Mount Lebanon',
                      href: locationUrl,
                      external: true,
                  },
              ]
            : []),
        ...(reviewUrl
            ? [
                  {
                      label: 'Rate us',
                      note: 'Tell Google how it went',
                      href: reviewUrl,
                      external: true,
                  },
              ]
            : []),
    ];

    const { contextSafe } = useGSAP({ scope: dialogRef });

    /** Builds the sunburst from wherever the burger is right now. */
    const build = contextSafe((): gsap.core.Timeline => {
        const reduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        const tl = gsap.timeline({ paused: true });

        if (reduced) {
            gsap.set('.sm-burst', { autoAlpha: 0 });

            return tl.fromTo(
                '.sm-panel',
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.25, ease: 'none' },
            );
        }

        const box = originRef.current?.getBoundingClientRect();
        const x = box ? box.left + box.width / 2 : window.innerWidth - 40;
        const y = box ? box.top + box.height / 2 : 40;
        // Far enough to reach the furthest corner from the burger.
        const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y),
        );
        const from = `circle(0px at ${x}px ${y}px)`;
        const to = `circle(${radius}px at ${x}px ${y}px)`;

        // Each name split into letters, each letter in a slot of its own to
        // rise out of. Undone before splitting again, so reopening never
        // splits the letters a second time.
        split.current?.revert();
        split.current = SplitText.create('.sm-label', {
            type: 'chars',
            mask: 'chars',
            charsClass: 'sm-char',
        });

        return tl
            .fromTo(
                '.sm-burst',
                { clipPath: from, autoAlpha: 1 },
                { clipPath: to, duration: 0.75, ease: 'expo.inOut' },
            )
            .fromTo(
                '.sm-panel',
                { clipPath: from, autoAlpha: 1 },
                { clipPath: to, duration: 0.85, ease: 'expo.inOut' },
                0.09,
            )
            .fromTo(
                '.sm-sun',
                { scale: 0.35, yPercent: 35, autoAlpha: 0 },
                {
                    scale: 1,
                    yPercent: 0,
                    autoAlpha: 1,
                    duration: 1.5,
                    ease: 'expo.out',
                },
                0.45,
            )
            .fromTo(
                '.sm-top',
                { autoAlpha: 0, y: -14 },
                { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' },
                0.55,
            )
            .fromTo(
                split.current.chars,
                { yPercent: 120, rotate: 16, autoAlpha: 0 },
                {
                    yPercent: 0,
                    rotate: 0,
                    autoAlpha: 1,
                    duration: 0.75,
                    ease: 'back.out(1.8)',
                    stagger: 0.022,
                },
                0.55,
            )
            .fromTo(
                '.sm-index, .sm-note, .sm-arrow',
                { autoAlpha: 0, y: 8 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.025,
                    ease: 'power3.out',
                },
                0.8,
            )
            .fromTo(
                '.sm-rule',
                { scaleX: 0 },
                {
                    scaleX: 1,
                    duration: 0.9,
                    stagger: 0.07,
                    ease: 'expo.out',
                },
                0.75,
            )
            .fromTo(
                '.sm-detail',
                { autoAlpha: 0, y: 16 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.07,
                    ease: 'power3.out',
                },
                1,
            );
    });

    const close = useCallback(() => {
        const finish = (): void => {
            dialogRef.current?.close();
            unlockScroll();
            onClose();
            originRef.current?.focus({ preventScroll: true });
        };
        const tl = timeline.current;

        if (!tl || tl.progress() === 0) {
            finish();

            return;
        }

        tl.eventCallback('onReverseComplete', finish);
        tl.timeScale(1.9).reverse();
    }, [onClose, originRef]);

    // Opening: shown as a modal, the page held still under it, and the
    // sunburst played from the burger's position at this moment.
    useEffect(() => {
        const dialog = dialogRef.current;

        if (!open || !dialog || dialog.open) {
            return;
        }

        lockScroll();
        dialog.showModal();
        timeline.current?.kill();
        timeline.current = build();
        timeline.current.timeScale(1).play();
    }, [open, build]);

    // A visit to another page leaves the menu behind it, closed.
    useEffect(() => {
        if (dialogRef.current?.open) {
            timeline.current?.pause(0);
            dialogRef.current.close();
            unlockScroll();
            onClose();
        }
        // Only on a change of page.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    useEffect(
        () => () => {
            split.current?.revert();
            unlockScroll();
        },
        [],
    );

    return (
        <dialog
            ref={dialogRef}
            aria-label="Site menu"
            // Escape plays the close rather than snapping it shut.
            onCancel={(event) => {
                event.preventDefault();
                close();
            }}
            className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-transparent"
        >
            {/* The sunlight that sweeps out ahead of the green. */}
            <div
                aria-hidden
                style={{ visibility: 'hidden' }}
                className="sm-burst fixed inset-0 bg-[#F4C338]"
            />

            <div
                // Hidden until the burst draws it.
                style={{ visibility: 'hidden' }}
                className="sm-panel fixed inset-0 isolate flex flex-col overflow-hidden bg-primary text-cream"
            >
                {/* The logo's sun, swelling up out of the corner. */}
                <img
                    src="/images/sun-light.svg"
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="sm-sun pointer-events-none absolute -right-28 -bottom-28 -z-10 size-[22rem] origin-bottom-right opacity-30 select-none sm:size-[30rem] lg:-right-16 lg:-bottom-40 lg:size-[40rem]"
                />

                <div className="sm-top flex shrink-0 items-center justify-between gap-4 px-5 pt-[max(1rem,env(safe-area-inset-top))]">
                    <span
                        role="img"
                        aria-label="Good Morning"
                        style={LIGHT_LOGO}
                        className="block w-24 bg-cream sm:w-32"
                    />

                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close menu"
                        autoFocus
                        className="flex size-11 items-center justify-center rounded-full bg-cream text-primary shadow-md transition-[scale] duration-200 hover:scale-105 focus-visible:ring-3 focus-visible:ring-cream/60 focus-visible:outline-none active:scale-95"
                    >
                        <X className="size-5.5" strokeWidth={2.75} />
                    </button>
                </div>

                {/* One screen at any height: the names and gaps are sized
                    from the viewport's height, so a short phone gets a
                    shorter menu rather than a scrolling one. */}
                <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col justify-center gap-[3.5vh] px-6 py-[2.5vh] lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:px-10">
                    <nav aria-label="Main">
                        <ul className="flex flex-col">
                            {destinations.map((destination, index) => (
                                <li key={destination.label}>
                                    <MenuRow
                                        destination={destination}
                                        index={index}
                                        current={
                                            !destination.external &&
                                            url.split('?')[0] ===
                                                destination.href
                                        }
                                        onFollow={close}
                                    />
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <aside className="flex flex-col gap-[1.8vh] lg:gap-5 lg:pb-2">
                        {/* Whether the shop is open, which is often what
                            someone opening a menu has come to find out. */}
                        <p className="sm-detail flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm font-semibold sm:text-base">
                            <span
                                className={cn(
                                    'size-2.5 rounded-full',
                                    status.open
                                        ? 'bg-[#F4C338]'
                                        : 'bg-cream/40',
                                )}
                            />
                            {status.open ? 'Open now' : 'Closed now'}
                            {status.detail && (
                                <span className="font-normal text-cream/70">
                                    · {status.detail}
                                </span>
                            )}
                        </p>

                        <div className="sm-detail flex flex-wrap items-center gap-2">
                            {whatsappNumber && (
                                <a
                                    href={`https://wa.me/${whatsappNumber}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-sm font-bold text-primary shadow-md transition-[scale] duration-200 hover:scale-[1.03] focus-visible:ring-3 focus-visible:ring-cream/60 focus-visible:outline-none active:scale-95"
                                >
                                    <MessageCircle className="size-4.5" />
                                    WhatsApp us
                                </a>
                            )}

                            {socialLinks
                                .filter(
                                    ({ url: href }) => !href.includes('wa.me'),
                                )
                                .map(({ label, url: href }) => (
                                    <a
                                        key={href}
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 rounded-full px-3.5 py-2.5 text-sm font-semibold ring-1 ring-cream/35 transition-colors duration-200 hover:bg-cream hover:text-primary focus-visible:ring-3 focus-visible:ring-cream/60 focus-visible:outline-none"
                                    >
                                        {label}
                                        <ArrowUpRight className="size-3.5" />
                                    </a>
                                ))}
                        </div>

                        <p className="sm-detail hidden text-sm text-cream/60 lg:block">
                            Fresh desserts and drinks in Aley since 2011.
                        </p>
                    </aside>
                </div>

                <div className="h-[env(safe-area-inset-bottom)] shrink-0" />
            </div>
        </dialog>
    );
}

/**
 * One place to go: its number, its name spelled out in the display face, a
 * line about it, and a rule drawn under it.
 */
function MenuRow({
    destination,
    index,
    current,
    onFollow,
}: {
    destination: Destination;
    index: number;
    current: boolean;
    onFollow: () => void;
}) {
    const body = (
        <>
            <span className="sm-index w-7 shrink-0 text-[0.7rem] font-bold text-[#F4C338] tabular-nums">
                {String(index + 1).padStart(2, '0')}
            </span>

            <span className="flex min-w-0 flex-1 flex-col">
                <span
                    className={cn(
                        // Sized from the screen's height, capped both ways,
                        // so five names always fit a phone without scrolling.
                        'sm-label block font-heading text-[clamp(1.75rem,5.4vh,4.5rem)] leading-[1.08] transition-[color,translate] duration-300 ease-out group-hover:translate-x-1.5 group-hover:text-[#F4C338] motion-reduce:group-hover:translate-x-0',
                        current && 'text-[#F4C338]',
                    )}
                >
                    {destination.label}
                </span>
                <span className="sm-note text-xs text-cream/65 [@media(max-height:640px)]:hidden">
                    {destination.note}
                </span>
            </span>

            <span className="sm-arrow flex size-9 shrink-0 items-center justify-center rounded-full ring-1 ring-cream/30 transition-[background-color,color,rotate] duration-300 group-hover:rotate-45 group-hover:bg-cream group-hover:text-primary motion-reduce:group-hover:rotate-0 lg:size-11">
                <ArrowUpRight className="size-4.5" />
            </span>

            <span
                aria-hidden
                className="sm-rule absolute inset-x-0 bottom-0 h-px origin-left bg-cream/20"
            />
        </>
    );

    const className =
        'group relative flex items-center gap-3 rounded-sm py-[1.3vh] focus-visible:ring-3 focus-visible:ring-cream/50 focus-visible:outline-none lg:py-3';

    if (destination.external) {
        return (
            <a
                href={destination.href}
                target="_blank"
                rel="noreferrer"
                className={className}
            >
                {body}
            </a>
        );
    }

    return (
        <Link
            href={destination.href}
            onClick={() => {
                if (current) {
                    onFollow();
                }
            }}
            aria-current={current ? 'page' : undefined}
            className={className}
        >
            {body}
        </Link>
    );
}
