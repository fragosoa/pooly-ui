# Pooly Design System

> **Voice-of-Customer for e-commerce.** Ask your customers an open question, and get actionable insights in under 5 minutes — themes, sentiment, urgency, and a recommended action. No spreadsheets, no analysts, no reading every reply.

This project is the design system for **Pooly.mx** following its **2026 reposition** from a *civic-participation* tool (the former "Civic Trust" system) to an **e-commerce customer-feedback** product. The underlying product (open questions → NLP + GPT-4o → themes/sentiment/urgency/recommendation) is unchanged; **who we talk to and how we look** changed.

---

## What Pooly does

A brand drops a Pooly question at a moment in the customer journey (post-purchase, post-delivery, return/cancellation, support, product validation). The shopper answers in their own words, on mobile, in seconds, without creating an account. Pooly's AI turns the raw open responses into:

- **Themes** — what customers keep bringing up, grouped automatically.
- **Sentiment** — positive / neutral / negative per theme.
- **Urgency** — high / medium / low, so you know what to fix first.
- **A recommended action** — not just a dashboard, an actual next step.

**Tagline:** *"Escucha las voces de tus clientes y obtén insights en menos de 5 minutos."*

**ICP:** DTC / e-commerce brands (Shopify, VTEX, WooCommerce, Mercado Libre) from independent stores to mid-market with a CX team. Buyers/users are store owners, CX teams, and growth/marketing — **not** data scientists, **not** enterprise.

**Positioning wedge:** *"open question + AI analysis in under 5 minutes."* Typeform/Forms collect but don't analyze; Yotpo/Trustpilot are review-marketing; Qualtrics/Medallia need a team and an enterprise budget. Pooly gives qualitative insight in minutes, at SMB pricing.

---

## Two surfaces

| Surface | Who sees it | Character |
|---|---|---|
| **App (admin)** | Store owners, CX / growth teams | Dense, confident, data-forward. Dashboard, survey builder, AI report. |
| **Public response screen** | The shopper answering | Light, warm, mobile-first, chat-style. The most-seen face of Pooly. |

---

## Sources this system was built from

Built by reading the live front-end codebase, then applying the rebrand brief.

- **GitHub — front-end (ground truth):** https://github.com/fragosoa/pooly-ui (branch `develop`)
  - Color & shape tokens lifted from `src/styles/index.css` and `src/styles/landing.css`.
  - Components & screens read from `src/pages/*`, `src/components/*`, `src/layout/Navbar.jsx`.
- **GitHub — backend (context only):** https://github.com/fragosoa/pooly-core
- **Rebrand brief:** "Pooly — Identidad de Marca (Reposicionamiento a E-commerce)" + `BRAND_COLORS.md` snapshot of the pre-rebrand palette.

> Explore the `pooly-ui` repo to build higher-fidelity designs — the live screens, copy, and interaction details are all there.

**What carried over from the old system:** the product's analysis architecture; **brand blue** `#2563EB` as the trust anchor; **Nunito Sans**; the colored **badge/label pattern** for status (now mapped to order status, complaint urgency, review sentiment); the **flat, low-shadow** philosophy.

**What changed:** vocabulary (civic → commercial); imagery (office/government → product/packaging/mobile); a new **action-blue** (deep blue, `--action: #1D4ED8`) for conversion; **moderate corner radius** (8–12px) replacing the old `border-radius: 0`; the public screen reframed from "citizen participating" to "shopper giving quick feedback".

---

## CONTENT FUNDAMENTALS

How Pooly writes.

**Language.** Primary language is **Spanish (Mexico)**. Marketing headlines may pair a Spanish lead with an English-loanword vocabulary the e-commerce world already uses (insights, CX, growth, NPS). Keep Spanish accents correct in new copy (the legacy codebase often omitted them — do not copy that).

**Person & address.** Talk **to the brand as "tú"** — direct, second person: *"Escucha las voces de tus clientes"*, *"Pregúntale a tus clientes"*. Pooly refers to itself by name, not "we/nosotros". The shopper answering is *"tú"* too, but warmer and lighter.

**Vocabulary shift (this is the core of the rebrand voice):**

| Don't say (civic) | Say (commercial) |
|---|---|
| Ciudadanos | Clientes / Compradores |
| Funcionarios públicos | Tu equipo / Dueños de tienda / Marcas |
| Participación ciudadana | Voz del cliente |
| Encuesta pública | Pregunta post-compra / Encuesta a tus clientes |

**Tone.** Fast, direct, business-minded, modern, warm-commercial — *trust + speed + action*. It is **not** corporate-stiff, slow, academic, or technically intimidating. Think Klaviyo / Gorgias / Shopify, **not** Qualtrics. It stays serious (it handles real customer data) but gains commercial energy and warmth. Never "playful/cutesy".

