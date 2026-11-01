import { Loader2, Minus, Plus, RefreshCw, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ProductImage } from '@/components/menu/product-image';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/contexts/cart-context';
import { findCombos } from '@/lib/budget-combos';
import type { Combo, Mood, Pick } from '@/lib/budget-combos';
import { usePricing } from '@/lib/use-pricing';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types';

const MIN_BUDGET = 3;
const MAX_BUDGET = 40;
const QUICK_BUDGETS = [5, 10, 15, 20, 30];
const MOODS: { value: Mood; label: string }[] = [
    { value: 'mix', label: 'Surprise me' },
    { value: 'sweet', label: 'Something sweet' },
    { value: 'fresh', label: 'Something fresh' },
];

/** What it says while it works, one line after another. */
const THINKING = [
    'Counting your budget…',
    'Looking through the whole menu…',
    'Pairing bites with drinks…',
    'Picking the best fits…',
];

/** How long it takes to "think": long enough to read as working it out. */
const THINK_MS = 900;

/** How long the slider rests before it works out the new budget. */
const SETTLE_MS = 350;

/**
 * "What can I get for $10?" — a budget, how many people, and a mood, and it
 * comes back with a handful of ready-made orders that fit: a bite and a drink
 * each, all sweet, all fresh, one big treat. Each one says what is in it,
 * what it comes to and the change left over, and on the delivery menu goes
 * into the basket in one tap.
 *
 * Worked out on the phone itself from the menu on screen — no server, no
 * waiting on anyone — by a small search that fills the budget as closely as
 * it can and leans towards the shop's top sellers. It takes a moment over it
 * on purpose, saying what it is doing, so the answer reads as considered.
 */
