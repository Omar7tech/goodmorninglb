import { usePricing } from '@/lib/use-pricing';
import { cn } from '@/lib/utils';

/**
 * A product price in dollars, with the pre-discount price struck through
 * beside it while the product is on offer.
 */
export function ProductPrice({
    price,
    discountPrice,
    className,
}: {
    price: number;
    discountPrice?: number | null;
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
            <span className="text-lg font-semibold text-primary tabular-nums">
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
