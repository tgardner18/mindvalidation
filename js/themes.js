/*
 * Mind Validation — seasonal & holiday theme takeovers.
 *
 * A theme can layer any of:
 *   palette   re-skins the whole site by overriding the colour tokens in css/mind-val-v2.css
 *             (full skin = every role; accent skin = just primary/neon). Must pass checkContrast().
 *   accent    colour for the ornament, message, favicon and toggle when there's no palette
 *   effects   ambient animation (drifting leaves/snow/etc., bats in the hero)
 *   ornament  small neon icon on the hero title (stroke-only SVG paths, 24×24 grid)
 *   ornamentText  a neon text sign in the ornament's place instead (fn of the active date → line or lines);
 *             with an ornament too, the text sits small above the ornament's artwork on one sign
 *   icon      favicon artwork when it differs from the ornament
 *   message   one line of seasonal copy under the hero CTA
 *   cobwebs   corner webs in the footer
 *   lights    a strand of neon string lights hanging from the nav (static under reduced motion)
 *   snowman   a neon snowman standing on a snowdrift at the bottom of the footer
 * Extra theme-specific styling lives at the bottom of css/themes.css, keyed off html[data-theme].
 *
 * Loaded in <head> (not deferred) so the palette is applied before first paint;
 * DOM decorations are added on DOMContentLoaded.
 *
 * The active theme is chosen by date (highest priority wins). Preview with:
 *   ?theme=<id>        force a theme        ?theme=none   plain site
 *   ?date=YYYY-MM-DD   pretend it's that date (tests the windows)
 *   ?effect=leaves|snow|none   legacy aliases
 * All theme copy is a draft for Kirby's approval — keep it in her voice.
 */
