{{--
    The page in plain HTML, for whoever reads it before running its JavaScript.

    Everything a visitor sees is painted by React, so the raw document a
    crawler fetches is otherwise an empty div. This puts the page's heading,
    words, links and — on the menus — every dish with its prices into that
    document, inside `<noscript>` so it is never drawn over the real page, and
    gives the first indexing pass something to read and somewhere to go next.

    @see App\Support\Seo\PageResolver
--}}
@php
    $seoPage = app(\App\Support\Seo\Seo::class)->page();
    $shopSettings = app(\App\Settings\GeneralSettings::class);
    $shopPhone = preg_replace('/\D/', '', (string) $shopSettings->whatsapp_number);
@endphp

@if ($seoPage->indexable)
    <noscript>
        <header>
            <a href="{{ route('home') }}">{{ \App\Support\Seo\Shop::FULL_NAME }}</a>
            <nav aria-label="Main navigation">
                <ul>
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><a href="{{ route('menu.dine-in') }}">Menu</a></li>
                    @if ($shopSettings->online_ordering_active)
                        <li><a href="{{ route('menu.delivery') }}">Order for delivery</a></li>
                    @endif
                </ul>
            </nav>
        </header>

        <main>
            @if (count($seoPage->breadcrumbs) > 1)
                <nav aria-label="Breadcrumb">
                    <ol>
                        @foreach ($seoPage->breadcrumbs as $crumb)
                            <li><a href="{{ $crumb['url'] }}">{{ $crumb['name'] }}</a></li>
                        @endforeach
                    </ol>
                </nav>
            @endif

            <h1>{{ $seoPage->heading }}</h1>
            <p>{{ $seoPage->description }}</p>

            @foreach ($seoPage->outline as $section)
                @if ($section['items'] !== [] || filled($section['text'] ?? null))
                    <section>
                        <h2>{{ $section['heading'] }}</h2>
                        @if (filled($section['text'] ?? null))
                            <p>{{ $section['text'] }}</p>
                        @endif
                        <ul>
                            @foreach ($section['items'] as $item)
                                <li>
                                    @if (filled($item['url'] ?? null))
                                        <a href="{{ $item['url'] }}">{{ $item['label'] }}</a>
                                    @else
                                        <strong>{{ $item['label'] }}</strong>
                                    @endif
                                    @if (filled($item['price'] ?? null))
                                        <span>{{ $item['price'] }}</span>
                                    @endif
                                    @if (filled($item['text'] ?? null))
                                        <p>{{ $item['text'] }}</p>
                                    @endif
                                </li>
                            @endforeach
                        </ul>
                    </section>
                @endif
            @endforeach

            @foreach (array_slice($seoPage->images, 0, 8) as $image)
                <img src="{{ $image }}" alt="{{ $seoPage->heading }}" loading="lazy">
            @endforeach
        </main>

        <footer>
            <p>{{ \App\Support\Seo\Shop::FULL_NAME }}: fresh desserts and drinks in {{ \App\Support\Seo\Shop::LOCALITY }}, {{ \App\Support\Seo\Shop::REGION }}, {{ \App\Support\Seo\Shop::COUNTRY_NAME }}, since {{ \App\Support\Seo\Shop::FOUNDED }}.</p>
            @if ($shopPhone !== '')
                <p>WhatsApp <a href="https://wa.me/{{ $shopPhone }}">+{{ $shopPhone }}</a></p>
            @endif
            @if ($map = $shopSettings->usableLocationUrl())
                <p><a href="{{ $map }}">Directions to Good Morning in {{ \App\Support\Seo\Shop::LOCALITY }}</a></p>
            @endif
        </footer>
    </noscript>
@endif
