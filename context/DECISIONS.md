# context/DECISIONS.md — Architecture Decision Records

Cada entrada documenta una decisión ya tomada e implementada en el código.

---

## ADR-UI-001: Token JWT en localStorage

**Estado:** Activo

**Qué se decidió:**
El token JWT de acceso se guarda en `localStorage` bajo la clave `'token'`. El objeto de usuario se guarda serializado en `localStorage` bajo `'user'`. `AuthContext` los lee al montar para restaurar la sesión.

**Por qué:**
La app es una SPA sin un servidor propio que pueda setear cookies httpOnly. Guardar el token en memoria (estado React) forzaría al usuario a re-autenticarse en cada recarga. `localStorage` es el trade-off estándar para SPAs sin BFF (Backend For Frontend).

**Consecuencia directa:**
- El token es susceptible a XSS. Mitigación: no se ejecuta código de terceros no auditado, y la API tiene rate limiting en endpoints sensibles.
- El interceptor en `api.js` lee el token en cada request — no se necesita pasar el token manualmente a ningún componente.
- El logout limpia `localStorage` y resetea el estado de `AuthContext`.

**Archivos clave:** `src/context/AuthContext.jsx`, `src/services/api.js`.

---

## ADR-UI-002: Axios con interceptores centralizados en api.js

**Estado:** Activo

**Qué se decidió:**
Toda comunicación con el backend usa la instancia `api` exportada desde `src/services/api.js` — un `axios.create()` con `baseURL = VITE_API_URL`. Dos interceptores globales:
1. **Request**: inyecta `Authorization: Bearer <token>` si existe token en localStorage.
2. **Response**: en error 401, limpia localStorage y redirige a `/login`.

**Por qué:**
Evita duplicar la lógica de autenticación en cada componente. Cualquier llamada que haga `api.get/post/put/delete` ya tiene el header JWT y el manejo de sesión expirada sin código extra.

**Consecuencia directa:**
- Nunca usar `fetch()` directo ni crear instancias `axios` locales.
- El redirect 401 es automático — no agregar `catch(401)` en páginas individuales.

**Archivos clave:** `src/services/api.js`.

---

## ADR-UI-003: i18n con LanguageContext — traducciones embebidas en el bundle

**Estado:** Activo

**Qué se decidió:**
Las traducciones ES y EN están en un objeto JS plano dentro de `src/context/LanguageContext.jsx`. El hook `useLanguage()` expone `t(key)` para obtener el string en el idioma activo, y `locale` (e.g. `'es-MX'`) para formato de fechas/números. El idioma se guarda en el estado de React (reset en cada recarga — no persiste en localStorage deliberadamente).

**Por qué:**
Para la escala actual (una SPA con ~200 keys), cargar archivos JSON externos añadiría complejidad sin beneficio visible. Al estar embebidas en el bundle no hay requests extras ni flash de contenido sin traducir.

**Alternativas descartadas:**
- `react-i18next` — overhead de setup y dependencia extra para el volumen actual de texto.
- Archivos JSON externos (`/public/locales/es.json`) — requiere un loader o fetcher asíncrono.

**Consecuencia directa:**
- Cada key nueva debe agregarse en **ambos idiomas** (ES y EN) en el mismo commit.
- Borrar una key rompe silenciosamente cualquier `t('key')` que la use — retorna `'key'` como fallback.

**Archivos clave:** `src/context/LanguageContext.jsx`.

---

## ADR-UI-004: Drag & drop de preguntas con @dnd-kit

**Estado:** Activo

**Qué se decidió:**
El reordenamiento de preguntas en `CreateEvent` y `EditEvent` usa `@dnd-kit/core` + `@dnd-kit/sortable`. Cada fila de pregunta es un `SortableQuestionRow` con un handle de arrastre. El orden final se envía al backend en el `PUT /events/:id/questions` con el array ordenado.

