import type { Mood, Taste } from '@/lib/pick-memory';
import type { Category, Product } from '@/types';

export type { Mood };

/** Something to eat, or something to drink. */
export type Kind = 'bite' | 'sip';

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

/** The answer to one question: the ideas, and a line on how it got there. */
export type Reading = {
    combos: Combo[];
    note: string;
};

/**
 * Categories whose dishes are drunk rather than eaten. Read off the names the
 * owner gave them, so a new juice category is recognised without anyone
 * telling the menu.
 */
const SIP =
    /juice|shake|cocktail|smoothie|coffee|drink|tea|jallab|lemonade|avocado|milk|soda/i;

/** Sizes sold by the litre, like "1L" or "1.5L": a jug to share. */
const SHARING_SIZE = /^\s*\d+(\.\d+)?\s*l\s*$/i;

/** Dishes made for a table: a dozen of something, a box, a big plate. */
const SHARING_DISH =
    /dozen|\bbox\b|\b(1[2-9]|[2-9]\d)\s*(pieces|pcs)\b|birthday/i;
const SHARING_CATEGORY = /plate/i;

/** Things sold as they are, that nobody would call a treat. */
const NOT_A_DISH = /dough/i;

/** A heavy, dessert-rich dish. */
const RICH =
    /choco|nutella|lotus|oreo|kinder|pistachio|brown|dubai|cheese|knafeh|ashta|cream|mou\b|lava|cake|shake|donut/i;

/** A bright, sharp drink, the thing that cuts through a rich one. */
const SHARP =
    /lemon|grape-?fruit|kiwi|pomegranate|pineapple|orange|vitamin|passion|carrot/i;

/** Named flavours. Two of the same in one order is one flavour too many. */
const FLAVOURS =
    /nutella|lotus|pistachio|oreo|kinder|dubai|chocolate|choco|mango|strawberry|avocado/gi;

/** What each part of the day leans towards. */
const MOMENTS: {
    from: number;
    greeting: string;
    leaning: string;
    lean: RegExp;
}[] = [
    {
        from: 5,
        greeting: 'Good morning',
        leaning: 'a proper start',
        lean: /pancake|crepe|croissant|cinnamon|orange|carrot|coffee|vitamin/i,
    },
    {
        from: 11,
        greeting: 'Good afternoon',
        leaning: 'cold and fresh',
        lean: /juice|cocktail|avocado|fruit|lemon|smoothie|watermelon|shamam/i,
    },
    {
        from: 16,
        greeting: 'Good evening',
        leaning: 'something to share a moment with',
        lean: /waffle|shake|cup|sweets|cake|brownie|cocktail/i,
    },
    {
        from: 20,
        greeting: 'Good evening',
        leaning: 'something rich',
        lean: /waffle|crepe|pancake|choco|nutella|lotus|knafeh|brownie/i,
    },
];

/** How many tries each shape of combo gets at finding its best fit. */
const ATTEMPTS = 14;

/** How many improving swaps each try makes. */
const STEPS = 90;

/** Past this share of the budget, spending more earns nothing. */
const ENOUGH_SPENT = 0.82;

/** How many ideas come back. */
const MOST_IDEAS = 4;

/** What a dish loses for having been seen in this same answer. */
const ALREADY_USED = 45;

/** A small seeded random number generator (mulberry32). */
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

function momentOf(now: Date): (typeof MOMENTS)[number] {
    const hour = now.getHours();

    return (
        [...MOMENTS].reverse().find((moment) => hour >= moment.from) ??
        MOMENTS[MOMENTS.length - 1]
    );
}

