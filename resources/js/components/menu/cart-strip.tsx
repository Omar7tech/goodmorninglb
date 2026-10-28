import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useMemo } from 'react';

import { ProductImage } from '@/components/menu/product-image';
import { useCart } from '@/contexts/cart-context';
import { usePricing } from '@/lib/use-pricing';
import { cn } from '@/lib/utils';

/**
 * What's in the order so far, across the top of the menu.
 *
 * It runs the full width of the page and drags sideways — a half-cut tile at
 * the right edge is what tells you there is more in there, so a long order
 * needs no arrows and no second screen to look at. Pressing a tile opens the
 * checkout.
 *
 * It stays put on an empty order rather than unmounting: the space is where the
 * order lives, and a card that appears out of nowhere on the first add shoves
 * the whole menu down the page as you are reaching for it.
 */

/**
 * How far the card's white carries on below the tiles, for the products panel
 * to sit on top of. It is drawn out of flow, so this is a purely visual number:
 * raising it slides more white behind the panel and cannot move anything on the
 * page, whatever the rest of the layout is doing.
 */
const SHEET_BLEED = '-12rem';

export function CartStrip() {
    const { items, count, subtotalUsd, setOpen } = useCart();
    const pricing = usePricing();

    const [emblaRef] = useEmblaCarousel({
        dragFree: true,
        align: 'start',
        containScroll: 'trimSnaps',
    });

    // Newest first: what you just added is the thing you want to see, and at
    // the head of the row it is on screen without dragging to it. The basket
    // keeps the other order, where a list reads as the order you built it in.
    const newestFirst = useMemo(() => [...items].reverse(), [items]);

    // Nothing drawn but the card and a line saying what it is for. Outlines
    // where the tiles will go only invite a press that does nothing — an empty
    // shelf doesn't need a picture of the tins.
    if (items.length === 0) {
        return (
            <Sheet>
                <div className="relative flex items-center gap-3 px-5 py-5">
                    {/* Decorative: the lines beside it already say this. */}
                    <span
                        aria-hidden
                        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                    >
                        <ShoppingBag className="size-5" />
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="text-base leading-none font-bold text-primary">
                            Your order
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Tap + on any dish and it shows up here.
                        </p>
                    </div>
                </div>
            </Sheet>
        );
    }

    return (
        <Sheet>
            {/* Named and totalled up top, so the row underneath is nothing
                but the dishes themselves. The whole line is the way in. */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={`View your order: ${count === 1 ? '1 item' : `${count} items`}, ${pricing.usd(subtotalUsd)}`}
                className="group relative flex w-full items-center justify-between gap-3 px-5 pt-4 text-left focus-visible:outline-none"
            >
                <span className="flex items-baseline gap-2">
                    <span className="text-lg leading-none font-bold text-primary">
                        Your order
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {count === 1 ? '1 item' : `${count} items`}
                    </span>
                </span>

                <span className="flex items-center gap-2">
                    <span className="text-lg leading-none font-bold text-primary tabular-nums">
                        {pricing.usd(subtotalUsd)}
                    </span>
                    <span
                        aria-hidden
                        className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[translate] duration-200 ease-out group-hover:translate-x-0.5 group-focus-visible:ring-3 group-focus-visible:ring-ring/50 motion-reduce:translate-none"
                    >
                        <ArrowRight className="size-4" strokeWidth={2.5} />
                    </span>
                </span>
            </button>

            {/* The dishes as round plates on a counter, newest at the head.
                The padding is what keeps each plate's shadow and count out of
                the carousel's clipping. */}
            <div
                ref={emblaRef}
                className="relative overflow-hidden pt-3 pb-4 select-none"
            >
                <ul className="flex pl-5">
                    {newestFirst.map((item, index) => (
                        <li
                            key={item.key}
                            className={cn(
                                'shrink-0 pr-3',
                                // The trailing gutter has to sit inside the
                                // last plate: Embla measures its scroll limit
                                // from the slides, so padding on the track
                                // would never be reachable.
                                index === newestFirst.length - 1 && 'pr-5',
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                aria-label={`${item.name}, ${item.quantity} in your order. Open checkout.`}
                                className="group flex w-[4.5rem] flex-col items-center gap-1.5 rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            >
                                <span className="relative">
                                    <ProductImage
                                        product={item}
                                        className="size-16 rounded-full bg-cream shadow-md ring-3 ring-white transition-[translate] duration-200 ease-out group-hover:-translate-y-0.5 motion-reduce:translate-none"
                                        markClassName="w-11"
                                    />

                                    {/* How many, tucked on the plate's rim. */}
                                    <span
                                        aria-hidden
                                        className="absolute -right-1 -bottom-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-berry px-1.5 text-[0.65rem] font-bold text-white tabular-nums ring-2 ring-cart-surface"
                                    >
                                        ×{item.quantity}
                                    </span>
                                </span>

                                {/* Body face, as on the product cards. */}
                                <span className="w-full truncate text-center text-[0.7rem] leading-tight font-medium text-foreground/80">
                                    {item.name}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </Sheet>
    );
}

/** The card both states stand on, so the empty one is the same piece of paper. */
function Sheet({ children }: { children: React.ReactNode }) {
    return (
        <section aria-label="Your order" className="relative">
            {/* The card itself, behind its own contents. Everything below is
                laid out from the tiles alone, so this can reach as far down as
                the design wants without any sibling having to know. */}
            <div
                aria-hidden
                style={{ bottom: SHEET_BLEED }}
                className="absolute inset-x-0 top-0 rounded-3xl bg-cart-surface shadow-lg"
            />

            {children}
        </section>
    );
}
