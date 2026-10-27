import { Link } from '@inertiajs/react';
import { Bike, UtensilsCrossed } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { OrderType } from '@/types';

/**
 * The two menus, each in the colour of its button on the home page — the green
 * of "Morning" for dining in, the red of "Good" for delivery — so the switch
 * reads as the same pair of doors the customer came through.
 *
 * Each icon has its own way of arriving when its menu opens: the bike rides in
 * from the left, the fork and knife pop into place.
 */
const OPTIONS = [
    {
        type: 'dine_in',
        label: 'Dine In',
        href: '/menu/dine-in',
        icon: UtensilsCrossed,
        pill: 'bg-sage',
        idle: 'text-sage/70 hover:text-sage',
        arrive: 'animate-in zoom-in-50 duration-500 ease-out',
    },
    {
        type: 'delivery',
        label: 'Delivery',
        href: '/menu/delivery',
        icon: Bike,
        pill: 'bg-berry',
        idle: 'text-berry/70 hover:text-berry',
        arrive: 'animate-in fade-in slide-in-from-left-4 duration-700 ease-out',
    },
] as const;

/**
 * Segmented toggle for moving between the dine-in and delivery menus.
 *
 * One pill slides between the two halves and changes colour on the way, from
 * the green of dining in to the red of delivery — the movement says these are
 * two views of the same menu, and the colour says which door you are at.
 *
 * The track is a soft groove the pill sits down in, rather than a flat
 * outline: shaded on the inside, so the pill reads as raised out of it.
 */
export function OrderTypeSwitch({ current }: { current: OrderType }) {
    const activeIndex = Math.max(
        OPTIONS.findIndex((option) => option.type === current),
        0,
    );

    return (
        <div className="relative grid w-full grid-cols-2 gap-1 rounded-full bg-card p-1.5 shadow-[inset_0_2px_4px_rgb(46_42_36/0.08),0_1px_2px_rgb(46_42_36/0.06)] ring-1 ring-black/5">
            {/* The pill tracks the active option. Its width is one grid
                column: half the box, less the padding and half the gap. */}
            <span
                aria-hidden
                style={{
                    transform:
                        activeIndex === 0
                            ? 'translateX(0)'
                            : 'translateX(calc(100% + 0.25rem))',
                }}
                className={cn(
                    'pointer-events-none absolute inset-y-1.5 left-1.5 w-[calc(50%-0.5rem)] rounded-full shadow-[0_4px_10px_-2px_rgb(46_42_36/0.3)]',
                    'transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
                    OPTIONS[activeIndex].pill,
                )}
            />

            {OPTIONS.map(({ type, label, href, icon: Icon, idle, arrive }) => {
                const isActive = current === type;

                return (
                    <Link
                        key={type}
                        href={href}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                            'relative z-10 flex items-center justify-center gap-2 rounded-full px-3 py-2 font-heading text-xl transition-colors duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:text-2xl',
                            isActive ? 'text-cream' : idle,
                        )}
                    >
                        <Icon
                            className={cn(
                                'size-5 shrink-0',
                                isActive &&
                                    cn(arrive, 'motion-reduce:animate-none'),
                            )}
                        />
                        <span className="truncate">{label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
