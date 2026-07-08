# Handoff: Pooly Design System (rebrand e-commerce 2026)

Instrucciones para Claude Code. Objetivo: implementar el design system de Pooly en el codebase real de front-end (`fragosoa/pooly-ui`, rama `develop`, React + Vite), aplicando el reposicionamiento de herramienta cívica → producto de Voice-of-Customer para e-commerce.

## Overview
Pooly deja preguntas abiertas en momentos del customer journey (post-compra, entrega, devoluciones, soporte) y su IA convierte las respuestas en temas, sentimiento, urgencia y una acción recomendada. Dos superficies: **App admin** (dashboard, survey builder, reporte IA — densa, data-forward) y **pantalla pública de respuesta** (mobile-first, cálida, estilo chat). Este bundle define tokens, 19 componentes primitivos y 3 UI kits de referencia.

## Sobre los archivos de este bundle
**Son referencias de diseño creadas en HTML/JSX**, no código de producción para copiar tal cual. La tarea es **recrear estos diseños en el entorno existente del codebase** (React de `pooly-ui`) usando sus patrones y librerías. Los `.jsx` de `components/` sí son implementaciones fieles y pequeñas — úsalos como spec exacta; adáptalos a las convenciones del repo (imports, naming, CSS strategy) en vez de pegarlos sin cambios.

## Fidelidad
**Alta (hifi).** Colores, tipografía, espaciado, radios, sombras e interacciones son finales. Recrear pixel-perfect.

## Cómo empezar
1. Lee `DESIGN_SYSTEM.md` completo — es la fuente de verdad de fundamentos, voz, iconografía y marca.
2. Importa los tokens: `styles.css` es un manifiesto de `@import` hacia `tokens/*.css`. Migra estas variables CSS al sistema de estilos del repo (reemplazan a `src/styles/index.css` en lo que colisionen — en particular, elimina el `border-radius: 0` global del sistema anterior).
3. Implementa los primitivos de `../components/` (en la raíz del proyecto; cada carpeta tiene `.jsx` + `.d.ts` con props tipadas + `*.prompt.md` con uso).
4. Usa `../ui_kits/` como referencia de pantallas completas: `admin/` (dashboard → builder → reporte), `public/` (respuesta del shopper), `marketing/` (landing).

## Design tokens (resumen — valores exactos en `tokens/`)
- **Anclas:** brand blue `#2563EB` (hover `#1D4ED8`, soft `#DBEAFE`) para confianza/nav/links/focus; action blue `#1D4ED8` (hover `#1E40AF`) SOLO para momentos de conversión (CTA primario, pricing, signup). El naranja fue retirado (2026-07); `--orange-*` queda solo como paleta legacy.
- **Estatus:** success `#059669`, danger `#DC2626`, warning `#D97706`, info `#4F46E5`, special `#7C3AED` — cada uno con su `-soft` (100). Mapeados a estado de orden / urgencia / sentimiento.
- **Neutros:** ramp Tailwind `--gray-50…950` (`#F9FAFB` … `#0B1220`). Canvas de app = gray-50; cards blancas; bandas oscuras = gray-900/950. Border = `#E5E7EB`.
- **Tipografía:** Nunito Sans única familia (Google Fonts, `tokens/fonts.css`). Titulares 800 con tracking `-0.02em`; body 400, line-height 1.5–1.7; eyebrows 700 UPPERCASE tracking `0.1em`. Escala 12→56px.
- **Radios:** 8px controles/badges, 12px cards/paneles/modales, 16px hero panels, pill para chips, círculo para avatares. (Cambio clave del rebrand.)
- **Sombras:** planas y sutiles, xs→xl (`0 1px 2px rgba(16,24,40,.05)` … `0 12px 32px rgba(16,24,40,.14)`); `--shadow-action` para glow de CTA.
- **Espaciado:** grid de 4px; gutter 24px; marketing max 1160px, app max 1200px; ritmo de sección marketing 96px.
- **Motion:** transiciones 0.2s (0.15s en transform), ease `cubic-bezier(0.4,0,0.2,1)`; hover = lift `translateY(-1px)` + sombra; press = `scale(0.95–0.97)`; keyframes `pooly-spin/pulse/fade-in`. Sin bounce ni parallax.

