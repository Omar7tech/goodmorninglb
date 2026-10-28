import { Star } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

/** What each star says while it is pointed at, worst to best. */
const VERDICTS = [
    'Not great',
    'It was okay',
    'Good',
    'Really good',
    'Loved it!',
];

/**
 * A rating, asked for on the footer's green: "How was your morning?" over five
 * big stars that fill in the sun's yellow up to the one under the finger or
 * pointer, with a word for what that many stars means.
 *
 * Every star goes to the same place — the shop's review page, where the score
 * is actually given and counts — so picking one here is the first step of
 * rating rather than a rating kept on this site. Each is still a link of its
 * own, named for its score, so it reads as a choice to anyone using a reader.
 */
export function ReviewCard({
    href,
    className,
}: {
    href: string;
    className?: string;
}) {
    /** How many stars are lit: the one pointed at and all before it. */
    const [lit, setLit] = useState(0);

    return (
        <div
            className={cn(
                'flex flex-col items-center gap-2 rounded-3xl bg-slab-ink/10 px-5 py-5 text-center',
                className,
            )}
        >
            <p className="font-heading text-2xl leading-none">
                How was your morning?
            </p>

            <div
                className="flex items-center gap-1"
                onMouseLeave={() => setLit(0)}
            >
                {VERDICTS.map((verdict, index) => {
                    const stars = index + 1;
                    const isLit = stars <= lit;

                    return (
                        <a
                            key={verdict}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Rate us ${stars} out of 5 on Google`}
                            onMouseEnter={() => setLit(stars)}
                            onFocus={() => setLit(stars)}
                            onBlur={() => setLit(0)}
                            className="rounded-full p-0.5 focus-visible:ring-3 focus-visible:ring-slab-ink/50 focus-visible:outline-none"
                        >
                            <Star
                                aria-hidden
                                strokeWidth={1.75}
                                className={cn(
                                    'size-9 transition-[color,fill,scale] duration-150 ease-out motion-reduce:transition-colors',
                                    isLit
                                        ? 'scale-110 fill-[#F4C338] text-[#F4C338] motion-reduce:scale-100'
                                        : 'fill-transparent text-slab-ink/55',
                                )}
                            />
                        </a>
                    );
                })}
            </div>

            {/* Says what the lit stars mean, or what to do with them. Held to
                one line's height so the card never jumps as it changes. */}
            <p aria-hidden className="h-4 text-xs leading-4 font-semibold">
                {lit > 0
                    ? VERDICTS[lit - 1]
                    : 'Tap a star to rate us on Google'}
            </p>
        </div>
    );
}