(function () {
    'use strict';

    // ---------- Date helpers (local time, whole days) ----------
    const day = (y, m, d) => new Date(y, m, d); // m is 0-based
    const addDays = (date, n) => day(date.getFullYear(), date.getMonth(), date.getDate() + n);
    const nthWeekday = (y, m, weekday, n) => {
        const offset = (weekday - day(y, m, 1).getDay() + 7) % 7;
        return day(y, m, 1 + offset + (n - 1) * 7);
    };
    // Default holiday window: 3 days before through 1 day after
    const around = (date, before = 3, after = 1) => [addDays(date, -before), addDays(date, after)];

    // ---------- Colour palettes ----------
    // Palette roles → CSS colour tokens (a role can feed several near-identical tokens)
    const PALETTE_TOKENS = {
        primary: ['--c-primary'],
        primaryLight: ['--c-primary-light'],
        primaryDeep: ['--c-primary-deep'],
        primaryDark: ['--c-primary-dark'],
        button: ['--c-button'],
        buttonDeep: ['--c-button-deep'],
        secondary: ['--c-secondary', '--c-secondary-alt'],
        secondaryMid: ['--c-secondary-mid', '--c-secondary-mid-2'],
        secondarySoft: ['--c-secondary-soft'],
        secondaryDark: ['--c-secondary-dark'],
        secondaryInk: ['--c-secondary-ink'],
        tertiary: ['--c-tertiary'],
        tertiaryDeep: ['--c-tertiary-deep']
    };

    // The everyday Mind Validation palette (mirrors the token defaults in css/mind-val-v2.css)
    const BRAND = {
        primary: '#F30090', primaryLight: '#FC31A9', primaryDeep: '#B8006D', primaryDark: '#7D0049',
        button: '#C5006C', buttonDeep: '#8B004F',
        secondary: '#A0DED1', secondaryMid: '#5FBEAB', secondarySoft: '#7ECFC0', secondaryDark: '#2E6E65', secondaryInk: '#2D4D48',
        tertiary: '#504BFD', tertiaryDeep: '#020887',
        neon: '#F30090'
    };

    const hexToTriplet = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(' ');

    // WCAG 2.x contrast ratio between two hex colours
    function contrast(a, b) {
        const lum = hex => {
            const [r, g, bl] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
                .map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
            return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
        };
        const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
        return (hi + 0.05) / (lo + 0.05);
    }

    // Readability rules every palette must meet. Primary-on-white uses the brand pink (4.03:1) as its
    // floor — a theme may never be harder to read than the everyday site.
    const CONTRAST_RULES = [
        { label: 'White text on buttons', fg: () => '#FFFFFF', bg: p => p.button, min: 4.5 },
        { label: 'White text on button gradient end', fg: () => '#FFFFFF', bg: p => p.buttonDeep, min: 4.5 },
        { label: 'Primary text on light sections', fg: p => p.primary, bg: () => '#FFFFFF', min: 4.0 },
        { label: 'Small accent text on light sections', fg: p => p.primaryDeep, bg: () => '#FFFFFF', min: 4.5 },
        // Primary appears on dark sections only as large text/icons ("Mind" in the hero) → WCAG large-text 3:1;
        // small accent text on dark (the theme message link) uses primaryLight → 4.5:1
        { label: 'Primary large text on dark sections', fg: p => p.primary, bg: () => '#000000', min: 3.0 },
        { label: 'Small accent text on dark sections', fg: p => p.primaryLight, bg: () => '#000000', min: 4.5 },
        { label: 'Secondary text on dark sections', fg: p => p.secondary, bg: () => '#222222', min: 4.5 },
        { label: 'Soft secondary text on dark sections', fg: p => p.secondarySoft, bg: () => '#222222', min: 4.5 },
        { label: 'Secondary ink on light sections', fg: p => p.secondaryInk, bg: () => '#FFFFFF', min: 4.5 },
        { label: 'Tertiary text on light sections', fg: p => p.tertiary, bg: () => '#FFFFFF', min: 4.5 }
    ];

    function checkContrast(palette) {
        const p = Object.assign({}, BRAND, palette);
        return CONTRAST_RULES.map(rule => {
            const ratio = contrast(rule.fg(p), rule.bg(p));
            return { label: rule.label, ratio: Math.round(ratio * 100) / 100, min: rule.min, pass: ratio >= rule.min };
        });
    }

    // ---------- Ornament artwork (stroke-only, rendered as neon tubes) ----------
    const ORNAMENTS = {
        pumpkin:
            '<ellipse cx="12" cy="14" rx="4.2" ry="6.2"/>' +
            '<ellipse cx="9" cy="14" rx="5.6" ry="5.8"/>' +
            '<ellipse cx="15" cy="14" rx="5.6" ry="5.8"/>' +
            '<path d="M12 7.8c0-1.8.6-3.2 2.2-4"/>' +
            '<path d="M8.4 12.6l1.4-1.9 1.4 1.9z"/>' +
            '<path d="M12.8 12.6l1.4-1.9 1.4 1.9z"/>' +
            '<path d="M8.2 16l1.25 1 1.25-1 1.3 1 1.3-1 1.25 1 1.25-1"/>',
        tree:
            '<path d="M12 1.8l.75 1.55 1.7.25-1.23 1.2.29 1.7L12 5.7l-1.51.8.29-1.7-1.23-1.2 1.7-.25z"/>' +
            '<path d="M12 7.6L7.6 12.4h2.3L6.4 16.6h2.9L5.2 21h13.6l-4.1-4.4h2.9l-3.5-4.2h2.3z"/>' +
            '<path d="M11 21v1.6h2V21"/>' +
            '<path d="M9.6 15.1c1.5.5 3.2.2 4.6-.8M8.3 19.2c2.4.7 5 .3 7.2-1.1"/>',
        heart:
            '<path d="M12 20.3l-1.3-1.2C6 14.9 3 12.2 3 8.9 3 6.2 5.1 4.1 7.8 4.1c1.5 0 3 .7 4.2 1.9 1.2-1.2 2.7-1.9 4.2-1.9 2.7 0 4.8 2.1 4.8 4.8 0 3.3-3 6-7.7 10.2z"/>',
        shamrock:
            '<path d="M12 11C9.6 9.4 8.2 7.8 8.4 6.2 8.6 4.6 10.6 4 12 5.6 13.4 4 15.4 4.6 15.6 6.2 15.8 7.8 14.4 9.4 12 11z"/>' +
            '<path transform="rotate(120 12 11)" d="M12 11C9.6 9.4 8.2 7.8 8.4 6.2 8.6 4.6 10.6 4 12 5.6 13.4 4 15.4 4.6 15.6 6.2 15.8 7.8 14.4 9.4 12 11z"/>' +
            '<path transform="rotate(240 12 11)" d="M12 11C9.6 9.4 8.2 7.8 8.4 6.2 8.6 4.6 10.6 4 12 5.6 13.4 4 15.4 4.6 15.6 6.2 15.8 7.8 14.4 9.4 12 11z"/>' +
            '<path d="M12 11c.4 3.5 1.4 6.6 3.4 9.6"/>',
        ribbon:
            '<path d="M12 3.4c-2.1 0-3.5 1.7-3.5 3.8 0 2.6 2 5 3.5 6.6 1.5-1.6 3.5-4 3.5-6.6 0-2.1-1.4-3.8-3.5-3.8z"/>' +
            '<path d="M10.3 12.2L6.6 20.4l2.6-.6 1.3 2.3 3.4-7M13.7 12.2l3.7 8.2-2.6-.6-1.3 2.3-3.4-7"/>',
        star:
            '<path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
        leaf:
            '<path d="M12 2.5C7 6 4.5 10 4.5 14.2c0 4.3 3.5 7.3 7.5 7.3s7.5-3 7.5-7.3C19.5 10 17 6 12 2.5z"/>' +
            '<path d="M12 6.5v15M12 12.5l-3-2.2M12 16l3.2-2.4"/>',
        turkey: // five fanned tail feathers, round body, head with beak and wattle, feet
            [-64, -32, 0, 32, 64].map(a => '<ellipse cx="12" cy="6.6" rx="2" ry="4.3" transform="rotate(' + a + ' 12 14)"/>').join('') +
            '<circle cx="12" cy="15.4" r="4.1"/>' +
            '<circle cx="12" cy="10" r="1.75"/>' +
            '<path d="M13.6 9.8l1.6.5-1.6.5M12.9 11.3c.5.8.4 1.7-.2 2.2"/>' +
            '<path d="M10.7 19.4v2.3M13.3 19.4v2.3M9.7 22.2l1-.5 1 .5M12.3 22.2l1-.5 1 .5"/>',
        sparkle:
            '<path d="M12 3v5M12 16v5M3 12h5M16 12h5"/>' +
            '<path d="M12 8.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/>' +
            '<path d="M6 6l1.8 1.8M16.2 16.2L18 18M18 6l-1.8 1.8M7.8 16.2L6 18"/>'
    };

    // ---------- Theme registry ----------
    // window(year) returns [start, end] (inclusive) for the occurrence that starts in `year`.
    const THEMES = [
        {
            id: 'fall',
            name: 'Fall (seasonal)',
            priority: 1,
            accent: '#E8871E',
            window: y => [day(y, 8, 1), day(y, 10, 30)],
            effects: [{ type: 'drift', preset: 'leaves' }]
        },
        {
            id: 'winter',
            name: 'Winter (seasonal)',
            priority: 1,
            accent: '#A0DED1',
            window: y => [day(y, 11, 1), day(y + 1, 2, 0)], // Dec 1 – last day of Feb
            effects: [{ type: 'drift', preset: 'snow' }]
        },
        {
            id: 'halloween',
            name: 'Halloween',
            priority: 10,
            skin: 'full',
            // Firelight + moonlight: pumpkin orange carries the charge, a cooled night seafoam keeps
            // the brand's calm counterpoint, midnight blue replaces the violet tertiary
            palette: {
                primary: '#D35400', primaryLight: '#F7902E', primaryDeep: '#A63F00', primaryDark: '#5C2200',
                button: '#C2410C', buttonDeep: '#7C2D12',
                secondary: '#8FD3C3', secondaryMid: '#5FAE9E', secondarySoft: '#A8E0D3', secondaryDark: '#2C5F57', secondaryInk: '#24443F',
                tertiary: '#34508C', tertiaryDeep: '#1E2F5C',
                neon: '#FF7A1A'
            },
            window: y => around(day(y, 9, 31), 4, 1), // Oct 27 – Nov 1
            effects: [{ type: 'bats' }],
            ornament: 'pumpkin',
            cobwebs: true,
            message: {
                text: 'Not every fear is seasonal. Let’s work on the ones that stay.',
                cta: 'Schedule intake'
            }
        },
        {
            id: 'holidays',
            name: 'Winter holidays',
            priority: 10,
            skin: 'full',
            // String lights at night: traditional Christmas red carries the charge, the neon sign burns
            // bulb-gold, evergreen is the calm counterpoint and bronze the third voice
            palette: {
                primary: '#C41E3A', primaryLight: '#E8566B', primaryDeep: '#9A0E22', primaryDark: '#5E0818',
                button: '#B5121B', buttonDeep: '#7A0A12',
                secondary: '#9ED9B9', secondaryMid: '#5FB089', secondarySoft: '#B9E6CC', secondaryDark: '#2E6B4F', secondaryInk: '#1F4636',
                tertiary: '#8A5A00', tertiaryDeep: '#4A3000',
                neon: '#FFD27A'
            },
            window: y => [day(y, 11, 12), day(y, 11, 27)], // Dec 12 – 27
            effects: [{ type: 'drift', preset: 'snow' }],
            ornament: 'tree',
            lights: true,
            snowman: true,
            message: {
                text: 'The holidays can hold a lot at once. You don\u2019t have to carry it alone.',
                cta: 'Schedule intake'
            }
        },
        {
            id: 'newyear',
            name: 'New Year',
            priority: 10,
            // Stays in the everyday brand colours: the pink neon sign is the charge, the teal
            // "Happy New Year" sign the counterpoint
            accent: '#A0DED1',
            window: y => [day(y, 11, 30), day(y + 1, 0, 2)], // Dec 30 – Jan 2
            effects: [{ type: 'drift', preset: 'confetti' }, { type: 'fireworks' }],
            // The year being welcomed: this year in January, otherwise the coming one (Dec 30–31, and previews)
            ornamentText: date => ['Happy New Year', String(date.getMonth() === 0 ? date.getFullYear() : date.getFullYear() + 1)],
            icon: 'sparkle',
            message: {
                text: 'A new year doesn\u2019t need a new you. Just a next step.',
                cta: 'Schedule intake'
            }
        },
        {
            id: 'valentines',
            name: "Valentine's Day",
            priority: 10,
            // Brand colours already are Valentine's; the theme adds hearts and a self-compassion line
            accent: '#FC31A9',
            window: y => around(day(y, 1, 14)), // Feb 11 – 15
            effects: [{ type: 'drift', preset: 'hearts' }],
            ornament: 'heart',
            message: {
                text: 'Start with the relationship you have with yourself.',
                cta: 'Schedule intake'
            }
        },
        {
            id: 'stpatricks',
            name: "St. Patrick's Day",
            priority: 10,
            skin: 'full',
            // Emerald carries the charge (deep enough for white button text), the neon burns clover-bright,
            // warm gold is the calm counterpoint and deep sea-teal the third voice
            palette: {
                primary: '#1E8449', primaryLight: '#58D68D', primaryDeep: '#145A32', primaryDark: '#0B3D20',
                button: '#17703C', buttonDeep: '#0B3D20',
                secondary: '#E6D49A', secondaryMid: '#C9B36E', secondarySoft: '#F1E8C8', secondaryDark: '#6B5A22', secondaryInk: '#4A3E17',
                tertiary: '#2F5D62', tertiaryDeep: '#173236',
                neon: '#7CFFA0'
            },
            window: y => around(day(y, 2, 17)), // Mar 14 – 18
            effects: [{ type: 'drift', preset: 'shamrocks' }],
            ornament: 'shamrock',
            message: {
                text: 'Luck is nice. Tools last longer.',
                cta: 'Schedule intake'
            }
        },
        {
            id: 'mhmonth',
            name: 'Mental Health Awareness Month',
            priority: 5,
            // Light touch for a whole month: the green awareness ribbon, no ambient motion
            accent: '#7ED957',
            window: y => [day(y, 4, 1), day(y, 4, 31)], // May
            ornament: 'ribbon',
            message: {
                text: 'May is Mental Health Awareness Month. Reaching out is a strong first step.',
                cta: 'Schedule intake'
            }
        },
        {
            id: 'mothersday',
            name: "Mother's Day",
            priority: 20,
            // Message only: this day is hard for many people, so nothing celebratory
            window: y => around(nthWeekday(y, 4, 0, 2), 1, 0), // Sat + Sun, 2nd Sunday of May
            message: {
                text: 'Mother\u2019s Day can hold joy, grief, or both. All of it is welcome here.',
                cta: 'Schedule intake'
            }
        },
        {
            id: 'fathersday',
            name: "Father's Day",
            priority: 20,
            window: y => around(nthWeekday(y, 5, 0, 3), 1, 0), // Sat + Sun, 3rd Sunday of June
            message: {
                text: 'Father\u2019s Day can hold joy, grief, or both. All of it is welcome here.',
                cta: 'Schedule intake'
            }
        },
        {
            id: 'july4',
            name: '4th of July',
            priority: 10,
            skin: 'full',
            // The flag's official colours: Old Glory Red #B31942 (buttons and accents), white as the calm
            // counterpoint, Old Glory Blue #0A3161 as the third voice. Lighter tints only where a colour
            // must glow or be read as small text on the dark hero.
            palette: {
                primary: '#B31942', primaryLight: '#E9506F', primaryDeep: '#8C1333', primaryDark: '#5C0C22',
                button: '#B31942', buttonDeep: '#7E1230',
                secondary: '#FFFFFF', secondaryMid: '#9DB0CC', secondarySoft: '#F2F4F8', secondaryDark: '#0A3161', secondaryInk: '#0A3161',
                tertiary: '#0A3161', tertiaryDeep: '#061F3F',
                neon: '#FF3D63'
            },
            window: y => around(day(y, 6, 4)), // Jul 1 – 5
            // Old Glory Blue is too dark to see against the night sky, so the blue bursts use a luminous flag blue
            effects: [{ type: 'fireworks', colors: ['#E9506F', '#FFFFFF', '#5B8CFF'] }],
            ornament: 'star',
            message: {
                text: 'Independence includes the freedom to ask for support.',
                cta: 'Schedule intake'
            }
        },
        {
            id: 'wmhd',
            name: 'World Mental Health Day',
            priority: 10,
            accent: '#7ED957',
            window: y => around(day(y, 9, 10), 2, 1), // Oct 8 – 11
            effects: [{ type: 'drift', preset: 'leaves' }],
            ornament: 'ribbon',
            message: {
                text: 'October 10 is World Mental Health Day. Your mental health matters every day.',
                cta: 'Schedule intake'
            }
        },
        {
            id: 'thanksgiving',
            name: 'Thanksgiving',
            priority: 10,
            accent: '#E8871E',
            window: y => around(nthWeekday(y, 10, 4, 4), 3, 1), // Mon – Fri of Thanksgiving week
            effects: [{ type: 'drift', preset: 'leaves' }],
            ornamentText: () => 'Happy Thanksgiving',
            ornament: 'turkey',
            message: {
                text: 'Gratitude and grief can share the same table. There\u2019s room for both here.',
                cta: 'Schedule intake'
            }
        }
    ];

    const byId = Object.fromEntries(THEMES.map(t => [t.id, t]));

    function windowsFor(theme, year) {
        // Check the occurrence starting this year and last year (for windows that span New Year)
        return [year - 1, year].map(y => theme.window(y));
    }

    function isActive(theme, date) {
        return windowsFor(theme, date.getFullYear())
            .some(([start, end]) => date >= start && date < addDays(end, 1));
    }

    function resolve(date) {
        return THEMES
            .filter(t => isActive(t, date))
            .sort((a, b) => b.priority - a.priority)[0] || null;
    }

    function parseDate(value) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
        return m ? day(+m[1], +m[2] - 1, +m[3]) : null;
    }

    // Exposed for dev/themes.html (the preview gallery)
    const accentOf = theme => (theme.palette && (theme.palette.neon || theme.palette.primary)) || theme.accent || BRAND.primary;
    window.MVThemes = { themes: THEMES, brand: BRAND, resolve, isActive, accentOf, checkContrast, ornaments: ORNAMENTS };
    if (document.currentScript && document.currentScript.hasAttribute('data-no-apply')) return;

    // ---------- Pick the theme ----------
    const params = new URLSearchParams(window.location.search);
    const legacyEffect = { leaves: 'fall', snow: 'winter', none: 'none' }[params.get('effect')];
    const requested = params.get('theme') || legacyEffect;
    const today = parseDate(params.get('date')) || day(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const theme = requested === 'none' ? null : (byId[requested] || resolve(today));
    if (!theme) return;

    // ---------- Skin: runs immediately, before first paint ----------
    const root = document.documentElement;
    const accent = accentOf(theme);
    root.setAttribute('data-theme', theme.id);
    root.style.setProperty('--theme-accent', accent);
    if (theme.palette) {
        root.setAttribute('data-skin', theme.skin || 'accent');
        Object.entries(theme.palette).forEach(([role, hex]) => {
            (PALETTE_TOKENS[role] || []).forEach(token => root.style.setProperty(token, hexToTriplet(hex)));
        });
        if (theme.palette.neon) root.style.setProperty('--neon-glow', theme.palette.neon);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', decorate);
    } else {
        decorate();
    }

    // ---------- Decorations: need the DOM ----------
    function decorate() {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mobile = window.innerWidth < 768;
        const rand = (min, max) => min + Math.random() * (max - min);
        const pick = list => list[Math.floor(Math.random() * list.length)];
        const hero = document.getElementById('home');

        // Corner cobweb anchored at the top-left (0,0): radial threads plus sagging rings
        function cobwebSVG() {
            const R = 200, spokes = 7, rings = [34, 62, 92, 124, 158, 192];
            const pt = (r, a) => [r * Math.cos(a), r * Math.sin(a)].map(n => n.toFixed(1));
            const angle = i => (Math.PI / 2) * (i / (spokes - 1));
            let d = '';
            for (let i = 0; i < spokes; i++) d += 'M0,0 L' + pt(R, angle(i)).join(',') + ' ';
            rings.forEach((r, k) => {
                const jitter = 1 + (k % 2 ? 0.03 : -0.02);
                d += 'M' + pt(r * jitter, angle(0)).join(',') + ' ';
                for (let i = 1; i < spokes; i++) {
                    const sag = pt(r * 0.86, (angle(i - 1) + angle(i)) / 2);
                    d += 'Q' + sag.join(',') + ' ' + pt(r * jitter, angle(i)).join(',') + ' ';
                }
            });
            return '<svg viewBox="0 0 ' + R + ' ' + R + '"><path d="' + d.trim() + '"/></svg>';
        }

        // ---------- Effects ----------
        const LEAF_SHAPES = [
            // Rounded leaf with center vein
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1.5C6.5 5.5 4 10 4 14.2 4 18.8 7.6 22 12 22s8-3.2 8-7.8C20 10 17.5 5.5 12 1.5z"/><path d="M12 5v17" stroke="rgba(0,0,0,0.18)" stroke-width="1" fill="none"/></svg>',
            // Slender leaf with stem
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.5 3.5C11 3.5 4.5 8.5 4.5 15.5c0 1.6.4 2.9 1 4C14 19.5 20.5 13 20.5 3.5z"/><path d="M3 21c4-5 9-10 15-15" stroke="rgba(0,0,0,0.18)" stroke-width="1" fill="none"/></svg>'
        ];
        const HEART_PATH = 'M12 20.3l-1.3-1.2C6 14.9 3 12.2 3 8.9 3 6.2 5.1 4.1 7.8 4.1c1.5 0 3 .7 4.2 1.9 1.2-1.2 2.7-1.9 4.2-1.9 2.7 0 4.8 2.1 4.8 4.8 0 3.3-3 6-7.7 10.2z';
        const LOBE = 'M12 11C9.6 9.4 8.2 7.8 8.4 6.2 8.6 4.6 10.6 4 12 5.6 13.4 4 15.4 4.6 15.6 6.2 15.8 7.8 14.4 9.4 12 11z';
        const SHAMROCK_FILL = [0, 120, 240].map(r => '<path transform="rotate(' + r + ' 12 11)" d="' + LOBE + '"/>').join('') +
            '<path d="M11.6 11.2h.8c.3 3.4 1.3 6.4 3.2 9.2l-.7.5c-2-2.9-3-6-3.3-9.7z"/>';
        const LEAF_COLORS = ['#D9531E', '#E8871E', '#C0392B', '#B5651D', '#E3A72F', 'var(--primary-pink)'];

        // Drift presets: each returns the CSS variables (and optional markup) for one falling item
        const DRIFT_PRESETS = {
            leaves: {
                count: [14, 7],
                className: 'fall-leaf',
                item: i => ({
                    vars: {
                        '--fall-dur': rand(12, 22) + 's', '--delay': rand(0, 18) + 's',
                        '--size': rand(16, 30) + 'px', '--sway': rand(20, 60) + 'px', '--sway-dur': rand(2.5, 4.5) + 's',
                        '--rot-start': rand(-60, 0) + 'deg', '--rot-end': rand(30, 120) + 'deg', '--flip': '55deg',
                        '--leaf-color': pick(LEAF_COLORS)
                    },
                    html: LEAF_SHAPES[i % LEAF_SHAPES.length]
                })
            },
            hearts: {
                count: [16, 9],
                className: 'fall-leaf',
                item: () => ({
                    vars: {
                        '--fall-dur': rand(15, 24) + 's', '--delay': rand(0, 18) + 's',
                        '--size': rand(12, 22) + 'px', '--sway': rand(16, 40) + 'px', '--sway-dur': rand(3, 5) + 's',
                        '--rot-start': rand(-20, 0) + 'deg', '--rot-end': rand(5, 25) + 'deg', '--flip': '0deg',
                        '--leaf-color': pick(['rgb(var(--c-primary))', 'rgb(var(--c-primary-light))', '#FFFFFF'])
                    },
                    html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="' + HEART_PATH + '"/></svg>'
                })
            },
            shamrocks: {
                count: [16, 9],
                className: 'fall-leaf',
                item: () => ({
                    vars: {
                        '--fall-dur': rand(14, 22) + 's', '--delay': rand(0, 18) + 's',
                        '--size': rand(20, 32) + 'px', '--sway': rand(18, 46) + 'px', '--sway-dur': rand(2.6, 4.4) + 's',
                        '--rot-start': rand(-60, 0) + 'deg', '--rot-end': rand(30, 110) + 'deg', '--flip': '40deg',
                        // bright clover greens: the deep emerald disappears on the dark hero
                        '--leaf-color': pick(['rgb(var(--c-primary-light))', 'var(--neon-glow, #7CFFA0)', '#B9F5CF'])
                    },
                    html: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor">' + SHAMROCK_FILL + '</g></svg>'
                })
            },
            confetti: {
                count: [26, 14],
                className: 'fall-confetti',
                item: () => ({
                    vars: {
                        '--fall-dur': rand(14, 24) + 's', '--delay': rand(0, 16) + 's',
                        '--size': rand(8, 13) + 'px', '--shape': rand(0.45, 1).toFixed(2),
                        '--sway': rand(14, 40) + 'px', '--sway-dur': rand(2.4, 4) + 's',
                        '--rot-start': rand(-90, 0) + 'deg', '--rot-end': rand(60, 180) + 'deg', '--flip': '70deg',
                        '--leaf-color': pick(['rgb(var(--c-primary))', 'rgb(var(--c-primary-light))', 'rgb(var(--c-secondary))', '#FFFFFF'])
                    }
                })
            },
            snow: {
                count: [50, 25],
                className: 'fall-snow',
                item: () => ({
                    vars: {
                        '--fall-dur': rand(10, 20) + 's', '--delay': rand(0, 15) + 's',
                        '--size': rand(3, 8) + 'px', '--sway': rand(10, 35) + 'px', '--sway-dur': rand(3, 6) + 's',
                        '--rot-start': '0deg', '--rot-end': '0deg', '--flip': '0deg',
                        '--opacity': rand(0.5, 0.95).toFixed(2)
                    }
                })
            }
        };

        const setVars = (el, vars) => Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));

        const EFFECTS = {
            // Items drifting down the whole viewport
            drift({ preset }) {
                const p = DRIFT_PRESETS[preset];
                const layer = document.createElement('div');
                layer.className = 'theme-layer theme-drift';
                for (let i = 0; i < p.count[mobile ? 1 : 0]; i++) {
                    const { vars, html } = p.item(i);
                    const item = document.createElement('div');
                    item.className = 'fall-item ' + p.className;
                    setVars(item, Object.assign({ '--x': rand(0, 100) + 'vw' }, vars));
                    const inner = document.createElement('span');
                    inner.className = 'fall-item-inner';
                    if (html) inner.innerHTML = html;
                    item.appendChild(inner);
                    layer.appendChild(item);
                }
                document.body.appendChild(layer);
            },

            // A few bats crossing the hero slowly, behind the content
            // Soft firework blooms in the hero's upper corners, behind the content. Trauma-aware by design:
            // no flash frame, no sound, slow ease-out blooms that drift down and fade, at most two at once.
            // Paused whenever the hero is off-screen, hidden by the decorations toggle, or the tab is hidden.
            fireworks({ colors } = {}) {
                if (!hero) return;
                const canvas = document.createElement('canvas');
                canvas.className = 'theme-layer theme-fireworks';
                hero.insertBefore(canvas, hero.querySelector('.hero-content'));
                const ctx = canvas.getContext('2d');
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                const css = getComputedStyle(root);
                const token = name => 'rgb(' + css.getPropertyValue(name).trim().split(/\s+/).join(',') + ')';
                const COLORS = colors || [token('--c-primary'), token('--c-primary-light'), token('--c-secondary'), '#FFFFFF'];
                let W = 0, H = 0, bursts = [], visible = false, running = false, nextAt = 0, last = 0;

                const size = () => {
                    W = canvas.clientWidth; H = canvas.clientHeight;
                    canvas.width = W * dpr; canvas.height = H * dpr;
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    measureZones();
                };

                // Bursts open in the free space either side of the title; where the title fills the width
                // (phones, small tablets) they sit behind it at reduced strength so the text stays readable
                let zones = [], strength = 1;
                const measureZones = () => {
                    const heroBox = hero.getBoundingClientRect(), titleEl = hero.querySelector('.hero-main-title');
                    const tb = titleEl ? titleEl.getBoundingClientRect() : { left: W / 2, right: W / 2 };
                    const left = [60, tb.left - heroBox.left - 90], right = [tb.right - heroBox.left + 90, W - 60];
                    zones = [left, right].filter(([a, b]) => b - a >= 160); // room for a whole bloom
                    strength = zones.length ? 1 : 0.6;
                    if (!zones.length) zones = [[W * 0.15, W * 0.85]];
                };

                const launch = now => {
                    const [zx0, zx1] = pick(zones);
                    const x = rand(zx0, zx1);
                    const y = rand(130, Math.min(H * 0.45, 360)); // the band above the service cards
                    const color = pick(COLORS);
                    const n = mobile ? 40 : 72;
                    const sparks = [];
                    for (let i = 0; i < n; i++) {
                        const a = (Math.PI * 2 * i) / n + rand(-0.06, 0.06);
                        const speed = rand(0.72, 1) * (mobile ? 100 : 130);
                        sparks.push({ vx: Math.cos(a) * speed, vy: Math.sin(a) * speed });
                    }
                    bursts.push({ x, y, startY: Math.min(H, 760), color, sparks, born: now });
                };

                const RISE = 0.9, BLOOM = 2.6; // seconds
                const ease = p => 1 - Math.pow(1 - p, 3);

                const frame = now => {
                    if (!running) return;
                    const t = now / 1000;
                    ctx.clearRect(0, 0, W, H);
                    ctx.globalCompositeOperation = 'lighter';
                    if (t >= nextAt && bursts.length < 2) { launch(t); nextAt = t + rand(2.2, 3.8); }
                    bursts = bursts.filter(b => t - b.born < RISE + BLOOM);
                    bursts.forEach(b => {
                        const age = t - b.born;
                        ctx.fillStyle = b.color;
                        ctx.strokeStyle = b.color;
                        ctx.shadowColor = b.color;
                        ctx.lineCap = 'round';
                        if (age < RISE) {
                            // a faint rising streak
                            const p = ease(age / RISE), y = b.startY + (b.y - b.startY) * p;
                            ctx.globalAlpha = 0.55;
                            ctx.shadowBlur = 6;
                            ctx.lineWidth = 2;
                            ctx.beginPath(); ctx.moveTo(b.x, y); ctx.lineTo(b.x, y + 16); ctx.stroke();
                            return;
                        }
                        const p = (age - RISE) / BLOOM;
                        const at = q => ease(Math.min(Math.max(q, 0) * 1.4, 1));
                        const spread = at(p), tail = at(p - 0.07);
                        const fall = 26 * p * p; // gentle gravity
                        ctx.globalAlpha = Math.max(0, strength * Math.pow(1 - p, 1.3));
                        ctx.shadowBlur = 12;
                        ctx.lineWidth = mobile ? 2 : 2.6;
                        ctx.beginPath();
                        b.sparks.forEach(s => {
                            // each spark is a short streak from where it was a moment ago
                            ctx.moveTo(b.x + s.vx * tail, b.y + s.vy * tail + fall * 0.8);
                            ctx.lineTo(b.x + s.vx * spread, b.y + s.vy * spread + fall);
                        });
                        ctx.stroke();
                        // small bright tips: sparkle without a flash
                        ctx.fillStyle = '#FFFFFF';
                        ctx.globalAlpha *= 0.75;
                        ctx.beginPath();
                        b.sparks.forEach(s => {
                            const tx = b.x + s.vx * spread, ty = b.y + s.vy * spread + fall;
                            ctx.moveTo(tx + 1.4, ty);
                            ctx.arc(tx, ty, 1.4, 0, Math.PI * 2);
                        });
                        ctx.fill();
                    });
                    ctx.globalAlpha = 1;
                    ctx.shadowBlur = 0;
                    last = requestAnimationFrame(frame);
                };

                const update = () => {
                    const shouldRun = visible && !document.hidden && !root.classList.contains('decor-hidden');
                    if (shouldRun && !running) { running = true; size(); last = requestAnimationFrame(frame); }
                    if (!shouldRun && running) { running = false; cancelAnimationFrame(last); ctx.clearRect(0, 0, W, H); bursts = []; }
                };
                new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(hero);
                if (document.fonts) document.fonts.ready.then(() => { if (W) measureZones(); });
                document.addEventListener('visibilitychange', update);
                new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ['class'] });
                window.addEventListener('resize', () => { if (running) size(); });
            },

            bats() {
                if (!hero) return;
                const bat = '<svg viewBox="0 0 24 12" aria-hidden="true"><path d="M12 4.2c.5-1.1 1.2-1.8 1.8-2-.1.8.1 1.5.5 2.1C15.8 2.8 18.8 1.7 24 2.1c-2 1.2-3 3-3 5-1.4-.8-3-.6-4 .6-.6-1-1.8-1.4-3-1-.6.8-1.2 1.6-2 2.4-.8-.8-1.4-1.6-2-2.4-1.2-.4-2.4 0-3 1-1-1.2-2.6-1.4-4-.6 0-2-1-3.8-3-5 5.2-.4 8.2.7 9.7 2.2.4-.6.6-1.3.5-2.1.6.2 1.3.9 1.8 2z"/></svg>';
                const layer = document.createElement('div');
                layer.className = 'theme-layer theme-bats';
                for (let i = 0; i < (mobile ? 3 : 5); i++) {
                    const item = document.createElement('div');
                    item.className = 'bat';
                    const rtl = i % 2 === 1;
                    setVars(item, {
                        '--y': rand(8, 70) + '%', '--size': rand(34, 56) + 'px',
                        '--dur': rand(18, 30) + 's', '--delay': rand(0, 20) + 's',
                        '--dir': rtl ? 'reverse' : 'normal', '--bob': rand(1.8, 3.2) + 's'
                    });
                    item.innerHTML = '<span class="bat-bob"><span class="bat-face' + (rtl ? ' bat-rtl' : '') + '">' + bat + '</span></span>';
                    layer.appendChild(item);
                }
                hero.insertBefore(layer, hero.querySelector('.hero-content'));
            }
        };

        if (!reducedMotion && theme.effects) {
            theme.effects.forEach(effect => EFFECTS[effect.type](effect));
            addDecorToggle();
        }

        // ---------- Hero ornament ----------
        const title = document.querySelector('.hero-main-title');
        if (title && (theme.ornament || theme.ornamentText)) {
            const ornament = document.createElement('span');
            ornament.setAttribute('aria-hidden', 'true');
            if (theme.ornamentText) {
                ornament.className = 'theme-ornament theme-ornament-text';
                const withIcon = Boolean(theme.ornament);
                [].concat(theme.ornamentText(today)).forEach((line, n, lines) => {
                    const span = document.createElement('span');
                    // the last line is the sign's headline unless artwork follows it
                    span.className = 'sign-line' + (withIcon || n < lines.length - 1 ? ' sign-line-small' : '');
                    span.textContent = line;
                    ornament.appendChild(span);
                });
                if (withIcon) {
                    const icon = document.createElement('span');
                    icon.className = 'sign-icon';
                    icon.innerHTML = '<svg viewBox="0 0 24 24">' + ORNAMENTS[theme.ornament] + '</svg>';
                    ornament.appendChild(icon);
                }
            } else {
                ornament.className = 'theme-ornament';
                ornament.innerHTML = '<svg viewBox="0 0 24 24">' + ORNAMENTS[theme.ornament] + '</svg>';
            }
            title.classList.add('has-ornament');
            title.appendChild(ornament);
            if (theme.ornamentText) {
                // A text sign sits above the title (anchored by its bottom edge); give the title enough
                // room above it for the whole sign plus clearance under the fixed nav
                const fit = () => {
                    title.style.marginTop = '';
                    const overhang = title.getBoundingClientRect().top - ornament.getBoundingClientRect().top;
                    const base = parseFloat(getComputedStyle(title).marginTop) || 0;
                    title.style.marginTop = Math.max(base, overhang + 20) + 'px';
                };
                fit();
                if (document.fonts) document.fonts.ready.then(fit);
                window.addEventListener('resize', fit);
            }
        }

        // ---------- Message: one line under the hero call to action ----------
        if (theme.message) {
            const openContact = e => {
                if (typeof window.openContactModal === 'function') {
                    e.preventDefault();
                    window.openContactModal();
                }
            };
            const cta = document.querySelector('.hero-cta-section');
            if (cta) {
                const note = document.createElement('p');
                note.className = 'theme-message';
                note.appendChild(document.createTextNode(theme.message.text + ' '));
                const link = document.createElement('a');
                link.href = '#contact';
                link.className = 'theme-message-cta';
                link.textContent = theme.message.cta;
                link.insertAdjacentHTML('beforeend', ' <i class="fas fa-arrow-right" aria-hidden="true"></i>');
                link.addEventListener('click', openContact);
                note.appendChild(link);
                cta.insertAdjacentElement('afterend', note);
            }
        }

        // ---------- Footer cobwebs ----------
        const footer = document.querySelector('.modern-footer');
        if (footer && theme.cobwebs) {
            ['left', 'right'].forEach(side => {
                const web = document.createElement('div');
                web.className = 'theme-cobweb theme-cobweb-' + side;
                web.setAttribute('aria-hidden', 'true');
                web.innerHTML = cobwebSVG();
                footer.appendChild(web);
            });
        }

        // ---------- Footer snowman ----------
        const footerInner = document.querySelector('.modern-footer .footer-inner');
        if (footerInner && theme.snowman) {
            const scene = document.createElement('div');
            scene.className = 'theme-snowman';
            scene.setAttribute('aria-hidden', 'true');
            scene.innerHTML = '<svg viewBox="0 0 64 96">' +
                '<path class="drift" d="M0 92c8-7 20-9 32-9s24 2 32 9z"/>' +
                '<g class="body">' +
                    '<circle cx="32" cy="70" r="15"/><circle cx="32" cy="43" r="11"/><circle cx="32" cy="22" r="8.5"/>' +
                    '<path d="M22.5 15h19M26 15V6.5h12V15"/>' +
                    '<path d="M21 42l-11-7M12.5 36.5l-3.5-1.5M43 42l11-8M51.5 35.8l3-2.3"/>' +
                    '<path class="dots" d="M29 20.5h.01M35 20.5h.01M32 39h.01M32 45h.01M32 64h.01M32 71h.01"/>' +
                '</g>' +
                '<path class="nose" d="M32 23.5l6.5 1.6-6.5 1.1"/>' +
                '<path class="scarf" d="M23.5 31.5c5.5 2.6 11.5 2.6 17 0M37 33l2.5 8.5"/>' +
                '</svg>';
            footerInner.appendChild(scene);
        }

        // ---------- String lights hanging from the nav ----------
        const nav = document.querySelector('.modern-nav');
        if (nav && theme.lights) {
            const strand = document.createElement('div');
            strand.className = 'theme-lights';
            strand.setAttribute('aria-hidden', 'true');
            const SPAN = 56, H = 22;
            const draw = () => {
                const w = Math.ceil(window.innerWidth / SPAN) * SPAN;
                // The wire runs straight along the nav's bottom border; each bulb hangs directly off it
                let bulbs = '';
                for (let x = SPAN / 2, k = 0; x < w; x += SPAN, k++) {
                    bulbs += '<g class="bulb bulb-' + (k % 4) + '" style="--i:' + k + '">' +
                        '<rect x="' + (x - 2.1) + '" y="0.5" width="4.2" height="3.6" rx="1" class="bulb-cap"/>' +
                        '<ellipse cx="' + x + '" cy="9.6" rx="4" ry="5.8"/></g>';
                }
                strand.innerHTML = '<svg width="' + w + '" height="' + H + '" viewBox="0 0 ' + w + ' ' + H + '">' +
                    '<path class="wire" d="M0,0.75 H' + w + '"/>' + bulbs + '</svg>';
            };
            draw();
            let resizeTimer;
            window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(draw, 200); });
            nav.appendChild(strand);
            root.classList.add('has-lights');
        }

        // ---------- Favicon (ornament on a dark tile, in the accent colour) ----------
        const faviconArt = ORNAMENTS[theme.icon || theme.ornament];
        if (faviconArt) {
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
                '<rect width="24" height="24" rx="6" fill="#141414"/>' +
                '<g transform="translate(2.4 2.4) scale(0.8)" fill="none" stroke="' + accent + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
                faviconArt + '</g></svg>';
            const icon = document.createElement('link');
            icon.rel = 'icon';
            icon.type = 'image/svg+xml';
            icon.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
            document.head.appendChild(icon);
        }

        // ---------- Visitor control: hide animated decorations (remembered per device) ----------
        function addDecorToggle() {
            const KEY = 'mv_decor_hidden';
            const root = document.documentElement;
            const read = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
            const write = hidden => { try { localStorage.setItem(KEY, hidden ? '1' : '0'); } catch (e) { /* storage unavailable */ } };

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'theme-toggle';
            const render = hidden => {
                root.classList.toggle('decor-hidden', hidden);
                btn.setAttribute('aria-pressed', String(hidden));
                btn.setAttribute('aria-label', hidden ? 'Show seasonal decorations' : 'Hide seasonal decorations');
                btn.title = btn.getAttribute('aria-label');
                btn.innerHTML = '<i class="fas ' + (hidden ? 'fa-wand-magic-sparkles' : 'fa-eye-slash') + '" aria-hidden="true"></i>';
            };
            btn.addEventListener('click', () => {
                const hidden = !root.classList.contains('decor-hidden');
                write(hidden);
                render(hidden);
            });
            render(read());
            document.body.appendChild(btn);
            root.classList.add('has-decor-toggle');
        }
    }
})();
