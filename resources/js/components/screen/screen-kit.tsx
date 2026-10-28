import { Maximize, Minimize } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';

import { GoodMorningLogo } from '@/components/good-morning-logo';
import { usePricing } from '@/lib/use-pricing';
import { cn } from '@/lib/utils';
import type { Category, Product, Slide } from '@/types';

/**
 * What every counter-screen theme is handed. The screen page owns the
 * behaviour — which category is up, when to turn, who is touching it — and a
 * theme only decides how that looks.
 */
export type BoardProps = {
    categories: readonly Category[];
    activeIndex: number;
    /** The category up now; null only on a menu with no categories at all. */
    active: Category | null;
    onSelectCategory: (index: number) => void;
    /** Opens a dish's sheet, on the size given. */
    onOpenDish: (product: Product, variantIndex: number | null) => void;
    /**
     * Hung on the theme's countdown bar: the page fills it as the time on the
     * category runs out. Every theme draws exactly one.
     */
    progressRef: RefObject<HTMLSpanElement | null>;
    /** Hung on whatever scrolls the dishes, so a new category starts at the top. */
    scrollRef: RefObject<HTMLDivElement | null>;
    portrait: boolean;
    uppercase: boolean;
    /** Dishes to a row, for the themes laid out in a grid. */
    columns: number;
    /** True while nobody is using the screen and no dish is open. */
    idle: boolean;
    slides: readonly Slide[];
    showSlider: boolean;
    onOpenSlide: (slide: Slide) => void;
    /** The full-screen button, for the theme to place. */
    controls: (tone: 'dark' | 'light') => ReactNode;
};

/** The logo as a cream silhouette, for a dark ground its colours vanish on. */
const LIGHT_LOGO = {
    maskImage: "url('/images/logo.svg')",
    WebkitMaskImage: "url('/images/logo.svg')",
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    aspectRatio: '4193 / 2782',
} satisfies CSSProperties;

/** The Good Morning logo, in its own colours or as a cream silhouette. */
export function BoardLogo({
    light = false,
    className,
}: {
    light?: boolean;
    className?: string;
}) {
    if (light) {
        return (
            <span
                role="img"
                aria-label="Good Morning"
                style={LIGHT_LOGO}
                className={cn('block bg-cream', className)}
            />
        );
    }

    return <GoodMorningLogo className={cn('drop-shadow-sm', className)} />;
}

/**
 * The bar the page fills as the time on a category runs out. Drawn empty;
 * the page animates it.
 */
export function CountdownBar({
    progressRef,
    className,
    fillClassName,
}: {
    progressRef: RefObject<HTMLSpanElement | null>;
    className?: string;
    fillClassName?: string;
}) {
    return (
        <span aria-hidden className={cn('block overflow-hidden', className)}>
            <span
                ref={progressRef}
                className={cn(
                    'block h-full origin-left scale-x-0 bg-[#F4C338]',
                    fillClassName,
                )}
            />
        </span>
    );
}

/**
 * What a dish costs, as the screen quotes it: its own price, or for a dish
 * sold in sizes the cheapest of them, marked "from".
 */
export function useDishPrice(product: Product): {
    label: string;
    from: boolean;
} {
    const pricing = usePricing();

    if (product.variants.length === 0) {
        return {
            label: pricing.usd(product.discountPrice ?? product.price),
            from: false,
        };
    }

    const cheapest = Math.min(
        ...product.variants.map(
            (variant) => variant.discountPrice ?? variant.price,
        ),
    );

    return {
        label: pricing.usd(cheapest),
        from: product.variants.length > 1,
    };
}

/** The size a sheet opens on: the cheapest, matching the price quoted. */
export function cheapestVariantIndex(product: Product): number | null {
    if (product.variants.length === 0) {
        return null;
    }

    return product.variants.reduce(
        (cheapest, variant, index) =>
            (variant.discountPrice ?? variant.price) <
            (product.variants[cheapest].discountPrice ??
                product.variants[cheapest].price)
                ? index
                : cheapest,
        0,
    );
}

