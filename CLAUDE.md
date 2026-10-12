# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static single-page website for Mind Validation — a therapy and yoga practice in Nashua, NH run by Kirby Gardner, LCMHC. Hosted on Netlify, deployed from the `master` branch of `github.com/tgardner18/mindvalidation`.

There is no build system or bundler. `package.json` exists only for dev tooling (Playwright); nothing is built or deployed from it. To preview locally, open `index.html` in a browser or run a simple local server:

```bash
python3 dev/serve.py        # or: npm run serve — no-cache, so CSS/JS edits show on refresh
# then open http://localhost:8000
```

**Testing:** `npm install` then `npx playwright install chromium` once per machine. `npm test` runs the theme date/contrast checks and the Playwright browser tests (`tests/`, desktop + phone); `npm run shots` saves a hero screenshot of every theme to `test-results/shots/`.

**Design tooling:** this project uses the impeccable Claude Code plugin (`/impeccable`). `.claude/settings.json` registers its marketplace and enables it, so Claude Code offers to install it on any machine; `.impeccable/` holds its project files and is checked in.

The `dev/` folder contains sandbox/scratch files (`sandbox.html`, `temp.html`) for experimentation and is excluded from search indexing via `robots.txt`.

## Architecture

The entire site is a single file: `index.html`. Site JavaScript is inline at the bottom of that file and custom styles live in `css/mind-val-v2.css`. The one exception is the seasonal/holiday theme system: `js/themes.js` + `css/themes.css`.

**Page sections** (in DOM order, navigated via anchor links):
`#home` → `#about` → `#services` → `#yoga` → `#certifications` → `#faq` → `#location` → `#contact` (footer)

**External dependencies** are all loaded from CDN — nothing is vendored:
- Bootstrap 5.3.2 (layout/utilities)
- Font Awesome 6.4.0 (icons)
- Google Fonts — Poppins (body) + Tilt Neon (yoga section branding)
- AOS 2.3.1 (scroll-triggered animations via `data-aos` attributes)
- EmailJS browser SDK (contact form submission)

## Key Patterns

**CSS variables** — brand colors are defined as custom properties in `:root` at the top of `mind-val-v2.css`. Every brand colour is a `--c-*` RGB-triplet token (e.g. `rgb(var(--c-primary) / 0.3)`), which is what lets holiday themes re-skin the whole site. Never hardcode a brand hex or rgba value — use the tokens or the named variables:
- `--primary-pink: #F30090`
- `--primary-blue: #020887`
- `--secondary-blue: #504BFD`
- `--accent-teal: #A0DED1`

**Contact modal** — any element with class `contact-modal-trigger` opens the modal on click. The modal auto-fires after the user scrolls past 35% of the page, suppressed by `localStorage` key `mv_modal_dismissed`.

**EmailJS integration** — the contact form posts to EmailJS service `service_2ajvq1g` using template `template_ccl0hvh`. The public key is initialized in the inline script near the EmailJS SDK `<script>` tag.

**Scroll animations** — use `data-aos="fade-up"` (or other AOS values) and `data-aos-delay="NNN"` on elements. AOS is initialized once with `duration: 800, once: true, offset: 100`.

**Seasonal & holiday themes** — `js/themes.js` holds a registry of themes (date window, priority, accent colour, ambient effects, hero ornament, hero message). The highest-priority theme whose window contains today is applied by setting `html[data-theme]`; theme-specific CSS overrides live at the bottom of `css/themes.css`. Preview with `?theme=<id>`, `?theme=none`, or `?date=YYYY-MM-DD`; `dev/themes.html` is a gallery with a calendar of every theme. A theme's `palette` overrides the colour tokens before first paint (`themes.js` loads in `<head>`, not deferred); every palette must pass `checkContrast()` — run `node dev/test-themes.js` after adding or editing a theme. Theme messages are written in Kirby's voice and need her approval. Respect `prefers-reduced-motion` (no ambient animation, static accents only) and keep decoration in the dark hero — no flashing, no sound.

**SEO / AI-search content** — the canonical host is `https://mindvalidation.com/` (no `www`); use it in every absolute URL. The JSON-LD in `<head>` mirrors the visible page: when you edit FAQ questions/answers, services, credentials, insurance, or contact details, update the JSON-LD and `llms.txt` to match, and bump `dateModified` in the WebPage schema and `<lastmod>` in `sitemap.xml`.

**Netlify redirects** — `_redirects` maps legacy path-style URLs to the SPA's hash anchors with 301s.

## Deployment

Push to `master` on GitHub — Netlify auto-deploys. No CI or build step.
