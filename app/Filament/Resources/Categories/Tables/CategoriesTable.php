<?php

namespace App\Filament\Resources\Categories\Tables;

use App\Models\Category;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class CategoriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->columns([
                SpatieMediaLibraryImageColumn::make('image')
                    ->label('Icon')
                    ->collection('image')
                    ->conversion('thumb')
                    ->circular(),
                TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->weight('medium')
                    ->description(fn (Category $record): ?string => $record->description),
                TextColumn::make('addons')
                    ->label('Add-ons')
                    ->badge()
                    ->color('info')
                    ->state(fn (Category $record): int => count($record->addons ?? []))
                    ->formatStateUsing(fn (int $state): string => $state === 1 ? '1 add-on' : "{$state} add-ons"),
                TextColumn::make('products_count')
                    ->label('Products')
                    ->counts('products')
                    ->badge()
                    ->color(fn (int $state): string => $state > 0 ? 'success' : 'gray')
                    ->sortable(),
                ToggleColumn::make('is_active')
                    ->label('Active')
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
                TernaryFilter::make('is_active')->label('Active'),
            ])
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
}
