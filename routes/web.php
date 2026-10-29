<?php

use App\Http\Controllers\MenuController;
use App\Http\Controllers\SeoController;
use Illuminate\Support\Facades\Route;

// Crawl rules and sitemap, served by the app so their URLs follow the live
// domain and the sitemap lists exactly what is on the menu.
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('seo.robots');
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('seo.sitemap');

Route::inertia('/', 'welcome')->name('home');

Route::get('/menu/dine-in', [MenuController::class, 'dineIn'])->name('menu.dine-in');
Route::get('/menu/delivery', [MenuController::class, 'delivery'])->name('menu.delivery');
// The dine-in menu full screen, for a tablet at the counter.
Route::get('/menu/screen', [MenuController::class, 'screen'])->name('menu.screen');
