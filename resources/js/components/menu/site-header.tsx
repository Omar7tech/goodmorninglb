import { Link } from '@inertiajs/react';
import { Menu } from 'lucide-react';

import { GoodMorningLogo } from '@/components/good-morning-logo';

/**
 * The logo, doubling as the way back to the home page, and the nav trigger at
 * the far end of the row, as on the Stone House site. The trigger opens
 * nothing yet.
 */
export function SiteHeader() {
    return (
        <header className="flex items-center justify-between gap-4 px-5 pt-5 pb-6">
            <Link
                href="/"
                aria-label="Good Morning — home"
                className="rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
                <GoodMorningLogo className="w-32 drop-shadow-sm sm:w-40 lg:w-48" />
            </Link>

            <button
                type="button"
                aria-label="Open menu"
                className="-mr-1 rounded-lg p-1 text-primary transition-opacity hover:opacity-70 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
                <Menu className="size-9" strokeWidth={3} />
            </button>
        </header>
    );
}
