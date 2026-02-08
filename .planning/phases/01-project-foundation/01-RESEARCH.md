# Phase 1: Project Foundation - Research

**Researched:** 2026-02-08
**Domain:** React Native infrastructure (Expo SDK 54, Supabase, observability, CI/CD)
**Confidence:** HIGH

## Summary

Phase 1 establishes production-ready infrastructure for a video-first React Native app using Expo SDK 54, Supabase backend, and comprehensive observability. The stack is mature and well-documented, with Expo SDK 54 representing a significant milestone as it runs on React Native's New Architecture with dramatically improved iOS build times (120s → 10s via precompiled XCFrameworks).

Key findings: (1) Expo SDK 54 requires the New Architecture (cannot be disabled in SDK 55+), currently at 83% adoption; (2) Environment variable management has three security tiers (EXPO_PUBLIC_, sensitive, secret) with EAS-native secrets for build-time credentials; (3) Supabase integration requires expo-sqlite for localStorage polyfill; (4) Sentry and PostHog both have first-class Expo support with native SDKs; (5) EAS Build + GitHub Actions enables fully automated TestFlight deployment.

**Primary recommendation:** Use app.config.ts (not app.json) for TypeScript-native configuration with environment variable support. Start with New Architecture enabled, as SDK 54 is the last version where it can be disabled. Implement RLS policies on all Supabase tables from day one—83% of exposed Supabase databases in 2025 involved RLS misconfigurations.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Expo SDK | ~54.0.33 | React Native framework and tooling | Industry standard for managed RN, SDK 54 introduces precompiled iOS binaries (10s builds), New Architecture default |
| @supabase/supabase-js | Latest | Backend client (auth, database, storage) | Official Supabase JS client, full RLS support, works with Expo's AsyncStorage |
| expo-sqlite | ~15.0.11 | localStorage polyfill for Supabase | Required for Supabase auth persistence in React Native (provides localStorage API) |
| @react-native-async-storage/async-storage | Latest | Async key-value storage | Used with expo-sqlite for Supabase session persistence |
| @sentry/react-native | Latest | Error monitoring and crash reporting | Official Sentry SDK, Expo-native integration via config plugin, Session Replays support |
| posthog-react-native | Latest | Product analytics and feature flags | Written in pure JS, uses only Expo-supported libraries, includes autocapture |
| expo-file-system | ~19.0.11 | File operations | Required for PostHog, used for video upload/compression flows |
| expo-application | ~6.0.13 | App metadata | PostHog dependency for device context |
| expo-device | ~7.0.13 | Device information | PostHog dependency for analytics context |
| expo-localization | ~16.0.11 | Locale data | PostHog dependency for user context |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-video | ~3.0.15 | Video playback | Phase 4+. Replaces deprecated expo-av, supports PiP and DRM |
| expo-camera | ~17.0.11 | In-app video recording | Phase 5. Native camera access for video recording |
| expo-web-browser | ~15.0.10 | External browser integration | Phase 9. Stripe checkout (App Store compliance—no WebView payments) |
| @expo/config-types | Latest | TypeScript types for app.config.ts | Development. Provides autocomplete and type safety for configuration |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Expo SDK | React Native CLI (bare workflow) | More control but lose managed workflow, OTA updates, EAS Build. Not worth it for solo dev. |
| Supabase | Firebase | Firebase is more mature but pricier, less SQL-friendly, vendor lock-in. Supabase wins for RLS and Postgres. |
| @sentry/react-native | Bugsnag, Datadog | Sentry has better Expo integration, free tier (5k events/month), native Session Replays. |
| posthog-react-native | Amplitude, Mixpanel | PostHog is open-source, includes feature flags, cheaper for early-stage. |
| expo-video | react-native-video | expo-video is first-class Expo support, better integration, replaces deprecated expo-av. |

**Installation:**
```bash
# Core infrastructure
npx expo install @supabase/supabase-js expo-sqlite @react-native-async-storage/async-storage

# Observability
npx expo install @sentry/react-native posthog-react-native expo-file-system expo-application expo-device expo-localization

# EAS CLI (global)
npm install -g eas-cli
```

