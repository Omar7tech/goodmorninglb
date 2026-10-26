import { cn } from '@/lib/utils';

/**
 * The full Good Morning mark: the sun over the wordmark. Served as a file
 * rather than inlined, since it is ~125 KB of paths the browser can cache.
 * The width and height carry its aspect ratio so the page doesn't jump while
 * it loads.
 *
 * `animated` swaps in the version that draws itself in: the sun's rays paint
 * on, the letters drop and rise into place, then the desserts pop in. It
 * runs once (about 2.5 s) and holds on the finished mark, and stands still
 * for anyone who prefers reduced motion. The animation lives in the SVG's
 * own CSS, so it plays as an ordinary `<img>`.
 */
export function GoodMorningLogo({
    animated = false,
    className,
}: {
    animated?: boolean;
    className?: string;
}) {
    return (
        <img
            src={animated ? '/images/logo-animated.svg' : '/images/logo.svg'}
            alt="Good Morning"
            width={4193}
            height={2782}
            fetchPriority="high"
            draggable={false}
            className={cn('h-auto select-none', className)}
        />
    );
}
