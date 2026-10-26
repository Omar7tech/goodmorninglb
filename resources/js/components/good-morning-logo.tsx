import { cn } from '@/lib/utils';

/**
 * The full Good Morning mark: the sun over the wordmark. Served as a file
 * rather than inlined, since it is ~125 KB of paths the browser can cache.
 * The width and height carry its aspect ratio so the page doesn't jump while
 * it loads.
 */
export function GoodMorningLogo({ className }: { className?: string }) {
    return (
        <img
            src="/images/logo.svg"
            alt="Good Morning"
            width={4193}
            height={2782}
            fetchPriority="high"
            draggable={false}
            className={cn('h-auto select-none', className)}
        />
    );
}
