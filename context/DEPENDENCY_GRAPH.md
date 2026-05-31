# context/DEPENDENCY_GRAPH.md

> Construido por lectura directa del código fuente (2026-05-29).
> Una arista A → B significa "A importa B".
> Úsalo para saber dónde buscar cuando debas modificar una parte del sistema.

---

## Archivos hub (más importados — tocar con cuidado)

| Archivo | Importado por | N |
|---|---|---|
| `src/services/api.js` | AdminDashboard, Auth, AuthContext, CreateEvent, EditEvent, EventDetails, ImportResults, PublicGallery, PublicSurvey, ResponseSubmission, Settings, OverviewTab | ~12 |
| `src/context/AuthContext.jsx` | App.jsx, AdminDashboard, Auth, Navbar, ProtectedRoute, Settings | 6 |
| `src/context/LanguageContext.jsx` | App.jsx, AdminDashboard, Auth, CreateEvent, EditEvent, EventDetails, ImportResults, Navbar, PublicSurvey, Settings, OverviewTab, TrendsTab | ~12 |
| `src/components/Modal.jsx` | AdminDashboard, CreateEvent, EditEvent, EventDetails | 4 |
| `src/components/RecommendationCard.jsx` | OverviewTab | 1 |

---

## Entry points (archivos raíz)

- `src/main.jsx` — punto de entrada; monta `<App />` en `#root`; importa `App.jsx` y `styles/index.css`
- `index.html` — HTML raíz; Vite inyecta el script de `main.jsx`

---

## Grafo completo (lista de adyacencia)

### `src/main.jsx`
- → `src/App.jsx`
- → `src/styles/index.css`

### `src/App.jsx`
- → `react-router-dom` — `BrowserRouter`, `Routes`, `Route`
- → `@react-oauth/google` — `GoogleOAuthProvider` (envuelve toda la app)
- → `react-hot-toast` — `Toaster`
- → `src/context/AuthContext.jsx` — `AuthProvider`
- → `src/context/LanguageContext.jsx` — `LanguageProvider`
- → `src/components/ProtectedRoute.jsx`
- → `src/layout/Navbar.jsx`
- → todas las páginas en `src/pages/`

### `src/services/api.js`
- (sin dependencias internas — solo `axios` de terceros)

### `src/context/AuthContext.jsx`
- → `src/services/api.js` — llama `api.post('/login')`, `api.post('/create_user')`, `api.post('/auth/google')`

### `src/context/LanguageContext.jsx`
- (sin dependencias internas — solo React)

---

### `src/layout/Navbar.jsx`
- → `src/context/AuthContext.jsx` — `useAuth()` para mostrar/ocultar links según `user`
- → `src/context/LanguageContext.jsx` — `useLanguage()` para textos
- → `src/components/LanguageSwitcher.jsx`

### `src/components/LanguageSwitcher.jsx`
- → `src/context/LanguageContext.jsx` — `useLanguage()` para cambiar idioma

### `src/components/ProtectedRoute.jsx`
- → `src/context/AuthContext.jsx` — `useAuth()` para verificar `user`
- → `react-router-dom` — `Navigate`

### `src/components/Modal.jsx`
- (sin dependencias internas — solo React)

### `src/components/MarkdownEditor.jsx`
- (sin dependencias internas relevantes — editor de texto simple)

### `src/components/DisruptionBanner.jsx`
- (sin dependencias internas)

### `src/components/RecommendationCard.jsx`
- (sin dependencias internas)

### `src/components/OverviewTab.jsx`
- → `src/components/RecommendationCard.jsx`

### `src/components/TrendsTab.jsx`
- → `recharts` — `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`

---

### `src/pages/AdminDashboard.jsx`
- → `src/services/api.js`
- → `src/context/AuthContext.jsx` — `useAuth()`
- → `src/context/LanguageContext.jsx` — `useLanguage()`
- → `src/components/Modal.jsx`
- → `react-router-dom` — `Link`, `useNavigate`
- → `react-hot-toast` — `toast`

### `src/pages/Auth.jsx`
- → `src/services/api.js` (via AuthContext)
- → `src/context/AuthContext.jsx` — `useAuth()`
- → `src/context/LanguageContext.jsx` — `useLanguage()`
- → `@react-oauth/google` — `GoogleLogin`
- → `react-router-dom` — `Link`, `useNavigate`

