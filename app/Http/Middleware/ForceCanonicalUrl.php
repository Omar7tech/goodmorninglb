<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceCanonicalUrl
{
    /**
     * Send every visit to the one address the site lives at: `APP_URL`, so
     * https, and with or without www exactly as written there. Otherwise each
     * spelling of the domain is a separate copy of the site to a search engine.
     *
     * Left alone when `APP_URL` was never set to a real domain, since following
     * it would send every visitor to an address that isn't there.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! app()->isProduction() || ! $request->isMethodSafe()) {
            return $next($request);
        }

        $url = (string) config('app.url');
        $host = parse_url($url, PHP_URL_HOST);

        if (! is_string($host) || $this->isPlaceholder($host)) {
            return $next($request);
        }

        $wantsHttps = parse_url($url, PHP_URL_SCHEME) === 'https';
        $isHttps = $request->secure() || $request->header('X-Forwarded-Proto') === 'https';

        if ($request->getHost() === $host && ($isHttps || ! $wantsHttps)) {
            return $next($request);
        }

        return redirect()->away(rtrim($url, '/').$request->getRequestUri(), 301);
    }

    private function isPlaceholder(string $host): bool
    {
        return $host === 'localhost'
            || filter_var($host, FILTER_VALIDATE_IP) !== false
            || str_ends_with($host, '.test');
    }
}
