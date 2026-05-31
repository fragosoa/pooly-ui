# context/AGENT_INSTRUCTIONS.md

Si eres un agente de IA trabajando en este proyecto, lee esto primero.
Complementa las reglas generales de CLAUDE.md con el flujo de trabajo de sesión.

---

## Cómo orientarse al inicio de una sesión

**Siempre hacer en este orden antes de tocar código:**

1. **`git branch`** — confirmar en qué branch estás.
2. **`git log --oneline -10`** — ver qué se hizo recientemente.
3. **`git status`** — ver si hay cambios sin commitear que no sean tuyos.
4. Leer [CLAUDE.md](../CLAUDE.md) — estructura, stack, rutas, convenciones.
5. Leer [context/PROJECT_STATE.md](PROJECT_STATE.md) — qué está hecho, qué falta, bugs activos.
6. Leer [context/DECISIONS.md](DECISIONS.md) — por qué el código está como está antes de cambiarlo.
7. Si vas a tocar un archivo con muchos consumers, consultar [context/DEPENDENCY_GRAPH.md](DEPENDENCY_GRAPH.md).

---

## Cómo cerrar una sesión

Al terminar trabajo significativo, actualizar [context/PROJECT_STATE.md](PROJECT_STATE.md):

- Marcar como ✅ lo que implementaste en la tabla "Qué está implementado".
- Agregar a "Qué falta" cualquier deuda técnica que hayas descubierto.
- Actualizar "Contexto para retomar el trabajo" con el estado actual y el branch.
- Si creaste o modificaste un componente con dependencias relevantes, actualizar [context/DEPENDENCY_GRAPH.md](DEPENDENCY_GRAPH.md).

---

## Qué puede hacer el agente sin preguntar

- Leer cualquier archivo del proyecto.
- Correr `git status`, `git log`, `git diff`.
- Correr `npm run dev` para verificar que el servidor de desarrollo arranca.
- Correr `npm run build` para verificar que el build no tiene errores.
- Editar archivos en `src/` en una rama que no sea `main`.
- Agregar keys de traducción en `LanguageContext.jsx` (siempre en ambos idiomas: ES y EN).

---

## Qué debe mencionar antes de hacer

- **Agregar una dependencia nueva** — mencionar qué se agrega, versión, y por qué no alcanza con lo que ya existe.
- **Crear un archivo nuevo en `src/pages/`** — confirmar que no duplica funcionalidad existente y agregar la ruta en `App.jsx`.
- **Modificar `src/services/api.js`** — es el cliente HTTP compartido por todas las páginas; un error aquí rompe toda la comunicación con el backend.
- **Modificar `src/context/AuthContext.jsx`** — el estado de auth afecta `ProtectedRoute` y todas las páginas del admin.
- **Modificar `src/context/LanguageContext.jsx`** — agregar keys en ambos idiomas siempre; borrar una key rompe cualquier componente que la use con `t('key')`.
- **Cambiar las rutas en `App.jsx`** — las rutas deben estar sincronizadas con el backend si son rutas de recursos.

---

## Qué nunca debe hacer

- **Nunca** hacer `git push` a `main` directamente.
- **Nunca** hardcodear URLs de la API — siempre usar la instancia `api` con `VITE_API_URL`.
- **Nunca** hardcodear el `VITE_GOOGLE_CLIENT_ID` en el código fuente.
- **Nunca** commitear el archivo `.env`.
- **Nunca** usar `fetch()` directo — siempre la instancia `api` de Axios en `src/services/api.js`.
- **Nunca** verificar autenticación manualmente en páginas admin — siempre usar `<ProtectedRoute>` en `App.jsx`.
- **Nunca** agregar lógica de negocio de análisis en el frontend — el análisis corre en el backend (`pooly-core`).
- **Nunca** agregar lógica de redirect 401 en componentes individuales — ya está en el interceptor de `api.js`.
- **Nunca** inventar tipos de pregunta distintos de `'open'`, `'multiple'`, `'numeric'`, `'date'` sin coordinar con backend.

---

## Stack de referencia rápida

```
Entry point:         src/main.jsx           → monta App en #root
Routing:             src/App.jsx            → <Routes> con todas las rutas
HTTP client:         src/services/api.js    → instancia Axios, JWT interceptor
Auth global:         src/context/AuthContext.jsx → user, login(), logout(), loginWithGoogle()
i18n:                src/context/LanguageContext.jsx → t('key'), locale
Rutas protegidas:    src/components/ProtectedRoute.jsx → redirige a /login si !user
Navbar:              src/layout/Navbar.jsx
Drag & drop:         @dnd-kit en CreateEvent.jsx y EditEvent.jsx
Gráficas:            recharts en EventDetails.jsx y TrendsTab.jsx
Exports:             jspdf (PDF) + xlsx (Excel) en EventDetails.jsx
QR code:             qrcode.react en EventDetails.jsx
CSV parse (cliente): papaparse en ImportResults.jsx
```

---

## Flujo completo de una solicitud de análisis (desde el frontend)

```
Admin en EventDetails
  → click "Analizar"
      ↓ POST /events/<eventId>/analyze   [src/services/api.js → pooly-core]
      ↓ recibe { job_id: N }
      ↓ polling con GET /jobs/event/<eventId>  (cada ~3s)
      ↓ cuando status === "COMPLETED":
          → GET /events/<eventId>/reports
          → renderiza reportes en OverviewTab + TrendsTab
```

---

## Flujo de carga de archivo importado

```
Admin en ImportResults
  → sube CSV/XLSX
      ↓ parseFileWithColumns() — analiza localmente con papaparse/xlsx
      ↓ muestra columnas detectadas con tipo inferido (open/multiple/numeric/date)
      ↓ admin ajusta tipos y nombre del evento
      ↓ POST /imports  (multipart: archivo + metadata JSON)
          → backend crea evento + preguntas + respuestas en una transacción
      ↓ redirige a EventDetails del evento creado
```
