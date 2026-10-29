<?php

namespace App\Providers;

use App\Support\ErrorPage;
use App\Support\MenuCatalog;
use App\Support\Seo\Seo;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\ExceptionResponse;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // One answer per request: the menu page and its SEO share one query,
        // and the page's head is resolved once however often it is printed.
        $this->app->scoped(MenuCatalog::class);
        $this->app->scoped(Seo::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureErrorPages();
    }

    /**
     * Draw the storefront's own page for the errors a visitor can meet, in
     * place of the framework's. Requests that want JSON, and the dashboard's
     * Livewire calls, keep their own response; so does a 500 while debugging,
     * where the real stack trace is the useful page.
     */
    protected function configureErrorPages(): void
    {
        Inertia::handleExceptionsUsing(function (ExceptionResponse $response): ?ExceptionResponse {
            $status = $response->statusCode();
            $request = $response->request;

            if (! in_array($status, ErrorPage::STATUSES, true) || $request->expectsJson() || $request->hasHeader('X-Livewire')) {
                return null;
            }

            if ($status >= 500 && config('app.debug')) {
                return null;
            }

            app(Seo::class)->describeError($status);

            return $response->render('error', [
                'status' => $status,
                ...ErrorPage::copy($status),
            ])->withSharedData();
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
