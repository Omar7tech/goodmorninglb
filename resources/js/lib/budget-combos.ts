import type { Category, Product } from '@/types';

/** Something to eat, or something to drink. */
export type Kind = 'bite' | 'sip';

/** What the customer is in the mood for. */
export type Mood = 'mix' | 'sweet' | 'fresh';

/** One dish in one size, at the price it actually costs. */
export type Pick = {
    product: Product;
    categoryName: string;
    variantIndex: number | null;
    size: string | null;
    price: number;
    kind: Kind;
};

/** A set of dishes that fits the budget, with a name and a reason. */
export type Combo = {
    id: string;
    title: string;
    reason: string;
    picks: Pick[];
    total: number;
};

/**
 * Categories whose dishes are drunk rather than eaten. Read off the names the
 * owner gave them, so a new juice category is recognised without anyone
 * telling the menu.
 */
const SIP =
    /juice|shake|cocktail|smoothie|coffee|drink|tea|jallab|lemonade|avocado|milk|soda/i;

/** Sizes sold by the litre, like "1L" or "1.5L": a jug to share. */
const SHARING = /^\s*\d+(\.\d+)?\s*l\s*$/i;

/** How many tries each shape of combo gets at finding its best fit. */
const ATTEMPTS = 60;

/** How many improving swaps each try makes. */
const STEPS = 140;

/**
 * A small seeded random number generator (mulberry32), so the same budget
 * gives the same ideas until the customer asks for others.
 */
function random(seed: number): () => number {
    let state = seed >>> 0;

    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Every dish in every size it is sold in, as something that can go into a
 * combo. Dishes with no price are left out: they cannot be budgeted for.
 */
export function picksFrom(categories: readonly Category[]): Pick[] {
    return categories.flatMap((category) => {
        const kind: Kind = SIP.test(category.name) ? 'sip' : 'bite';

        return category.products.flatMap((product): Pick[] => {
            if (product.variants.length === 0) {
                const price = product.discountPrice ?? product.price;

                return price > 0
                    ? [
                          {
                              product,
                              categoryName: category.name,
                              variantIndex: null,
                              size: null,
                              price,
                              kind,
                          },
                      ]
                    : [];
            }

            return product.variants
                .map((variant, index) => ({
                    product,
                    categoryName: category.name,
                    variantIndex: index,
                    size: variant.name,
                    price: variant.discountPrice ?? variant.price,
                    kind,
                }))
                .filter((pick) => pick.price > 0);
        });
    });
}

/**
 * How good a set of picks is for this budget: above all how fully it uses the
 * money, then whether it holds the shop's top sellers and something new, and
 * whether it spreads across the menu rather than repeating one dish.
 */
function score(picks: readonly Pick[], budget: number): number {
    const total = picks.reduce((sum, pick) => sum + pick.price, 0);

    if (total > budget + 1e-9) {
        return -Infinity;
    }

    const dishes = new Set(picks.map((pick) => pick.product.id));
    const categories = new Set(picks.map((pick) => pick.categoryName));

    return (
        (total / budget) * 100 +
        picks.filter((pick) => pick.product.isFeatured).length * 5 +
        picks.filter((pick) => pick.product.isNew).length * 2 +
        categories.size * 3 -
        (picks.length - dishes.size) * 18
    );
}

/**
 * The best set of picks it can find for a shape — say a bite and a sip for
 * each of two people — under the budget. A quick local search: start from a
 * random fit, then keep swapping one dish for another of the same kind
 * whenever the swap scores better, from several random starts.
 */
function solve(
    shape: readonly Kind[],
    pool: Record<Kind, Pick[]>,
    budget: number,
    next: () => number,
): Pick[] | null {
    if (shape.some((kind) => pool[kind].length === 0)) {
        return null;
    }

    const cheapest = shape.reduce(
        (sum, kind) => sum + Math.min(...pool[kind].map((pick) => pick.price)),
        0,
    );

    if (cheapest > budget) {
        return null;
    }

    const choose = (kind: Kind): Pick =>
        pool[kind][Math.floor(next() * pool[kind].length)];

    let best: Pick[] | null = null;
    let bestScore = -Infinity;

    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
        // A start that fits: the cheapest of each kind, then reshuffled in.
        let current = shape.map((kind) =>
            pool[kind].reduce((low, pick) =>
                pick.price < low.price ? pick : low,
            ),
        );
        let currentScore = score(current, budget);

        for (let step = 0; step < STEPS; step++) {
            const slot = Math.floor(next() * shape.length);
            const candidate = [...current];
            candidate[slot] = choose(shape[slot]);
            const candidateScore = score(candidate, budget);

            if (candidateScore >= currentScore) {
                current = candidate;
                currentScore = candidateScore;
            }
        }

        if (currentScore > bestScore) {
            best = current;
            bestScore = currentScore;
        }
    }

    return best;
}

