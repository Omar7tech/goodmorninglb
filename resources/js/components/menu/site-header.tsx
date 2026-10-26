import { Link } from '@inertiajs/react';

import { GoodMorningLogo } from '@/components/good-morning-logo';
import { nextOpeningLabel, useShop, useShopOpen } from '@/lib/shop';
import { cn } from '@/lib/utils';

/**
 * The logo, back to the home page, and whether the shop is open right now.
 *
 * The status is the one thing worth saying before the menu starts: a closed
 * shop still shows its menu, and a customer should know that before building a
 * basket rather than at the send button. It follows the schedule live, so a
 * shop that opens while the page is up says so on its own.
 */
export function SiteHeader() {
    const shop = useShop();
    const open = useShopOpen();
    const opensLabel = open ? null : nextOpeningLabel(shop);

    return (
        <header className="flex items-center justify-between gap-4 px-5 pt-5 pb-6">
            <Link
                href="/"
                aria-label="Good Morning — home"
                className="rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
                <GoodMorningLogo className="w-32 drop-shadow-sm sm:w-40 lg:w-48" />
            </Link>

            <p
                className={cn(
                    'flex items-center gap-2 rounded-full bg-card/90 py-1.5 pr-3.5 pl-3 text-xs font-medium shadow-sm',
                    open ? 'text-primary' : 'text-berry',
                )}
            >
                {/* The dot breathes while the door is open, and holds still
                    once it shuts — the one thing on the header that moves. */}
                <span aria-hidden className="relative flex size-2">
                    {open && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
                    )}
                    <span
                        className={cn(
                            'relative size-2 rounded-full',
                            open ? 'bg-primary' : 'bg-berry',
                        )}
                    />
                </span>

                <span className="flex flex-col leading-tight">
                    {open ? 'Open now' : 'Closed'}
                    {opensLabel && (
                        <span className="text-[0.65rem] font-normal text-muted-foreground">
                            {opensLabel}
                        </span>
                    )}
                </span>
            </p>
        </header>
    );
}
