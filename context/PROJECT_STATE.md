# context/PROJECT_STATE.md

**Última actualización:** 2026-05-29
**Branch activo:** `feat/KAN-7`
**Branch principal:** `main`
**Deploy:** Vite build → archivos estáticos (servicio externo — verificar configuración actual)
**Backend API:** `https://pooly-core-development.up.railway.app` (producción) / `http://127.0.0.1:8080` (local)

---

## Fase actual del proyecto

**Beta funcional.** El frontend opera end-to-end conectado al backend `pooly-core` en Railway. Las funciones core (creación de encuestas, respuesta pública, análisis NLP, importación CSV/XLSX, exportación, Google OAuth) están implementadas y estables. El trabajo reciente se ha centrado en recomendaciones de acción (OverviewTab), exportación a Excel de respuestas, y mejoras de UX en el flujo de encuestas.

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

---

## Qué falta o está incompleto

| Item | Evidencia | Prioridad estimada |
|---|---|---|
| **Password reset** — no existe flujo de recuperación de contraseña | Auth.jsx tiene link "¿Olvidaste tu contraseña?" sin implementar | Alta |
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
| #32 | `task/KAN-78` | Exportar respuestas a Excel, filtrado por pregunta |
| #30 | `task/KAN-56-additional` | Mejoras flujo encuesta pública (pausa, validaciones opciones múltiples) |
| #29 | `test/dply` | Dashboard: modal confirmación borrar, badge is_paused, botón refresh respuestas |
| #28 | `task/incidence-disruption` | Banner de incidencias de servicio |
| #27 | `task/KAN-56-frontend` | Edit event consistente + mejoras CSS |
| #26 | `task/KAN-53` | Notificaciones en Settings, Google OAuth en Auth |
| #25 | `task/KAN-50` | Registro con validaciones y términos legales |

---

## Contexto para retomar el trabajo

**Branch actual:** `feat/KAN-7` (clean, sin cambios sin commitear a 2026-05-29)

El frontend está en buen estado. Los últimos commits completan las recomendaciones de acción (`ebef9a7`) y el fix de like duplicado (`d13360c`). Las próximas prioridades mencionadas en `TODO.md` son: password reset, page titles, y mejoras al símbolo de análisis IA.