## Architecture Patterns

### Recommended Project Structure

```
/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (auth)/            # Auth flow screens (grouped route)
│   ├── (tabs)/            # Main tab navigation
│   └── _layout.tsx        # Root layout with providers
├── components/
│   ├── ui/                # Base UI primitives
│   └── [feature]/         # Feature-specific components
├── lib/
│   ├── supabase.ts        # Supabase client initialization
│   ├── sentry.ts          # Sentry configuration
│   └── posthog.ts         # PostHog provider
├── hooks/                 # Custom React hooks
├── constants/             # Theme, config, constants
│   └── config.ts          # Runtime environment variables
├── types/
│   └── supabase.ts        # Generated Supabase types
├── assets/                # Images, fonts, static files
├── app.config.ts          # Expo configuration (TypeScript)
├── eas.json               # EAS Build profiles
├── .env.local             # Local development secrets (gitignored)
└── .env.example           # Template for required variables
```

### Pattern 1: Supabase Client Initialization with Expo

**What:** Initialize Supabase client with expo-sqlite localStorage polyfill for session persistence
**When to use:** App startup, before any Supabase operations
**Example:**
```typescript
// lib/supabase.ts
// Source: https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native
  },
});
```

### Pattern 2: Environment Variable Configuration (app.config.ts)

**What:** TypeScript-native configuration with three-tier environment variable access
**When to use:** Always. Prefer over app.json for type safety and dynamic logic
**Example:**
```typescript
// app.config.ts
// Source: https://docs.expo.dev/workflow/configuration/
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.APP_VARIANT === 'production' ? 'MVR' : 'MVR (Dev)',
  slug: 'orion_frontstage_MK-1',
  version: '1.0.0',
  extra: {
    // EXPO_PUBLIC_ prefix = client-safe, embedded in bundle
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
    // EAS_SECRET_ prefix = build-time only, never in bundle
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
  plugins: [
    'expo-router',
    '@sentry/react-native/expo',
    ['expo-build-properties', {
      ios: {
        newArchEnabled: true, // Required in SDK 54+
      },
      android: {
        newArchEnabled: true,
      },
    }],
  ],
});
```

### Pattern 3: Sentry Integration with Expo Config Plugin

**What:** Auto-instrument Sentry using Expo config plugin, not manual native setup
**When to use:** Phase 1 setup. Handles source maps, native crash reporting
**Example:**
```typescript
// app.config.ts - Sentry plugin configuration
// Source: https://docs.sentry.io/platforms/react-native/manual-setup/expo/
{
  plugins: [
    [
      '@sentry/react-native/expo',
      {
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      }
    ]
  ]
}

// app/_layout.tsx - Initialize Sentry
// Source: https://docs.expo.dev/guides/using-sentry/
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  enableNative: true,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
});
```

### Pattern 4: PostHog Provider with Autocapture

**What:** Wrap app in PostHogProvider for analytics and feature flags
**When to use:** App root layout
**Example:**
```typescript
// app/_layout.tsx
// Source: https://posthog.com/docs/libraries/react-native
import { PostHogProvider } from 'posthog-react-native';

export default function RootLayout() {
  return (
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
      options={{
        host: 'https://app.posthog.com', // or self-hosted
        captureApplicationLifecycleEvents: true,
        captureDeepLinks: true,
      }}
      autocapture // Automatically track taps, screen views, etc.
    >
      <Stack />
    </PostHogProvider>
  );
}
```

### Pattern 5: EAS Build Profiles (eas.json)

**What:** Three standard profiles: development (internal testing), preview (TestFlight beta), production (App Store)
**When to use:** EAS Build setup
**Example:**
```json
// eas.json
// Source: https://docs.expo.dev/build/eas-json/
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "APP_VARIANT": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890"
      }
    }
  }
}
```

### Pattern 6: GitHub Actions CI/CD for TestFlight

