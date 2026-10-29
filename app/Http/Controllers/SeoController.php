<?php

namespace App\Http\Controllers;

use App\Support\Seo\Sitemap;
use Illuminate\Http\Response;

/**
 * The two files a crawler asks for before it reads a single page. Both are
 * served by the app rather than sitting in `public/`, so every URL in them
 * follows the domain the site is actually running on, and the sitemap only
 * ever lists what is on the menu right now.
 */
class SeoController extends Controller
{
    public function robots(Sitemap $sitemap): Response
    {
        return response(implode("\n", $sitemap->robots())."\n")
            ->header('Content-Type', 'text/plain; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * The XML sitemap, with the image extension so each dish's photo is
     * offered to Google Images with the menu it is on.
     */
    public function sitemap(Sitemap $sitemap): Response
    {
        $lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
        ];

        foreach ($sitemap->entries() as $entry) {
            $lines[] = '  <url>';
            $lines[] = '    <loc>'.e($entry['loc']).'</loc>';

            if ($entry['lastmod'] !== null) {
                $lines[] = '    <lastmod>'.e($entry['lastmod']).'</lastmod>';
            }

            foreach ($entry['images'] as $image) {
                $lines[] = '    <image:image>';
                $lines[] = '      <image:loc>'.e($image['loc']).'</image:loc>';
                $lines[] = '      <image:title>'.e($image['title']).'</image:title>';
                $lines[] = '    </image:image>';
            }

            $lines[] = '  </url>';
        }

        $lines[] = '</urlset>';

        // An hour is fresh enough for a menu, and spares a small shared host
        // from rebuilding it for every crawler that asks.
        return response(implode("\n", $lines)."\n")
            ->header('Content-Type', 'application/xml; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=3600');
    }
}