/** The fanciest single dish each person can have, all within the budget. */
function treat(
    pool: readonly Pick[],
    budget: number,
    people: number,
): Pick[] | null {
    const each = budget / people;
    const fits = pool
        .filter((pick) => pick.price <= each)
        .sort(
            (a, b) =>
                b.price - a.price ||
                Number(b.product.isFeatured) - Number(a.product.isFeatured),
        );

    if (fits.length === 0) {
        return null;
    }

    // A different dish for each person where the menu allows it.
    const chosen: Pick[] = [];
    const seen = new Set<number>();

    for (const pick of fits) {
        if (!seen.has(pick.product.id)) {
            chosen.push(pick);
            seen.add(pick.product.id);
        }

        if (chosen.length === people) {
            break;
        }
    }

    while (chosen.length < people) {
        chosen.push(fits[0]);
    }

    return chosen;
}

/** The sizes and dishes of a set, said the way a person would. */
function describe(picks: readonly Pick[]): string {
    const counts = new Map<string, number>();

    for (const pick of picks) {
        const name = pick.size
            ? `${pick.product.name} (${pick.size})`
            : pick.product.name;
        counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    const parts = [...counts].map(([name, count]) =>
        count > 1 ? `${count}× ${name}` : name,
    );

    return parts.length <= 1
        ? parts.join('')
        : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/** Why this combo, in a line: what is in it, what is left over, what stands out. */
function reasonFor(
    picks: readonly Pick[],
    total: number,
    budget: number,
): string {
    const change = budget - total;
    const notes = [
        change < 0.01
            ? 'uses every cent'
            : `leaves $${change.toFixed(2)} change`,
    ];

    if (picks.some((pick) => pick.product.isFeatured)) {
        notes.push('with a top seller in it');
    } else if (picks.some((pick) => pick.product.isNew)) {
        notes.push('with something new to try');
    }

    return `${describe(picks)}. Comes to $${total.toFixed(2)}, ${notes.join(', ')}.`;
}

/**
 * Up to four different ideas for spending the budget, each a different shape
 * of order — a bite and a drink each, all sweet, all fresh, one big treat —
 * chosen to suit the mood and the number of people. Ideas that turn out the
 * same are kept once, and best-fitting first.
 */
export function findCombos({
    categories,
    budget,
    people,
    mood,
    seed,
}: {
    categories: readonly Category[];
    budget: number;
    people: number;
    mood: Mood;
    seed: number;
}): Combo[] {
    // Litre bottles are for sharing: offered to a group, not to one or two.
    const all = picksFrom(categories).filter(
        (pick) => people >= 3 || !SHARING.test(pick.size ?? ''),
    );
    const pool: Record<Kind, Pick[]> = {
        bite: all.filter((pick) => pick.kind === 'bite'),
        sip: all.filter((pick) => pick.kind === 'sip'),
    };
    const next = random(seed);
    const each = (kinds: Kind[]): Kind[] =>
        Array.from({ length: people }, () => kinds).flat();

    const shapes: { title: string; picks: Pick[] | null }[] = [];

    if (mood !== 'fresh') {
        shapes.push({
            title: people > 1 ? 'A bite and a sip each' : 'The perfect pair',
            picks:
                mood === 'mix'
                    ? solve(each(['bite', 'sip']), pool, budget, next)
                    : null,
        });
        shapes.push({
            title: 'Sweet tooth',
            picks: solve(each(['bite', 'bite']), pool, budget, next),
        });
    }

    if (mood !== 'sweet') {
        shapes.push({
            title: 'Fresh and cold',
            picks: solve(each(['sip']), pool, budget, next),
        });
        shapes.push({
            title: 'Thirsty morning',
            picks: solve(each(['sip', 'sip']), pool, budget, next),
        });
    }

    if (mood === 'mix') {
        shapes.push({
            title: people > 1 ? 'Treat everyone' : 'Treat yourself',
            picks: treat(all, budget, people),
        });
    } else {
        shapes.push({
            title: mood === 'sweet' ? 'One big treat' : 'The best glass',
            picks: treat(
                pool[mood === 'sweet' ? 'bite' : 'sip'],
                budget,
                people,
            ),
        });
        shapes.push({
            title: mood === 'sweet' ? 'Just a bite' : 'A quick sip',
            picks: solve(
                each([mood === 'sweet' ? 'bite' : 'sip']),
                pool,
                budget,
                next,
            ),
        });
    }

    const seen = new Set<string>();
    const combos: (Combo & { fit: number })[] = [];

    for (const { title, picks } of shapes) {
        if (picks === null) {
            continue;
        }

        const total = picks.reduce((sum, pick) => sum + pick.price, 0);
        const key = picks
            .map((pick) => `${pick.product.id}:${pick.variantIndex}`)
            .sort()
            .join('|');

        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        combos.push({
            id: `${title}-${key}`,
            title,
            reason: reasonFor(picks, total, budget),
            picks,
            total,
            fit: score(picks, budget),
        });
    }

    return combos
        .sort((a, b) => b.fit - a.fit)
        .slice(0, 4)
        .map(({ fit: _fit, ...combo }) => combo);
}