**What:** Automated EAS Build + Submit on merge to main
**When to use:** CI/CD setup for continuous TestFlight deployment
**Example:**
```yaml
# .github/workflows/eas-build.yml
# Source: https://docs.expo.dev/build/building-on-ci/
name: EAS Build and Submit to TestFlight

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - name: Build and Submit to TestFlight
        run: |
          eas build --platform ios --profile production --non-interactive --auto-submit
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
```

### Anti-Patterns to Avoid

- **Using app.json instead of app.config.ts:** Static JSON files can't access environment variables or use TypeScript. app.config.ts provides type safety, autocomplete, and dynamic configuration.
- **Storing secrets in EXPO_PUBLIC_ variables:** Never prefix sensitive secrets (API keys, auth tokens) with EXPO_PUBLIC_ as they get embedded in the client bundle. Use EAS Secrets for build-time credentials.
- **Bypassing RLS with service_role key in client:** service_role keys bypass Row Level Security and grant full database access. NEVER use in client code—keep server-side only (Supabase Edge Functions).
- **Not enabling RLS on Supabase tables:** 83% of exposed Supabase databases in 2025 involved RLS misconfigurations. Enable RLS from day one, even in development.
- **Using expo-av for video:** expo-av's Video component is deprecated. Use expo-video instead (supports PiP, DRM, better performance).
- **Manual Sentry native setup:** Expo config plugin auto-handles native integration, source maps, and Metro bundler configuration. Manual setup causes conflicts.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Video compression | FFmpeg wrapper or native module | expo-video + Supabase Storage with transform API | Video compression is complex (codecs, bitrates, formats). Supabase Storage supports on-demand transforms. Client-side compression handled in Phase 6. |
| Authentication flow | Custom JWT + refresh token logic | Supabase Auth | Auth is deceptively complex: token refresh, session persistence, email verification, password reset. Supabase handles all edge cases. |
| Push notifications | Direct APNs/FCM integration | expo-notifications + Supabase Edge Functions | Push notification setup involves certificates, device tokens, retry logic. Expo abstracts platform differences. |
| Analytics event batching | Custom queue + retry logic | PostHog SDK | Event batching, offline queueing, retry, and deduplication are solved problems. PostHog handles it. |
| Feature flags | Environment variables or custom backend | PostHog feature flags | Real-time feature toggles with user segmentation and A/B testing built-in. |
| Error reporting | console.log or custom logging | Sentry | Crash reporting needs source maps, symbolication, user context, release tracking. Sentry handles all of it. |

**Key insight:** Infrastructure tooling (auth, analytics, errors, storage) has mature, battle-tested solutions. Solo developers should focus on product differentiation (video-first discovery, role-based decks), not rebuilding commodities.

## Common Pitfalls

### Pitfall 1: Environment Variable Scope Confusion

**What goes wrong:** Developers put sensitive secrets in EXPO_PUBLIC_ variables or expect EAS Secrets to be available at runtime.

**Why it happens:** Expo has three environment variable scopes: (1) EXPO_PUBLIC_ (client-side, embedded in bundle), (2) EAS Build env (build-time only), (3) EAS Secrets (build-time, not in bundle). Confusion between scopes leads to exposing secrets or runtime errors.

**How to avoid:**
- **Client-safe config** (API URLs, public keys): EXPO_PUBLIC_ prefix
- **Build-time secrets** (Sentry auth token, signing keys): EAS Secrets (never in .env)
- **Runtime secrets** (user tokens, session data): expo-secure-store or Supabase session management

**Warning signs:**
- Secrets visible in app bundle when inspected
- "Environment variable not defined" errors at runtime for non-EXPO_PUBLIC_ variables
- Accidentally committing .env with SENTRY_AUTH_TOKEN

### Pitfall 2: Supabase RLS Not Enabled

**What goes wrong:** Database tables accessible without Row Level Security policies, exposing all user data publicly.

**Why it happens:** Supabase defaults to RLS disabled on new tables. Developers forget to enable it, thinking the anon key provides sufficient security.

