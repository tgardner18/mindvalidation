---
name: Mind Validation
description: Evidence-based therapy and mindful yoga for adults in MA, NH, and VT.
colors:
  electric-magenta: "#F30090"
  electric-magenta-deep: "#B8006D"
  voltage-violet: "#504BFD"
  deep-indigo: "#020887"
  seafoam-signal: "#A0DED1"
  noir-canvas: "#222222"
  midnight-ink: "#1a1a2e"
  soft-graphite: "#666666"
  misted-seafoam: "#f5fbfa"
typography:
  display:
    fontFamily: "Tilt Neon, sans-serif"
    fontSize: "clamp(3.1rem, 8vw, 6.8rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.1em"
  headline:
    fontFamily: "Poppins, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 700
    letterSpacing: "0.12em"
rounded:
  pill: "50px"
  card-lg: "30px"
  card: "20px"
  card-sm: "16px"
  badge: "12px"
  input: "10px"
spacing:
  section-v: "6rem"
  section-h: "2rem"
  card: "2.5rem"
  gap-lg: "3rem"
  gap: "2rem"
  gap-sm: "1.5rem"
components:
  button-primary:
    backgroundColor: "#F30090"
    textColor: "#fefefe"
    rounded: "{rounded.pill}"
    padding: "1.2rem 3rem"
  button-primary-hover:
    backgroundColor: "#B8006D"
    textColor: "#fefefe"
    rounded: "{rounded.pill}"
    padding: "1.2rem 3rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "rgba(255,255,255,0.9)"
    rounded: "{rounded.pill}"
    padding: "1.2rem 3rem"
  button-secondary-hover:
    backgroundColor: "rgba(255,255,255,0.12)"
    textColor: "#fefefe"
    rounded: "{rounded.pill}"
    padding: "1.2rem 3rem"
  section-badge:
    backgroundColor: "rgba(252,49,169,0.1)"
    textColor: "#504BFD"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1.5rem"
  credential-badge:
    backgroundColor: "rgba(243,0,144,0.1)"
    textColor: "#F30090"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1rem"
  faq-item:
    backgroundColor: "#fefefe"
    textColor: "#1a1a2e"
    rounded: "{rounded.card}"
    padding: "1.75rem 2rem"
  insurance-pill:
    backgroundColor: "rgba(160,222,209,0.12)"
    textColor: "#A0DED1"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.9rem"
---

# Design System: Mind Validation

## 1. Overview

**Creative North Star: "Charged Canvas"**

Mind Validation's visual system is built on a single premise: neon conviction on a dark field. The site exists as a charged canvas where clinical credibility and kinetic energy coexist without apology. The design does not soften itself to meet a visitor's preconceptions about what a therapy site looks like. It signals, instead, that the work of healing is bold, intentional, and possible. Every element earns its place on the canvas.

The site operates in two distinct registers that are held in deliberate tension. Dark sections (hero, services, yoga) carry the electric charge: aurora blobs, neon glows, high-contrast typography, animated orbs. Light sections (about, certifications, FAQ, location) ground that charge in clinical daylight: white surfaces, Midnight Ink text, Poppins precision. Moving through the page is a physical exhale, from high-voltage entry to trustworthy substance. Visitors arrive through the neon signal and stay because of the credentials.

The system explicitly rejects two failure modes. First, the generic healthcare portal: cold institutional blues, stock-photo warmth, dense legal paragraphs, form-over-feeling. Second, the corporate therapy chain: franchise-polished but anonymous, where any therapist's face could replace Kirby's with no loss. This system is saturated with Kirby's identity; every section bears her name, her credentials, her direct voice.

**Key Characteristics:**
- Two-register page: dark neon sections alternate with white clinical sections
- Full-palette strategy: Electric Magenta (primary charge), Seafoam Signal (calm counterpoint), Voltage Violet (secondary depth)
- Typography contrast: Tilt Neon for display (neon sections only), Poppins for everything else
- Glow-over-shadow elevation: colored glows on dark, gentle ambient lift on light
- Motion is grounding, never playful: AOS entrances, aurora drifts, smooth hover lifts; no bounce, no elastic, no spin

## 2. Colors: The Charged Palette

Two saturated colors carry the visual weight. Pink is the charge; teal is the breath.

