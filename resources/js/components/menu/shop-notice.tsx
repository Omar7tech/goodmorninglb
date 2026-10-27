import { useShopStatus } from '@/lib/shop';
import { cn } from '@/lib/utils';

/**
 * What the customer can and cannot do right now, said in two lines — a title
 * and a sentence — wherever they are about to do it.
 *
 * On the delivery menu it sits in the basket strip, the box they are about to
 * fill, and says the thing a closed shop most needs to say: the basket can be
 * filled now and sent the moment the shop opens. In the last hour it says to
 * send soon. On the dine-in menu it sits under the heading and only says when
 * the shop is back.
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
