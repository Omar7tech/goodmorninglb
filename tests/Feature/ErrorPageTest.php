<?php

use Inertia\Testing\AssertableInertia;

it('draws the branded page for a page that is not there', function (): void {
    $this->get('/nothing-here')
        ->assertNotFound()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('error')
            ->where('status', 404)
            ->where('heading', 'Not on the menu')
            ->where('retry', false)
        );
});

it('keeps an error page out of search and titled by what went wrong', function (): void {
    $this->get('/nothing-here')
        ->assertSee('<title data-inertia="title">Not on the menu | Good Morning Aley</title>', escape: false)
        ->assertSee('<meta data-inertia="robots" name="robots" content="noindex, follow">', escape: false)
        ->assertDontSee('application/ld+json', escape: false);
});

it('answers a request that wants JSON with JSON, not the page', function (): void {
    $this->getJson('/nothing-here')
        ->assertNotFound()
        ->assertJsonStructure(['message']);
});

it('has a plain page for when the app is down for maintenance', function (): void {
    expect(view('errors.503')->render())
        ->toContain('Back in a moment')
        ->toContain('noindex, follow');
});