### Primary
- **Electric Magenta** (`#F30090` / `oklch(55% 0.30 350)`): The site's defining color. Used on all primary CTAs, the hero title neon glow, service icons, certification dots, the footer rule, and scroll-to-top button. Rare enough in light sections to feel like a signal; pervasive in dark sections where it IS the atmosphere.
- **Electric Magenta Deep** (`#B8006D` / `oklch(43% 0.28 350)`): The gradient terminus for `--gradient-primary`. Appears only as the dark end of linear-gradient(135deg) on buttons, backgrounds, and borders. Never used as a flat fill.

### Secondary
- **Voltage Violet** (`#504BFD` / `oklch(50% 0.28 264)`): Section badge text on light backgrounds. The vibrant start of `--gradient-secondary`. Used on even-numbered certification items to introduce color variety without a third hue.
- **Deep Indigo** (`#020887` / `oklch(18% 0.20 264)`): The deep terminus of `--gradient-secondary`. Never a flat fill; only appears as the dark end of the secondary gradient on certification section even items.

### Tertiary
- **Seafoam Signal** (`#A0DED1` / `oklch(83% 0.07 184)`): The system's cooling agent. Applied to nav active states, step card borders, connector lines, yoga dividers, footer link hovers, and icon accents on dark surfaces. Where Electric Magenta says "act now," Seafoam Signal says "you're safe."

