# context/PROJECT_STATE.md

**Última actualización:** 2026-06-02
**Branch activo:** `task/KAN-85-frontend` (limpio, sin cambios sin commitear)
**Branch principal:** `task/KAN-85-frontend` (de-facto integration branch; `main` y `develop` son más antiguos)
**Deploy:** Vite build → archivos estáticos (servicio externo — verificar configuración actual)
**Backend API:** `https://pooly-core-development.up.railway.app` (producción) / `http://127.0.0.1:8080` (local)

---

## Fase actual del proyecto

**Beta funcional.** El frontend opera end-to-end conectado al backend `pooly-core` en Railway. Desde la última actualización (2026-05-29) se completaron 6 PRs adicionales: mejoras al análisis (OverviewTab con recomendaciones globales, clusters consolidados, tendencias), flujo completo de autenticación vía magic link + password reset (KAN-72), y guardado automático de borradores de encuesta (KAN-87). La próxima tarea activa es KAN-85.

---

## Qué está implementado (a 2026-05-29)

| Módulo | Estado | Commit / PR | Archivos clave |
|---|---|---|---|
| Routing completo (12 rutas) | ✅ Completo | — | `src/App.jsx` |
| Auth context (login, register, logout, Google) | ✅ Completo | PR #26 | `src/context/AuthContext.jsx` |
| Cliente HTTP con interceptores JWT + 401 redirect | ✅ Completo | — | `src/services/api.js` |
| i18n ES/EN con hook t() | ✅ Completo | — | `src/context/LanguageContext.jsx` |
| Navbar con links condicionales | ✅ Completo | — | `src/layout/Navbar.jsx` |
| ProtectedRoute (redirige a /login) | ✅ Completo | — | `src/components/ProtectedRoute.jsx` |
| AdminDashboard — lista de encuestas del usuario | ✅ Completo | PR #29 | `src/pages/AdminDashboard.jsx` |
| AdminDashboard — menú de acciones por tarjeta | ✅ Completo | PR #29 | `src/pages/AdminDashboard.jsx` |
| AdminDashboard — duplicar encuesta | ✅ Completo | `cc4e371` | `src/pages/AdminDashboard.jsx` |
| AdminDashboard — badge is_paused | ✅ Completo | `d2e8a8c` | `src/pages/AdminDashboard.jsx` |
| CreateEvent — wizard 3 slides (info, preguntas, welcome/completion) | ✅ Completo | — | `src/pages/CreateEvent.jsx` |
| CreateEvent — drag & drop de preguntas | ✅ Completo | `7e00f1c` | `src/pages/CreateEvent.jsx` |
| CreateEvent — tipos open/multiple/numeric/date | ✅ Completo | — | `src/pages/CreateEvent.jsx` |
| EditEvent — edición de preguntas existentes | ✅ Completo | PR #27 | `src/pages/EditEvent.jsx` |
| EditEvent — modal de confirmación si hay respuestas | ✅ Completo | `f410f43` | `src/pages/EditEvent.jsx` |
| EventDetails — reportes NLP visualizados | ✅ Completo | — | `src/pages/EventDetails.jsx` |
| EventDetails — tab Overview + Tendencias | ✅ Completo | — | `src/pages/EventDetails.jsx` |
| EventDetails — trigger análisis + polling de job | ✅ Completo | — | `src/pages/EventDetails.jsx` |
| EventDetails — QR code de la encuesta pública | ✅ Completo | — | `src/pages/EventDetails.jsx` |
| EventDetails — exportar a PDF | ✅ Completo | — | `src/pages/EventDetails.jsx` |
| EventDetails — exportar respuestas a Excel | ✅ Completo | `7f44fce`, PR #32 | `src/pages/EventDetails.jsx` |
| EventDetails — filtrar respuestas por pregunta | ✅ Completo | `a5ad649` | `src/pages/EventDetails.jsx` |
| EventDetails — botón refresh respuestas | ✅ Completo | `74e7cb3` | `src/pages/EventDetails.jsx` |
| OverviewTab — recomendaciones de acción | ✅ Completo | `ebef9a7` | `src/components/OverviewTab.jsx` |
| OverviewTab — feedback (like/dislike) en recomendaciones | ✅ Completo | `d13360c` | `src/components/OverviewTab.jsx` |
| TrendsTab — gráfica histórica de sentimiento | ✅ Completo | — | `src/components/TrendsTab.jsx` |
| ImportResults — carga CSV/XLSX + inferencia de tipo de columna | ✅ Completo | — | `src/pages/ImportResults.jsx` |
| PublicGallery — galería de encuestas públicas | ✅ Completo | — | `src/pages/PublicGallery.jsx` |
| PublicSurvey — flujo ciudadano (welcome → preguntas → thank you) | ✅ Completo | PR #30 | `src/pages/PublicSurvey.jsx` |
| PublicSurvey — estado paused (403 / survey_paused) | ✅ Completo | — | `src/pages/PublicSurvey.jsx` |
| SurveyPreview — vista previa de encuesta para el admin | ✅ Completo | `903e831` | `src/pages/SurveyPreview.jsx` |
| Auth — login con email/password | ✅ Completo | — | `src/pages/Auth.jsx` |
| Auth — Google OAuth | ✅ Completo | PR #26 | `src/pages/Auth.jsx` |
| Auth — registro con validación | ✅ Completo | PR #25 | `src/pages/Auth.jsx` |
| Settings — preferencias de notificaciones | ✅ Completo | PR #26 | `src/pages/Settings.jsx` |
| Modal genérico reutilizable | ✅ Completo | `dc2a58c` | `src/components/Modal.jsx` |
| MarkdownEditor — editor para welcome/completion messages | ✅ Completo | — | `src/components/MarkdownEditor.jsx` |
| DisruptionBanner — banner de incidencias | ✅ Completo | PR #28 | `src/components/DisruptionBanner.jsx` |
| TermsOfUse + PrivacyNotice — texto legal | ✅ Completo | — | `src/pages/TermsOfUse.jsx`, `PrivacyNotice.jsx` |
| Preguntas opción múltiple con multi-select | ✅ Completo | `9c47e66` | `src/pages/CreateEvent.jsx`, `PublicSurvey.jsx` |
| OverviewTab — recomendaciones globales (summary) | ✅ Completo | PR #33 (`e818d04`) | `src/components/OverviewTab.jsx` |
| OverviewTab — clusters consolidados + presentación mejorada | ✅ Completo | PR #33 (`082bbd2`, `47e47ff`) | `src/components/OverviewTab.jsx` |
| OverviewTab — preguntas cerradas en análisis de tendencias | ✅ Completo | PR #33 (`391d50a`) | `src/components/TrendsTab.jsx` |
| OverviewTab — badge versión beta | ✅ Completo | PR #33 (`1a929c0`) | varios |
| PDF report — fix generación y texto de recomendaciones | ✅ Completo | PR #34 (`66ccf5b`, `c51494d`) | `src/pages/EventDetails.jsx` |
| Auth — magic link login (email verification) | ✅ Completo | PR #35 (`688770d`) | `src/pages/Auth.jsx` |
| Auth — email authentication como default | ✅ Completo | PR #36 (`eec736d`) | `src/pages/Auth.jsx` |
| Auth — **password reset** vía email | ✅ Completo | PR #37 (`e4256c6`) | `src/pages/Auth.jsx` |
| CreateEvent — guardado automático de borradores | ✅ Completo | PR #38 (`2f8a61e`) | `src/pages/CreateEvent.jsx` |

