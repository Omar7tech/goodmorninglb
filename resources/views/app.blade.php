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

        {{-- The visitor's theme, put on the document before anything is drawn:
             their own choice if they made one, otherwise their device's.
             Inline and ahead of the stylesheet on purpose, or a dark phone gets
             a cream page flashed at it first. @see resources/js/lib/theme.ts --}}
        <script>
            (function () {
                var theme = null;

                try {
                    theme = localStorage.getItem('good-morning-theme');
                } catch (error) {
                    // Storage can be off; the device decides instead.
                }

                if (theme !== 'light' && theme !== 'dark') {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }

                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#181512');
                }
            })();
        </script>

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
