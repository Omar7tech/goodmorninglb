import { ArrowUpRight, Star } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * A nudge to review the shop, on the footer's green: five stars in the sun's
 * yellow over a line asking how the morning went, the whole card one link to
 * where reviews are left.
 *
 * The stars are a picture of a review rather than a rating to pick — the
 * score is given on Google, where it counts — so they are drawn full and
 * hidden from readers, who hear the link's own words instead.
 */
export function ReviewCard({
    href,
    className,
}: {
    href: string;
    className?: string;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={cn(
                'group flex items-center gap-4 rounded-3xl bg-slab-ink/10 px-5 py-4 text-left transition-colors duration-200 ease-out hover:bg-slab-ink/15 focus-visible:ring-3 focus-visible:ring-slab-ink/50 focus-visible:outline-none',
                className,
            )}
        >
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span aria-hidden className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, index) => (
                        <Star
                            key={index}
                            className="size-4 fill-[#F4C338] text-[#F4C338]"
                        />
                    ))}
                </span>
                <span className="font-heading text-xl leading-none">
                    Loved your morning?
                </span>
                <span className="text-xs opacity-80">
                    Rate us on Google, it takes a minute.
                </span>
            </span>

            <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slab-ink text-primary transition-[translate] duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:translate-none"
            >
                <ArrowUpRight className="size-5" strokeWidth={2.5} />
            </span>
        </a>
    );
}
