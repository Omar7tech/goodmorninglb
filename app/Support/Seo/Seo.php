<?php

namespace App\Support\Seo;

use App\Support\ErrorPage;
use Illuminate\Http\Request;

/**
 * The SEO of the request being answered, resolved once and shared by everything
 * that prints it.
 *
 * The site is an Inertia app with no SSR (and no Node on the server), so the
 * head a crawler reads has to be written here. These tags go out twice from
 * the same list: printed straight into the first HTML response by the root
 * template, and shared with the app as the `head` prop, which Inertia's
 * `serverHead` keeps in the document on every client-side visit. The two can't
 * drift apart, and no page component has to repeat a title or a description.
 *
 * Bound as scoped, so one request resolves its page once however many times
 * it is asked.
 */
final class Seo
{
    private ?SeoPage $page = null;

    public function __construct(
        private readonly Request $request,
        private readonly PageResolver $resolver,
        private readonly StructuredData $structuredData,
    ) {}

    public function page(): SeoPage
    {
        return $this->page ??= $this->resolver->resolve($this->request);
    }

    /**
     * Describe this request as an error page instead of whatever its route
     * would have been: titled by what went wrong and never indexable. A 404
     * that describes itself as the menu is a 404 that gets indexed as one.
     */
    public function describeError(int $status): void
    {
        $copy = ErrorPage::copy($status);

        $this->page = new SeoPage(
            title: Shop::title($copy['heading']),
            description: $copy['message'],
            canonical: url()->to($this->request->path()),
            heading: $copy['heading'],
            indexable: false,
        );
    }

    /**
     * The head as HTML tags, each keyed with `data-inertia` so the client
     * swaps it for its counterpart on the next page instead of stacking a
     * second one beside it.
     *
     * @return list<string>
     */
    public function headTags(): array
    {
        $page = $this->page();
        $image = $page->images[0] ?? asset(Shop::IMAGE);
        $ownImage = $image === asset(Shop::IMAGE);

        return array_values(array_filter([
            $this->element('title', 'title', [], $page->title),
            $this->meta('description', ['name' => 'description', 'content' => $page->description]),
            $this->meta('keywords', ['name' => 'keywords', 'content' => Shop::KEYWORDS]),
            $this->meta('robots', ['name' => 'robots', 'content' => $page->robots()]),
            $this->meta('googlebot', ['name' => 'googlebot', 'content' => $page->robots()]),
            $this->element('link', 'canonical', ['rel' => 'canonical', 'href' => $page->canonical]),

            // Where the shop is, for the engines that still read these.
            $this->meta('geo.region', ['name' => 'geo.region', 'content' => 'LB-JL']),
            $this->meta('geo.placename', ['name' => 'geo.placename', 'content' => Shop::LOCALITY.', '.Shop::COUNTRY_NAME]),

            // Open Graph: what WhatsApp, Instagram and Facebook show when a link
            // is shared. The house image is declared with its size, so the card
            // is laid out before the picture has finished downloading.
            $this->meta('og:type', ['property' => 'og:type', 'content' => 'website']),
            $this->meta('og:site_name', ['property' => 'og:site_name', 'content' => Shop::FULL_NAME]),
            $this->meta('og:title', ['property' => 'og:title', 'content' => $page->title]),
            $this->meta('og:description', ['property' => 'og:description', 'content' => $page->description]),
            $this->meta('og:url', ['property' => 'og:url', 'content' => $page->canonical]),
            $this->meta('og:image', ['property' => 'og:image', 'content' => $image]),
            $this->meta('og:image:secure_url', ['property' => 'og:image:secure_url', 'content' => $image]),
            $ownImage ? $this->meta('og:image:type', ['property' => 'og:image:type', 'content' => 'image/jpeg']) : null,
            $ownImage ? $this->meta('og:image:width', ['property' => 'og:image:width', 'content' => (string) Shop::IMAGE_WIDTH]) : null,
            $ownImage ? $this->meta('og:image:height', ['property' => 'og:image:height', 'content' => (string) Shop::IMAGE_HEIGHT]) : null,
            $this->meta('og:image:alt', ['property' => 'og:image:alt', 'content' => $ownImage ? Shop::IMAGE_ALT : $page->heading]),
            $this->meta('og:locale', ['property' => 'og:locale', 'content' => 'en_US']),

            // X / Twitter
            $this->meta('twitter:card', ['name' => 'twitter:card', 'content' => 'summary_large_image']),
            $this->meta('twitter:title', ['name' => 'twitter:title', 'content' => $page->title]),
            $this->meta('twitter:description', ['name' => 'twitter:description', 'content' => $page->description]),
            $this->meta('twitter:image', ['name' => 'twitter:image', 'content' => $image]),

            $page->indexable
                ? $this->element('script', 'schema', ['type' => 'application/ld+json'], $this->json($this->structuredData->graph($page)), escape: false)
                : null,
        ]));
    }

    /** @param array<string, string> $attributes */
    private function meta(string $key, array $attributes): string
    {
        return $this->element('meta', $key, $attributes);
    }

    /**
     * One head element. Void elements close themselves; the rest wrap their
     * content, escaped unless it is already safe (the JSON-LD below).
     *
     * @param  array<string, string>  $attributes
     */
    private function element(string $tag, string $key, array $attributes, ?string $content = null, bool $escape = true): string
    {
        $html = '<'.$tag.' data-inertia="'.e($key).'"';

        foreach ($attributes as $attribute => $value) {
            $html .= ' '.$attribute.'="'.e($value).'"';
        }

        if (in_array($tag, ['meta', 'link'], true)) {
            return $html.'>';
        }

        return $html.'>'.($escape ? e((string) $content) : (string) $content).'</'.$tag.'>';
    }

    /**
     * The graph as JSON that is safe inside a `<script>`: `<` and `>` are
     * escaped, so no text the owner typed in the dashboard can close the tag.
     *
     * @param  array<string, mixed>  $data
     */
    private function json(array $data): string
    {
        return (string) json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP);
    }
}
