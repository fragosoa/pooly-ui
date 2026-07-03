---
name: pooly-design
description: Use this skill to generate well-branded interfaces and assets for Pooly (pooly.mx) — the e-commerce voice-of-customer product — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

Pooly is a voice-of-customer tool for e-commerce brands: customers answer one open question, and AI returns themes, sentiment, urgency, and a recommended action in under 5 minutes. The brand was repositioned in 2026 from a civic-participation tool to e-commerce — keep the vocabulary commercial ("clientes" not "ciudadanos"), lead with time/outcome, and never use emoji in UI.

Key files:
- `readme.md` — full design guide: product context, content fundamentals, visual foundations, iconography.
- `styles.css` — the single CSS entry point (link this); pulls in everything under `tokens/`.
- `tokens/` — colors (brand blue `#2563EB` + action orange `#F97316`), type (Nunito Sans), spacing, radius (8–12px), shadow, motion.
- `components/` — reusable React primitives; mount via `window.PoolyDesignSystem_3787fa.<Name>` after loading `_ds_bundle.js`. Read each `.prompt.md`.
- `ui_kits/` — full-screen recreations: `admin/` (app), `public/` (shopper response screen), `marketing/` (landing).
- `guidelines/` — foundation specimen cards.
- `assets/` — the Pooly wordmark/mark.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

Iconography is Lucide (line icons, stroke 2) loaded from CDN — never emoji, never hand-drawn SVG.

If the user invokes this skill without other guidance, ask them what they want to build or design, ask a few questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
