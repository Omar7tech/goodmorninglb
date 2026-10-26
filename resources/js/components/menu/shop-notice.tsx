import { Hourglass, Moon } from 'lucide-react';

import { useShopStatus } from '@/lib/shop';
import { cn } from '@/lib/utils';

/**
 * A word about the shop being shut, or about to be — said before the customer
 * builds an order rather than at the send button.
 *
 * Nothing at all while the shop is open with time to spare: a notice that is
 * always there is a notice nobody reads. Closed, it says when the shop opens
 * again ("Opens in 20 min", "Opens tomorrow at 9 AM"). On the delivery menu it
 * also speaks up in the last hour, so an order is not built only to find the
 * door shut by the time it is sent.
 *
 * The moon for closed, since the shop is called Good Morning; an hourglass for
 * the last hour. Both follow the clock on their own, without a reload.
 */
export function ShopNotice({
    context,
    className,
}: {
    /**
     * Where it is drawn. The home page only needs to know the shop is shut;
     * the delivery menu also warns that closing time is near, and says what
     * can still be done meanwhile.
     */
    context: 'home' | 'delivery';
    className?: string;
}) {
    const { open, detail, closingSoon } = useShopStatus();

    if (open && !(closingSoon && context === 'delivery')) {
        return null;
    }

    const title = open ? 'Closing soon' : 'We’re closed right now';

    const body = open
        ? `${detail}. Send your order before then.`
        : context === 'delivery'
          ? [detail, 'Build your order now and send it once we open.']
                .filter(Boolean)
                .join('. ')
          : [detail, 'The menu is open to browse.'].filter(Boolean).join('. ');

    const Icon = open ? Hourglass : Moon;

    return (
        // A live region, so a reader hears it when the shop closes while the
        // page is open — it appears on its own then.
        <div
            role="status"
            className={cn(
                'flex items-center gap-3 rounded-2xl bg-card/95 p-3.5 pr-4 text-left shadow-sm',
                className,
            )}
        >
            <span
                aria-hidden
                className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-full',
                    open
                        ? 'bg-[#F4C338]/25 text-[#8a6a0c]'
                        : 'bg-berry/10 text-berry',
                )}
            >
                <Icon className="size-5" />
            </span>

            <span className="flex min-w-0 flex-col">
                <span
                    className={cn(
                        'font-heading text-xl leading-tight',
                        open ? 'text-foreground' : 'text-berry',
                    )}
                >
                    {title}
                </span>
                <span className="text-sm text-muted-foreground">{body}</span>
            </span>
        </div>
    );
}
