import { Link } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { useRef, useState } from 'react';

import { GoodMorningLogo } from '@/components/good-morning-logo';
import { SiteMenu } from '@/components/menu/site-menu';

/**
 * The logo, doubling as the way back to the home page, and the burger at the
 * far end of the row that opens the site menu.
 */
export function SiteHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const burgerRef = useRef<HTMLButtonElement>(null);

    return (
        <header className="flex items-center justify-between gap-4 px-5 pt-5 pb-6">
            <Link
                href="/"
                aria-label="Good Morning — home"
                className="rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
                <GoodMorningLogo className="w-28 drop-shadow-sm sm:w-36 lg:w-44" />
            </Link>

            <button
                ref={burgerRef}
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                className="-mr-1 rounded-lg p-1 text-primary transition-opacity hover:opacity-70 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
                <Menu className="size-9" strokeWidth={3} />
            </button>

            <SiteMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                originRef={burgerRef}
            />
        </header>
    );
}
