<?php

namespace App\Filament\Resources\Products\Schemas;

use App\Enums\OrderType;
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
                                TextInput::make('subtitle')
                                    ->helperText('A short line under the name in the details sheet.')
                                    ->maxLength(255),
                                Select::make('category_id')
                                    ->relationship('category', 'title')
                                    ->searchable()
                                    ->preload()
                                    ->required(),
                                Select::make('order_type')
                                    ->label('Shown on')
                                    ->helperText('Which menu offers it. Most products are on both.')
                                    ->options(OrderType::class)
                                    ->default(OrderType::Both)
                                    ->native(false)
                                    ->required(),
                                Textarea::make('description')
                                    ->rows(3)
                                    ->columnSpanFull(),
                                TextInput::make('preparation_time')
                                    ->label('Preparation time')
                                    ->helperText('Roughly how long it takes, shown in its details.')
                                    ->numeric()
                                    ->integer()
                                    ->minValue(0)
                                    ->suffix('min'),
                                TextInput::make('calories')
                                    ->label('Calories')
                                    ->helperText('Leave empty if uncounted — the menu then shows nothing rather than a zero.')
                                    ->numeric()
                                    ->integer()
                                    ->minValue(0)
                                    ->maxValue(65535)
                                    ->suffix('kcal'),
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
                                    ->helperText('Leave at 0 when the product is sold in sizes â€” the sizes carry the prices.')
                                    ->required()
                                    ->numeric()
                                    ->minValue(0)
                                    ->default(0)
                                    ->prefix('$'),
                                TextInput::make('discount_price')
                                    ->label('Offer price')
                                    ->helperText('Set while the product is on offer; the menu strikes the full price through beside it.')
                                    ->numeric()
                                    ->minValue(0)
                                    ->lte('price')
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

                        Tab::make('Ingredients')
                            ->icon(Heroicon::OutlinedListBullet)
                            ->schema([
                                Repeater::make('ingredients')
                                    ->hiddenLabel()
                                    ->helperText('What is in it, in the order it should be read. Customers ordering delivery can take any of them out. Leave empty to say nothing about it.')
                                    ->defaultItems(0)
                                    ->table([
                                        TableColumn::make('Ingredient')->markAsRequired(),
                                    ])
                                    ->compact()
                                    ->addActionLabel('Add ingredient')
                                    ->reorderable()
                                    ->schema([
                                        TextInput::make('name')
                                            ->placeholder('Nutella')
                                            ->required()
                                            ->maxLength(255),
                                    ]),
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
                                        TableColumn::make('Offer price'),
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
                                        TextInput::make('discount_price')
                                            ->numeric()
                                            ->minValue(0)
                                            ->lte('price')
                                            ->prefix('$'),
                                    ]),
                            ]),
                    ]),
            ]);
    }
}
