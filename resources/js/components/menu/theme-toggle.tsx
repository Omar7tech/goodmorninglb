import { useId } from 'react';

import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

/** The sun's eight rays, as angles round its middle. */
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * The visitor's own light/dark switch, standing next to the burger.
 *
 * One mark that turns into the other: in the light it is the logo's sun,
 * yellow and rayed; pressed, the rays draw in and spin away while a shadow
 * slides across the disc and bites it into a crescent moon — and the new theme
 * spreads over the page in a circle from the button itself.
 *
 * The choice is the reader's, remembered on their device; until they make
 * one, the site follows their phone or computer.
 */
export function ThemeToggle({ className }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const maskId = `theme-moon-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

    return (
        <button
            type="button"
            onClick={(event) => {
                const box = event.currentTarget.getBoundingClientRect();

                toggleTheme({
                    x: box.left + box.width / 2,
                    y: box.top + box.height / 2,
                });
            }}
            aria-pressed={isDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className={cn(
                'grid size-11 place-items-center rounded-full transition-colors duration-300 hover:bg-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                className,
            )}
        >
            <svg
                aria-hidden
                viewBox="0 0 24 24"
                className={cn(
                    'size-8 overflow-visible transition-[color,rotate] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
                    isDark
                        ? 'rotate-[40deg] text-cream'
                        : 'rotate-0 text-[#F4C338]',
                )}
            >
                <defs>
                    <mask id={maskId}>
                        <rect width="24" height="24" fill="white" />
                        {/* The shadow that bites the sun into a moon: parked
                            off the corner in the light, slid over the disc
                            in the dark. */}
                        <circle
                            cx="18"
                            cy="6"
                            r="7"
                            fill="black"
                            style={{
                                transformBox: 'fill-box',
                                transformOrigin: 'center',
                            }}
                            className={cn(
                                'transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
                                isDark
                                    ? 'translate-x-0 translate-y-0'
                                    : 'translate-x-[9px] -translate-y-[9px]',
                            )}
                        />
                    </mask>
                </defs>

                {/* The disc: the sun's, then the moon's, a little larger. */}
                <circle
                    cx="12"
                    cy="12"
                    r="7"
                    fill="currentColor"
                    mask={`url(#${maskId})`}
                    style={{
                        transformBox: 'fill-box',
                        transformOrigin: 'center',
                    }}
                    className={cn(
                        'transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
                        isDark ? 'scale-125' : 'scale-75',
                    )}
                />

                {/* The rays, drawn in and spun away as the sun sets. */}
                <g
                    style={{ transformOrigin: '12px 12px' }}
                    className={cn(
                        'transition-[opacity,scale,rotate] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
                        isDark
                            ? 'scale-50 -rotate-90 opacity-0'
                            : 'scale-100 rotate-0 opacity-100',
                    )}
                >
                    {RAYS.map((angle) => (
                        <line
                            key={angle}
                            x1="12"
                            y1="1.5"
                            x2="12"
                            y2="4"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            transform={`rotate(${angle} 12 12)`}
                        />
                    ))}
                </g>
            </svg>
        </button>
    );
}
