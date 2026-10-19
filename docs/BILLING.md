# Subscription UI and local mock

Billing is available at `/admin/settings`, below account information. The API
selects `disabled`, `mock` or `stripe`; there is no separate frontend billing flag.
Plans/prices are loaded from the API, not duplicated in the UI. All strings are
in LanguageContext (ES/EN).

## Run the isolated local environment

From the parent workspace, create PostgreSQL once (Docker Desktop must be running):

```sh
docker run --name pooly-billing-dev \
  -e POSTGRES_USER=pooly -e POSTGRES_PASSWORD=pooly_local_only \
  -e POSTGRES_DB=pooly_billing_dev \
  -p 127.0.0.1:55432:5432 -d postgres:15-alpine
```

On subsequent runs, use `docker start pooly-billing-dev` instead of creating it again.
Start the backend in one terminal:

```sh
pooly-core/.venv/bin/python pooly-core/scripts/run_billing_mock.py
```

Start the UI in another terminal, from `pooly-ui`:

```sh
VITE_API_URL=http://127.0.0.1:8081 npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

Open http://127.0.0.1:5174/login and use either local demo account:

| Email | Scenario |
|---|---|
| billing-new@example.test | New account, no temporary free-access grant |
| billing-existing@example.test | Existing account with temporary free access |

Both local-only passwords: `PoolyMock2026!`. Use the email/password form (not
Google or registration). These accounts exist only in the dedicated local DB.
The API binds to loopback and disables external email/AI/Stripe credentials for
this launcher. No existing `.env` is modified. Restarting the launcher rotates
its JWT signing key, so sign in again afterward.

## Test from Settings → Subscription

1. Choose **Test Starter** (or another plan).
2. Simulate a declined card: no subscription should be created; retry remains available.
3. Reload: the pending checkout is recovered from the API.
4. Abandon payment: choosing another plan becomes possible.
5. Simulate approved payment: the active plan and period appear.
6. Reload: the subscription persists in PostgreSQL.
7. Manage subscription → confirm cancellation: the paid period remains available
   until its end. Cancellation does not immediately remove the subscription.

No card fields appear in mock mode. A mock subscription is never treated as a
real Stripe subscription. The current integration does **not** enforce analysis
quotas or payment requirements; those are the next implementation step.

Real mode redirects to Stripe Checkout and Customer Portal. Returning from
Checkout polls for confirmation for a bounded period and then provides manual
refresh; the redirect itself never grants access. Disabled mode shows a neutral
message. API failures show an explicit retry action, not fabricated billing data.

## Files

- `src/components/BillingSection.jsx`: state, plan selection and subscription controls.
- `src/services/billing.js`: API calls via the shared Axios instance.
- `src/styles/billing.css`: responsive billing layout.
- `src/pages/Settings.jsx`: hosts the billing section.
- `src/context/LanguageContext.jsx`: ES/EN translations.

Backend schema and configuration: `pooly-core/docs/BILLING.md`.

## Verification performed

- Production Vite build succeeds; new billing component/service and Settings pass ESLint.
- LanguageContext's existing `react-refresh/only-export-components` error also
  occurs on the unchanged HEAD version; no new lint error was introduced there.
- Actual browser → Flask API → isolated PostgreSQL verified: login, plans,
  declined payment without activation, pending checkout recovery after reload,
  abandonment, different-plan selection, successful payment, persistent active
  subscription after reload, end-of-period cancellation and temporary-access UI.
- PostgreSQL confirms the test Growth subscription is active with cancellation
  scheduled, plus one abandoned and one completed checkout. The second demo
  account remains unsubscribed and ready for manual testing.
- The default narrow browser viewport displayed the stacked plan layout correctly.
- Billing unit/integration suite: 26 passing tests. Actual Stripe payments and
  analysis quota enforcement are not part of this mock verification.
