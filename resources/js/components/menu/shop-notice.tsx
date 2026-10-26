import { useShopStatus } from '@/lib/shop';
import { cn } from '@/lib/utils';

/**
 * A word about the shop being shut, or about to be — said before the customer
 * builds an order rather than at the send button.
 *
 * Nothing at all while the shop is open with time to spare: a notice that is
 * always there is a notice nobody reads. The delivery menu also hears about
 * the last hour, so an order is not built only to find the door shut by the
 * time it is sent.
 *
 * Two lines and no more: a short title, and the one fact under it — when the
 * shop opens, or that the order should go soon. Everything else on the page
 * already says the menu can be read. Words only, no icon: the title says it.
 * It follows the clock on its own, without a reload.
 */
export function ShopNotice({
    context,
    className,
}: {
    /**
     * Where it is drawn. The home page only needs to know the shop is shut;
     * the delivery menu also warns that closing time is near.
     */
    context: 'home' | 'delivery';
    className?: string;
}) {
    const { open, detail, closingSoon } = useShopStatus();

    if (open && !(closingSoon && context === 'delivery')) {
        return null;
    }

    const title = open ? detail : 'We’re closed';
    const note = open ? 'Send your order soon' : (detail ?? 'Back soon');

    return (
        // A live region, so a reader hears it when the shop closes while the
        // page is open — it appears on its own then.
        <div
            role="status"
            className={cn(
                // No card behind it: set straight on the page, it reads as
                // part of the page rather than as a box laid over it.
                'flex flex-col items-center text-center',
                className,
            )}
        >
            <span className="flex min-w-0 flex-col items-center">
                <span
                    className={cn(
                        'font-heading text-lg leading-tight',
                        open ? 'text-foreground' : 'text-berry',
                    )}
                >
                    {title}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    {note}
                </span>
            </span>
        </div>
    );
}
