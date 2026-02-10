# Handoff: White Screen + Metro Logs Going Crazy (Plan Mode)

**Use this entire document as the prompt for a new Claude session in Plan mode.** Context has been gathered from this session and from prior Claude chat history so a fresh session can diagnose and fix the bug.

---

## Current state (what you’re seeing now)

- **Metro terminal**: Logs are “going crazy” (very high volume, likely continuous).
- **Device**: Completely **white screen** on iPhone 17 iOS simulator.
- **App**: Expo (SDK 54) React Native app, Supabase auth, Expo Router. Project: MVR (orion_frontstage_MK-1).

---

## What the app is supposed to do

- **Unauthenticated**: Show sign-up/sign-in (auth) screen.
- **Authenticated, profile incomplete**: Show onboarding (role → name → location → photo → bio → review).
- **Authenticated, profile complete**: Show main (tabs) app.
- After “Complete Profile” on review, profile is saved and user should land on home tab via profile-completeness redirect.

---

## Prior fixes (from earlier Claude chat, terminal/session history)

1. **Welcome card for new sign-ups**  
   Root layout was redirecting to onboarding before the welcome effect ran.  
   **Change**: In `app/_layout.tsx`, the `(onboarding)` screen redirect condition was updated to also block redirect when `isNewSignUp` is true, so the welcome effect can run first (e.g. `redirect={!session || profileComplete !== false || isNewSignUp}`).

2. **Dynamic import and Metro**  
   `getProfile` was dynamically imported in the layout; Metro doesn’t support that.  
   **Change**: Replaced with a static import of `getProfile` from `@/lib/profile-service` in `app/_layout.tsx`.

3. **Review screen empty after app restart**  
   Expo Router could restore navigation to a mid-flow screen (e.g. bio) while `ProfileContext` was empty.  
   **Change**: In `app/(onboarding)/_layout.tsx`, a `useEffect` was added to always `router.replace('/(onboarding)/role')` when the onboarding layout mounts so the flow starts at step 1.

4. **Complete Profile not routing to home**  
   After saving the profile, the root layout still had `profileComplete === false`, so the `(tabs)` redirect blocked entry.  
   **Change**: A “profile gate” was introduced: a context that exposes `markProfileComplete()`. The review screen calls `markProfileComplete()` after a successful save; the root layout sets `profileComplete` to true when that is called, so the redirect logic then allows `(tabs)`.

5. **Infinite loop and white screen (import from layout)**  
   `review.tsx` was importing `useProfileGate` from `@/app/_layout`. Importing from a layout into a child route caused module re-execution (e.g. `initSentry()` and navigation setup running repeatedly), Sentry log spam (~30/sec), and a white screen.  
   **Change**: Profile gate context was moved to a dedicated module.  
   - **Added** `lib/profile-gate.tsx`: `ProfileGateContext`, `ProfileGateProvider`, `useProfileGate()`.  
   - **Updated** `app/_layout.tsx`: import `ProfileGateProvider` from `@/lib/profile-gate`; use `ProfileGateProvider` with `value={{ markProfileComplete: () => setProfileComplete(true) }}`.  
   - **Updated** `app/(onboarding)/review.tsx`: import `useProfileGate` from `@/lib/profile-gate` (no longer from `@/app/_layout`).  
   After this, the flow worked until the next round of changes.

6. **Routing after save**  
   At one point the review screen called both `markProfileComplete()` and `router.replace('/(tabs)')`. It was simplified to only call `markProfileComplete()` and rely on the root layout’s redirect logic to move to tabs.

---

## Changes made in this debug session (current session)

All of the following were attempts to fix a recurring **white screen** and/or **render loop** after the above fixes.

1. **Splash screen never hiding when logged out**  
   Splash was only hidden when `profileComplete !== null`; when there is no session, `profileComplete` stays `null`, so the splash never hid and the app looked like a white screen.  
   **Change**: Splash hide condition was updated to also hide when there is no session once auth has resolved:  
   `!isLoading && (profileComplete !== null || !session)`.