## Componentes (19)
Cada uno con `.d.ts` (contrato de props) y `.jsx` (implementación de referencia):
- `icon/` — `Icon` (wrapper de Lucide; stroke 2, currentColor, 16/20/24/48px).
- `buttons/` — `Button` (variantes brand / action / ghost / secondary), `IconButton`.
- `forms/` — `Input`, `Textarea`, `FormField`, `ChatOption` (opción tipo chat de la pantalla pública).
- `data-display/` — `Badge`, `StatusBadge`, `Avatar`, `StatCard`, `ProgressBar`.
- `feedback/` — `Alert`, `Modal` (overlay `rgba(0,0,0,.5)` sin blur), `Spinner`.
- `surfaces/` — `Card` (blanca, borde 1px `--border`, radius 12, padding 24, hover: borde→brand + shadow-md + lift), `Tabs` (subrayado 2px brand en activa).
- `product/` — `ShareLink`, `ReportCard` (composites propios de Pooly).

## Pantallas de referencia (`ui_kits/`)
- **admin/**: shell con navbar sticky, dashboard de encuestas (stat cards, tabla/lista con StatusBadges), survey builder de dos columnas (formulario + sidebar sticky de tips), reporte IA (temas + sentimiento + urgencia + acción recomendada como ReportCards). FAB móvil <640px reemplaza el botón "crear".
- **public/**: flujo de respuesta del shopper — mobile-first, estilo chat, ChatOptions con fade-in, sin cuenta, cálido.
- **marketing/**: landing e-commerce — hero con `clamp()` hasta 56px, secciones fade-up al scroll, banda oscura de stats/pricing, CTA naranja.
Cada carpeta trae su propio `README.md`.

## Interacciones y comportamiento
- Hover botón primario: brand→brand-hover; action: action→action-hover + lift opcional; ghost: relleno `--surface-alt`.
- Cards/links en hover: borde→brand, sombra +1 paso.
- Focus: borde brand + ring 3px `--brand-soft`.
- Press: scale down breve. Dropzones/empty states: borde dashed 1.5px.
- Sin glassmorphism; gradientes solo en la card de entrada del dashboard y bandas oscuras.

## Reglas de contenido y voz (crítico para copy en UI)
- Español (MX), tuteo directo; vocabulario comercial, nunca cívico (clientes, no ciudadanos; "pregunta post-compra", no "encuesta pública"). Acentos correctos (el legacy los omitía — no copiar eso).
- Sentence case en headings y botones; UPPERCASE solo en eyebrows/labels con tracking amplio.
- **Sin emoji en la UI** — reemplazar los emoji-como-íconos del legacy por Lucide. `★ → •` permitidos solo como glifos tipográficos.

## Assets
- `assets/pooly-mark.png` — marca "P" con cola azul (favicon/mark). Wordmark: "Pool" en `--text-primary` + "y" final en brand blue, peso 800. Iconos: Lucide vía CDN (o SVG inline con los mismos paths si no hay CDN).
- Fotografía: no incluida; debe ser e-commerce real (producto, empaques, checkout móvil) — no renders 3D fríos del legacy.

## Archivos del bundle
- `DESIGN_SYSTEM.md` — documentación completa del sistema (leer primero).
- `styles.css` + `tokens/` — variables CSS (colores, tipografía, espaciado, radio/sombra, motion, fuentes, base).
- `../components/**` (raíz del proyecto) — 19 primitivos (`.jsx` + `.d.ts` + `*.prompt.md`).
- `../ui_kits/{admin,public,marketing}/` (raíz del proyecto) — pantallas completas de referencia con README propio.

> Nota: los componentes y UI kits viven en la raíz del proyecto (no dentro de esta carpeta) para no duplicar el bundle compilado. Descarga el proyecto completo para tener todo junto.