/** The full-screen button, quiet in a corner. */
export function ScreenControls({
    tone = 'dark',
}: {
    /** Light for a dark ground, where the usual grey would be lost. */
    tone?: 'dark' | 'light';
}) {
    const fullscreen = useFullscreen();

    if (!fullscreen.supported) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={fullscreen.toggle}
            aria-label={fullscreen.active ? 'Leave full screen' : 'Full screen'}
            title={fullscreen.active ? 'Leave full screen' : 'Full screen'}
            className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none',
                tone === 'light'
                    ? 'text-cream/70 hover:bg-cream/15 hover:text-cream focus-visible:ring-cream/50'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-ring/50',
            )}
        >
            {fullscreen.active ? (
                <Minimize className="size-4.5" />
            ) : (
                <Maximize className="size-4.5" />
            )}
        </button>
    );
}

/**
 * Whether the tablet is held upright, kept current as it turns. Every theme
 * simply follows the tablet: there is nothing for anyone at the counter to
 * set.
 */
export function usePortrait(): boolean {
    const [portrait, setPortrait] = useState(
        () => window.matchMedia('(orientation: portrait)').matches,
    );

    useEffect(() => {
        const query = window.matchMedia('(orientation: portrait)');
        const update = (): void => setPortrait(query.matches);

        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return portrait;
}

/** Whether the board fills the screen, and a way to make it. */
function useFullscreen() {
    const [active, setActive] = useState(
        () => document.fullscreenElement !== null,
    );

    useEffect(() => {
        const update = (): void =>
            setActive(document.fullscreenElement !== null);

        document.addEventListener('fullscreenchange', update);

        return () => document.removeEventListener('fullscreenchange', update);
    }, []);

    const toggle = useCallback((): void => {
        if (document.fullscreenElement !== null) {
            void document.exitFullscreen().catch(() => {});

            return;
        }

        void document.documentElement.requestFullscreen().catch(() => {});
    }, []);

    return {
        // Older iPads have no full-screen API for pages; there the button is
        // left out and "Add to Home Screen" does the job instead.
        supported: document.fullscreenEnabled === true,
        active,
        toggle,
    };
}

/**
 * Keeps the tablet's screen from dimming and locking while the board is up.
 * The browser lets the lock go whenever the page is hidden, so it is taken
 * again each time the page comes back. Quietly does nothing where the browser
 * has no screen wake lock.
 */
export function useWakeLock(): void {
    useEffect(() => {
        if (!('wakeLock' in navigator)) {
            return;
        }

        let lock: WakeLockSentinel | null = null;

        const request = (): void => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            navigator.wakeLock
                .request('screen')
                .then((sentinel) => {
                    lock = sentinel;
                })
                .catch(() => {});
        };

        request();
        document.addEventListener('visibilitychange', request);

        return () => {
            document.removeEventListener('visibilitychange', request);
            void lock?.release().catch(() => {});
        };
    }, []);
}

/**
 * Keeps the open category in view in a list that scrolls on its own, moving
 * the list alone rather than the page.
 */
export function useKeepActiveInView(
    listRef: RefObject<HTMLElement | null>,
    activeIndex: number,
    axis: 'x' | 'y',
): void {
    useEffect(() => {
        const list = listRef.current;
        const item = list?.children[activeIndex] as HTMLElement | undefined;

        if (!list || item === undefined) {
            return;
        }

        if (axis === 'x') {
            list.scrollTo({
                left:
                    item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2,
                behavior: 'smooth',
            });

            return;
        }

        list.scrollTo({
            top: item.offsetTop - (list.clientHeight - item.offsetHeight) / 2,
            behavior: 'smooth',
        });
    }, [listRef, activeIndex, axis]);
}
