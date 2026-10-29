import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

/** The two sheets the storefront can be drawn on. */
export type Theme = 'light' | 'dark';

/**
 * Where the visitor's choice is kept. Deliberately theirs and not the shop's:
 * nothing is stored on the server, so one customer reading in the dark
 * changes nothing for the next one. Only ever written by the switch.
 */
const STORAGE_KEY = 'good-morning-theme';

/**
 * The theme the visitor chose, or — until they choose — the one their phone
 * or computer is set to. Read by the inline script in the root template too,
 * which is why the rule lives in one place there and here.
 */
export function preferredTheme(): Theme {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);

        if (stored === 'light' || stored === 'dark') {
            return stored;
        }
    } catch {
        // Storage can be off or walled up; fall through to the device.
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

/**
 * Paint the document in a theme. The class is what every `dark:` utility and
 * the dark token block key off; `color-scheme` carries the choice to what the
 * stylesheet does not own — scrollbars, form controls, autofill — and the
 * theme-color meta repaints the phone's own status bar to match.
 */
export function applyTheme(theme: Theme): void {
    const root = document.documentElement;

    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', theme === 'dark' ? '#181512' : '#faf3de');
}

/**
 * The current theme and a way to change it.
 *
 * The first value is read off the document, which the inline script in the
 * root template has already settled before React runs — reading storage again
 * would be a second answer that could disagree and flash.
 *
 * Until the visitor picks one, the site keeps following the device, so a
 * phone that turns dark at sunset takes the menu with it.
 */
export function useTheme(): {
    theme: Theme;
    toggleTheme: (origin?: { x: number; y: number }) => void;
} {
    const [theme, setTheme] = useState<Theme>(() =>
        typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light',
    );

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    useEffect(() => {
        const query = window.matchMedia('(prefers-color-scheme: dark)');
        const follow = (): void => {
            try {
                if (window.localStorage.getItem(STORAGE_KEY) !== null) {
                    return;
                }
            } catch {
                // No storage: there is no choice to respect.
            }

            setTheme(query.matches ? 'dark' : 'light');
        };

        query.addEventListener('change', follow);

        return () => query.removeEventListener('change', follow);
    }, []);

    /**
     * Switch theme. Given the point it was pressed from, the new theme spreads
     * out in a circle from there over the old one, where the browser supports
     * animating a change of the whole page; elsewhere, and for anyone who
     * prefers less motion, it simply changes.
     */
    const toggleTheme = useCallback(
        (origin?: { x: number; y: number }) => {
            const next: Theme = theme === 'dark' ? 'light' : 'dark';

            try {
                window.localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // The switch still works for this visit.
            }

            const reduced = window.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ).matches;

            if (
                origin === undefined ||
                reduced ||
                typeof document.startViewTransition !== 'function'
            ) {
                setTheme(next);

                return;
            }

            const transition = document.startViewTransition(() => {
                flushSync(() => setTheme(next));
                applyTheme(next);
            });

            const radius = Math.hypot(
                Math.max(origin.x, window.innerWidth - origin.x),
                Math.max(origin.y, window.innerHeight - origin.y),
            );

            void transition.ready.then(() => {
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${origin.x}px ${origin.y}px)`,
                            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
                        ],
                    },
                    {
                        duration: 650,
                        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                        pseudoElement: '::view-transition-new(root)',
                    },
                );
            });
        },
        [theme],
    );

    return { theme, toggleTheme };
}