2. **Stable ProfileGate value**  
   `ProfileGateProvider` was given a new object every render, which could force re-renders.  
   **Change**: `markProfileComplete` is created with `useCallback` and the provider value with `useMemo`, both at the **top** of `RootLayoutNav` (before any conditional return) to satisfy React’s rules of hooks.

3. **Redirect component vs effect**  
   Rendering `<Redirect href="/(auth)/sign-up" />` when `!session` on every render was thought to contribute to navigation churn.  
   **Change**: `<Redirect>` was removed. A `useEffect` runs when `!isLoading && !session` and calls `router.replace('/(auth)/sign-up')` once (guarded by `hasRedirectedToAuthRef` so it only runs once per “no session” period; ref is reset when `session` is truthy again).

4. **“Rendered more hooks than during the previous render”**  
   `useCallback` and `useMemo` were originally placed **after** an early `return null` (when `showingNull`). That meant a different number of hooks ran on different renders.  
   **Change**: `markProfileComplete` (useCallback) and `profileGateValue` (useMemo) were moved to the top of `RootLayoutNav`, right after `useState`, so hooks always run in the same order.

5. **PostHog options reference**  
   `RootLayout` was passing a new `options={{ host: '...', captureAppLifecycleEvents: true }}` object every render, which might have caused `PostHogProvider` to remount children.  
   **Change**: A constant `POSTHOG_OPTIONS` was defined (after all imports) and passed as `options={POSTHOG_OPTIONS}` to `PostHogProvider`.

6. **Single redirect to sign-up**  
   To avoid repeated navigation when there’s no session, a ref `hasRedirectedToAuthRef` was added: redirect runs only when `!hasRedirectedToAuthRef.current`, then set to `true`; when `session` exists again, the ref is set back to `false`.

7. **Import order**  
   At one point `const POSTHOG_OPTIONS = { ... }` was placed between two `import` statements, which could confuse the bundler.  
   **Change**: All imports are grouped at the top; `POSTHOG_OPTIONS` is defined immediately after the last import block.

8. **Removed unused import**  
   `Redirect` from `expo-router` was removed from `app/_layout.tsx` since redirect is now done via `router.replace` in an effect.

---

## Debug instrumentation still in the code (important)

**There is active instrumentation in `app/_layout.tsx` that runs during render and in effects.** It sends HTTP POSTs to a debug ingest endpoint on (almost) every layout render and on profile/splash events. If the root layout is re-rendering in a loop, this will flood Metro and the log endpoint and can make the app behave badly.

- **Locations** (search for `#region agent log` and `#endregion` in `app/_layout.tsx`):
  - **In render path** (runs every time `RootLayoutNav` renders):
    - After `showingNull` is computed: `fetch('http://127.0.0.1:7243/ingest/fb4d65d8-30cb-4961-9205-f4a7ef0f740b', ...)` with `location: '_layout.tsx:RootLayoutNav'`, `message: 'Layout render'`, and `data: { isLoading, hasSession, profileComplete, isNewSignUp, showingNull }`.
    - After the `if (showingNull) return null` block, before the main return: same endpoint with `location: '_layout.tsx:StackRender'`, `message: 'Rendering Stack (past gate)'`.
  - **In effects**:
    - Inside `checkProfile` (success): `location: '_layout.tsx:checkProfile'`, `message: 'Profile check done'`.
    - Inside `checkProfile` (catch): `message: 'Profile check error'`.
    - In the splash-hide effect: `location: '_layout.tsx:SplashHide'`, `message: 'Hiding splash'`.

**Recommendation for the new session:** Remove all of this instrumentation (the `fetch(...)` calls and their `// #region agent log` / `// #endregion` blocks) as a first step. Then reproduce. If Metro logs calm down and the white screen goes away, the loop was likely exacerbated or caused by the logging. If the white screen persists, diagnose without the extra network and render cost.

---

## Key files to inspect