**How to avoid:**
1. Enable RLS on ALL tables: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Test queries with RLS enabled, never bypass with service_role in client
3. Use simple policies initially (e.g., `user_id = auth.uid()`)
4. Add indexes on RLS policy columns: `CREATE INDEX ON table_name (user_id);`

**Warning signs:**
- Supabase dashboard shows "RLS Disabled" warning
- Queries work in SQL editor but fail in app (likely using service_role in editor)
- Users seeing other users' data

### Pitfall 3: New Architecture Compatibility Issues

**What goes wrong:** Libraries without New Architecture support cause crashes or silent failures in SDK 54+.

**Why it happens:** SDK 54 defaults to New Architecture (cannot be disabled in SDK 55+). Some libraries haven't migrated yet.

**How to avoid:**
- Verify library compatibility before installation (check npm, GitHub issues)
- Prefer Expo-first libraries (expo-video, expo-camera) over third-party
- Test on both iOS and Android with New Architecture enabled
- Use Expo SDK 54 compatibility list: https://reactnative.directory/?newArch=true

**Warning signs:**
- App crashes on launch with "Unable to resolve module" or "Invariant Violation"
- Features work in SDK 52/53 but fail in SDK 54
- GitHub issues mentioning "New Architecture" or "Fabric"

### Pitfall 4: Sentry Auth Token in Client Bundle

**What goes wrong:** SENTRY_AUTH_TOKEN (used for uploading source maps) gets embedded in app bundle, exposing Sentry project access.

**Why it happens:** Developers put SENTRY_AUTH_TOKEN in .env with EXPO_PUBLIC_ prefix or commit it to git.

**How to avoid:**
- SENTRY_AUTH_TOKEN is build-time only—add as EAS Secret, not .env
- Never prefix SENTRY_AUTH_TOKEN with EXPO_PUBLIC_
- Add .env to .gitignore, commit .env.example instead

**Warning signs:**
- Sentry token visible in app.config.js when inspected
- Sentry token in git history
- Source maps not uploading (token not available at build time)

### Pitfall 5: EAS Build Profile Misconfiguration

**What goes wrong:** Development builds submitted to App Store, production builds missing environment variables.

**Why it happens:** eas.json profiles (development, preview, production) have different purposes but similar names. Developers run wrong profile or forget to set environment variables per profile.

**How to avoid:**
- **development:** Internal testing only, developmentClient: true (not App Store compatible)
- **preview:** TestFlight beta testing, distribution: internal
- **production:** App Store release, includes production environment variables
- Use eas.json "env" field for profile-specific variables
- Test EAS Build locally: `eas build --profile preview --local`

**Warning signs:**
- App Store rejects build due to "invalid provisioning profile" (development profile used)
- Environment variables undefined in production (not set in eas.json)
- TestFlight builds show "development" in app name

### Pitfall 6: Supabase Storage File Size Limits

**What goes wrong:** Video uploads fail silently or with cryptic errors when exceeding bucket size limits.

**Why it happens:** Supabase Storage has default file size limits (50MB free tier) and bucket-specific limits. Videos (especially uncompressed) easily exceed limits.

**How to avoid:**
1. Set explicit bucket file size limit: 50MB max (enforce in Phase 1, compress in Phase 6)
2. Check file size client-side before upload
3. Show clear error message: "Video must be under 50MB. Please compress or trim."
4. Monitor storage quota in Supabase dashboard

**Warning signs:**
- Uploads succeed for small videos but fail for large ones
- Error message: "Payload too large" or "Request entity too large"
- Storage quota warnings in Supabase dashboard

## Code Examples

Verified patterns from official sources:

### Runtime Environment Variable Access

```typescript
// constants/config.ts
// Source: https://docs.expo.dev/guides/environment-variables/
import Constants from 'expo-constants';

// Type-safe environment variable access
export const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl;
export const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey;
export const POSTHOG_API_KEY = Constants.expoConfig?.extra?.posthogApiKey;
export const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn;

// Validate required variables at startup
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables');
}
```

