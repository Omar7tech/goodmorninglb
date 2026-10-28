import { usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useRef } from 'react';

import { usePricing } from '@/lib/use-pricing';
import { cn } from '@/lib/utils';
import type { Variant, VariantStyle } from '@/types';

/** Arrow keys that move the selection forward through the option list. */
const NEXT_KEYS = ['ArrowRight', 'ArrowDown'];
/** Arrow keys that move the selection backward through the option list. */
const PREVIOUS_KEYS = ['ArrowLeft', 'ArrowUp'];

/**
 * Up to this many sizes, the bubbles stretch across the full width, each one
 * a longer pill than the last. Past it there is no room left to grow, so they
 * sit at their own size instead, all on one line.
 */
const BUBBLES_TO_STRETCH = 4;

/** The most bubbles on one line; a seventh starts a line underneath. */
const BUBBLES_PER_ROW = 6;

/** Classes every option shares, whatever shape it is drawn in. */
const OPTION_BASE =
    'relative focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';

/**
 * The sizes a product is sold in, in whichever shape the shop has chosen.
 *
 * The style is a look and nothing more. Every one of them is the same radio
 * group underneath — one tab stop, arrow keys between options, Home and End to
 * the ends — because that behaviour is what makes the control usable, and it
 * should not be something an owner can turn off by preferring a shape.
 *
 * That is why the keyboard handling lives here rather than in each style: there
 * is one implementation to get right, and a style added later inherits it
 * instead of having to remember it.
 *
 * The same picker serves the card and the sheet, so choosing on one and opening
 * the other never disagree.
 */