### Neutral
- **Noir Canvas** (`#222222` / `oklch(17% 0.005 265)`): Base dark-section background. Blended with near-black (#000) via gradient for depth.
- **Midnight Ink** (`#1a1a2e` / `oklch(14% 0.03 265)`): Body text and section titles on white surfaces. Not pure black; the subtle blue shift anchors text to the violet/blue secondary palette.
- **Soft Graphite** (`#666666` / `oklch(46% 0.00 0)`): Secondary body text, descriptions, FAQ answers. Reads warm on white; never used on dark surfaces.
- **Misted Seafoam** (`#f5fbfa` / `oklch(97% 0.01 184)`): Location section background only. A barely-there teal tint that signals the transition from FAQ to map.

### Named Rules
**The Rarity Rule.** Electric Magenta is the site's only fully saturated color on light surfaces. On white sections, it appears only as badge text, link color, and credential accents. The moment it covers a full button or background, it signals a primary action. Reserve it or lose it.

**The Two-Glow Rule.** On dark surfaces, only Electric Magenta and Seafoam Signal are permitted as glow sources (text-shadow, box-shadow color). Voltage Violet never glows. Deep Indigo never glows. This keeps the atmosphere readable.

## 3. Typography

**Display Font:** Tilt Neon (Google Fonts, weight 400 only)
**Body Font:** Poppins (Google Fonts, weights 200, 300, 400, 500, 600, 700, 800)

**Character:** Tilt Neon is a decorative neon-sign font used exclusively on the hero title and the yoga "YOGA CLASS" heading. It is not a headline font; it is a prop. Poppins carries everything else, from the thinnest (weight 200) taglines to the heaviest (800) names.

### Hierarchy
- **Display** (weight 400, `clamp(3.1rem, 8vw, 6.8rem)`, line-height 1.5, letter-spacing 0.1em, uppercase): Hero title "Mind Validation" and yoga "YOGA CLASS" heading only. Always rendered with Electric Magenta neon text-shadow stack.
- **Headline** (weight 700, `clamp(2rem, 4vw, 3rem)`, line-height 1.2, letter-spacing -0.01em): Section titles such as "Services and Treatment Types," "Certifications." On light backgrounds, color is Midnight Ink with a 4px Electric Magenta underline rule via `::after`.
- **Title** (weight 700, `clamp(1.5rem, 3vw, 2.5rem)`, line-height 1.3): Hero subhead ("Evidence-Based Support for Mind and Body"), about section tagline. On dark: white. On light: Midnight Ink.
- **Body** (weight 400, 1.05rem, line-height 1.8): Section descriptions, FAQ answers, about intro text. Max line length 65 to 75ch. Color: Soft Graphite on white, rgba(255,255,255,0.8) on dark.
- **Label** (weight 700, 0.85rem, letter-spacing 0.12em, uppercase): Section badge text, footer column headings, credential badge text. All-caps treatment enforced at the CSS level.

### Named Rules
**The Tilt Neon Rule.** Tilt Neon is used only with the neon text-shadow stack (6 layers, Electric Magenta, spreading from 10px to 200px). Rendering Tilt Neon without the glow is prohibited; the font looks unfinished without its signature effect.

**The Weight Contrast Rule.** Within any single text block, maintain at least a 2-step weight jump between heading and body (e.g., 700 heading, 300 or 200 tagline beneath it). Flat weight scales (all 500) are prohibited in the typography hierarchy.

## 4. Elevation

The system uses glow-based elevation on dark surfaces and ambient shadow lift on light surfaces. There are no hard-cast shadows anywhere in the design.

On dark surfaces (hero, services, yoga), depth is created by colored glows radiating from element edges: Electric Magenta glows signal interactive elements (buttons, service cards, certification dots); Seafoam Signal glows signal informational elements (step cards, connectors, nav active states). Elements float over the noir canvas rather than casting shadows onto it.

On light surfaces (about, certifications, FAQ), depth is created by a soft ambient lift: `box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08)` at rest, growing to `0 20px 50px rgba(0, 0, 0, 0.12)` on hover. This register is intentionally quieter; the light sections ground the dark ones.

### Shadow Vocabulary
- **Magenta glow, buttons** (`box-shadow: 0 10px 30px rgba(243,0,144,0.35), 0 0 20px rgba(243,0,144,0.25)`): All primary CTAs at rest. Intensifies on hover.
- **Magenta glow, service cards hover** (`box-shadow: 0 0 30px rgba(243,0,144,0.6), 0 0 60px rgba(243,0,144,0.4), 0 20px 40px rgba(0,0,0,0.3)`): Maximum glow state for dark-section interactive cards.
- **Teal glow, step cards** (`box-shadow: 0 20px 50px rgba(160,222,209,0.2)`): Step cards on hover. Cooler, less urgent than magenta.
- **Ambient lift, light cards** (`box-shadow: 0 10px 40px rgba(0,0,0,0.08)`): Certification content cards, FAQ items. No color.
- **Aurora blur** (`filter: blur(110px)`): Background aurora blobs on hero and yoga sections. Not elevation; atmosphere.

### Named Rules
**The Flat-by-Default Rule.** Glows and shadows appear only as a response to hover or interactive state. Background aurora animations are atmospheric, not elevation. An element at rest that has a permanent glow must be a primary CTA or a decorative accent (yoga benefit cards), not an interactive card.

## 5. Components

### Buttons
Kinetic and confident. Every button either pulses with Electric Magenta or holds a quiet boundary.

- **Shape:** Full pill (50px radius). No square or slightly-rounded buttons in this system.
- **Primary:** Electric Magenta to Deep gradient fill (`linear-gradient(135deg, #F30090, #B8006D)`), white text, padding `1.2rem 3rem`, three-layer magenta glow at rest. The shimmer-wipe hover effect (white fill rising from bottom, `::before` pseudo-element) is the system's signature button interaction.
- **Hover:** Scale 1.03, intensified glow. No color shift, no background change; the shimmer wipe IS the hover response.
- **Secondary / Ghost:** Transparent fill, 2px solid `rgba(255,255,255,0.55)` border, white text. Used only alongside a primary CTA. On hover, border opacity increases to 0.9; scale 1.02.
- **Nav CTA:** Identical to primary but smaller padding (`0.75rem 1.5rem`) and a persistent neon box-shadow. The nav CTA never collapses to a ghost on scroll.

### Chips and Badges
- **Section Badge:** Pink-tinted background (`rgba(252,49,169,0.1)`), Voltage Violet text, 2px solid pink border, pill radius. Uppercase, 0.85rem, 2px letter-spacing. Always appears above a section headline. A thin gradient line extends below via `::after`.
- **Credential Badge:** Light pink tint, Electric Magenta text, pill radius. Used in inline clusters (flex-wrap); designed to scan not read.
- **Insurance Pill:** Seafoam-tinted background, Seafoam Signal text, pill radius. A muted secondary variant for non-CTA labeling.
- **Section Badge on Dark:** Swaps Voltage Violet text for Seafoam Signal text; background becomes `rgba(152,223,210,0.2)`. Do not use Voltage Violet on dark backgrounds; contrast is insufficient.

### Cards
- **Hero Service Boxes (signature component):** Glass dark surface (`rgba(255,255,255,0.05)`) with 25px radius, 3D tilt on mousemove (12deg max rotation via JS), shimmer border animation on hover, inner aurora glow overlay, ghost watermark icon. These are the system's most complex components; do not simplify them in future iterations.
- **Service Cards (dark):** Glass surface, 20px radius, 2px border, shimmer-sweep pseudo-element on hover, scale and rotate (-1deg) lift.
- **Certification Cards (light):** White fill, 20px radius, `0 10px 40px rgba(0,0,0,0.1)` ambient shadow, no glass. **Current violation:** these cards carry a 4px side-stripe border (`border-left` on odd, `border-right` on even). This is prohibited. Replacement: use a top accent line or a background tint to distinguish alternating items.
- **FAQ Items:** White fill, 15px radius, 1px neutral border at rest, magenta border tint on hover. Accordion via max-height transition. The expand icon uses Electric Magenta; active state fills the icon circle with the primary gradient.

### Inputs and Fields
Appear only in the contact modal (dark context).

- **Style:** Dark glass fill (`rgba(255,255,255,0.06)`), 1px white/10% border, 10px radius.
- **Focus:** Border shifts to Electric Magenta, background lightens to `rgba(255,255,255,0.08)`, 3px magenta focus ring (`box-shadow: 0 0 0 3px rgba(243,0,144,0.1)`).
- **Labels:** Uppercase, 0.75rem, 60% white opacity. Spacing tighter than body text.
- **Placeholder:** 25% white opacity. Barely-there; the label does the heavy lifting.

### Navigation
Dark glass, fixed top, full-width.

- **Default:** `rgba(0,0,0,0.3)` with `backdrop-filter: blur(10px)`. Transitions to `rgba(0,0,0,0.5)` on scroll (`.scrolled` class).
- **Links:** `rgba(255,255,255,0.8)` at rest; white on hover with a pink-tinted background pill.
- **Active:** White text, teal-glow background (`rgba(160,222,209,0.2)`), teal text-shadow. Tracks scroll position via JS.
- **CTA Link:** Primary button style, smaller padding, persistent magenta glow. Triggers the contact modal.
- **Mobile:** Slides in from the right as a full-height drawer (`width: 280px`). Links stack vertically with thin dividers.

### Contact Modal (signature component)
The modal is the site's primary conversion point. It uses a dark glass surface (`#1e1e1e`) with a subtle magenta border and a glow box-shadow. The form fields, labels, and submit button follow the Inputs spec above.

**Note:** The modal auto-fires at 35% scroll depth. This crosses the "modal as first thought" threshold from the design laws. Future consideration: replace the auto-fire with a persistent sticky CTA bar at the bottom of dark sections instead, or a slide-in drawer from the bottom.

## 6. Do's and Don'ts

### Do:
- **Do** use Electric Magenta as a glow color on dark surfaces: `text-shadow`, `box-shadow`. It is the site's energy source; let it radiate.
- **Do** alternate dark and light sections in sequence: dark hero, light about, dark services, dark yoga, light certifications, light FAQ, light location, dark footer. This rhythm is intentional.
- **Do** use the neon text-shadow stack (6-layer spread from 10px to 200px) whenever Tilt Neon appears. The font is incomplete without it.
- **Do** use Seafoam Signal for grounding accents on dark surfaces: connector lines, nav active state, icon accents, yoga neon divider. It is the calm counterpoint to Electric Magenta's charge.
- **Do** animate with `ease-out` curves on departures. Cards lift and settle. Nothing bounces.
- **Do** maintain the pill radius (50px) for all buttons and badge-style elements. Square or slightly-rounded buttons break the system's fluidity.
- **Do** keep the section badge pattern: uppercase label, pill shape, gradient underline rule, above the headline. It is the system's primary section entry signal.

### Don't:
- **Don't** use a `border-left` or `border-right` greater than 1px as a colored accent on cards or callouts. The current certification cards and about-section blockquote both violate this. Rewrite with background tints or top accent bars.
- **Don't** use `background-clip: text` with a gradient to color icons or type. The current "What Sets Kirby Apart" section uses gradient text on the icon elements. Replace with a solid Electric Magenta or Seafoam Signal fill.
- **Don't** render Tilt Neon without the neon glow stack. A title in Tilt Neon with no text-shadow looks like a typeface error.
- **Don't** use Voltage Violet or Deep Indigo as glow sources. These colors are too blue to glow on the dark canvas without reading as a different brand.
- **Don't** add new sections to the light register with dark-section components (aurora blobs, neon glows, glass cards). The contrast between registers is the design's emotional rhythm. Contaminating light sections with dark-section elements collapses the rhythm.
- **Don't** make the contact modal fire without user intent. Auto-fire modals break the "motion is grounding" principle. Prefer a persistent CTA element that remains visible without interrupting reading.
- **Don't** produce generic healthcare visual patterns: clinical blues, stock-photo grids, heavy tables of service costs. This site is a brand, not a directory.
- **Don't** produce corporate therapy chain visual patterns: franchise-feel repetition, anonymous stock portraits, interchangeable section layouts. Every section should be identifiably Kirby's.