/** May to September in Lebanon: cold drinks earn a little more. */
function isWarmSeason(now: Date): boolean {
    const month = now.getMonth();

    return month >= 4 && month <= 8;
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

/** The dishes that make sense for this many people. */
function sensiblePicks(
    categories: readonly Category[],
    people: number,
): Pick[] {
    return picksFrom(categories).filter((pick) => {
        if (NOT_A_DISH.test(pick.product.name)) {
            return false;
        }

        // Jugs and dozens are offered to a group, not to one or two.
        if (
            people < 3 &&
            (SHARING_SIZE.test(pick.size ?? '') ||
                SHARING_DISH.test(pick.product.name))
        ) {
            return false;
        }

        return people > 1 || !SHARING_CATEGORY.test(pick.categoryName);
    });
}

function isRich(pick: Pick): boolean {
    return RICH.test(`${pick.product.name} ${pick.categoryName}`);
}

function isSharp(pick: Pick): boolean {
    return pick.kind === 'sip' && SHARP.test(pick.product.name);
}

function flavoursOf(pick: Pick): string[] {
    return (pick.product.name.match(FLAVOURS) ?? []).map((flavour) =>
        flavour.toLowerCase().replace('choco', 'chocolate').slice(0, 9),
    );
}

/** How well a set of dishes goes together, whatever it costs. */
function harmony(picks: readonly Pick[]): number {
    const rich = picks.filter(isRich).length;
    const sharp = picks.filter(isSharp).length;
    const flavours = picks.flatMap(flavoursOf);
    const repeats = flavours.length - new Set(flavours).size;

    return (
        // Something bright against something rich is the classic match.
        Math.min(rich, sharp) * 12 -
        // Rich on rich for one stomach is too much of a good thing.
        Math.max(0, rich - sharp - 1) * 9 -
        repeats * 16
    );
}

/** How much this customer, at this moment, would want each dish. */
function appealFor(taste: Taste, seed: number): (pick: Pick) => number {
    const moment = momentOf(taste.now);
    const warm = isWarmSeason(taste.now);
    const cache = new Map<number, number>();

    const dishAppeal = (pick: Pick): number => {
        const { product } = pick;

        const whim = random(seed ^ Math.imul(product.id, 2654435761))() * 16;

        const seen = (taste.heat.get(product.id) ?? 0) * 34;
        const refused = (taste.refused.get(product.id) ?? 0) * 46;
        const inBasket = taste.basket.has(product.id) ? 50 : 0;

        const fits = moment.lean.test(`${product.name} ${pick.categoryName}`)
            ? 9
            : 0;
        const season =
            warm && pick.kind === 'sip' && !isRich(pick)
                ? 4
                : !warm && isRich(pick)
                  ? 3
                  : 0;

        return (
            whim +
            fits +
            season +
            (taste.loved.get(pick.categoryName) ?? 0) * 8 +
            (product.isFeatured ? 6 : 0) +
            (product.isNew && !taste.tried.has(product.id) ? 4 : 0) -
            seen -
            refused -
            inBasket
        );
    };

    return (pick) => {
        const known = cache.get(pick.product.id);

        if (known !== undefined) {
            return known;
        }

        const value = dishAppeal(pick);

        cache.set(pick.product.id, value);

        return value;
    };
}

type Rating = (picks: readonly Pick[]) => number;

/**
 * How good a set of picks is. Spending the budget counts until it is mostly
 * spent and no further: a menu has a hundred ways to use most of ten dollars,
 * and chasing the last cent is what used to land on the same dishes every time.
 * Past that, it is about what this customer would want and what goes together.
 */
function ratingFor(
    budget: number,
    appeal: (pick: Pick) => number,
    bias: (pick: Pick) => number,
    used: ReadonlySet<number>,
): Rating {
    return (picks) => {
        const total = picks.reduce((sum, pick) => sum + pick.price, 0);

        if (total > budget + 1e-9) {
            return -Infinity;
        }

        const dishes = new Set(picks.map((pick) => pick.product.id));
        const categories = new Set(picks.map((pick) => pick.categoryName));

        return (
            Math.min(total / budget / ENOUGH_SPENT, 1) * 70 +
            picks.reduce(
                (sum, pick) =>
                    sum +
                    appeal(pick) +
                    bias(pick) -
                    (used.has(pick.product.id) ? ALREADY_USED : 0),
                0,
            ) /
                picks.length +
            harmony(picks) +
            categories.size * 3 -
            (picks.length - dishes.size) * 18
        );
    };
}

/**
 * The best set of picks it can find for a shape — say a bite and a sip for
 * each of two people — under the budget. A quick local search: start from the
 * cheapest fit, then keep swapping one dish for another of the same kind
 * whenever the swap scores better, from several starts.
 */
function solve(
    shape: readonly Kind[],
    pool: Record<Kind, Pick[]>,
    budget: number,
    rate: Rating,
    next: () => number,
): Pick[] | null {
    if (shape.some((kind) => pool[kind].length === 0)) {
        return null;
    }

    const lowest = (kind: Kind): Pick =>
        pool[kind].reduce((low, pick) => (pick.price < low.price ? pick : low));

    if (shape.reduce((sum, kind) => sum + lowest(kind).price, 0) > budget) {
        return null;
    }

    const choose = (kind: Kind): Pick =>
        pool[kind][Math.floor(next() * pool[kind].length)];

    let best: Pick[] | null = null;
    let bestScore = -Infinity;

    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
        let current = shape.map(lowest);
        let currentScore = rate(current);

        for (let step = 0; step < STEPS; step++) {
            const slot = Math.floor(next() * shape.length);
            const candidate = [...current];
            candidate[slot] = choose(shape[slot]);
            const candidateScore = rate(candidate);

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

/** One big dish each: the upper end of what fits, by what they would want. */
function treat(
    pool: readonly Pick[],
    budget: number,
    people: number,
    appeal: (pick: Pick) => number,
    used: ReadonlySet<number>,
): Pick[] | null {
    const each = budget / people;
    const fits = pool
        .filter((pick) => pick.price <= each && pick.price >= each * 0.6)
        .sort(
            (a, b) =>
                appeal(b) -
                (used.has(b.product.id) ? ALREADY_USED : 0) -
                (appeal(a) - (used.has(a.product.id) ? ALREADY_USED : 0)),
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

/** Why this combo, in a line a person would say, then the change left over. */
function reasonFor(
    picks: readonly Pick[],
    total: number,
    budget: number,
    taste: Taste,
    because: string | null,
    turn: number,
): string {
    const rich = picks.find(isRich);
    const sharp = picks.find(isSharp);
    const fresh = picks.find(
        (pick) => pick.product.isNew && !taste.tried.has(pick.product.id),
    );
    const star = picks.find((pick) => pick.product.isFeatured);
    const moment = momentOf(taste.now);
    const fitting = picks.find((pick) =>
        moment.lean.test(`${pick.product.name} ${pick.categoryName}`),
    );

    let why = because;

    if (why === null && rich !== undefined && sharp !== undefined) {
        const heavy = rich.product.name;
        const bright = sharp.product.name;

        // Said differently card to card, or it reads like a template.
        why = [
            `${heavy} is rich, so ${bright} cuts through it.`,
            `${bright} keeps ${heavy} from feeling too heavy.`,
            `Sweet and rich, then sharp: ${heavy} with ${bright}.`,
            `${heavy} needs something bright, and ${bright} is it.`,
        ][turn % 4];
    } else if (why === null && fresh !== undefined) {
        why = `${fresh.product.name} is new on the menu.`;
    } else if (why === null && star !== undefined) {
        why = `${star.product.name} is one of our top sellers.`;
    } else if (why === null && fitting !== undefined) {
        why = `${fitting.product.name} suits this time of day.`;
    }

    const change = budget - total;
    const left =
        change < 0.01 ? 'Uses every cent.' : `$${change.toFixed(2)} change.`;

    return why === null ? left : `${why} ${left}`;
}

/** One line on what shaped this answer, using only what is actually true. */
function noteFor(taste: Taste, people: number): string {
    const moment = momentOf(taste.now);
    const skipped = [...taste.heat.values()].filter(
        (heat) => heat > 0.35,
    ).length;
    const favourite = [...taste.loved].sort((a, b) => b[1] - a[1])[0]?.[0];

    const parts = [`${moment.greeting}. Leaning towards ${moment.leaning}`];

    if (favourite !== undefined) {
        parts.push(`with more ${favourite} since you like it`);
    }

    if (people > 2) {
        parts.push('with sharing sizes in play');
    }

    const line = `${parts.join(', ')}.`;

    return skipped > 0
        ? `${line} Skipping ${skipped} ${skipped === 1 ? 'dish' : 'dishes'} you saw lately.`
        : line;
}

type Shape = {
    titles: string[];
    /** Why, when the shape itself is the reason. */
    because?: string;
    /** A push towards certain dishes for this idea alone. */
    bias?: (pick: Pick) => number;
    /** The dishes to build it from, one set per person. */
    kinds?: Kind[];
    /** A single big dish each rather than a built set. */
    treatFrom?: Kind | 'all';
};

/** The ideas to try for this mood and this customer, leading with the likeliest. */
function shapesFor(
    mood: Mood,
    people: number,
    budget: number,
    taste: Taste,
    next: () => number,
): Shape[] {
    const group = people > 1;
    const favourite = [...taste.loved].sort((a, b) => b[1] - a[1])[0]?.[0];
    const onlyKind: Kind | null =
        mood === 'sweet' ? 'bite' : mood === 'fresh' ? 'sip' : null;

    const known: Shape | null =
        favourite === undefined
            ? null
            : {
                  titles: ['Your kind of thing', 'Back to your favourites'],
                  because: `You keep coming back to ${favourite}.`,
                  bias: (pick) => (pick.categoryName === favourite ? 22 : 0),
                  kinds: onlyKind === null ? ['bite', 'sip'] : [onlyKind],
              };

    // Only someone with a history has a usual to step away from.
    const hasHistory = taste.tried.size > 0;
    const discovery: Shape = {
        titles: hasHistory
            ? ['Never tried this', 'Off your usual']
            : ['Something different', 'A little adventure'],
        because: hasHistory
            ? 'Nothing here is from your past orders.'
            : undefined,
        bias: (pick) =>
            (taste.tried.has(pick.product.id) ? -40 : 0) -
            (taste.loved.get(pick.categoryName) ?? 0) * 16 +
            (pick.product.isNew ? 10 : 0),
        kinds: onlyKind === null ? ['bite', 'sip'] : [onlyKind],
    };

    const big: Shape = {
        titles: group
            ? ['Treat everyone', 'On you today']
            : ['Treat yourself', 'You earned this', 'Go big'],
        treatFrom: onlyKind ?? 'all',
    };

    const feast: Shape | null =
        budget / people >= 14 && onlyKind === null
            ? {
                  titles: ['The full table', 'Why choose'],
                  kinds: ['bite', 'bite', 'sip'],
              }
            : null;

    const pair: Shape = {
        titles: group
            ? ['A bite and a sip each', 'One of each, each']
            : ['The perfect pair', 'Better together', 'Good match'],
        kinds: ['bite', 'sip'],
    };
    const sweet: Shape = {
        titles: ['Sweet tooth', 'Full sugar', 'No regrets'],
        kinds: ['bite', 'bite'],
    };
    const cold: Shape = {
        titles: ['Fresh and cold', 'Ice cold', 'Cold and easy'],
        kinds: ['sip'],
        bias: (pick) => (isRich(pick) ? -10 : 6),
    };
    const twoGlasses: Shape = {
        titles: ['Two glasses', 'Double sip'],
        kinds: ['sip', 'sip'],
    };
    const small: Shape = {
        titles: [mood === 'sweet' ? 'Just a bite' : 'A quick sip'],
        kinds: [onlyKind ?? 'bite'],
    };

    const lineUps: Record<Mood, (Shape | null)[]> = {
        mix: [pair, known, discovery, feast, big, next() < 0.5 ? sweet : cold],
        sweet: [sweet, known, discovery, big, small],
        fresh: [cold, known, discovery, twoGlasses, big],
    };

    return lineUps[mood].filter((shape): shape is Shape => shape !== null);
}

/**
 * Up to four different ideas for spending the budget, each a different shape of
 * order and none sharing a dish with another where the menu allows it.
 *
 * It gives a different answer every time because it is told what the customer
 * has already seen, and because each question gets a fresh seed: dishes shown
 * lately step back, ones swapped away step back further, and a small whim per
 * dish stops the same winners from always floating to the top. What it leans
 * towards comes from the customer's own orders, the time of day and the season.
 */
export function findCombos({
    categories,
    budget,
    people,
    mood,
    seed,
    taste,
}: {
    categories: readonly Category[];
    budget: number;
    people: number;
    mood: Mood;
    seed: number;
    taste: Taste;
}): Reading {
    const all = sensiblePicks(categories, people);
    const pool: Record<Kind, Pick[]> = {
        bite: all.filter((pick) => pick.kind === 'bite'),
        sip: all.filter((pick) => pick.kind === 'sip'),
    };
    const next = random(seed);
    const appeal = appealFor(taste, seed);
    const used = new Set<number>();
    const seen = new Set<string>();
    const combos: Combo[] = [];

    for (const shape of shapesFor(mood, people, budget, taste, next)) {
        if (combos.length === MOST_IDEAS) {
            break;
        }

        const { kinds, treatFrom, bias = () => 0 } = shape;
        let picks: Pick[] | null = null;

        if (treatFrom !== undefined) {
            picks = treat(
                treatFrom === 'all' ? all : pool[treatFrom],
                budget,
                people,
                appeal,
                used,
            );
        } else if (kinds !== undefined) {
            picks = solve(
                Array.from({ length: people }, () => kinds).flat(),
                pool,
                budget,
                ratingFor(budget, appeal, bias, used),
                next,
            );
        }

        if (picks === null) {
            continue;
        }

        const key = picks
            .map((pick) => `${pick.product.id}:${pick.variantIndex}`)
            .sort()
            .join('|');

        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        picks.forEach((pick) => used.add(pick.product.id));

        const total = picks.reduce((sum, pick) => sum + pick.price, 0);
        const title = shape.titles[Math.floor(next() * shape.titles.length)];

        combos.push({
            id: `${title}-${key}`,
            title,
            reason: reasonFor(
                picks,
                total,
                budget,
                taste,
                shape.because ?? null,
                combos.length + seed,
            ),
            picks,
            total,
        });
    }

    return { combos, note: noteFor(taste, people) };
}

/**
 * The same idea with one dish changed: the best thing of the same kind that
 * still fits the money, is not already in the combo, and goes with the rest.
 * Null when nothing else fits. The combo keeps its id, so it stays where it is.
 */
export function swapDish({
    combo,
    index,
    categories,
    budget,
    people,
    seed,
    taste,
}: {
    combo: Combo;
    index: number;
    categories: readonly Category[];
    budget: number;
    people: number;
    seed: number;
    taste: Taste;
}): Combo | null {
    const outgoing = combo.picks[index];
    const others = combo.picks.filter((_, position) => position !== index);
    const room =
        budget - others.reduce((sum, pick) => sum + pick.price, 0) + 1e-9;
    const taken = new Set(combo.picks.map((pick) => pick.product.id));
    const appeal = appealFor(taste, seed);

    const worth = (pick: Pick): number =>
        appeal(pick) +
        harmony([...others, pick]) +
        // Close to what it replaces, so the order stays the size they liked.
        (Math.min(pick.price, outgoing.price) /
            Math.max(pick.price, outgoing.price)) *
            20;

    const replacement = sensiblePicks(categories, people)
        .filter(
            (pick) =>
                pick.kind === outgoing.kind &&
                pick.price <= room &&
                !taken.has(pick.product.id),
        )
        .reduce<Pick | null>(
            (best, pick) =>
                best === null || worth(pick) > worth(best) ? pick : best,
            null,
        );

    if (replacement === null) {
        return null;
    }

    const picks = combo.picks.map((pick, position) =>
        position === index ? replacement : pick,
    );
    const total = picks.reduce((sum, pick) => sum + pick.price, 0);

    return {
        ...combo,
        picks,
        total,
        reason: reasonFor(picks, total, budget, taste, null, seed),
    };
}
