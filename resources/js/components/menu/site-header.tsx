import { Link } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { lazy, Suspense, useRef, useState } from 'react';

import { GoodMorningLogo } from '@/components/good-morning-logo';
import { ThemeToggle } from '@/components/menu/theme-toggle';

/**
 * Fetches the menu and the animation library it runs on. Kept out of the
 * page's own download — most visitors never open the menu, and GSAP is most
 * of its weight — and asked for the moment a finger or pointer reaches the
 * burger, so it is usually already here by the time the tap lands.
 */
const loadMenu = () =>
    import('@/components/menu/site-menu').then((module) => ({
        default: module.SiteMenu,
    }));

const SiteMenu = lazy(loadMenu);

/**
 * The logo, doubling as the way back to the home page, and the burger at the
 * far end of the row that opens the site menu, with the light/dark switch
 * beside it.
 */
export function SiteHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    // The menu is only mounted once it has been asked for, so its code is
    // only fetched then; after that it stays, ready for the next time.
    const [menuWanted, setMenuWanted] = useState(false);
    const burgerRef = useRef<HTMLButtonElement>(null);

    const prefetch = (): void => {
        void loadMenu();
    };

    return (
        <header className="flex items-center justify-between gap-4 px-5 pt-5 pb-6">
            <Link
                href="/"
                aria-label="Good Morning — home"
                className="rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
                <GoodMorningLogo className="w-28 drop-shadow-sm sm:w-36 lg:w-44" />
            </Link>

            <div className="-mr-1 flex items-center gap-1">
                <ThemeToggle />

                <button
                    ref={burgerRef}
                    type="button"
                    onClick={() => {
                        setMenuWanted(true);
                        setMenuOpen(true);
                    }}
                    onPointerEnter={prefetch}
                    onPointerDown={prefetch}
                    onFocus={prefetch}
                    aria-label="Open menu"
                    aria-haspopup="dialog"
                    aria-expanded={menuOpen}
                    className="rounded-lg p-1 text-primary transition-opacity hover:opacity-70 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    <Menu className="size-9" strokeWidth={3} />
                </button>
            </div>

            {menuWanted && (
                <Suspense fallback={null}>
                    <SiteMenu
                        open={menuOpen}
                        onClose={() => setMenuOpen(false)}
                        originRef={burgerRef}
                    />
                </Suspense>
            )}
        </header>
    );
}