### `src/pages/CreateEvent.jsx`
- → `src/services/api.js`
- → `src/context/LanguageContext.jsx` — `useLanguage()`
- → `src/components/Modal.jsx`
- → `src/components/MarkdownEditor.jsx`
- → `@dnd-kit/core` — `DndContext`, `closestCenter`, `PointerSensor`, `useSensor`, `useSensors`
- → `@dnd-kit/sortable` — `SortableContext`, `verticalListSortingStrategy`, `useSortable`, `arrayMove`
- → `@dnd-kit/utilities` — `CSS`
- → `react-router-dom` — `useNavigate`, `Link`
- → `react-hot-toast` — `toast`

### `src/pages/EditEvent.jsx`
- → `src/services/api.js`
- → `src/context/LanguageContext.jsx` — `useLanguage()`
- → `src/components/Modal.jsx`
- → `src/components/MarkdownEditor.jsx`
- → `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- → `react-router-dom` — `useParams`, `useNavigate`, `Link`
- → `react-hot-toast` — `toast`

### `src/pages/EventDetails.jsx`
- → `src/services/api.js`
- → `src/context/LanguageContext.jsx` — `useLanguage()`, `locale`
- → `src/components/Modal.jsx`
- → `src/components/OverviewTab.jsx`
- → `src/components/TrendsTab.jsx`
- → `recharts` — `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`, `Cell`, `PieChart`, `Pie`, `Legend`, `ReferenceLine`
- → `qrcode.react` — `QRCodeSVG`
- → `jspdf` — `jsPDF`
- → `xlsx` — `XLSX`
- → `react-router-dom` — `useParams`, `Link`

### `src/pages/ImportResults.jsx`
- → `src/services/api.js`
- → `src/context/LanguageContext.jsx` — `useLanguage()`
- → `xlsx` — `XLSX` (parse del archivo en cliente)
- → `papaparse` — `Papa` (parse CSV en cliente)
- → `react-router-dom` — `Link`, `useNavigate`

### `src/pages/PublicGallery.jsx`
- → `src/services/api.js`
- → `src/context/LanguageContext.jsx` — `useLanguage()`

### `src/pages/PublicSurvey.jsx`
- → `src/services/api.js`
- → `src/context/LanguageContext.jsx` — `useLanguage()`
- → `react-markdown` — `ReactMarkdown` (render del welcome_message)
- → `react-router-dom` — `useParams`, `Link`

### `src/pages/Settings.jsx`
- → `src/services/api.js`
- → `src/context/AuthContext.jsx` — `useAuth()`, `updateUser()`
- → `src/context/LanguageContext.jsx` — `useLanguage()`

### `src/pages/SurveyPreview.jsx`
- → `src/context/LanguageContext.jsx` — `useLanguage()`

### `src/pages/ResponseSubmission.jsx`
- → `src/services/api.js`
- → `src/context/LanguageContext.jsx` — `useLanguage()`

### `src/pages/TermsOfUse.jsx` / `src/pages/PrivacyNotice.jsx`
- (sin dependencias internas — contenido estático)

---

## Guía de búsqueda rápida

| Si modificas... | Revisa también... |
|---|---|
| `src/services/api.js` | Todas las páginas que llaman `api.*()` — un cambio en `baseURL` o interceptores afecta todo |
| `src/context/AuthContext.jsx` | `ProtectedRoute` (verifica `user`), `Navbar` (muestra links según auth), `Settings` (llama `updateUser`) |
| `src/context/LanguageContext.jsx` | Cualquier componente que use `t('key')` — agregar key nueva en **ambos idiomas** |
| `src/components/Modal.jsx` | `AdminDashboard`, `CreateEvent`, `EditEvent`, `EventDetails` (todos lo usan) |
| `src/components/OverviewTab.jsx` | `EventDetails` (lo instancia), `RecommendationCard` (lo usa OverviewTab) |
| `src/App.jsx` (rutas) | El componente de página correspondiente y `ProtectedRoute` si cambia el auth requirement |
| Tipos de pregunta (`open`, `multiple`, `numeric`, `date`) | `CreateEvent`, `EditEvent`, `PublicSurvey`, `ImportResults`, backend (`pooly-core`) |
| `src/pages/EventDetails.jsx` | `OverviewTab` y `TrendsTab` (son sub-componentes renderizados desde aquí) |
| Formato del reporte JSON del backend | `EventDetails.jsx`, `OverviewTab.jsx`, `TrendsTab.jsx` (todos parsean los reportes) |
