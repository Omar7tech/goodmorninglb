<?php

namespace App\Filament\Resources\Products\Tables;

use App\Enums\OrderType;
use App\Models\Product;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Support\Number;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->columns([
                SpatieMediaLibraryImageColumn::make('image')
                    ->label('Image')
                    ->collection('image')
                    ->conversion('thumb')
                    ->circular(),
                TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->weight('medium'),
                TextColumn::make('category.title')
                    ->label('Category')
                    ->badge()
                    ->color('info')
                    ->sortable(),
                // A product sold in sizes keeps its own price at 0, so show the
                // spread of its sizes rather than a misleading $0.00.
                TextColumn::make('price')
                    ->label('Price')
                    ->sortable()
                    ->formatStateUsing(fn (Product $record): string => self::priceLabel($record)),
                TextColumn::make('variants')
                    ->label('Sizes')
                    ->badge()
                    ->color('gray')
                    ->state(fn (Product $record): int => count($record->variants ?? [])),
                TextColumn::make('order_type')
                    ->label('Shown on')
                    ->badge()
                    ->sortable()
                    ->toggleable(),
                ToggleColumn::make('is_active')
                    ->label('Active')
                    ->sortable(),
                ToggleColumn::make('is_featured')
                    ->label('Top seller')
                    ->sortable(),
                ToggleColumn::make('is_new')
                    ->label('New')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->relationship('category', 'title')
                    ->searchable()
                    ->preload(),
                SelectFilter::make('order_type')
                    ->label('Shown on')
                    ->options(OrderType::class),
                TernaryFilter::make('is_active')->label('Active'),
                TernaryFilter::make('is_featured')->label('Top seller'),
                TernaryFilter::make('is_new')->label('New'),
            ])
            ->filtersFormColumns(2)
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    /**
     * The product's price, or the range its sizes span when it is sold in sizes.
     */
    private static function priceLabel(Product $product): string
    {
        $sizePrices = array_map(
            static fn (array $variant): float => (float) ($variant['price'] ?? 0),
            $product->variants ?? [],
        );

        if ($sizePrices === []) {
            return (string) Number::currency((float) $product->price, 'USD');
        }

        $lowest = (string) Number::currency(min($sizePrices), 'USD');
        $highest = (string) Number::currency(max($sizePrices), 'USD');

        return $lowest === $highest ? $lowest : "{$lowest} – {$highest}";
    }
}
