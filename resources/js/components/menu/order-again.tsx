import { RotateCcw } from 'lucide-react';

import { ProductImage } from '@/components/menu/product-image';
import { cartItemUnitUsd } from '@/contexts/cart-context';
import type { CartItem } from '@/contexts/cart-context';
import { usePricing } from '@/lib/use-pricing';

/** How many dishes get a photo before the rest become a count. */
const FACES_SHOWN = 3;

/**
 * The last order, offered back.
 *
 * A snack shop lives on the same people ordering the same thing, and the fastest
 * menu in the world is still slower than not using it. So the order that was
 * sent last is kept, read back against today's menu, and put at the top of the
 * page as one button.
 *
 * What it shows is the rebuilt order rather than the remembered one — today's
 * prices, today's names, and only the dishes still being sold — because the
 * figure on this card is what the basket will actually come to.
 */
export function OrderAgain({
    items,
    sentAt,
    usual,
    dropped,
    onReorder,
}: {
    /** The past order as it stands on today's menu. Never empty. */
    items: readonly CartItem[];
    /** When it was sent, in epoch milliseconds. */
    sentAt: number;
    /** Whether this same order has been sent more than once. */
    usual: boolean;
    /** How many lines the menu can no longer honour. */
    dropped: number;
    onReorder: () => void;
}) {
    const pricing = usePricing();

    const count = items.reduce((total, item) => total + item.quantity, 0);
    const totalUsd = items.reduce(
        (total, item) => total + cartItemUnitUsd(item) * item.quantity,
        0,
    );

    const faces = items.slice(0, FACES_SHOWN);
    const rest = items.length - faces.length;

    return (
        // On the brand green rather than white, so it reads as a shortcut of
        // the customer's own and not as one more dish in the list below it.
        <section
            aria-label="Order again"
            className="relative isolate flex flex-col gap-3 overflow-hidden rounded-2xl bg-primary p-3.5 text-primary-foreground"
        >
            {/* The logo's sun, rising out of the corner and faded right back:
                the morning the shop is named for, without a word about it. */}
            <img
                src="/images/sun-light.svg"
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute -top-10 -right-8 -z-10 size-32 opacity-25"
            />

            <div className="flex items-baseline gap-2">
                {/* An order sent more than once is a habit, and calling it one
                    is the difference between a feature and a shortcut the
                    customer recognises as theirs. */}
                <span className="font-heading text-lg leading-none">
                    {usual ? 'Your usual' : 'Last order'}
                </span>
                <span className="text-[0.7rem] text-primary-foreground/70">
                    {whenLabel(sentAt)}
                </span>
            </div>

            <div className="flex items-center gap-3">
                {/* Overlapped, so three dishes take the room of two and the row
                    reads as one order rather than a list of them. */}
                <div className="flex shrink-0 -space-x-3">
                    {faces.map((item) => (
                        <ProductImage
                            key={item.key}
                            product={{ name: item.name, image: item.image }}
                            className="size-11 rounded-full bg-cream ring-2 ring-primary"
                            markClassName="w-8"
                        />
                    ))}

                    {rest > 0 && (
                        <span className="flex size-11 items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-semibold tabular-nums ring-2 ring-primary">
                            +{rest}
                        </span>
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold">
                        {items.map((item) => item.name).join(', ')}
                    </span>
                    <span className="truncate text-xs text-primary-foreground/75">
                        {count === 1 ? '1 item' : `${count} items`}
                        {' · '}
                        <span className="font-semibold text-primary-foreground tabular-nums">
                            {pricing.usd(totalUsd)}
                        </span>
                    </span>
                </div>

                {/* Beside the order rather than under it: one row, one tap,
                    and the card stays as short as the shortcut it is. */}
                <button
                    type="button"
                    onClick={onReorder}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-cream px-3.5 py-2 text-xs font-bold text-primary shadow-sm transition-[scale,background-color] duration-200 ease-out hover:bg-white focus-visible:ring-3 focus-visible:ring-cream/60 focus-visible:outline-none active:scale-95 motion-reduce:scale-100"
                >
                    <RotateCcw
                        aria-hidden
                        className="size-3.5"
                        strokeWidth={2.5}
                    />
                    Reorder
                </button>
            </div>

            {/* Said here rather than after the fact: the customer should know
                what they are about to get before they press, not find a
                shorter basket afterwards and wonder what happened. */}
            {dropped > 0 && (
                <p className="text-[0.7rem] text-primary-foreground/75">
                    {dropped === 1
                        ? 'One item from that order is no longer on the menu.'
                        : `${dropped} items from that order are no longer on the menu.`}
                </p>
            )}
        </section>
    );
}

/**
 * Roughly how long ago, in the words people use. Precision is not the point —
 * "3 days ago" tells the customer whether this is the order they are thinking
 * of, and a timestamp would not.
 */
function whenLabel(sentAt: number): string {
    const days = Math.floor((Date.now() - sentAt) / 86_400_000);

    if (days <= 0) {
        return 'Today';
    }

    if (days === 1) {
        return 'Yesterday';
    }

    if (days < 7) {
        return `${days} days ago`;
    }

    if (days < 14) {
        return 'Last week';
    }

    if (days < 60) {
        return `${Math.floor(days / 7)} weeks ago`;
    }

    return 'A while ago';
}
