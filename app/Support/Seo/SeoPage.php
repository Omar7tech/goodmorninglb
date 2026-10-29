<?php

namespace App\Support\Seo;

/**
 * Everything search engines and link previews need to know about one page,
 * resolved once on the server: its copy, its one true URL, whether it may be
 * indexed, where it sits in the site, and what it is about.
 *
 * The site renders without SSR (there is no Node on the server), so this is
 * the whole story a crawler gets from the first HTML response.
 * {@see PageResolver} builds it from the route, {@see Seo} prints it, and
 * {@see StructuredData} turns it into the schema.org graph.
 */
final readonly class SeoPage
{
    /**
     * @param  list<array{name: string, url: string}>  $breadcrumbs  The trail from home to this page, this page last.
     * @param  list<string>  $images  The page's own photos, best first, for the graph and the sitemap.
     * @param  list<array<string, mixed>>  $nodes  Extra schema.org nodes this page is about.
     * @param  list<array{heading: string, text?: string|null, items: list<array{label: string, url?: string|null, text?: string|null, price?: string|null}>}>  $outline
     *                                                                                                                                                                    The page's content as plain HTML, for crawlers that don't run JavaScript.
     */
    public function __construct(
        public string $title,
        public string $description,
        public string $canonical,
        public string $heading,
        public string $schemaType = 'WebPage',
        public bool $indexable = true,
        public array $breadcrumbs = [],
        public array $images = [],
        public array $nodes = [],
        public array $outline = [],
        public ?string $mainEntityId = null,
    ) {}

    /**
     * How Google may show the page: the whole photograph and the whole
     * snippet for anything indexable; followed but never listed otherwise.
     */
    public function robots(): string
    {
        return $this->indexable
            ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
            : 'noindex, follow';
    }
}
