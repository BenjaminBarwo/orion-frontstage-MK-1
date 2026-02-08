---
phase: 01-project-foundation
plan: 01
subsystem: infra
tags: [expo, typescript, eas-build, github-actions, sentry, environment-variables]

# Dependency graph
requires:
  - phase: none
    provides: "Initial Expo project scaffold"
provides:
  - "TypeScript-native Expo configuration with environment variable support"
  - "EAS Build profiles for development, preview, and production"
  - "CI/CD pipeline for automated iOS TestFlight deployment"
  - "Type-safe runtime access to environment variables"
  - "Sentry integration plugin configuration"
affects: [02-authentication, 03-database, 04-error-monitoring, 05-analytics]

# Tech tracking
tech-stack:
  added: [@sentry/react-native]
  patterns:
    - "Environment variables flow: .env.local → app.config.ts extra → Constants.expoConfig.extra → constants/config.ts exports"
    - "Build variant configuration via APP_VARIANT env var"
    - "Development-mode validation with console.warn for missing env vars"

key-files:
  created:
    - app.config.ts
    - constants/config.ts
    - eas.json
    - .env.example
    - .github/workflows/eas-build.yml
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Use TypeScript for Expo config (app.config.ts) for type safety and dynamic env var access"
  - "Sentry plugin configured at build time (requires SENTRY_ORG and SENTRY_PROJECT env vars)"
  - "Three build profiles: development (simulator), preview (device), production (TestFlight)"
  - "Validation warns in development but does not throw to allow service-by-service setup"

patterns-established:
  - "Environment variable naming: EXPO_PUBLIC_ for client-safe, plain names for build-time only"
  - "Secrets management: .env.local for local dev, EAS Secrets for build-time, GitHub Secrets for CI/CD"
  - "APP_VARIANT determines app name: MVR (Dev) vs MVR for production"

# Metrics
duration: 2m 9s
completed: 2026-02-08
---

# Phase 01 Plan 01: Build Infrastructure & Configuration Summary

**TypeScript-native Expo configuration with environment variable mapping, EAS Build profiles (dev/preview/prod), and automated TestFlight CI/CD pipeline**

## Performance

- **Duration:** 2m 9s
- **Started:** 2026-02-08T21:50:14Z
- **Completed:** 2026-02-08T21:52:23Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Migrated from static app.json to TypeScript app.config.ts with full environment variable support
- Created type-safe runtime config access via constants/config.ts with development-mode validation
- Established three EAS Build profiles with proper distribution and variant configuration
- Set up GitHub Actions workflow for automated iOS TestFlight deployment
- Documented all required environment variables with sourcing instructions in .env.example

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate app.json to app.config.ts and create constants/config.ts** - `7686d0b` (feat)
2. **Task 2: Create EAS Build profiles, environment template, and CI/CD workflow** - `723c92b` (chore)

## Files Created/Modified
- `app.config.ts` - TypeScript Expo configuration with environment variable mapping via extra field
- `constants/config.ts` - Type-safe runtime access to Supabase, Sentry, and PostHog environment variables
- `eas.json` - Build profiles for development (simulator), preview (internal), and production (TestFlight)
- `.env.example` - Template documenting all required environment variables with sourcing instructions
- `.github/workflows/eas-build.yml` - CI/CD pipeline triggering on push to main and workflow_dispatch
- `package.json` / `package-lock.json` - Added @sentry/react-native dependency

## Decisions Made

- **TypeScript config migration**: Chose app.config.ts over static app.json to enable dynamic environment variable access and type safety
- **Sentry plugin integration**: Added Sentry plugin to app.config.ts requiring SENTRY_ORG and SENTRY_PROJECT at build time
- **APP_VARIANT naming**: App displays as "MVR (Dev)" in development/preview, "MVR" in production based on APP_VARIANT env var
- **Validation strategy**: Development-mode warnings instead of throwing errors to allow incremental service setup
- **Manual workflow dispatch**: Included workflow_dispatch trigger to support manual builds during early development (EAS free tier limits consideration)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing @sentry/react-native package**
- **Found during:** Task 1 verification (npx expo config)
- **Issue:** Sentry plugin reference in app.config.ts failed to resolve - package not installed
- **Fix:** Ran `npm install @sentry/react-native` to install required dependency
- **Files modified:** package.json, package-lock.json
- **Verification:** `npx expo config --type public` ran successfully with Sentry plugin resolved
- **Committed in:** 7686d0b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Package installation was required to unblock config verification. No scope changes.

## Issues Encountered

None - plan executed smoothly after resolving Sentry package dependency.

## User Setup Required

**External services require manual configuration.** Before the app can run with full functionality, users need to:

1. **Expo EAS**: Create Expo account, run `eas init` to get EAS_PROJECT_ID
2. **Supabase**: Create project, get EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
3. **Sentry**: Create React Native project, get DSN, org slug, project slug, and auth token
4. **PostHog**: Create project, get EXPO_PUBLIC_POSTHOG_API_KEY
5. **GitHub**: Add EXPO_TOKEN and all EXPO_PUBLIC_ variables as repository secrets for CI/CD

All environment variables are documented in `.env.example` with sourcing instructions.

The app will run without these configured (development mode shows warnings), but services will not function until credentials are added.

## Next Phase Readiness

**Ready for next phases:**
- Environment variable infrastructure in place for Supabase, Sentry, and PostHog integrations
- EAS Build profiles ready for testing and deployment
- CI/CD pipeline configured (requires GitHub Secrets to activate)

**Blockers/concerns:**
- None - foundational infrastructure is complete

**Next recommended phases:**
- Phase 01 Plan 02: Supabase integration (auth, database, storage)
- Phase 01 Plan 03: Error monitoring with Sentry
- Phase 01 Plan 04: Analytics with PostHog

---
*Phase: 01-project-foundation*
*Completed: 2026-02-08*
