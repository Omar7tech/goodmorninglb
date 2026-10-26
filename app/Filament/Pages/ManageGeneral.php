<?php

namespace App\Filament\Pages;

use App\Settings\GeneralSettings;
use BackedEnum;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Repeater\TableColumn;
use Filament\Forms\Components\TextInput;
use Filament\Pages\SettingsPage;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class ManageGeneral extends SettingsPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static ?string $navigationLabel = 'General';

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static string $settings = GeneralSettings::class;

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Social media')
                    ->description('Links shown in the footer of the menu.')
                    ->icon(Heroicon::OutlinedLink)
                    ->columnSpanFull()
                    ->components([
                        Repeater::make('social_links')
                            ->hiddenLabel()
                            ->helperText('Listed at the foot of the menu, in this order. Rows missing a name or an address are not shown.')
                            ->defaultItems(0)
                            ->table([
                                TableColumn::make('Name')->markAsRequired(),
                                TableColumn::make('Address')->markAsRequired(),
                            ])
                            ->compact()
                            ->addActionLabel('Add link')
                            ->reorderable()
                            ->schema([
                                TextInput::make('label')
                                    ->placeholder('Instagram')
                                    ->required()
                                    ->maxLength(255),
                                TextInput::make('url')
                                    ->placeholder('https://www.instagram.com/good_morning_aley')
                                    ->url()
                                    ->required()
                                    ->maxLength(255),
                            ]),
                    ]),
            ]);
    }
}
