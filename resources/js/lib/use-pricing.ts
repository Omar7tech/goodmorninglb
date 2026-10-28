import { usePage } from '@inertiajs/react';
import { formatUsd } from '@/lib/currency';

export type PriceParts = {
    /** Delivery charge in USD added to an order, or null when none applies. */
    deliveryFeeUsd: number | null;
    /** Formats an amount in dollars, the menu's only currency. */
    usd: (usd: number) => string;
};

/**
 * Reads the pricing settings shared on every Inertia response and exposes a
 * formatter for menu prices, which are always in US dollars.
 */
export function usePricing(): PriceParts {
    const { pricing } = usePage().props;

    return {
        deliveryFeeUsd: pricing?.deliveryFeeUsd ?? null,
        usd: (value: number) => formatUsd(value),
    };
}
