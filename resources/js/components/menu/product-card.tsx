import { Plus, Sparkles, Star } from 'lucide-react';
import { useState } from 'react';

import { ProductImage } from '@/components/menu/product-image';
import { ProductPrice } from '@/components/menu/product-price';
import { VariantSelector } from '@/components/menu/variant-selector';
import { useUppercaseProductTitles } from '@/lib/title-case';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

/**
 * One row of the menu: photo, name, description and price, with the size picker
 * underneath when the product has sizes.
 *
 * The whole card opens the product's sheet — the row is the target, so there is
 * no small "details" link to find. That target is an overlay rather than a
 * wrapper, so the size chips and the quick add can be real buttons standing on
 * top of it instead of buttons nested inside one.
 *
 * `onAdd` is what separates the two menus: delivery passes a handler and gets
 * the quick-add button beside the name, dine-in passes nothing and the card is
 * there to read.
 */
export function ProductCard({
    product,
    quantity,
    onOpen,
    onAdd,
}: {
    product: Product;
    quantity: number;
    onOpen: (product: Product, variantIndex: number | null) => void;
    onAdd?: (product: Product, variantIndex: number | null) => void;
}) {
    const uppercase = useUppercaseProductTitles();

    const hasVariants = product.variants.length > 0;

    // Which size is chosen on the card. It is what the quick add adds, and the
    // sheet opens on it, so the card and the sheet never disagree.
    const [variantIndex, setVariantIndex] = useState(0);
    const chosen = hasVariants ? variantIndex : null;

    // The price shown is the chosen size's, so the figure on the card is always
    // one the customer can actually pay.
    const selectedVariant = hasVariants ? product.variants[variantIndex] : null;
    const price = selectedVariant?.price ?? product.price;
    const discountPrice =
        selectedVariant?.discountPrice ??
        (hasVariants ? null : product.discountPrice);

    const hasDescription =
        product.description !== null && product.description.trim() !== '';

    return (
        // `lg:h-full` is for the grid the list becomes on a desktop: the row's
        // tallest card sets the height, and without it the shorter ones stop
        // where their copy does and leave the row's bottom edge ragged. In the
        // phone's single column there is no row to level against, so it does
        // nothing there.
        <article className="relative flex flex-col rounded-2xl bg-card p-2.5 transition-[translate] duration-200 ease-out hover:-translate-y-0.5 motion-reduce:translate-none lg:h-full">
            {/* Covers the card, under everything else, so the heading and copy
                stay real block elements outside a button. */}
            <button
                type="button"
                onClick={() => onOpen(product, chosen)}
                className="absolute inset-0 z-0 rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
                <span className="sr-only">View {product.name}</span>
            </button>

            <div className="pointer-events-none flex items-center gap-3">
                {/* Grows with the screen alongside the name: 88px on a
                    360px phone, about 104px on a 430px one, stopping at
                    112px. The 400px thumbnail stays sharp at that size even
                    on a 3x screen. */}
                <ProductImage
                    product={product}
                    className="size-[clamp(5.5rem,0.36rem+22.86vw,7rem)] shrink-0"
                />

                <div className="min-w-0 flex-1">
                    {/* Body face, not the heading one: product names are read,
                        not admired, and have to hold a full name on one line. */}
                    {/* `leading-tight`, or the line's own leading sits under the
                        name as a gap no margin below it can take back. */}
                    {/* The add button shares the name's line rather than being
                        pinned to the card's corner: hung off the card it sits
                        above the name and reaches down into the copy, since the
                        text block is centred against the taller photo. In the
                        row it takes the line's own height, and everything below
                        starts cleanly under it. */}
                    <div className="flex items-center gap-2">
                        {/* `min-w-0`, or the flex item refuses to shrink and
                            `truncate` never gets a narrower box to clip in.

                            Sized with the screen rather than in one jump at
                            `sm`: 17px on a 360px phone, growing smoothly to
                            about 19.5px on a 430px one and stopping at 22px. */}
                        <h3
                            className={cn(
                                'min-w-0 flex-1 truncate leading-tight font-semibold',
                                // A step bigger with no description under it,
                                // so name and price fill the space beside the
                                // photo instead of leaving a gap.
                                hasDescription
                                    ? 'text-[length:clamp(1.0625rem,0.26rem+3.57vw,1.375rem)]'
                                    : 'text-[length:clamp(1.25rem,0.45rem+3.57vw,1.5625rem)]',
                                uppercase && 'uppercase',
                            )}
                        >
                            {product.name}
                        </h3>

                        {/* The row it sits in is inert so the card's own tap
                            target shows through the copy; the button has to
                            take its clicks back. */}
                        {onAdd && (
                            <button
                                type="button"
                                onClick={() => onAdd(product, chosen)}
                                aria-label={`Add ${product.name} to your order`}
                                className="pointer-events-auto relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[scale] duration-200 ease-out hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95 motion-reduce:scale-100"
                            >
                                <Plus className="size-3.5" strokeWidth={3} />
                                {quantity > 0 && (
                                    <span className="sr-only">
                                        {quantity} already in your order
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    {hasDescription && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {product.description}
                        </p>
                    )}

                    {/* The marks ride with the price rather than the name: the
                        name is the one line on the card that has to hold a full
                        product title, and anything beside it comes out of that
                        width. The price row has slack to spare.

                        Labelled rather than hidden — they carry the same
                        meaning the sheet's marks do, and the copy above may not
                        say it. */}
                    <div
                        className={cn(
                            'flex items-start justify-between gap-2',
                            hasDescription ? 'mt-1.5' : 'mt-2.5',
                        )}
                    >
                        <ProductPrice
                            price={price}
                            discountPrice={discountPrice}
                            large={!hasDescription}
                        />

                        {/* Pushed to the far end and pinned to the top of the
                            row, so they sit level with the leading price line
                            rather than drifting down the middle of a two-row
                            price. */}
                        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
                            {product.isFeatured && (
                                <Star
                                    aria-label="Top seller"
                                    className="size-3.5 fill-current text-primary"
                                />
                            )}
                            {product.isNew && (
                                <Sparkles
                                    aria-label="New"
                                    className="size-3.5 text-berry"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Raised over the card's own tap target, or the options would be
                pressed through to the sheet instead of switching. */}
            {hasVariants && (
                <div className="relative z-10 mt-2.5 border-t border-foreground/10 pt-2.5">
                    <VariantSelector
                        variants={product.variants}
                        selectedIndex={variantIndex}
                        onSelect={setVariantIndex}
                    />
                </div>
            )}
        </article>
    );
}
