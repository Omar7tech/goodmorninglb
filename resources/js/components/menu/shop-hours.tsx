import {
    formatTime,
    hasPublishedHours,
    useShop,
    weeklyHours,
} from '@/lib/shop';
import { cn } from '@/lib/utils';

/**
 * The week's opening hours, for the foot of the menu.
 *
 * Only drawn while the shop runs on the automatic schedule: in manual mode
 * there are no hours to publish, only a switch, and printing the untouched
 * nine-to-five default would be a promise the shop never made.
 *
 * Days sharing the same hours are run together into one line, and the line
 * covering today is lifted onto a pill of its own so it is the one read first.
 */
export function ShopHours({ className }: { className?: string }) {
    const shop = useShop();

    if (!hasPublishedHours(shop)) {
        return null;
    }

    const rows = weeklyHours(shop);

    return (
        <section aria-labelledby="footer-hours" className={className}>
            <h2 id="footer-hours" className="font-heading text-2xl">
                Opening hours
            </h2>

            <ul className="mt-3 flex flex-col gap-1">
                {rows.map((row) => (
                    <li
                        key={row.label}
                        aria-current={row.isToday ? 'date' : undefined}
                        className={cn(
                            '-mx-3 flex items-baseline justify-between gap-6 rounded-full px-3 py-1.5 text-sm',
                            row.isToday
                                ? 'bg-slab-ink/15 font-semibold'
                                : 'opacity-80',
                        )}
                    >
                        <span>
                            {row.label}
                            {row.isToday && (
                                <span className="ml-2 text-[0.65rem] font-normal tracking-wide uppercase opacity-80">
                                    Today
                                </span>
                            )}
                        </span>

                        {row.isClosed ? (
                            <span>Closed</span>
                        ) : (
                            <span className="tabular-nums">
                                {formatTime(row.opensAt)} –{' '}
                                {formatTime(row.closesAt)}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
