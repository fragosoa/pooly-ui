# UI kit — Public response screen

The shopper-facing surface: the screen a customer sees after clicking a Pooly link (post-purchase, post-delivery, return…). This is **the most-seen face of Pooly**, so it's lighter, warmer, and mobile-first — a warm `orange-50` canvas, a narrow centered column, chat-style questions.

Open `index.html`. Single self-contained screen (one file).

## Flow
1. **Intro** — store branding, "3 quick anonymous questions", an orange `action` CTA, trust chips (anónimo · sin crear cuenta).
2. **Questions** — assistant `Bubble` poses one question at a time; open questions use `Textarea chat`, choice questions use `ChatOption`. A `ProgressBar` in the sticky header tracks progress.
3. **Success** — thank-you, reinforcing that the answer reaches the brand and drives real decisions.

## Composition
Uses `Button`, `Textarea`, `ChatOption`, `ProgressBar`, `Avatar`, `Icon` from `window.PoolyDesignSystem_3787fa`. Question content is inline in the file.

> Recreation, not production code.
