# Pooly — Paleta de Colores Actual (era "Civic Trust")

> Snapshot del sistema de color vigente en `pooly-ui` antes del rebrand a e-commerce (2026-06-29). Extraído directamente de `src/styles/index.css` y `src/styles/landing.css`. Úsalo como referencia de "punto de partida", no como restricción — el rebrand puede conservar, ajustar o descartar cualquier valor aquí.

## Tokens core (`src/styles/index.css`)

| Token CSS | Hex | Rol |
|---|---|---|
| `--primary` | `#2563EB` | Azul de marca. CTAs, links, foco, acentos, wordmark |
| `--primary-hover` | `#1D4ED8` | Hover de elementos primary |
| `--primary-light` | `#DBEAFE` | Fondos de chips/iconos, focus rings, estados seleccionados |
| `--secondary` | `#059669` | Verde de éxito / estado "activo" |
| `--secondary-light` | `#D1FAE5` | Fondos de éxito |
| `--error` | `#DC2626` | Errores, peligro, urgencia alta |
| `--error-light` | `#FEE2E2` | Fondos de error/alerta |
| `--bg-primary` | `#F9FAFB` | Lienzo general de la app (gris muy claro) |
| `--bg-secondary` | `#F3F4F6` | Superficies secundarias (filas, hover) |
| `--bg-white` | `#FFFFFF` | Cards, inputs, navbar |
| `--bg-dark` | `#1F2937` | Footer, stats band |
| `--text-primary` | `#111827` | Texto principal |
| `--text-secondary` | `#6B7280` | Texto secundario / descripciones |
| `--text-muted` | `#9CA3AF` | Texto terciario, labels, timestamps |
| `--border` | `#E5E7EB` | Bordes de cards, inputs, divisores |

**Radios y sombras:**
- `--radius` / `--radius-lg`: `0` — todo el sistema usa esquinas a 90° (sin excepciones salvo círculos puros: avatares, dots, spinners).
- `--shadow`: `0 1px 4px rgba(0,0,0,0.06)`
- `--shadow-md`: `0 2px 8px rgba(0,0,0,0.08)`

Es, en esencia, la paleta default de Tailwind (blue-600 / emerald-600 / gray-50…900) reimplementada a mano, sin que el proyecto use Tailwind.

## Colores satélite (hardcodeados, fuera del sistema de tokens)

Usados de forma puntual en componentes específicos — no están declarados como variables CSS, aparecen como literales repetidos:

| Color | Hex (fondo / texto) | Dónde se usa |
|---|---|---|
| Morado | `#f3e8ff` / `#7c3aed` | Banner de "vista previa", badge de encuesta "pausada" |
| Ámbar | `#FEF3C7` / `#D97706` (o `#B45309`) | Urgencia media, estado "por cerrar" |
| Índigo | `#E0E7FF` / `#4F46E5` | Icono de stat "info" en dashboard |
| Verde alterno | `#ecfdf5` / `#047857` | Badge de origen de dato "importado" |
| Azul alterno | `#eff6ff` / `#1d4ed8` | Badge de origen de dato "online" |
| Rojo claro | `#FEE2E2` / `#DC2626` | Estado "urgente" en cards de encuesta |

## Tokens de landing page (`src/styles/landing.css`, sistema paralelo)

Definidos en `oklch()`, con naming distinto al sistema core (deuda de consistencia ya identificada):

| Token | Valor | Rol |
|---|---|---|
| `--lp-accent` | `#2563eb` | Igual que `--primary` |
| `--lp-accent-hover` | `#1d4ed8` | Hover |
| `--lp-accent-light` | `#dbeafe` | Fondos claros |
| `--lp-ink` | `oklch(12% 0.04 265)` | Texto principal (casi negro, matiz azul) |
| `--lp-ink-mid` | `oklch(25% 0.04 265)` | Texto medio |
| `--lp-muted` | `oklch(52% 0.03 265)` | Texto secundario |
| `--lp-border` | `oklch(88% 0.015 265)` | Bordes |
| `--lp-surface` | `#ffffff` | Fondo claro |
| `--lp-surface-tint` | `#f5f5f5` | Fondo secundario |
| `--lp-dark-bg` | `oklch(12% 0.04 265)` | Secciones oscuras (stats, CTA, footer) |
| `--lp-dark-mid` | `oklch(18% 0.04 265)` | Cards sobre fondo oscuro |
| `--lp-dark-border` | `oklch(25% 0.04 265)` | Bordes sobre fondo oscuro |
| `--lp-dark-muted` | `oklch(62% 0.03 265)` | Texto secundario sobre fondo oscuro |

## Tipografía

- **Familia:** Nunito Sans (Google Fonts), pesos 300–800, cargada vía `<link>` en `index.html`.
- **Headlines:** peso 800, `letter-spacing: -0.02em` (densidad y autoridad en títulos grandes).
- **Body:** peso 400, `line-height: 1.5–1.7`.
- Fallback stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.

## Logo

- Wordmark puro, sin isotipo: **"Pool"** en texto oscuro (`--text-primary`) + **"y"** final en azul (`#2563eb`), peso 800.
- Favicon: monograma simplificado de la "P" en azul, 35×35px (`public/pooly_logo.png`).

## Lenguaje visual / shape

- 100% escuadrado (`border-radius: 0`) en botones, cards, inputs, badges, modales.
- Círculos solo para: avatares, dots de estado, spinners, iconos de check/× en opciones de chat.
- Sombras muy sutiles, casi imperceptibles — refuerzan el aspecto "flat", sin profundidad skeumórfica.
- Sin gradientes (excepción puntual: `dashboard-entry-card-accent` con `linear-gradient(135deg, #eff6ff 0%, #ffffff 70%)`).
- Comentario explícito en el código: *"Material Design aesthetic: flat, squared, no gradients"*.

## Patrones de color funcional (semántica actual)

| Significado | Color |
|---|---|
| Activo / éxito / positivo | Verde (`--secondary`) |
| Urgencia alta / error / negativo | Rojo (`--error`) |
| Urgencia media / advertencia | Ámbar |
| Neutral / pausado / finalizado | Gris |
| Acción primaria / foco / marca | Azul (`--primary`) |
| Estado especial (preview, pausado) | Morado |
