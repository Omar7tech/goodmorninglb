import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Bike, UtensilsCrossed } from 'lucide-react';

import { DessertPattern } from '@/components/dessert-pattern';
import { GoodMorningLogo } from '@/components/good-morning-logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Landing call-to-action. On hover the arrow rides out to the right and a
 * fresh copy takes its place from the left; the colours stay put.
 */
function ChoiceButton({
    label,
    href,
    icon: Icon,
    className,
}: {
    label: string;
    href: string;
    icon: LucideIcon;
    className?: string;
}) {
    return (
        <Button
            asChild
            size="lg"
            className={cn(
                'h-16 justify-start gap-3 rounded-2xl px-5 font-heading text-3xl text-cream sm:h-20 sm:flex-1 sm:text-[2rem]',
                // Lifted off the page, and a little further on hover.
                'shadow-lg shadow-black/10 transition-[box-shadow,translate] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl motion-reduce:hover:translate-y-0',
                className,
            )}
        >
            <Link href={href}>
                <Icon className="size-7 shrink-0 sm:size-8" />
                {label}
                <span className="relative ml-auto flex size-7 items-center justify-center overflow-hidden sm:size-8">
                    <ArrowRight className="size-7 transition-transform duration-300 ease-out group-hover/button:translate-x-9 motion-reduce:transform-none sm:size-8" />
                    <ArrowRight
                        aria-hidden
                        className="absolute size-7 -translate-x-9 transition-transform duration-300 ease-out group-hover/button:translate-x-0 motion-reduce:hidden sm:size-8"
                    />
                </span>
            </Link>
        </Button>
    );
}

export default function Welcome() {
    return (
        <>
            <Head title="Fresh Desserts & Drinks in Aley" />

            <main className="relative isolate flex min-h-svh flex-col items-center justify-center gap-10 overflow-hidden px-6 py-12 sm:gap-12">
                <DessertPattern />

                <h1 className="w-full max-w-sm animate-in duration-700 ease-out zoom-in-95 fade-in motion-reduce:animate-none sm:max-w-lg lg:max-w-xl">
                    <GoodMorningLogo className="w-full drop-shadow-sm" />
                </h1>

                {/* From `sm` up the pair sits side by side under the logo and
                    shares its width, so the two read as one block. */}
                <nav
                    aria-label="Order"
                    className="flex w-full max-w-sm animate-in flex-col gap-3 delay-300 duration-500 ease-out fill-mode-backwards fade-in slide-in-from-bottom-4 motion-reduce:animate-none sm:max-w-lg sm:flex-row sm:gap-4 lg:max-w-xl"
                >
                    <ChoiceButton
                        label="Dine In"
                        href="/menu/dine-in"
                        icon={UtensilsCrossed}
                        className="bg-sage hover:bg-sage"
                    />
                    <ChoiceButton
                        label="Delivery"
                        href="/menu/delivery"
                        icon={Bike}
                        className="bg-berry hover:bg-berry"
                    />
                </nav>
            </main>
        </>
    );
}