export function VariantSelector({
    variants,
    selectedIndex,
    onSelect,
}: {
    variants: readonly Variant[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}) {
    const pricing = usePricing();
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const style: VariantStyle =
        usePage().props.variantStyle ?? ('rows' as const);

    /** Selects an option and keeps the roving focus on it. */
    const move = (index: number): void => {
        const wrapped = (index + variants.length) % variants.length;

        onSelect(wrapped);
        optionRefs.current[wrapped]?.focus();
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>,
    ): void => {
        if (NEXT_KEYS.includes(event.key)) {
            event.preventDefault();
            move(selectedIndex + 1);

            return;
        }

        if (PREVIOUS_KEYS.includes(event.key)) {
            event.preventDefault();
            move(selectedIndex - 1);

            return;
        }

        if (event.key === 'Home') {
            event.preventDefault();
            move(0);

            return;
        }

        if (event.key === 'End') {
            event.preventDefault();
            move(variants.length - 1);
        }
    };

    /** The shell each style lays its options out in. */
    const group = {
        rows: 'flex flex-col overflow-hidden rounded-2xl bg-primary/5',
        chips: 'flex flex-wrap gap-1.5',
        // Equal parts that wrap onto a second line rather than squeezing a
        // name like "1.5L" into a sliver when a juice comes in six sizes.
        segmented:
            'grid grid-cols-[repeat(auto-fit,minmax(4.25rem,1fr))] gap-1 rounded-2xl bg-primary/10 p-1',
        // Lines of up to six, stacked; see `BUBBLES_PER_ROW`.
        bubbles: 'flex flex-col gap-2',
    }[style];

    const stretchBubbles = variants.length <= BUBBLES_TO_STRETCH;

    const options = variants.map((variant, index) => {
        const selected = index === selectedIndex;
        const effectivePrice = variant.discountPrice ?? variant.price;
        const was =
            variant.discountPrice === null
                ? null
                : pricing.primary(variant.price);
        const now = pricing.primary(effectivePrice);

        return (
            <button
                key={variant.name}
                ref={(element) => {
                    optionRefs.current[index] = element;
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                // Only the selected option stays in the tab order;
                // arrow keys reach the rest.
                tabIndex={selected ? 0 : -1}
                onClick={() => onSelect(index)}
                className={cn(
                    OPTION_BASE,
                    optionClasses(style, selected, index, stretchBubbles),
                )}
                style={
                    style === 'bubbles' && stretchBubbles
                        ? bubbleGrowth(index)
                        : undefined
                }
            >
                {style === 'chips' && (
                    <ChipOption
                        name={variant.name}
                        now={now}
                        was={was}
                        selected={selected}
                    />
                )}
                {style === 'rows' && (
                    <RowOption
                        name={variant.name}
                        now={now}
                        was={was}
                        selected={selected}
                    />
                )}
                {style === 'segmented' && (
                    <SegmentOption
                        name={variant.name}
                        now={now}
                        was={was}
                        selected={selected}
                    />
                )}
                {style === 'bubbles' && (
                    <BubbleOption
                        index={index}
                        stretched={stretchBubbles}
                        name={variant.name}
                        now={now}
                        was={was}
                        selected={selected}
                    />
                )}
            </button>
        );
    });

    return (
        // Named for readers but not on screen: each option already carries its
        // own name and price, so a heading over them only says again what the
        // row is plainly showing.
        <div
            role="radiogroup"
            aria-label="Choose an option"
            onKeyDown={handleKeyDown}
            className={group}
        >
            {style === 'bubbles'
                ? Array.from(
                      {
                          length: Math.ceil(options.length / BUBBLES_PER_ROW),
                      },
                      (_, line) => (
                          // Stretched, the line runs the full width on its
                          // own, wrapping should the names not fit. At their
                          // own size, the bubbles spread out along it instead
                          // and never wrap: six always share one line.
                          <div
                              key={line}
                              className={cn(
                                  'flex',
                                  stretchBubbles
                                      ? 'flex-wrap gap-x-1.5 gap-y-2'
                                      : 'justify-between gap-1',
                              )}
                          >
                              {options.slice(
                                  line * BUBBLES_PER_ROW,
                                  (line + 1) * BUBBLES_PER_ROW,
                              )}
                          </div>
                      ),
                  )
                : options}
        </div>
    );
}

/** The shape and state colours of one option, per style. */
function optionClasses(
    style: VariantStyle,
    selected: boolean,
    index: number,
    stretchBubbles: boolean,
): string {
    if (style === 'chips') {
        return cn(
            'inline-flex items-baseline gap-1.5 rounded-full px-3 py-1.5 transition-colors duration-200 ease-out',
            selected
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/10 text-primary/75 hover:bg-primary/20',
        );
    }

    if (style === 'rows') {
        return cn(
            'flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-200 ease-out',
            // Ruled between rather than around: the group already has an edge,
            // and a border on every row would draw it twice.
            index > 0 && 'border-t border-primary/10',
            selected ? 'bg-primary/10' : 'hover:bg-primary/5',
        );
    }

    if (style === 'segmented') {
        return cn(
            'flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-1.5 text-center transition-colors duration-200 ease-out',
            selected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-primary hover:bg-primary/10',
        );
    }

    // Bubbles: the button is the bubble and its price together, so the ring
    // a keyboard draws goes round both rather than round the circle alone.
    // Never narrower than its own name, nor than a circle. Stretched, the pill
    // fills the button's width; otherwise it keeps its own size.
    return cn(
        'group/bubble flex min-w-11 flex-col gap-1 rounded-2xl p-0.5',
        stretchBubbles ? 'items-stretch' : 'items-center',
    );
}

/**
 * How much of the row's spare width a bubble takes: a larger share for each
 * size along, so the first is a circle and every one after it a longer pill,
 * the way cups get bigger along a counter. The admin lists sizes from small
 * to large, so the order alone says which is which.
 *
 * Measured from nothing (`0%`) rather than from the name, so the steps come
 * from the order and not from how long each name happens to be; the name only
 * sets a floor, through the item's own minimum width.
 */
function bubbleGrowth(index: number): React.CSSProperties {
    return { flex: `${index + 2} 1 0%` };
}

/** The tick that marks the chosen option in the styles roomy enough for one. */
function Tick({ selected }: { selected: boolean }) {
    return (
        <span
            aria-hidden
            className={cn(
                'grid size-4 shrink-0 place-items-center rounded-full transition-colors duration-200 ease-out',
                selected
                    ? 'bg-primary text-primary-foreground'
                    : 'ring-2 ring-foreground/20 ring-inset',
            )}
        >
            {selected && <Check className="size-2.5" strokeWidth={3} />}
        </span>
    );
}

/** What a price was before the offer, struck through. */
function Was({ was, className }: { was: string | null; className?: string }) {
    if (was === null) {
        return null;
    }

    return (
        <span
            className={cn(
                'text-[0.7rem] text-muted-foreground tabular-nums line-through',
                className,
            )}
        >
            {was}
        </span>
    );
}

type OptionProps = {
    name: string;
    now: string;
    was?: string | null;
    selected: boolean;
};

/** Name and price on one line, the chosen one filled solid. */
function ChipOption({ name, now, was = null, selected }: OptionProps) {
    return (
        <>
            <span className="text-[0.7rem] font-semibold tracking-wide uppercase">
                {name}
            </span>
            <span className="text-[0.7rem] font-semibold tabular-nums opacity-80">
                {now}
            </span>
            <Was
                was={was}
                className={cn(selected && 'text-primary-foreground/60')}
            />
        </>
    );
}

/** A full-width row: name left, price hard right. */
function RowOption({ name, now, was = null, selected }: OptionProps) {
    return (
        <>
            <Tick selected={selected} />

            <span
                className={cn(
                    'min-w-0 flex-1 text-sm leading-snug tracking-wide break-words uppercase',
                    selected ? 'font-semibold text-primary' : 'text-primary/70',
                )}
            >
                {name}
            </span>

            <span className="flex shrink-0 items-baseline gap-1.5 text-[0.8rem]">
                <Was was={was} />
                <span
                    className={cn(
                        'font-semibold tabular-nums',
                        selected ? 'text-primary' : 'text-primary/60',
                    )}
                >
                    {now}
                </span>
            </span>
        </>
    );
}

/** One part of the bar: the size, with its price under it. */
function SegmentOption({ name, now, was = null, selected }: OptionProps) {
    return (
        <>
            <span className="max-w-full truncate text-xs font-semibold">
                {name}
            </span>
            <span className="flex items-baseline gap-1 text-[0.7rem] leading-none tabular-nums">
                <span className={cn(!selected && 'opacity-75')}>{now}</span>
                <Was
                    was={was}
                    className={cn(selected && 'text-primary-foreground/60')}
                />
            </span>
        </>
    );
}

/**
 * A bubble with the size in it and the price under it, like the cup sizes on
 * a counter: the smallest a circle, each one after it a longer pill, and a
 * shade deeper too, so the step up reads in colour as well as in width.
 */
function BubbleOption({
    index,
    stretched,
    name,
    now,
    was = null,
    selected,
}: OptionProps & { index: number; stretched: boolean }) {
    return (
        <>
            <span
                style={
                    selected
                        ? undefined
                        : {
                              backgroundColor: `color-mix(in srgb, var(--primary) ${Math.min(8 + index * 4, 28)}%, transparent)`,
                          }
                }
                className={cn(
                    'flex h-11 min-w-11 items-center justify-center rounded-full text-xs font-semibold whitespace-nowrap',
                    // Snugger at their own size, so six fit one line on the
                    // narrowest phone.
                    stretched ? 'px-3' : 'px-2',
                    'transition-[background-color,color,box-shadow] duration-200 ease-out',
                    // No growing when chosen: the pills sit edge to edge, and
                    // one swelling would run into its neighbours.
                    selected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-primary group-hover/bubble:ring-2 group-hover/bubble:ring-primary/20 group-hover/bubble:ring-inset',
                )}
            >
                {name}
            </span>

            <span className="flex flex-col items-center text-[0.7rem] leading-tight tabular-nums">
                <span
                    className={cn(
                        selected
                            ? 'font-semibold text-primary'
                            : 'text-muted-foreground',
                    )}
                >
                    {now}
                </span>
                <Was was={was} />
            </span>
        </>
    );
}
