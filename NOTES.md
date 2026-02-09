# Session Notes

## 2026-02-08 — Supabase Full Optimization

### What Was Done

1. **Supabase MCP Server** — Created `.mcp.json` at project root with the public Supabase MCP endpoint. Project-scoped, activates on Claude Code restart with OAuth prompt on first use.

2. **Supabase CLI Initialized** — Ran `supabase init` (created `supabase/config.toml`) and linked to cloud project `trwjriwgqsohthsgevmh` via `supabase link`.

3. **Foundation Schema (2 migrations pushed to cloud)**
   - `20260208000001_create_profiles.sql` — `profiles` table with RLS (select all authenticated, update/insert own), auto-create trigger on `auth.users` insert, auto-update `updated_at` trigger.
   - `20260208000002_create_behavioral_events.sql` — Immutable event log for ML/behavioral data. RLS (insert/select own), indexed on `user_id`, `event_type`, `created_at`.

4. **TypeScript Types Generated** — Ran `supabase gen types typescript --linked` to produce `types/supabase.ts` with full `Database` type covering both tables (Row, Insert, Update, Relationships).

5. **Typed Supabase Client** — Updated `lib/supabase.ts` to use `createClient<Database>(...)` for compile-time query safety and IntelliSense.

6. **DB Scripts Added to `package.json`**
   - `db:gen-types` — Regenerate TypeScript types from linked project
   - `db:push` — Push local migrations to cloud
   - `db:reset` — Reset linked database

7. **Gitignore Updated** — Added `supabase/.temp/` (contains access tokens and linked project ref).

### Action Required — RESOLVED (2026-02-08)

> **DB schema ML-readiness optimization — completed.** Migration `20260208000003_optimize_schema_ml_readiness.sql` addressed all items:
>
> - **`profiles`**: `role_category` is now a PostgreSQL enum. `display_name` (varchar 100), `bio` (varchar 1000), `service_area` (varchar 100) have length constraints. New ML-ready columns: `years_experience` (smallint, 0-99), `license_number` (varchar 50), `specializations` (text array).
>
> - **`behavioral_events`**: `event_type` is now a PostgreSQL enum with 28 controlled values across all 12 app phases. `device_platform` is a `device_platform` enum. `event_data` is `NOT NULL` with a CHECK ensuring it's a JSON object. String fields have varchar constraints. Indexes optimized to a composite `(user_id, event_type, created_at)` + standalone `created_at` and `geo_area`.
>
> - **TypeScript**: `types/events.ts` provides discriminated union types with per-event-type data interfaces and a generic `BehavioralEventInsert<T>` for compile-time event_data validation.
>
> - **General**: Schema now produces clean, structured, unambiguous features suitable for ML consumption at scale.

---

## 2026-02-08 — Sentry Full Optimization

### What Was Done

1. **`lib/sentry.ts` — Full configuration overhaul**
   - `reactNavigationIntegration` with `enableTimeToInitialDisplay` for automatic screen performance traces
   - Environment (`development`/`production`) and release (`slug@version`) tagging with `dist` for native build version
   - `profilesSampleRate: 0.1` (prod) for CPU profiling on real devices
   - `enableCaptureFailedRequests` — auto-captures HTTP 4xx/5xx errors
   - `enableAppHangTracking` with 2s threshold — catches frozen UI on iOS
   - `maxBreadcrumbs: 100`, `attachStacktrace: true`, `normalizeDepth: 5`
   - `beforeSend` — strips `Authorization` and `Cookie` headers (PII)
   - `beforeBreadcrumb` — drops noisy `/health` XHR breadcrumbs
   - Helper functions: `captureError()`, `captureMessage()`, `addBreadcrumb()` with typed context (tags, extra, level)
   - `captureSupabaseError()` — auto-tags `supabase.operation` and `supabase.code` for Supabase-specific errors

2. **`components/error-boundary.tsx` — New component**
   - Wraps `Sentry.ErrorBoundary` with a user-friendly fallback ("Something went wrong" + Try Again)
   - Tags captured errors with `boundary: app` for Sentry dashboard filtering

3. **`app/_layout.tsx` — Integration wiring**
   - `Sentry.wrap(RootLayout)` — required HOC for React Native touch/gesture tracking
   - `useNavigationContainerRef` + `registerNavigationContainer` — enables automatic screen transition performance traces
   - `AppErrorBoundary` wrapping the `Stack` navigator

### Still Needed

> **Sentry MCP server** — Add to `.mcp.json` once the app is in production and we're actively triaging errors. Enables querying issues, managing alerts, and triaging directly from Claude. Not needed until there's real error volume to work with. Reference: `https://github.com/getsentry/sentry-mcp`

> **Source map uploads** — Set `SENTRY_AUTH_TOKEN` as an EAS secret (`eas secret:create --name SENTRY_AUTH_TOKEN --value <token>`) before production builds. Without this, production stack traces will be obfuscated.