**Por qué:**
`react-beautiful-dnd` está deprecada. `@dnd-kit` es su sucesor natural con mejor soporte para touch (mobile), accesibilidad, y no necesita portales CSS extras. La implementación con `SortableContext` y `arrayMove` es directa y legible.

**Consecuencia directa:**
- El id de drag interno usa `_dndId` (string, no el `id` entero del backend) para evitar conflictos con preguntas nuevas aún no guardadas.
- No mezclar el id de DnD con el id de la pregunta en el backend.

**Archivos clave:** `src/pages/CreateEvent.jsx`, `src/pages/EditEvent.jsx`.

---

## ADR-UI-005: Tipos de pregunta fijos alineados con el backend

**Estado:** Activo

**Qué se decidió:**
Los cuatro tipos de pregunta válidos son `'open'`, `'multiple'`, `'numeric'`, `'date'`. Están hardcodeados como constante `QUESTION_TYPES` en `CreateEvent` y `EditEvent`. El backend analiza cada tipo de forma diferente — `open` va a NLP+GPT, el resto a StatsAnalyst.

**Por qué:**
El frontend no puede inventar tipos porque el backend tiene lógica de despacho explícita por tipo (ver ADR-007 en pooly-core). Un tipo desconocido causaría que las respuestas sean ignoradas silenciosamente en el análisis.

**Consecuencia directa:**
- Agregar un nuevo tipo de pregunta requiere cambio coordinado en frontend + backend.
- La constante `TYPE_ICONS` en CreateEvent/EditEvent mapea cada tipo a un emoji de referencia visual.

**Archivos clave:** `src/pages/CreateEvent.jsx`, `src/pages/EditEvent.jsx`.

---

## ADR-UI-006: Inferencia de tipo de columna en el cliente para importación

**Estado:** Activo

**Qué se decidió:**
`ImportResults.jsx` parsea el archivo CSV/XLSX localmente con `papaparse`/`xlsx` y clasifica cada columna como `open`, `multiple`, `numeric`, o `date` antes de subir al backend. El algoritmo escanea hasta `MAX_ROWS_TO_SCAN = 1000` filas y aplica heurísticas: si hay ≤ 20 valores únicos y son strings cortos → `multiple`; si son todos numéricos → `numeric`; si coinciden patrones de fecha → `date`; si no → `open`.

**Por qué:**
Permite al admin revisar y corregir el tipo de cada columna antes de crear el evento, evitando análisis incorrectos. El backend también valida los tipos, pero la inferencia local mejora la UX.

**Archivos clave:** `src/pages/ImportResults.jsx`.

---

## ADR-UI-007: PublicSurvey sin Navbar para experiencia limpia

**Estado:** Activo

**Qué se decidió:**
La ruta `/encuesta/:publicId` (PublicSurvey) y `/admin/preview` (SurveyPreview) no incluyen `<Navbar />`. Las demás rutas sí llevan navbar.

**Por qué:**
El ciudadano que responde una encuesta no necesita ver la navegación del panel de admin — podría confundirlo. La vista previa debe simular lo que verá el ciudadano, por lo que tampoco lleva navbar.

**Archivos clave:** `src/App.jsx`.

---

## ADR-UI-008: Fallback con datos mock en AdminDashboard ante error de API

**Estado:** Activo

**Qué se decidió:**
`AdminDashboard` tiene datos de fallback en el `catch` del `useEffect` de carga de eventos. Si la API falla, muestra 2 eventos de ejemplo (`Movilidad Urbana 2026`, `Feedback asistentes Summit Norte`) para que la UI no quede vacía durante desarrollo sin backend.

**Por qué:**
Facilita el desarrollo del frontend sin depender del backend disponible. No afecta producción porque en producción la API está disponible.

**Consecuencia directa:**
- El fallback puede confundir si se ve en producción — indica que la API está caída o que `VITE_API_URL` apunta al lugar equivocado.

**Archivos clave:** `src/pages/AdminDashboard.jsx`.