---

## Qué falta o está incompleto

| Item | Evidencia | Prioridad estimada |
|---|---|---|
| **Page titles** — `<title>` del HTML no cambia por ruta | Sin `useEffect` que actualice `document.title` | Media |
| **Tests** — no hay ningún test (unit, integration, e2e) | Sin jest/vitest config, sin archivos `*.test.*` | Alta |
| **CI/CD** — no hay GitHub Actions de lint/build | Sin `.github/workflows/` | Media |
| **Error boundaries** — sin manejo de errores React a nivel de árbol | Sin `ErrorBoundary` component | Media |
| **Loading states consistentes** — algunos componentes no tienen skeleton/spinner | Variable por página | Baja |
| **Admin panel para promover usuarios** — no existe UI para `is_admin` | El backend lo soporta pero solo via SQL directo | Baja |
| **Password change** — Settings no tiene opción de cambiar contraseña | Mencionado en TODO.md | Media |
| **Historial/comparativos avanzados** — Dashboard pro features | Ver TODO.md (features Andres/roadmap) | Baja |

---

## Decisiones técnicas clave ya tomadas

Ver detalle en [DECISIONS.md](DECISIONS.md). Resumen rápido:

- JWT en localStorage + interceptor Axios global (ADR-UI-001, ADR-UI-002)
- i18n con LanguageContext embebido — no i18next (ADR-UI-003)
- Drag & drop con @dnd-kit (ADR-UI-004)
- 4 tipos de pregunta fijos sincronizados con backend: open/multiple/numeric/date (ADR-UI-005)
- Inferencia de tipo de columna en cliente en ImportResults (ADR-UI-006)
- PublicSurvey y SurveyPreview sin Navbar (ADR-UI-007)
- Fallback mock data en AdminDashboard durante desarrollo (ADR-UI-008)

---

## Historial de PRs mergeados (recientes)

| PR | Rama | Descripción |
|---|---|---|
| #38 | `task/KAN-87` | Guardado automático de borradores de encuesta |
| #37 | `task/KAN-72-frontend-fix2` | Password reset frontend |
| #36 | `task/KAN-72-frontend-fix1` | Email authentication como default |
| #35 | `task/KAN-72-frontend` | Magic link login frontend |
| #34 | `task/KAN-84` | Fix generación PDF, texto recomendaciones, nombres de tabs |
| #33 | `feat/KAN-7` | Recomendaciones globales, clusters consolidados, tendencias, badge beta |
| #32 | `task/KAN-78` | Exportar respuestas a Excel, filtrado por pregunta |
| #30 | `task/KAN-56-additional` | Mejoras flujo encuesta pública (pausa, validaciones opciones múltiples) |
| #29 | `test/dply` | Dashboard: modal confirmación borrar, badge is_paused, botón refresh respuestas |
| #28 | `task/incidence-disruption` | Banner de incidencias de servicio |
| #27 | `task/KAN-56-frontend` | Edit event consistente + mejoras CSS |
| #26 | `task/KAN-53` | Notificaciones en Settings, Google OAuth en Auth |
| #25 | `task/KAN-50` | Registro con validaciones y términos legales |

---

## Contexto para retomar el trabajo

**Branch actual:** `task/KAN-85-frontend` (clean, sin cambios sin commitear a 2026-06-02)

El frontend está en buen estado. Los últimos merges completan el flujo de autenticación vía magic link + password reset (KAN-72) y el guardado automático de borradores (KAN-87). Las próximas prioridades son: page titles dinámicos, dashboard mejorado (top urgencias, scatter, distribución sentimiento), y tests + CI/CD.
