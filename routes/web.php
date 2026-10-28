<?php

use App\Http\Controllers\MenuController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/menu/dine-in', [MenuController::class, 'dineIn'])->name('menu.dine-in');
Route::get('/menu/delivery', [MenuController::class, 'delivery'])->name('menu.delivery');
// The dine-in menu full screen, for a tablet at the counter.
Route::get('/menu/screen', [MenuController::class, 'screen'])->name('menu.screen');