**Copy rules.**
- Frame everything in **business terms** (ventas, retención, devoluciones, conversión) — never "NLP analysis" or "research".
- Avoid the cold word *"encuesta"* when you can name the **moment**: *"pregunta post-compra"*, *"feedback de devoluciones"*.
- **Lead with time and outcome:** *"en menos de 5 minutos"*, *"sin leer cada respuesta"*, *"insights, no datos crudos"*.
- Supporting lines in play: *"De respuestas abiertas a decisiones de negocio."* · *"Sin hojas de cálculo. Sin analistas. Solo insights."*

**Casing.** Sentence case for headings and buttons (*"Crea tu primera encuesta"*, not Title Case). UPPERCASE only for tiny eyebrows / table headers / status labels, always with wide letter-spacing (`--tracking-wider`). Numbers and time are emphasized ("**5 min**", "**1,200** respuestas").

**Emoji.** **No emoji in product UI or marketing copy.** The legacy app used emoji as icons (tips panel, modals) — the rebrand replaces those with a real SVG icon set (see Iconography). Stars (★) appear only as a rating glyph, drawn as icons, not emoji.

---

## VISUAL FOUNDATIONS

The feel: **modern commercial software that still looks trustworthy.** Flat, clean, generous whitespace, two confident color anchors, friendly rounded geometry.

