import { useShopStatus } from '@/lib/shop';
import { cn } from '@/lib/utils';

/**
 * What the customer can and cannot do right now, said in two lines — a title
 * and a sentence — wherever they are about to do it.
 *
 * On both menus it sits under the dine-in / delivery switch, compact. The
 * delivery menu adds the thing a closed shop most needs to say there — the
 * basket can still be filled and sent once the shop opens — and in the last
 * hour says to send soon. The dine-in menu invites a look at the menu.
 *
 * On the home page it sits under the two buttons and says both: when the shop
 * is back, and that a basket can be filled meanwhile.
 *
 * Nothing at all while the shop is open with time to spare. It follows the
 * clock on its own, without a reload.
 */
export function ShopNotice({
    context,
    className,
}: {
    context: 'home' | 'dine_in' | 'delivery';
    className?: string;
}) {
    const { open, detail, closingSoon } = useShopStatus();

    if (open && !(closingSoon && context === 'delivery')) {
        return null;
    }

    const when = detail ? `${detail}.` : 'We’ll be back soon.';

    const title = open ? detail : 'We’re closed right now';

    const body = open
        ? 'Send your order before we close.'
        : context === 'dine_in'
          ? `${when} Have a look at the menu in the meantime.`
          : `${when} Fill your basket now and send it as soon as we open.`;

    // Inside the menus it is a compact note under the switch rather than the
    // home page's two full lines: the title and the time share one line, and
    // the line under it says what can be done meanwhile on that menu.
    if (context !== 'home') {
        const hint = open
            ? 'Send your order before we close.'
            : context === 'delivery'
              ? 'You can still fill your basket and send it when we open.'
              : 'Have a look at the menu in the meantime.';

        return (
            <div
                role="status"
                className={cn('text-center leading-tight', className)}
            >
                <p className="text-sm text-muted-foreground">
                    <span
                        className={cn(
                            'font-heading text-lg',
                            open ? 'text-foreground' : 'text-berry',
                        )}
                    >
                        {open ? detail : 'We’re closed'}
                    </span>
                    {!open && detail && ` · ${detail}`}
                </p>
                {hint && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {hint}
                    </p>
                )}
            </div>
        );
    }

    return (
        // A live region, so a reader hears it when the shop closes while the
        // page is open — it appears on its own then.
        <div role="status" className={cn('text-center', className)}>
            <p
                className={cn(
                    'font-heading text-xl leading-tight',
                    open ? 'text-foreground' : 'text-berry',
                )}
            >
                {title}
            </p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-balance text-muted-foreground">
                {body}
            </p>
        </div>
    );
}
