import { Link } from '@inertiajs/react';

import { GoodMorningLogo } from '@/components/good-morning-logo';

/** The logo, and the way back to the home page. */
export function SiteHeader() {
    return (
        <header className="flex items-center px-5 pt-5 pb-6">
            <Link
                href="/"
                aria-label="Good Morning — home"
                className="rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
                <GoodMorningLogo className="w-32 drop-shadow-sm sm:w-40 lg:w-48" />
            </Link>
        </header>
    );
}
