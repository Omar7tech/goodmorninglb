import { usePricing } from '@/lib/use-pricing';
import { cn } from '@/lib/utils';

/**
 * A product price in dollars, large and bold in the body face the copy is set
 * in, and green — or the logo's red while the product is on offer, with the
 * full price struck through beside it.
 */
export function ProductPrice({
    price,
    discountPrice,
    large = false,
    className,
}: {
    price: number;
    discountPrice?: number | null;
    /** A step bigger, for a card with no description to fill the space. */
    large?: boolean;
    className?: string;
}) {
    const pricing = usePricing();
    const hasDiscount = discountPrice !== null && discountPrice !== undefined;
    const effectivePrice = hasDiscount ? discountPrice : price;

    return (
        <span
            className={cn(
                // `min-w-0` so the price can shrink inside a flex row rather
                // than shoving whatever stands beside it off the edge.
                'inline-flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5',
                className,
            )}
        >
            {/* Grows with the screen alongside the card's name: 24px on a
                360px phone, about 27px on a 430px one, stopping at 30px.
                Large is about 4px more at every width. */}
            <span
                className={cn(
                    'leading-none font-bold tracking-tight tabular-nums',
                    large
                        ? 'text-[length:clamp(1.75rem,0.95rem+3.6vw,2.125rem)]'
                        : 'text-[length:clamp(1.5rem,0.7rem+3.6vw,1.875rem)]',
                    hasDiscount ? 'text-berry' : 'text-primary',
                )}
            >
                {pricing.usd(effectivePrice)}
            </span>
            {hasDiscount && (
                <span className="text-[0.8rem] text-muted-foreground tabular-nums line-through">
                    {pricing.usd(price)}
                </span>
            )}
        </span>
    );
}