export function BudgetPicker({
    open,
    onOpenChange,
    categories,
    canOrder,
    onOpenDish,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: readonly Category[];
    /** The delivery menu: combos go into the basket. Dine-in only shows them. */
    canOrder: boolean;
    onOpenDish: (product: Product, variantIndex: number | null) => void;
}) {
    const pricing = usePricing();
    const { addItem } = useCart();

    const [draft, setDraft] = useState(10);
    const [budget, setBudget] = useState(10);
    const [people, setPeople] = useState(1);
    const [mood, setMood] = useState<Mood>('mix');
    const [seed, setSeed] = useState(1);
    const [thinking, setThinking] = useState(true);
    const [line, setLine] = useState(0);

    // The slider settles before anything is worked out, so dragging it is
    // not a stream of answers to budgets nobody chose.
    useEffect(() => {
        const timer = window.setTimeout(() => setBudget(draft), SETTLE_MS);

        return () => window.clearTimeout(timer);
    }, [draft]);

    const combos = useMemo(
        () => findCombos({ categories, budget, people, mood, seed }),
        [categories, budget, people, mood, seed],
    );

    // Each new question gets its moment of thought.
    useEffect(() => {
        if (!open) {
            return;
        }

        setThinking(true);
        setLine(0);

        const lines = window.setInterval(
            () =>
                setLine((current) =>
                    Math.min(current + 1, THINKING.length - 1),
                ),
            THINK_MS / THINKING.length,
        );
        const done = window.setTimeout(() => setThinking(false), THINK_MS);

        return () => {
            window.clearInterval(lines);
            window.clearTimeout(done);
        };
    }, [open, budget, people, mood, seed]);

    const addCombo = (combo: Combo): void => {
        for (const pick of combo.picks) {
            addItem({
                productId: pick.product.id,
                variantIndex: pick.variantIndex,
                name: pick.product.name,
                variantName: pick.size,
                unitUsd: pick.price,
                image: pick.product.thumbnail ?? pick.product.image,
            });
        }

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0">
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                    <div className="flex flex-col gap-5 px-5 pt-5 pb-4">
                        <div className="flex flex-col gap-1 pr-10">
                            <DialogTitle className="font-heading text-2xl leading-none text-primary">
                                Let us pick for you
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Tell us what you want to spend and we will put
                                the order together.
                            </DialogDescription>
                        </div>

                        {/* The budget, large, over its slider. */}
                        <div className="flex flex-col gap-3">
                            <p className="flex items-baseline gap-2 font-heading text-primary">
                                <span className="text-xl text-foreground/70">
                                    I have
                                </span>
                                <span className="text-6xl leading-none tabular-nums">
                                    ${draft}
                                </span>
                            </p>

                            <input
                                type="range"
                                min={MIN_BUDGET}
                                max={MAX_BUDGET}
                                step={1}
                                value={draft}
                                onChange={(event) =>
                                    setDraft(Number(event.target.value))
                                }
                                aria-label="Budget in dollars"
                                className="h-2 w-full cursor-pointer accent-primary"
                            />

                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_BUDGETS.map((amount) => (
                                    <Chip
                                        key={amount}
                                        active={draft === amount}
                                        onPress={() => setDraft(amount)}
                                    >
                                        ${amount}
                                    </Chip>
                                ))}
                            </div>
                        </div>

                        {/* For how many, and in what mood. */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    For
                                </span>
                                <div className="flex items-center rounded-full bg-card ring-1 ring-border">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPeople((count) =>
                                                Math.max(1, count - 1),
                                            )
                                        }
                                        aria-label="One person fewer"
                                        className="flex size-9 items-center justify-center rounded-full text-primary disabled:opacity-30"
                                        disabled={people === 1}
                                    >
                                        <Minus className="size-4" />
                                    </button>
                                    <span className="min-w-14 text-center text-sm font-bold tabular-nums">
                                        {people === 1
                                            ? '1 person'
                                            : `${people} people`}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPeople((count) =>
                                                Math.min(6, count + 1),
                                            )
                                        }
                                        aria-label="One person more"
                                        className="flex size-9 items-center justify-center rounded-full text-primary disabled:opacity-30"
                                        disabled={people === 6}
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {MOODS.map(({ value, label }) => (
                                <Chip
                                    key={value}
                                    active={mood === value}
                                    onPress={() => setMood(value)}
                                >
                                    {label}
                                </Chip>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border bg-background/40 px-5 pt-4 pb-6">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">
                                {thinking
                                    ? 'Working it out'
                                    : combos.length === 0
                                      ? 'Nothing fits yet'
                                      : `${combos.length} ideas for $${budget}`}
                            </p>
                            {!thinking && combos.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSeed((current) => current + 1)
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                                >
                                    <RefreshCw className="size-3.5" />
                                    Other ideas
                                </button>
                            )}
                        </div>

                        {thinking ? (
                            <Thinking line={THINKING[line]} />
                        ) : combos.length === 0 ? (
                            <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground ring-1 ring-border">
                                Nothing on the menu fits ${budget}
                                {people > 1 ? ` for ${people} people` : ''} in
                                this mood. Try a little more, fewer people, or
                                another mood.
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {combos.map((combo, index) => (
                                    <li
                                        key={combo.id}
                                        style={{
                                            animationDelay: `${index * 90}ms`,
                                            animationFillMode: 'backwards',
                                        }}
                                        className="animate-in duration-500 fade-in slide-in-from-bottom-3 motion-reduce:animate-none"
                                    >
                                        <ComboCard
                                            combo={combo}
                                            budget={budget}
                                            canOrder={canOrder}
                                            usd={pricing.usd}
                                            onAdd={() => addCombo(combo)}
                                            onOpenDish={(pick) => {
                                                onOpenChange(false);
                                                onOpenDish(
                                                    pick.product,
                                                    pick.variantIndex,
                                                );
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/** A small pill to pick with. */
function Chip({
    active,
    onPress,
    children,
}: {
    active: boolean;
    onPress: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onPress}
            aria-pressed={active}
            className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-foreground/75 ring-1 ring-border hover:text-primary',
            )}
        >
            {children}
        </button>
    );
}

/** The moment of thought: a line about what it is doing, over shimmering cards. */
function Thinking({ line }: { line: string }) {
    return (
        <div className="flex flex-col gap-3" aria-live="polite">
            <p className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                {line}
            </p>
            {[0, 1].map((card) => (
                <div
                    key={card}
                    className="flex animate-pulse items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border"
                >
                    <div className="flex -space-x-3">
                        <span className="size-12 rounded-full bg-muted ring-2 ring-card" />
                        <span className="size-12 rounded-full bg-muted ring-2 ring-card" />
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                        <span className="h-3 w-1/2 rounded-full bg-muted" />
                        <span className="h-2.5 w-4/5 rounded-full bg-muted" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/** One idea: its name, why it fits, its dishes, its total, and a way to have it. */
function ComboCard({
    combo,
    budget,
    canOrder,
    usd,
    onAdd,
    onOpenDish,
}: {
    combo: Combo;
    budget: number;
    canOrder: boolean;
    usd: (amount: number) => string;
    onAdd: () => void;
    onOpenDish: (pick: Pick) => void;
}) {
    const used = Math.min(100, Math.round((combo.total / budget) * 100));

    return (
        <article className="flex flex-col gap-3 rounded-2xl bg-card p-3.5 shadow-sm ring-1 ring-border">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="font-heading text-xl leading-tight text-primary">
                        {combo.title}
                    </h3>
                    <p className="text-xs leading-snug text-muted-foreground">
                        {combo.reason}
                    </p>
                </div>
                <span className="shrink-0 font-heading text-2xl leading-none tabular-nums">
                    {usd(combo.total)}
                </span>
            </div>

            {/* How much of the budget it uses. */}
            <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`Uses ${used}% of your budget`}
            >
                <div
                    style={{ width: `${used}%` }}
                    className="h-full rounded-full bg-[#F4C338]"
                />
            </div>

            <ul className="flex flex-col gap-1.5">
                {combo.picks.map((pick, index) => (
                    <li
                        key={`${pick.product.id}-${pick.variantIndex}-${index}`}
                    >
                        <button
                            type="button"
                            onClick={() => onOpenDish(pick)}
                            className="flex w-full items-center gap-3 rounded-xl p-1 text-left transition-colors hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                            <ProductImage
                                product={pick.product}
                                className="size-11 shrink-0 rounded-full"
                                markClassName="w-8"
                            />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold">
                                    {pick.product.name}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground">
                                    {pick.size ? `${pick.size} · ` : ''}
                                    {pick.categoryName}
                                </span>
                            </span>
                            <span className="shrink-0 text-sm font-bold text-primary tabular-nums">
                                {usd(pick.price)}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            {canOrder && (
                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-[scale] duration-200 hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-[0.98]"
                >
                    <ShoppingBag className="size-4" />
                    Add all to my order
                </button>
            )}
        </article>
    );
}
