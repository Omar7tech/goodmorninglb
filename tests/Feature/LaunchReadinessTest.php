<?php

use App\Filament\Resources\Products\Schemas\ProductForm;
use App\Models\Product;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

/**
 * The shop runs on shared hosting with no queue worker and no cron, and a local
 * install hides most of what that breaks. So these pretend to be the live site.
 */
function pretendToBeProduction(string $url = 'https://goodmorninglb.com'): void
{
    app()->detectEnvironment(fn (): string => 'production');
    config(['app.env' => 'production', 'app.url' => $url]);
}

arch('nothing in the app waits for a queue worker')
    ->expect('App')
    ->not->toImplement(ShouldQueue::class);

it('lets the admin into the panel in production', function (): void {
    pretendToBeProduction();

    expect(User::factory()->create()->canAccessPanel(Filament::getDefaultPanel()))->toBeTrue();
});

it('keeps the queue on sync whatever the environment says', function (): void {
    putenv('QUEUE_CONNECTION=database');
    $_ENV['QUEUE_CONNECTION'] = 'database';
    $_SERVER['QUEUE_CONNECTION'] = 'database';

    $config = require config_path('queue.php');

    putenv('QUEUE_CONNECTION=sync');
    $_ENV['QUEUE_CONNECTION'] = 'sync';
    $_SERVER['QUEUE_CONNECTION'] = 'sync';

    expect($config['default'])->toBe('sync');
});

it('queues nothing when a product photo is uploaded', function (): void {
    Queue::fake();
    Storage::fake('public');

    $product = Product::factory()->create();

    $product->addMedia(UploadedFile::fake()->image('dish.jpg', 800, 800))
        ->toMediaCollection('image');

    Queue::assertNothingPushed();
    expect($product->fresh()->getFirstMedia('image')->hasGeneratedConversion('thumb'))->toBeTrue();
});

it('does not ask the product form for images a worker would have to make', function (): void {
    $source = file_get_contents((new ReflectionClass(ProductForm::class))->getFileName());

    expect($source)->not->toContain('responsiveImages');
});

it('uses the time in Aley', function (): void {
    expect(config('app.timezone'))->toBe('Asia/Beirut');
});

it('sends every spelling of the domain to the one address', function (string $from): void {
    pretendToBeProduction();

    $this->get($from)
        ->assertMovedPermanently()
        ->assertRedirect('https://goodmorninglb.com/menu/dine-in?category=crepes');
})->with([
    'plain http' => 'http://goodmorninglb.com/menu/dine-in?category=crepes',
    'www' => 'https://www.goodmorninglb.com/menu/dine-in?category=crepes',
    'both' => 'http://www.goodmorninglb.com/menu/dine-in?category=crepes',
]);

it('leaves the right address alone', function (): void {
    pretendToBeProduction();

    $this->get('https://goodmorninglb.com/menu/dine-in')->assertSuccessful();
});

it('does not send visitors to an address that was never set', function (string $url): void {
    pretendToBeProduction($url);

    $this->get('https://goodmorninglb.com/menu/dine-in')->assertSuccessful();
})->with(['http://localhost', 'https://goodmorninglb.test', 'http://127.0.0.1']);

it('redirects nothing outside production', function (): void {
    $this->get('http://www.example.test/menu/dine-in')->assertSuccessful();
});

it('sends the browser protections on every page', function (string $path): void {
    $this->get($path)
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        ->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
})->with(['/', '/menu/delivery', '/does-not-exist']);

it('shares the JPEG on the menu pages', function (string $route): void {
    $this->get(route($route))
        ->assertSee('property="og:image" content="'.asset('og/good-morning.jpg').'"', false);
})->with(['menu.dine-in', 'menu.delivery']);
