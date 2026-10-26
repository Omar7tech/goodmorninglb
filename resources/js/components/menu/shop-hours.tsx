import { Clock } from 'lucide-react';

import {
    formatTime,
    hasPublishedHours,
    useShop,
    useShopStatus,
    weeklyHours,
} from '@/lib/shop';
import type { HoursRow } from '@/lib/shop';
import { cn } from '@/lib/utils';

/**
 * Where the shop stands right now, under its hours: a dot, filled while open
 * and hollow while shut, and a few words that keep themselves current —
 * "Open now", "Closing in 20 min", "Closed · Opens tomorrow at 9 AM".
 */
function LiveStatus({ className }: { className?: string }) {
    const { open, detail, closingSoon } = useShopStatus();

    const text = open
        ? closingSoon && detail !== null
            ? detail
            : 'Open now'
        : ['Closed', detail].filter(Boolean).join(' · ');

    return (
        <p
            role="status"
            className={cn('flex items-center gap-2 text-sm', className)}
        >
            <span
                aria-hidden
                className={cn(
                    'size-2 shrink-0 rounded-full border-[1.5px]',
                    open
                        ? 'border-[#F4C338] bg-[#F4C338]'
                        : 'border-slab-ink bg-transparent',
                )}
            />
            <span className={cn(open ? 'font-semibold' : 'opacity-90')}>
                {text}
            </span>
        </p>
    );
}

/** A day's hours as one string, or "Closed". */
function hoursLabel(row: HoursRow): string {
    return row.isClosed
        ? 'Closed'
        : `${formatTime(row.opensAt)} – ${formatTime(row.closesAt)}`;
}

/**
 * The week's opening hours, for the foot of the menu.
 *
 * Only drawn while the shop runs on the automatic schedule: in manual mode
 * there are no hours to publish, only a switch, and printing the untouched
 * nine-to-five default would be a promise the shop never made.
 *
 * Two shapes. A shop keeping the same hours all week gets one line — "Open
 * every day", and the hours — since a table of seven identical rows, or one
 * row labelled "Mon – Sun", is a list for something that is not a list. A shop
 * whose days differ gets the week, days with matching hours run together, and
 * the line covering today lifted onto a cream pill so it is the one read first.
 */
export function ShopHours({ className }: { className?: string }) {
    const shop = useShop();

    if (!hasPublishedHours(shop)) {
        return null;
    }

    const rows = weeklyHours(shop);

    if (rows.length === 1) {
        const [week] = rows;

        return (
            <section
                aria-label="Opening hours"
                className={cn('flex items-center gap-3', className)}
            >
                <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-slab-ink/15"
                >
                    <Clock className="size-5" />
                </span>

                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-heading text-xl leading-tight">
                        {week.isClosed ? 'Closed for now' : 'Open every day'}
                    </span>
                    {!week.isClosed && (
                        <span className="text-sm tabular-nums opacity-85">
                            {hoursLabel(week)}
                        </span>
                    )}
                    <LiveStatus className="mt-1.5" />
                </span>
            </section>
        );
    }

    return (
        <section aria-labelledby="footer-hours" className={className}>
            <h2
                id="footer-hours"
                className="flex items-center gap-2 font-heading text-xl"
            >
                <Clock aria-hidden className="size-5" />
                Opening hours
            </h2>

            <LiveStatus className="mt-1.5" />

            <ul className="mt-3 flex flex-col gap-0.5">
                {rows.map((row) => (
                    <li
                        key={row.label}
                        aria-current={row.isToday ? 'date' : undefined}
                        className={cn(
                            '-mx-3 flex items-center justify-between gap-4 rounded-full px-3 py-2 text-sm',
                            row.isToday
                                ? 'bg-slab-ink font-semibold text-primary shadow-sm'
                                : 'opacity-85',
                        )}
                    >
                        <span className="flex items-center gap-2">
                            {row.label}
                            {row.isToday && (
                                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[0.6rem] tracking-wide uppercase">
                                    Today
                                </span>
                            )}
                        </span>

                        <span className="tabular-nums">{hoursLabel(row)}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
