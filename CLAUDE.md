# CLAUDE.md — Pooly UI / Frontend Web

## Visión del proyecto

**Pooly UI** es el frontend de la plataforma de participación ciudadana Pooly. Es una SPA (Single Page Application) construida con React que permite a funcionarios públicos crear y gestionar encuestas, visualizar reportes de análisis NLP generados por el backend (`pooly-core`), e importar datos históricos desde archivos CSV/XLSX. Los ciudadanos acceden a encuestas públicas sin autenticación vía una URL con `public_id`.

El backend que consume esta UI está en `../pooly-core`. Toda comunicación es vía REST API en `VITE_API_URL`.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Lenguaje | JavaScript (ES Modules) | — |
| Framework UI | React | 19.2.0 |
| Build tool | Vite | 7.x |
| Routing | React Router DOM | 7.12.0 |
| HTTP client | Axios | 1.13.2 |
| Drag & drop | @dnd-kit/core + sortable + utilities | 6.3.1 / 10.0.0 / 3.2.2 |
| Google OAuth | @react-oauth/google | 0.13.5 |
| Gráficas | Recharts | 3.8.1 |
| Toast notifications | react-hot-toast | 2.6.0 |
| Markdown render | react-markdown | 10.1.0 |
| QR code | qrcode.react | 4.2.0 |
| PDF export | jspdf | 4.2.1 |
| Excel export | xlsx | 0.18.5 |
| CSV parse (cliente) | papaparse | 5.5.3 |
| Lint | ESLint | 9.x |
| Deploy | Vite build → archivos estáticos | — |

---

## Estructura de directorios

```
pooly-ui/
│
├── src/
│   ├── main.jsx                    ← Entry point: monta <App /> en el DOM
│   ├── App.jsx                     ← Envoltura de providers + definición de todas las rutas
│   │
│   ├── services/
│   │   └── api.js                  ← Instancia Axios con interceptores JWT y redirect 401
│   │
│   ├── context/
│   │   ├── AuthContext.jsx         ← Estado de autenticación global (user, token, login/logout)
│   │   └── LanguageContext.jsx     ← i18n ES/EN con función t() y hook useLanguage()
│   │
│   ├── layout/
│   │   └── Navbar.jsx              ← Barra de navegación con links condicionales por auth
│   │
│   ├── components/
│   │   ├── DisruptionBanner.jsx    ← Banner temporal de incidencias de servicio
│   │   ├── LanguageSwitcher.jsx    ← Selector ES/EN en Navbar
│   │   ├── MarkdownEditor.jsx      ← Editor de texto para welcome/completion messages
│   │   ├── Modal.jsx               ← Modal genérico reutilizable (confirmar, alertas)
│   │   ├── OverviewTab.jsx         ← Tab "Overview" de EventDetails (reportes NLP + recomendaciones)
│   │   ├── ProtectedRoute.jsx      ← Redirige a /login si no hay usuario autenticado
│   │   ├── RecommendationCard.jsx  ← Tarjeta de acción recomendada (usada en OverviewTab)
│   │   └── TrendsTab.jsx           ← Tab "Tendencias" de EventDetails (gráfica histórica)
│   │
│   ├── pages/
│   │   ├── AdminDashboard.jsx      ← /admin — Lista de encuestas del usuario autenticado
│   │   ├── Auth.jsx                ← /login y /register — Formulario auth + Google OAuth
│   │   ├── CreateEvent.jsx         ← /admin/create — Wizard de creación de encuesta (3 slides)
│   │   ├── EditEvent.jsx           ← /admin/events/:eventId/edit — Edición de encuesta existente
│   │   ├── EventDetails.jsx        ← /admin/events/:eventId — Reportes, análisis, QR, export
│   │   ├── ImportResults.jsx       ← /admin/import — Carga de CSV/XLSX para análisis offline
│   │   ├── PrivacyNotice.jsx       ← /privacy_notice — Texto estático de aviso de privacidad
│   │   ├── PublicGallery.jsx       ← / — Galería pública de encuestas activas
│   │   ├── PublicSurvey.jsx        ← /encuesta/:publicId — Encuesta para ciudadano (sin navbar)
│   │   ├── ResponseSubmission.jsx  ← (interno) Formulario de respuesta público
│   │   ├── Settings.jsx            ← /admin/settings — Preferencias del usuario
│   │   ├── SurveyPreview.jsx       ← /admin/preview — Vista previa de encuesta (sin navbar)
│   │   └── TermsOfUse.jsx          ← /terms_of_use — Texto estático de términos
│   │
│   └── styles/
│       ├── index.css               ← Variables CSS globales + estilos base
│       └── landing.css             ← Estilos de PublicGallery
│
├── index.html                      ← HTML raíz; Vite inyecta el bundle aquí
├── vite.config.js                  ← Config Vite (plugin React)
├── eslint.config.js                ← Config ESLint flat
├── package.json
└── .env                            ← Variables de entorno locales (no commitear)
```

