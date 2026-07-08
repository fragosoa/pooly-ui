# UI kit — Pooly admin app

Hi-fi, interactive recreation of the Pooly admin product (the store-owner / CX surface), rebuilt on the rebranded design system. Open `index.html`.

## Flow
- **Dashboard** (`Dashboard.jsx`) — greeting, KPI `StatCard`s, a "suggested action" highlight band, and the list of encuestas with `StatusBadge` (order state) rows. Click a row → event details.
- **Survey builder** (`SurveyBuilder.jsx`) — two-column: form (name, journey-moment template picker, open question, close date) + a sticky tips panel. The journey templates are e-commerce moments (post-compra, devoluciones, soporte…), replacing the old civic survey types.
- **Event details** (`EventDetails.jsx`) — `ShareLink`, then `Tabs`: **Respuestas** (raw answers), **Reporte IA** (empty → click *Analizar con IA* → spinner → `ReportCard` grid with sentiment/urgency/quotes/action), **Estado** (jobs table with `StatusBadge`).

## Composition
Screens compose the published primitives from `window.PoolyDesignSystem_3787fa` (Button, StatCard, StatusBadge, Tabs, Card, ShareLink, ReportCard, Input, Textarea, FormField, Alert, Spinner, Avatar, Icon). Product chrome (navbar, page header, canvas) lives in `AppShell.jsx`. Mock content is in `data.js`.

> Recreation, not production code — interactions are faked client-side.
