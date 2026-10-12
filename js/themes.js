/*
 * Mind Validation — seasonal & holiday theme takeovers.
 *
 * A theme can layer any of:
 *   palette   re-skins the whole site by overriding the colour tokens in css/mind-val-v2.css
 *             (full skin = every role; accent skin = just primary/neon). Must pass checkContrast().
 *   accent    colour for the ornament, message, favicon and toggle when there's no palette
 *   effects   ambient animation (drifting leaves/snow/etc., bats in the hero)
 *   ornament  small neon icon on the hero title (stroke-only SVG paths, 24×24 grid)
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
            '<path d="M9.6 15.1c1.5.5 3.2.2 4.6-.8M8.3 19.2c2.4.7 5 .3 7.2-1.1"/>'
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
            window: y => [day(y, 11, 18), day(y, 11, 26)], // Dec 18 – 26
            effects: [{ type: 'drift', preset: 'snow' }],
            ornament: 'tree',
            lights: true,
            snowman: true,
            message: {
                text: 'The holidays can hold a lot at once. You don\u2019t have to carry it alone.',
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
        if (title && theme.ornament) {
            const ornament = document.createElement('span');
            ornament.className = 'theme-ornament';
            ornament.setAttribute('aria-hidden', 'true');
            ornament.innerHTML = '<svg viewBox="0 0 24 24">' + ORNAMENTS[theme.ornament] + '</svg>';
            title.classList.add('has-ornament');
            title.appendChild(ornament);
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
            const SPAN = 64, H = 26;
            const draw = () => {
                const w = Math.ceil(window.innerWidth / SPAN) * SPAN;
                // The wire is pinned flush to the nav's bottom edge with a small clip at each attachment point
                let wire = 'M0,0.5', bulbs = '', clips = '';
                for (let x = 0, k = 0; x < w; x += SPAN, k++) {
                    wire += ' Q' + (x + SPAN / 2) + ',12 ' + (x + SPAN) + ',0.5';
                    clips += '<rect class="clip" x="' + (x - 1.5) + '" y="0" width="3" height="2.4" rx="0.6"/>';
                    const cx = x + SPAN / 2;
                    bulbs += '<g class="bulb bulb-' + (k % 4) + '" style="--i:' + k + '">' +
                        '<rect x="' + (cx - 1.6) + '" y="5" width="3.2" height="3" rx="0.8" class="bulb-cap"/>' +
                        '<ellipse cx="' + cx + '" cy="12.5" rx="3.2" ry="4.6"/></g>';
                }
                strand.innerHTML = '<svg width="' + w + '" height="' + H + '" viewBox="0 0 ' + w + ' ' + H + '">' +
                    '<path class="wire" d="' + wire + '"/>' + clips + bulbs + '</svg>';
            };
            draw();
            let resizeTimer;
            window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(draw, 200); });
            nav.appendChild(strand);
            root.classList.add('has-lights');
        }

        // ---------- Favicon (ornament on a dark tile, in the accent colour) ----------
        if (theme.ornament) {
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
                '<rect width="24" height="24" rx="6" fill="#141414"/>' +
                '<g transform="translate(2.4 2.4) scale(0.8)" fill="none" stroke="' + accent + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
                ORNAMENTS[theme.ornament] + '</g></svg>';
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