| File | Purpose |
|------|--------|
| `app/_layout.tsx` | Root layout: auth/session, profile gate, splash, redirect to sign-up or tabs/onboarding. Contains all current fixes and **all debug instrumentation**. |
| `lib/profile-gate.tsx` | Profile gate context and `useProfileGate` (used by review screen). |
| `app/(onboarding)/review.tsx` | Calls `markProfileComplete()` from `useProfileGate()` after saving profile; imports from `@/lib/profile-gate`. |
| `app/(onboarding)/_layout.tsx` | Onboarding layout; `useEffect` that resets to `/(onboarding)/role` on mount. |
| `lib/auth-context.tsx` | `SessionProvider`, `useAuth` (session, isLoading, isNewSignUp, etc.). |

---

## Debug log file (if instrumentation is still used)

- **Path**: `/Users/benjaminbarwo/Downloads/orion_frontstage_MK-1/.cursor/debug.log`
- NDJSON (one JSON object per line) from the ingest endpoint.  
- If you remove the instrumentation, this file may stop updating; that’s expected.

---

## Session 3: Root cause found & fixed

### Fixes attempted (did NOT resolve white screen)
1. Removed all 5 debug `fetch()` calls from `app/_layout.tsx`
2. Memoized auth context value with `useMemo` in `lib/auth-context.tsx`
3. Wrapped all auth functions in `useCallback`
4. Replaced `getSession()` + `onAuthStateChange` with just `onAuthStateChange`
5. Removed `router` from auth redirect effect deps
6. Added eslint-disable comments for intentionally omitted deps

### Root cause
The root layout mixed two conflicting navigation mechanisms:
- **`redirect` props on `Stack.Screen`** — removes screens from the navigator entirely (returns `null`)
- **Imperative `router.replace()` calls in effects**

When `isNewSignUp=true`, `session` exists, and `profileComplete=false`, ALL three main screens (`(auth)`, `(onboarding)`, `(tabs)`) had `redirect=true`. Only `welcome` (no redirect prop) remained. The navigator rendered `null` (white screen). Effects kept firing, calling `clearNewSignUp()`, triggering re-renders, and the cycle continued (Metro log storm).

Confirmed via `node_modules/expo-router/build/useScreens.js`:
```js
if (redirect) { return null; } // removes screen entirely from navigator
```

### Fix applied
1. **`'use no memo'` directive** — React Compiler can't reason about complex conditional effects with eslint-disabled deps
2. **Removed ALL `redirect` props** — All screens stay always mounted; routing is purely imperative
3. **Consolidated into 1 routing effect** — State machine with `lastRouteStateRef` to prevent re-firing during onboarding steps
4. **Added cancellation to profile check** — Prevents stale async updates
5. **Created `app/+not-found.tsx`** — Catch-all for navigation failures
6. **Guarded onboarding layout reset** — `useSegments()` check prevents conflict with root routing
7. **Deleted `app/modal.tsx`** — Unused template noise

---

## What to figure out in Plan mode

1. **Remove the debug instrumentation** in `app/_layout.tsx` (all `fetch('http://127.0.0.1:7243/ingest/...')` and their regions), then reproduce. Does the white screen and Metro log storm stop?
2. If the white screen persists without instrumentation:
   - Is the root layout (or something above it) still in a re-render or remount loop?
   - Is the splash screen hiding at the right time? Is the correct route (auth vs onboarding vs tabs) being shown?
   - Could `SessionProvider`, `PostHogProvider`, or Expo Router be remounting the tree unnecessarily?
3. Ensure hooks in `RootLayoutNav` are always called in the same order (no hooks after conditional returns).
4. Ensure no child route imports from `app/_layout.tsx` (or any layout file) to avoid the previous “Sentry spam + white screen” class of bug.

---

## Correct Expo command

Use:

```bash
npx expo start --clear
```

Not `npx start expo --clear` or `npx run expo` (those fail or run the wrong thing).

---

## Summary for the prompt

- **Symptom**: Metro logs going crazy; completely white screen on iPhone 17 iOS simulator.
- **Context**: Multiple prior fixes (welcome card, profile gate in `lib/profile-gate`, onboarding reset to role, splash hide when no session, stable provider values, redirect in effect, hooks order, PostHog options, redirect-once ref). Debug instrumentation is still present and runs on every layout render.
- **Ask**: Diagnose and fix the white screen and log storm. Start by removing the instrumentation and reproducing; then, if needed, track down any remaining render/remount or routing cause.
