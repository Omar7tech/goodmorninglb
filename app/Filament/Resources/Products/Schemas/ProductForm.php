<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Repeater\TableColumn;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make()
                    ->columnSpanFull()
                    ->tabs([
                        Tab::make('Details')
                            ->icon(Heroicon::OutlinedInformationCircle)
                            ->columns(2)
                            ->schema([
                                TextInput::make('title')
                                    ->required()
                                    ->maxLength(255),
                                Select::make('category_id')
                                    ->relationship('category', 'title')
                                    ->searchable()
                                    ->preload()
                                    ->required(),
                                Textarea::make('description')
                                    ->rows(3)
                                    ->columnSpanFull(),
                                SpatieMediaLibraryFileUpload::make('image')
                                    ->collection('image')
                                    ->disk('public')
                                    ->visibility('public')
                                    ->image()
                                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                                    ->maxSize(5120)
                                    ->conversion('webp')
                                    ->responsiveImages()
                                    ->imageEditor()
                                    ->columnSpanFull(),
                            ]),

                        Tab::make('Pricing & status')
                            ->icon(Heroicon::OutlinedCurrencyDollar)
                            ->columns(2)
                            ->schema([
                                TextInput::make('price')
                                    ->helperText('Leave at 0 when the product is sold in sizes — the sizes carry the prices.')
                                    ->required()
                                    ->numeric()
                                    ->minValue(0)
                                    ->default(0)
                                    ->prefix('$'),
                                Toggle::make('is_active')
                                    ->label('Active')
                                    ->default(true)
                                    ->inline(false),
                                Toggle::make('is_featured')
                                    ->label('Top seller')
                                    ->default(false)
                                    ->inline(false),
                                Toggle::make('is_new')
                                    ->label('New')
                                    ->default(false)
                                    ->inline(false),
                            ]),

                        Tab::make('Sizes')
                            ->icon(Heroicon::OutlinedRectangleStack)
                            ->schema([
                                Repeater::make('variants')
                                    ->hiddenLabel()
                                    ->helperText('Each size and its price, in the order the menu shows them, e.g. S, M, L or Classic, Double.')
                                    ->defaultItems(0)
                                    ->table([
                                        TableColumn::make('Name')->markAsRequired(),
                                        TableColumn::make('Price')->markAsRequired(),
                                    ])
                                    ->compact()
                                    ->addActionLabel('Add size')
                                    ->reorderable()
                                    ->schema([
                                        TextInput::make('name')
                                            ->required()
                                            ->maxLength(255),
                                        TextInput::make('price')
                                            ->required()
                                            ->numeric()
                                            ->minValue(0)
                                            ->prefix('$'),
                                    ]),
                            ]),
                    ]),
            ]);
    }
}
