<?php

namespace App\Support;

/**
 * What each error says, the way the shop would say it out loud rather than the
 * way HTTP does: a customer who mistypes a link has not met a "404 Not Found",
 * they have asked for something that is not on the menu.
 *
 * One list for both kinds of error page — the branded Inertia one and the
 * plain Blade fallback drawn when the app cannot boot — so the two never
 * disagree.
 */
final class ErrorPage
{
    /** The statuses the branded page is drawn for. */
    public const array STATUSES = [403, 404, 419, 429, 500, 503];

    /**
     * @return array{heading: string, message: string, retry: bool}
     */
    public static function copy(int $status): array
    {
        return match ($status) {
            403 => [
                'heading' => 'Staff only',
                'message' => 'This door goes to the kitchen. Everything for customers is on the menu.',
                'retry' => false,
            ],
            404 => [
                'heading' => 'Not on the menu',
                'message' => 'That page is not here. It may have been taken down, or the link lost a letter on the way. The menu itself has not moved.',
                'retry' => false,
            ],
            419 => [
                'heading' => 'This page went cold',
                'message' => 'It sat open long enough to expire. Nothing is lost: reload and try once more.',
                'retry' => true,
            ],
            429 => [
                'heading' => 'One at a time',
                'message' => 'That was a lot of requests in a short while. Give it a moment and try again.',
                'retry' => true,
            ],
            503 => [
                'heading' => 'Back in a moment',
                'message' => 'We are tidying up the site for a few minutes. It will be open again shortly.',
                'retry' => true,
            ],
            default => [
                'heading' => 'Something got burnt',
                'message' => 'Something went wrong on our side and we are on it. The menu should be back in a moment.',
                'retry' => true,
            ],
        };
    }
}
