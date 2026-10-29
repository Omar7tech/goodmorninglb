<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="color-scheme" content="only light">

        <link rel="icon" type="image/png" href="/favicon-96x96.png?v=20261026" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=20261026" />
        <link rel="shortcut icon" href="/favicon.ico?v=20261026" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20261026" />
        <meta name="apple-mobile-web-app-title" content="Good Morning" />
        <meta name="theme-color" content="#faf3de" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/site.webmanifest?v=20261026" />

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])

        {{-- The page's whole head, written on the server because the site renders
             without SSR: title, meta, Open Graph, canonical and the schema.org
             graph. The same tags ride along as the `head` prop, and Inertia's
             `serverHead` swaps them for the next page's on every visit.
             @see App\Support\Seo\Seo::headTags() --}}
        <x-inertia::head>
            @foreach ($page['props']['head'] ?? [] as $tag)
                {!! $tag !!}
            @endforeach
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        @include('partials.crawlable')

        <x-inertia::app />
    </body>
</html>