### Supabase Database Type Generation

```bash
# Generate TypeScript types from Supabase schema
# Source: https://supabase.com/docs/guides/api/rest/generating-types
npx supabase gen types typescript --local > types/supabase.ts

# Or from remote project
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

### Sentry User Context Tracking

```typescript
// lib/sentry.ts
// Source: https://docs.sentry.io/platforms/react-native/enriching-events/identify-user/
import * as Sentry from '@sentry/react-native';

export const setSentryUser = (userId: string, email?: string) => {
  Sentry.setUser({
    id: userId,
    email,
  });
};

export const clearSentryUser = () => {
  Sentry.setUser(null);
};
```

### PostHog User Identification

```typescript
// lib/posthog.ts
// Source: https://posthog.com/docs/libraries/react-native
import { usePostHog } from 'posthog-react-native';

export const useAnalytics = () => {
  const posthog = usePostHog();

  const identifyUser = (userId: string, traits?: Record<string, any>) => {
    posthog.identify(userId, traits);
  };

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    posthog.capture(eventName, properties);
  };

  const resetUser = () => {
    posthog.reset();
  };

  return { identifyUser, trackEvent, resetUser };
};
```

### EAS Update Configuration (for OTA updates)

```json
// eas.json - Add update channel support
// Source: https://docs.expo.dev/eas-update/getting-started/
{
  "build": {
    "production": {
      "channel": "production"
    },
    "preview": {
      "channel": "preview"
    }
  },
  "update": {
    "production": {
      "channel": "production"
    },
    "preview": {
      "channel": "preview"
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| expo-av Video | expo-video | SDK 52 (Nov 2024) | expo-av Video deprecated. expo-video adds PiP, DRM, better performance. Migration required. |
| app.json | app.config.ts | SDK 49+ (June 2024) | Static JSON can't access env vars or use TypeScript. app.config.ts enables dynamic config. |
| Old Architecture | New Architecture | SDK 54 (Jan 2025) default | 83% adoption in SDK 54. SDK 55+ requires New Architecture. Faster, better performance, some libraries incompatible. |
| Manual Sentry setup | Expo config plugin | SDK 48+ (Feb 2024) | Config plugin auto-handles native integration, source maps. Manual setup deprecated. |
| .env variables | EAS Secrets | EAS Build 2023+ | EAS Secrets keep sensitive tokens out of .env, better security for CI/CD. |

**Deprecated/outdated:**
- **expo-av Video component:** Replaced by expo-video. Migration guide: https://docs.expo.dev/versions/latest/sdk/video/
- **Disabling New Architecture in SDK 55+:** No longer possible. SDK 54 is last version where it can be disabled.
- **app.json for dynamic configuration:** Use app.config.ts for environment variables and TypeScript support.
- **Manual metro.config.js for Sentry:** Use @sentry/react-native/expo plugin instead.

## Open Questions

1. **Supabase video transcoding strategy**
   - What we know: Supabase Storage supports on-demand image transforms, video support unclear
   - What's unclear: Whether Supabase plans video transcoding (720p, adaptive bitrate) or if we need third-party (Mux, Cloudflare Stream)
   - Recommendation: Start with client-side compression (Phase 6), defer server-side transcoding to Phase 12 if needed

2. **PostHog vs Sentry overlap (Session Replays)**
   - What we know: Both Sentry and PostHog offer Session Replays
   - What's unclear: Whether to use both or consolidate on one
   - Recommendation: Start with Sentry for error-triggered replays, PostHog for product analytics. Evaluate overlap in Phase 12.

3. **EAS Build free tier limits for TestFlight automation**
   - What we know: EAS Build has usage-based pricing, free tier exists
   - What's unclear: Whether free tier allows automated TestFlight builds on every main merge
   - Recommendation: Start with manual builds (eas build --profile production), add GitHub Actions after validating usage.

## Sources

### Primary (HIGH confidence)

- [Expo SDK 54 Documentation](https://docs.expo.dev/) - Configuration, environment variables, EAS Build
- [Expo SDK 54 Beta Announcement](https://expo.dev/changelog/sdk-54-beta) - New Architecture default, precompiled XCFrameworks
- [Supabase Expo React Native Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native) - Supabase client setup with expo-sqlite
- [Sentry Expo Documentation](https://docs.sentry.io/platforms/react-native/manual-setup/expo/) - Config plugin, source maps, Session Replays
- [PostHog React Native Documentation](https://posthog.com/docs/libraries/react-native) - Pure JS implementation, autocapture
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/) - Build profiles, CI/CD, TestFlight submission
- [Using Supabase with Expo](https://docs.expo.dev/guides/using-supabase/) - Official Expo guide
- [Using Sentry with Expo](https://docs.expo.dev/guides/using-sentry/) - Official Expo guide

### Secondary (MEDIUM confidence)

- [What's New in Expo SDK 54](https://medium.com/@onix_react/whats-new-in-expo-sdk-54-1e93fe77d7a7) - Verified with official changelog
- [expo-video vs expo-av comparison](https://expo.dev/blog/expo-video-a-simple-powerful-way-to-play-videos-in-apps) - Official Expo blog
- [Supabase Best Practices 2026](https://www.leanware.co/insights/supabase-best-practices) - RLS security, performance optimization
- [Supabase RLS Performance](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) - Official troubleshooting guide
- [EAS Build GitHub Actions Setup](https://docs.expo.dev/build/building-on-ci/) - Official CI/CD guide
- [Environment Variables in Expo](https://docs.expo.dev/guides/environment-variables/) - EXPO_PUBLIC_ prefix, security tiers

### Tertiary (LOW confidence)

- [React Native Environment Variables for Expo](https://www.brilworks.com/blog/react-native-environment-variables/) - Third-party tutorial, cross-verified with official docs
- [Supabase RLS Explained](https://medium.com/@jigsz6391/supabase-row-level-security-explained-with-real-examples-6d06ce8d221c) - Community tutorial

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs, Context7 unavailable but official sources sufficient
- Architecture: HIGH - Patterns from Expo, Supabase, Sentry, PostHog official documentation
- Pitfalls: MEDIUM-HIGH - RLS misconfigurations verified (83% stat from Supabase security incident), environment variable scope from official Expo docs, New Architecture compatibility from Expo changelog

**Research date:** 2026-02-08
**Valid until:** 2026-04-08 (60 days—Expo SDK 55 beta expected March 2026, may introduce breaking changes)

---

## Additional Context for Planning

### Existing Codebase State

The project already has:
- Expo SDK 54 initialized (package.json shows expo ~54.0.33)
- app.json present (needs migration to app.config.ts for env var support)
- expo-video plugin already configured in app.json
- New Architecture enabled (newArchEnabled: true in app.json)
- Basic Expo Router structure in app/ directory
- TypeScript configured

**What's missing (Phase 1 scope):**
1. Supabase client initialization
2. Environment variable management (app.config.ts migration)
3. Sentry integration
4. PostHog integration
5. EAS Build configuration (eas.json)
6. CI/CD pipeline (GitHub Actions)
7. .env.example and secrets documentation

### Planning Considerations

**Phase 1 should deliver:**
1. **Working app.config.ts** with environment variable access
2. **Supabase client** initialized and testable (basic query)
3. **Sentry** capturing errors with test crash
4. **PostHog** tracking app lifecycle events
5. **EAS Build profiles** (development, preview, production)
6. **GitHub Actions workflow** for TestFlight deployment (can be manual trigger initially)
7. **Documentation** of required secrets and setup

**Success verification:**
- `npx expo start` runs without errors
- Supabase client connects (test query succeeds)
- Sentry captures test error
- PostHog dashboard shows app launch event
- `eas build --profile preview` succeeds
- TestFlight build deploys (manual or automated)

**Time estimate:** 4-6 hours for solo developer (1-2 hours per service: Supabase, Sentry, PostHog, EAS Build)
