import { Link } from '@inertiajs/react';
import { RotateCcw, UtensilsCrossed } from 'lucide-react';

import { SiteFooter } from '@/components/menu/site-footer';
import { SiteHeader } from '@/components/menu/site-header';
import { cn } from '@/lib/utils';

/** Every way out of the page shares one shape. */
const BUTTON =
    'inline-flex h-13 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';

/**
 * The error page: the storefront, with an explanation where the menu goes.
 *
 * The whole page rather than a bare message — the same header and footer as
 * everywhere else — so someone who lands here from a mistyped link or an old
 * post is standing in the shop rather than in Laravel, and the way back to
 * the menu is one tap. Its words come from the server (`App\Support\ErrorPage`),
 * which the plain fallback pages share.
 *
 * The status is set large and faint behind the panel in the house display
 * face: the one place on the site where a number is the picture.
 */
export default function ErrorPage({
    status,
    heading,
    message,
    retry,
}: {
    status: number;
    heading: string;
    message: string;
    /** Only where trying again is the actual fix; on a 404 it is not. */
    retry: boolean;
}) {
    return (
        <div className="flex min-h-svh flex-col bg-background">
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col lg:max-w-5xl xl:max-w-6xl">
                <SiteHeader />

                <main className="relative isolate mx-4 mb-10 flex flex-1 flex-col justify-center overflow-hidden rounded-[2rem] bg-surface px-6 py-14 shadow-sm ring-1 ring-border lg:px-14 lg:py-20">
                    <span
                        aria-hidden
                        className="pointer-events-none absolute -right-4 -bottom-10 -z-10 font-heading text-[10rem] leading-none text-primary/[0.08] tabular-nums select-none sm:text-[15rem] lg:text-[20rem]"
                    >
                        {status}
                    </span>

                    <div className="flex max-w-xl flex-col items-start gap-5">
                        <span className="rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-primary-foreground tabular-nums">
                            Error {status}
                        </span>

                        <h1 className="font-heading text-4xl leading-[0.95] text-balance text-primary sm:text-5xl lg:text-6xl">
                            {heading}
                        </h1>

                        <p className="text-base text-muted-foreground sm:text-lg">
                            {message}
                        </p>

                        <div className="mt-3 flex w-full flex-col gap-3 sm:flex-row">
                            <Link
                                href="/menu/dine-in"
                                className={cn(
                                    BUTTON,
                                    'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
                                )}
                            >
                                <UtensilsCrossed className="size-4.5" />
                                See the menu
                            </Link>

                            <Link
                                href="/"
                                className={cn(
                                    BUTTON,
                                    'border border-foreground/15 hover:bg-foreground/5',
                                )}
                            >
                                Back home
                            </Link>

                            {retry && (
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className={cn(
                                        BUTTON,
                                        'border border-foreground/15 hover:bg-foreground/5',
                                    )}
                                >
                                    <RotateCcw className="size-4.5" />
                                    Try again
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <SiteFooter />
        </div>
    );
}
