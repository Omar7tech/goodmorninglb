<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * The browser protections every page should ask for. Location stays
     * allowed for this site alone, because checkout can ask for a map pin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

        if (app()->isProduction() && $request->secure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=15552000');
        }

        // No need to tell every visitor which PHP version is running.
        if (! headers_sent()) {
            header_remove('X-Powered-By');
        }

        return $response;
    }
}
