import { readOrders } from '@/lib/order-history';
import type { Category } from '@/types';

/** What the customer is in the mood for. */
export type Mood = 'mix' | 'sweet' | 'fresh';

/** What the picker knows about this customer, right now. */
export type Taste = {
    /** Dishes shown lately, by id: 1 for a moment ago, fading over a day. */
    heat: ReadonlyMap<number, number>;
    /** Dishes swapped away, by id, fading over a few days. */
    refused: ReadonlyMap<number, number>;
    /** How much they go for each category, from 0 to 1. */
    loved: ReadonlyMap<string, number>;
    /** Dishes they have ordered before. */
    tried: ReadonlySet<number>;
    /** Dishes already in the basket. */
    basket: ReadonlySet<number>;
    now: Date;
};

type Memory = {
    /** Product id to when it was last shown, and how many times. */
    shown: Record<string, [number, number]>;
    /** Product id to when it was swapped away. */
    refused: Record<string, number>;
    /** Category name to how many combos they took from it. */
    picked: Record<string, number>;
    /** The last question, so it opens where they left it. */
    budget?: number;
    people?: number;
    mood?: Mood;
};

const STORAGE_KEY = 'good-morning-picks';
const HOUR = 3_600_000;
/** A dish shown three weeks ago has nothing left to say. */
const FORGET_AFTER = 21 * 24 * HOUR;
/** How fast a shown dish comes back into play. */
const HEAT_HOURS = 18;
/** How long a dish stays out of favour after being swapped away. */
const REFUSED_HOURS = 72;

/** The memory as it was left. Anything unreadable reads as a new customer. */
function readMemory(): Memory {
    const empty: Memory = { shown: {}, refused: {}, picked: {} };

    if (typeof window === 'undefined') {
        return empty;
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        return raw === null
            ? empty
            : { ...empty, ...(JSON.parse(raw) as Partial<Memory>) };
    } catch {
        return empty;
    }
}

function writeMemory(memory: Memory): void {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
    } catch {
        // Ignore storage failures (e.g. private mode quota).
    }
}

/** The last question asked, to open on. */
export function readLastAsk(): {
    budget: number | null;
    people: number | null;
    mood: Mood | null;
} {
    const { budget, people, mood } = readMemory();

    return {
        budget: budget ?? null,
        people: people ?? null,
        mood: mood ?? null,
    };
}

export function rememberAsk(budget: number, people: number, mood: Mood): void {
    writeMemory({ ...readMemory(), budget, people, mood });
}

/** Note what has just been put in front of them, so next time is different. */
export function rememberShown(ids: readonly number[]): void {
    const memory = readMemory();
    const now = Date.now();

    ids.forEach((id) => {
        memory.shown[id] = [now, (memory.shown[id]?.[1] ?? 0) + 1];
    });

    // Old entries go, so this cannot grow with the years.
    Object.entries(memory.shown).forEach(([id, [time]]) => {
        if (now - time > FORGET_AFTER) {
            delete memory.shown[id];
        }
    });

    writeMemory(memory);
}

/** They swapped this dish away: a small no, remembered for a few days. */
export function rememberRefused(id: number): void {
    const memory = readMemory();

    memory.refused[id] = Date.now();
    writeMemory(memory);
}

/** They took a combo: a yes for the categories in it. */
export function rememberPicked(categoryNames: readonly string[]): void {
    const memory = readMemory();

    categoryNames.forEach((name) => {
        memory.picked[name] = (memory.picked[name] ?? 0) + 1;
    });

    writeMemory(memory);
}

/**
 * Everything known about this customer: the picker's own memory, and the orders
 * this browser has actually sent, which count for more than anything tapped.
 */
export function readTaste(
    categories: readonly Category[],
    basket: readonly number[],
): Taste {
    const memory = readMemory();
    const now = Date.now();

    const heat = new Map<number, number>();

    Object.entries(memory.shown).forEach(([id, [time, count]]) => {
        heat.set(
            Number(id),
            Math.exp(-(now - time) / HOUR / HEAT_HOURS) *
                Math.min(1 + (count - 1) * 0.15, 1.5),
        );
    });

    const refused = new Map<number, number>();

    Object.entries(memory.refused).forEach(([id, time]) => {
        refused.set(Number(id), Math.exp(-(now - time) / HOUR / REFUSED_HOURS));
    });

    const categoryOf = new Map<number, string>();

    categories.forEach((category) => {
        category.products.forEach((product) => {
            categoryOf.set(product.id, category.name);
        });
    });

    const weights = new Map<string, number>(Object.entries(memory.picked));
    const tried = new Set<number>();

    readOrders().forEach((order) => {
        order.items.forEach((item) => {
            const name = categoryOf.get(item.productId);

            tried.add(item.productId);

            if (name !== undefined) {
                weights.set(name, (weights.get(name) ?? 0) + item.quantity * 2);
            }
        });
    });

    const most = Math.max(0, ...weights.values());
    const loved = new Map<string, number>();

    weights.forEach((weight, name) => {
        loved.set(name, weight / most);
    });

    return {
        heat,
        refused,
        loved,
        tried,
        basket: new Set(basket),
        now: new Date(now),
    };
}