---

## Rutas y pantallas

| Ruta | Componente | Auth | Navbar |
|---|---|---|---|
| `/` | PublicGallery | No | Sí |
| `/login` | Auth | No | Sí |
| `/register` | Auth | No | Sí |
| `/encuesta/:publicId` | PublicSurvey | No | No |
| `/admin` | AdminDashboard | ✅ | Sí |
| `/admin/create` | CreateEvent | ✅ | Sí |
| `/admin/import` | ImportResults | ✅ | Sí |
| `/admin/events/:eventId` | EventDetails | ✅ | Sí |
| `/admin/events/:eventId/edit` | EditEvent | ✅ | Sí |
| `/admin/preview` | SurveyPreview | ✅ | No |
| `/admin/settings` | Settings | ✅ | Sí |
| `/terms_of_use` | TermsOfUse | No | Sí |
| `/privacy_notice` | PrivacyNotice | No | Sí |

---

## Reglas para agentes de IA

### Git & branching

- **Nunca** hacer push directo a `main`.
- Formato de ramas: `feature/KAN-XX`, `bug/KAN-XX`, `task/KAN-XX`.
- Formato de commits: mensajes en inglés, imperativos.
- Verificar el branch actual con `git branch` antes de cualquier cambio.
- Pedir confirmación antes de `git push`, `git merge`, o `git rebase`.

### Código

- **No agregar dependencias** sin documentarlas en `package.json` y justificar por qué no puede cubrirlo una lib existente.
- **No crear archivos de estado global nuevos** sin evaluar si `AuthContext` o `LanguageContext` pueden extenderse. Preferir estado local (`useState`) en páginas cuando el estado es solo local.
- **No duplicar llamadas API**: centralizar en `src/services/api.js`. Nunca usar `fetch()` directo — siempre la instancia `api` de Axios.
- **No hardcodear URLs de la API**: siempre usar la instancia `api` con `baseURL = VITE_API_URL`.
- Toda la internacionalización va en `LanguageContext.jsx` (tanto ES como EN en el mismo archivo). No poner strings de UI directamente en JSX — usar `t('key')`.
- `ProtectedRoute` debe envolver cualquier página que requiera autenticación — no verificar `user` manualmente en los componentes.
- Los tipos de pregunta válidos son: `'open'`, `'multiple'`, `'numeric'`, `'date'`. No inventar nuevos tipos sin coordinarlo con el backend.
- Drag & drop de preguntas usa `@dnd-kit` (no `react-beautiful-dnd` ni HTML5 nativo). Ver `CreateEvent.jsx` y `EditEvent.jsx` como referencia.

### Seguridad

- **Nunca** hardcodear `VITE_GOOGLE_CLIENT_ID` ni ninguna clave en el código fuente.
- **Nunca** commitear el archivo `.env` (está en `.gitignore`).
- El token JWT se guarda en `localStorage` por decisión de diseño (ver ADR-UI-001). No mover a cookie sin discutir.
- El interceptor de respuesta en `api.js` maneja el logout en 401 globalmente — no agregar lógica de 401 en componentes individuales.

---

## Cómo correr localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de entorno
cp .env.example .env  # (o crear manualmente)
# Editar .env con VITE_API_URL y VITE_GOOGLE_CLIENT_ID

# 3. Iniciar servidor de desarrollo
npm run dev
# → http://localhost:5173

# 4. Build para producción
npm run build
# → dist/
```

El backend debe estar corriendo en `VITE_API_URL` (por defecto `http://127.0.0.1:8080`).

---

## Variables de entorno requeridas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API de pooly-core | `http://127.0.0.1:8080` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google OAuth (mismo que en el backend) | `554613...apps.googleusercontent.com` |

> Todas las variables de Vite deben empezar con `VITE_` para ser expuestas al bundle del cliente.

---

## Leer también

- [context/AGENT_INSTRUCTIONS.md](context/AGENT_INSTRUCTIONS.md) — flujo de sesión para agentes
- [context/PROJECT_STATE.md](context/PROJECT_STATE.md) — estado actual del proyecto
- [context/DECISIONS.md](context/DECISIONS.md) — decisiones de arquitectura (ADR)
- [context/DEPENDENCY_GRAPH.md](context/DEPENDENCY_GRAPH.md) — grafo de imports entre archivos