**Color.** Two anchors do the heavy lifting:
- **Brand blue `#2563EB`** — trust, the Pooly mark, navigation, links, focus rings, data accents (chart bars, selected states).
- **Action blue `#1D4ED8`** — commercial energy, one step deeper than brand blue, reserved for **conversion moments**: the primary CTA, "Start free", pricing buttons, the signup nudge. Used sparingly so it stays loud. (Retuned 2026-07 from the earlier orange `#F97316` — the `--orange-*` palette remains only as legacy vars.)
- Functional palette is carried straight over and re-mapped to commerce: **green** = positive / active / in-stock / completed; **red** = negative / high urgency / churn; **amber** = medium urgency / closing soon; **indigo** = neutral metric / "online" source; **purple** = preview / paused / promo. Grays are a Tailwind-derived neutral ramp (`--gray-50…950`).
- App canvas is `--gray-50` (#F9FAFB); cards are white; dark bands (footer, stats, pricing) use `--gray-900`/`#0B1220`.

**Type.** Nunito Sans throughout. Headlines **800 weight** with tight tracking (`-0.02em`) for density and commercial punch; body **400** at 1.5–1.7 line-height; tiny eyebrows/labels are **700 uppercase** with `0.1em` tracking. Marketing hero uses `clamp()` up to 56px. There is no separate display/serif face — weight and tracking carry the hierarchy.

**Shape & radius.** The defining rebrand move: **corners are now rounded.** Controls and badges at **8px** (`--radius-md`), cards/panels/modals at **12px** (`--radius-lg`), feature/hero panels at **16px**, status chips and pills fully rounded. Circles remain for avatars, status dots, spinners, icon bubbles. The old global `border-radius: 0` is gone.

**Cards.** White background, `1px solid --border` (#E5E7EB), `--radius-lg`, padding 24px, `--shadow-sm`. On hover they lift with `--shadow-md` and the border tints to brand blue — a consistent interaction across event cards, feature cards, stat cards, report cards. No colored left-border accents (a legacy pattern we drop).

**Shadows.** Subtle and flat — a five-step ramp from `--shadow-xs` to `--shadow-xl`. Default elevation is barely there (`0 1px 4px rgba(16,24,40,.06)`); the system never goes skeuomorphic. Conversion CTAs may carry a soft tinted glow (`--shadow-action`).

**Borders & dividers.** Hairline `1px` `--border` everywhere; `2px` brand-blue underline marks the active tab; inputs use `1px` border that becomes brand-blue with a 3px soft-blue focus ring (`--ring`). Dashed `1.5px` borders mark dropzones/empty states.

**Backgrounds.** No photographic hero in the system itself — legacy imagery was office/government and is dropped. Surfaces are solid color. The one sanctioned texture is a subtle diagonal hatch placeholder for "image goes here" slots. **No heavy gradients** — the only gradients are a near-white tint on the dashboard entry card and the dark-band fills. Imagery, when added, should be **e-commerce: product, packaging/shipping, mobile checkout, support chats, real reviews** — warm, bright, real; not cold 3D renders.

**Motion.** Quick and functional. `0.2s` standard transitions on color/background/border/shadow; `0.15s` on transform. Hover = small `translateY(-1px)` lift + shadow; **press = scale(0.95–0.97)** on FABs/buttons. Spinners rotate; running states pulse opacity; chat options and report cards fade-in (`pooly-fade-in`); marketing sections fade-up on scroll (`0.6s`). No bounce, no parallax, no long easing.

**Hover / press states.**
- Primary button: background darkens (`--brand` → `--brand-hover`).
- Action button: `--action` → `--action-hover`, optional lift.
- Ghost/secondary: fill with `--surface-alt`, or border + text tint to brand.
- Cards/links: border → brand, shadow up one step.
- Press: brief `scale` down.

**Transparency & blur.** Minimal. Modal overlay is `rgba(0,0,0,0.5)` (no blur). Preview/promo banners use white-on-color at `~0.15–0.2` alpha for chips. No glassmorphism.

**Layout rules.** Marketing max-width 1160px; app max-width 1200px; 24px gutters. Sticky navbar (z-200) and sticky survey header. Two-column app layouts (form + sticky tips sidebar; content + sticky rail). A mobile FAB replaces the inline "create" button under 640px. Section rhythm on marketing is 96px vertical.

---

## ICONOGRAPHY

**Approach.** The rebrand **replaces emoji-as-icons** (the legacy app used 🎯💡✨ etc. in tips panels and modals) with a single coherent **line-icon set: [Lucide](https://lucide.dev)** — loaded from CDN. Lucide is chosen because the existing codebase already hand-draws inline SVGs in exactly Lucide's style: **24×24 viewBox, `fill: none`, `stroke: currentColor`, `stroke-width: 2`, round caps/joins** (see the hamburger and event-stat icons in `Navbar.jsx` / `AdminDashboard.jsx`). Lucide matches that weight and feel exactly, so it's a drop-in formalization, not a restyle.

- **Stroke, not fill.** 1.5–2px stroke, rounded line ends, `currentColor` so icons inherit text/brand color.
- **Sizes:** 16px inline with text, 18–20px in buttons/stats, 24px standalone, 48px in feature/empty-state bubbles (icon sits in a soft tinted circle/rounded square — e.g. `--brand-soft` bg + `--brand` icon).
- **Commerce motifs** to prefer where meaningful: `shopping-cart`, `package`, `truck`, `star`, `heart`, `tag`, `message-circle`, `trending-up`, `zap`, `sparkles`. General UI uses the rest of the Lucide set.
- **Unicode glyphs** are allowed only as typographic marks, not icons: `★` rating star, `“ ”` quote marks, `•` bullets, `→` inline arrows.
- **The Pooly mark** (`assets/pooly-mark.png`) is the wordmark glyph — see Brand.

> If a consuming project can't reach the CDN, swap to inline Lucide SVGs (same paths). Don't hand-roll a different icon style and don't reintroduce emoji.

---

## Logo & brand mark

- **Wordmark:** "Pool" in `--text-primary` + a final **"y" in brand blue**, weight 800, tight tracking. No isotype.
- **Mark / favicon:** simplified **"P"** glyph with the blue "y" tail — `assets/pooly-mark.png`.
- A small skewed **"DEMO"** tag (green, clipped-arrow shape) appears beside the wordmark in the live demo build — decorative, not part of the core lockup.

---

## Index — what's in this project

**Foundations & tokens**
- `styles.css` — the single entry point consumers link (an `@import` manifest only).
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `radius-shadow.css`, `motion.css`, `fonts.css`, `base.css`.
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Radius/Shadow, Brand) shown on the Design System tab.

**Components** — 19 primitives, mounted via `window.PoolyDesignSystem_3787fa.<Name>` after loading `_ds_bundle.js`. See each directory's `.prompt.md`.
- `components/icon/` — `Icon` (Lucide wrapper).
- `components/buttons/` — `Button`, `IconButton`.
- `components/forms/` — `Input`, `Textarea`, `FormField`, `ChatOption`.
- `components/data-display/` — `Badge`, `StatusBadge`, `Avatar`, `StatCard`, `ProgressBar`.
- `components/feedback/` — `Alert`, `Modal`, `Spinner`.
- `components/surfaces/` — `Card`, `Tabs`.
- `components/product/` — `ShareLink`, `ReportCard` (the two Pooly-defining composites).

**UI kits** (full-screen recreations, each `{ index.html, *.jsx, README.md }`)
- `ui_kits/admin/` — the Pooly app: dashboard → survey builder → AI report (interactive).
- `ui_kits/public/` — the shopper-facing chat response screen (mobile-first, warm).
- `ui_kits/marketing/` — the e-commerce landing page.

**Meta**
- `SKILL.md` — makes this usable as a downloadable Agent Skill.
- `readme.md` — this file.

---

## CAVEATS / open questions
- **Fonts** load from Google Fonts (`@import` in `tokens/fonts.css`); no self-hosted TTFs are bundled. Tell me if you need them vendored.
- **Imagery:** the legacy feature renders are dark/cyan 3D and clash with the warm e-commerce direction, so they're intentionally not used. Real e-commerce photography (product, packaging, mobile checkout, support) is the recommended fill — point me at brand photos and I'll wire them in.
- **Action color** was retuned (2026-07) from orange `#F97316` to deep blue `#1D4ED8` per brand decision — it's one token (`--action`) if it ever needs to move again.
