<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\RepeatableEntry\TableColumn;
use Filament\Infolists\Components\SpatieMediaLibraryImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ProductInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        SpatieMediaLibraryImageEntry::make('image')
                            ->label('Image')
                            ->collection('image')
                            ->conversion('webp')
                            ->placeholder('-')
                            ->columnSpanFull(),
                        TextEntry::make('title'),
                        TextEntry::make('category.title')->label('Category'),
                        TextEntry::make('description')
                            ->placeholder('-')
                            ->columnSpanFull(),
                    ]),

                Section::make('Pricing & status')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        TextEntry::make('price')->money('USD'),
                        IconEntry::make('is_active')
                            ->label('Active')
                            ->boolean(),
                        IconEntry::make('is_featured')
                            ->label('Top seller')
                            ->boolean(),
                        IconEntry::make('is_new')
                            ->label('New')
                            ->boolean(),
                    ]),

                Section::make('Sizes')
                    ->columnSpanFull()
                    ->components([
                        RepeatableEntry::make('variants')
                            ->hiddenLabel()
                            ->placeholder('Sold at a single price.')
                            ->table([
                                TableColumn::make('Name'),
                                TableColumn::make('Price')->width('160px'),
                            ])
                            ->schema([
                                TextEntry::make('name'),
                                TextEntry::make('price')->money('USD'),
                            ]),
                    ]),

                Section::make('Meta')
                    ->columnSpanFull()
                    ->columns(2)
                    ->collapsed()
                    ->components([
                        TextEntry::make('created_at')
                            ->dateTime()
                            ->placeholder('-'),
                        TextEntry::make('updated_at')
                            ->dateTime()
                            ->placeholder('-'),
                    ]),
            ]);
    }
}
