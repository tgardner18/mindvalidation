# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static single-page website for Mind Validation — a therapy and yoga practice in Nashua, NH run by Kirby Gardner, LCMHC. Hosted on Netlify, deployed from the `master` branch of `github.com/tgardner18/mindvalidation`.

There is no build system, bundler, or package manager. To preview locally, open `index.html` in a browser or run a simple local server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

The `dev/` folder contains sandbox/scratch files (`sandbox.html`, `temp.html`) for experimentation and is excluded from search indexing via `robots.txt`.

## Architecture

The entire site is a single file: `index.html`. All JavaScript is inline at the bottom of that file; all custom styles live in `css/mind-val-v2.css`. There are no separate JS modules.

**Page sections** (in DOM order, navigated via anchor links):
`#home` → `#about` → `#services` → `#yoga` → `#certifications` → `#faq` → `#location` → `#contact` (footer)

**External dependencies** are all loaded from CDN — nothing is vendored:
- Bootstrap 5.3.2 (layout/utilities)
- Font Awesome 6.4.0 (icons)
- Google Fonts — Poppins (body) + Tilt Neon (yoga section branding)
- AOS 2.3.1 (scroll-triggered animations via `data-aos` attributes)
- EmailJS browser SDK (contact form submission)

## Key Patterns

**CSS variables** — brand colors are defined as custom properties in `:root` at the top of `mind-val-v2.css`. Always use these variables rather than hardcoding hex values:
- `--primary-pink: #F30090`
- `--primary-blue: #020887`
- `--secondary-blue: #504BFD`
- `--accent-teal: #A0DED1`

**Contact modal** — any element with class `contact-modal-trigger` opens the modal on click. The modal auto-fires after the user scrolls past 35% of the page, suppressed by `localStorage` key `mv_modal_dismissed`.

**EmailJS integration** — the contact form posts to EmailJS service `service_2ajvq1g` using template `template_ccl0hvh`. The public key is initialized in the inline script near the EmailJS SDK `<script>` tag.

**Scroll animations** — use `data-aos="fade-up"` (or other AOS values) and `data-aos-delay="NNN"` on elements. AOS is initialized once with `duration: 800, once: true, offset: 100`.

**Seasonal effect** — an inline script near the end of `index.html` injects falling leaves (Sep–Nov) or snow (Dec–Feb), nothing Mar–Aug. Preview with `?effect=leaves|snow|none`. Styles are the `.seasonal-effect` block at the end of the CSS.

**SEO / AI-search content** — the canonical host is `https://mindvalidation.com/` (no `www`); use it in every absolute URL. The JSON-LD in `<head>` mirrors the visible page: when you edit FAQ questions/answers, services, credentials, insurance, or contact details, update the JSON-LD and `llms.txt` to match, and bump `dateModified` in the WebPage schema and `<lastmod>` in `sitemap.xml`.

**Netlify redirects** — `_redirects` maps legacy path-style URLs to the SPA's hash anchors with 301s.

## Deployment

Push to `master` on GitHub — Netlify auto-deploys. No CI or build step.
