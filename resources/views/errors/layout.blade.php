{{--
    The plain error page, for when the app cannot draw its own: maintenance
    mode, or a failure before Inertia can render. No scripts and no build
    assets — only the logo, the shop's colours and the words shared with the
    branded page (App\Support\ErrorPage) — so it renders whatever is broken.
--}}
@php($copy = \App\Support\ErrorPage::copy($status))
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, follow">
    <meta name="theme-color" content="#faf3de">
    <title>{{ $copy['heading'] }} | Good Morning Aley</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100svh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: #faf3de;
            color: #2e2a24;
            font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        }
        main {
            position: relative;
            overflow: hidden;
            width: 100%;
            max-width: 560px;
            padding: 48px 32px;
            border-radius: 32px;
            background: #fffaec;
            box-shadow: 0 0 0 1px #eadfc4;
            text-align: center;
        }
        .status {
            position: absolute;
            right: -12px;
            bottom: -36px;
            font-size: 160px;
            font-weight: 800;
            line-height: 1;
            color: rgb(113 144 103 / 0.08);
            pointer-events: none;
        }
        img { width: 150px; height: auto; }
        h1 { margin: 24px 0 12px; font-size: 32px; line-height: 1.1; color: #719067; }
        p { margin: 0 0 28px; font-size: 17px; line-height: 1.55; color: #7b7266; }
        a {
            display: inline-block;
            padding: 14px 28px;
            border-radius: 999px;
            background: #719067;
            color: #fffdf6;
            font-weight: 600;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <main>
        <span class="status" aria-hidden="true">{{ $status }}</span>
        <img src="/images/logo.svg" alt="Good Morning" width="4193" height="2782">
        <h1>{{ $copy['heading'] }}</h1>
        <p>{{ $copy['message'] }}</p>
        <a href="/">Back to Good Morning</a>
    </main>
</body>
</html>
