# Codebase Concerns

**Analysis Date:** 2026-02-08

## Tech Debt

**Platform-Specific Type Inconsistencies:**
- Issue: The `IconSymbol` component has two platform-specific implementations with divergent type signatures. The iOS version (`icon-symbol.ios.tsx`) uses `SymbolViewProps['name']` while the web/Android fallback (`icon-symbol.tsx`) uses a hardcoded `IconMapping` record. The `weight` prop is optional in the iOS version but not exported in the web fallback.
- Files: `components/ui/icon-symbol.tsx`, `components/ui/icon-symbol.ios.tsx`
- Impact: Type safety is compromised when using `IconSymbol` across platforms. The `weight` prop will cause type errors on non-iOS platforms.
- Fix approach: Create a unified type definition for `IconSymbolProps` that both platform implementations must conform to. Use a barrel export pattern to ensure consistent prop interfaces.

**Hard-Coded Color Values:**
- Issue: Several components use hard-coded color strings instead of referencing the centralized theme constants. The `ThemedText` component's `link` style (line 58 in `themed-text.tsx`) uses `'#0a7ea4'` instead of referencing `Colors.light.tint`.
- Files: `components/themed-text.tsx`
- Impact: Theme changes require editing multiple files. Color consistency is fragile and depends on manual synchronization.
- Fix approach: Extract all hard-coded color values to `constants/theme.ts` and reference them consistently throughout components.

**Incomplete Icon Mapping:**
- Issue: The Material Icons fallback mapping in `components/ui/icon-symbol.tsx` contains only 4 icon mappings. Additional SF Symbols used elsewhere in the app (e.g., `trash`, `cube`, `square.and.arrow.up`, `ellipsis` in `index.tsx`) are not mapped.
- Files: `components/ui/icon-symbol.tsx`, `app/(tabs)/index.tsx`
- Impact: Using unmapped icons on Android/web will result in runtime errors or missing icons. This will only be caught when testing on non-iOS platforms.
- Fix approach: Audit all `IconSymbol` usages across the app and add complete Material Icons mappings for each SF Symbol used.

**Platform Detection String Duplication:**
- Issue: Platform detection using environment variables is repeated in multiple files: `process.env.EXPO_OS === 'ios'` in `haptic-tab.tsx` (line 10) and `process.env.EXPO_OS !== 'web'` in `external-link.tsx` (line 14).
- Files: `components/haptic-tab.tsx`, `components/external-link.tsx`
- Impact: Inconsistent platform detection patterns increase maintenance burden. Any changes to platform detection logic must be updated in multiple places.
- Fix approach: Create a custom hook (e.g., `usePlatform()`) in `hooks/` to centralize platform detection logic.

## Known Bugs

**Web Hydration Mismatch on Color Scheme:**
- Symptoms: The web version of `useColorScheme` hook defaults to 'light' before hydration completes (line 20 in `use-color-scheme.web.ts`). Users on dark mode systems will see a flash of light mode content before the actual color scheme loads.
- Files: `hooks/use-color-scheme.web.ts`
- Trigger: Load the web version of the app on a system with dark mode enabled
- Workaround: The `hasHydrated` state prevents rendering until hydration completes, but this creates a visual flash. Consider using a context provider to synchronize hydration state globally.

**Unhandled Null/Undefined in Color Scheme:**
- Symptoms: The `useColorScheme` hook can return `null | 'light' | 'dark'` (from React Native), but several components use the pattern `colorScheme ?? 'light'` (e.g., line 27 in `parallax-scroll-view.tsx`) which is defensive but not consistently applied across the codebase.
- Files: `hooks/use-theme-color.ts`, `components/parallax-scroll-view.tsx`, `components/ui/collapsible.tsx`
- Trigger: This manifests as inconsistent null-coalescing behavior across the app
- Workaround: The existing `?? 'light'` pattern mitigates this, but it should be formalized in the hook's return type.

## Security Considerations

**External Browser Opening Without Validation:**
- Risk: The `ExternalLink` component opens URLs in an external browser using `openBrowserAsync()` without validating the URL format or protocol. Malicious URLs could be passed to the component.
- Files: `components/external-link.tsx`
- Current mitigation: The component requires `href` to be a `Href & string` type, which provides basic type safety but no runtime validation.
- Recommendations: Add URL validation to ensure only http/https protocols are allowed. Use `URL` constructor validation or a URL validation library to catch invalid URLs before passing to `openBrowserAsync()`.

**Environment Variable Exposure:**
- Risk: The `process.env.EXPO_OS` check is used to conditionally execute platform-specific code, but this assumes the environment is properly configured in all build contexts.
- Files: `components/haptic-tab.tsx`, `components/external-link.tsx`
- Current mitigation: The code gracefully falls back to default behavior on unknown platforms
- Recommendations: Document which environment variables are required for proper app functionality and ensure they're set in all build configurations (development, staging, production).

## Performance Bottlenecks

**Reanimated Animated.ScrollView Animation Frame Rate:**
- Problem: The `ParallaxScrollView` component uses `scrollEventThrottle={16}` (line 51 in `parallax-scroll-view.tsx`), which throttles scroll events to ~60 FPS. On high-refresh-rate displays (120Hz+), this will feel choppy.
- Files: `components/parallax-scroll-view.tsx`
- Cause: Default throttle value doesn't account for modern display refresh rates
- Improvement path: Make throttle rate configurable or detect the device refresh rate using `react-native-reanimated`'s native driver capabilities to achieve smooth 120Hz animations.

**HelloWave Animation Duration:**
- Problem: The waving animation in `components/hello-wave.tsx` (lines 10-14) is hard-coded to 300ms with 4 iterations. This creates a brief but noticeable lag when the component first renders, especially on lower-end devices.
- Files: `components/hello-wave.tsx`
- Cause: No performance optimization or memoization; the animation runs on every render
- Improvement path: Wrap the component with `React.memo()` to prevent unnecessary re-renders. Consider making animation duration/iteration count configurable.

## Fragile Areas

**Color Scheme Type Safety Across Platform:**
- Files: `hooks/use-color-scheme.ts`, `hooks/use-color-scheme.web.ts`, `hooks/use-theme-color.ts`
- Why fragile: The native implementation simply re-exports from `react-native`, while the web implementation has custom hydration logic. Type differences between platforms can cause subtle bugs. The return type is `'light' | 'dark' | null`, but this is not consistently documented.
- Safe modification: Document the return type signature clearly. Add runtime assertions in `useThemeColor` to validate the colorScheme value before using it as an object key. Create a type-safe color getter utility.
- Test coverage: No test files found in the codebase for hooks. The color scheme behavior is untested.

**Modal Navigation Without Error Boundary:**
- Files: `app/modal.tsx`, `app/_layout.tsx`
- Why fragile: The modal is presented without error handling. If the `dismissTo` href doesn't match any existing route, the navigation will silently fail or throw an uncaught error.
- Safe modification: Wrap navigation in error boundary or add route validation. Test all modal dismissal paths in different navigation states.
- Test coverage: No test files found

**IconSymbol Component Cross-Platform Behavior:**
- Files: `components/ui/icon-symbol.tsx`, `components/ui/icon-symbol.ios.tsx`
- Why fragile: The component behaves completely differently on iOS vs other platforms due to platform-specific imports and implementations. Adding a new icon requires manual mapping on the non-iOS fallback.
- Safe modification: Create a centralized icon registry that maps SF Symbols to platform-specific icon names. Always test icon rendering on all target platforms.
- Test coverage: No test coverage for icon rendering

## Scaling Limits

**No State Management System:**
- Current capacity: Single-component state using React hooks (e.g., `useState` in `Collapsible`)
- Limit: Once the app grows beyond a handful of screens with simple state, managing shared state across the component tree will become unwieldy. Prop drilling will become evident when multiple screens need access to common data (user session, app settings, etc.)
- Scaling path: As the app scales, implement a state management solution like Redux Toolkit, Zustand, or Jotai. Start this migration early to avoid extensive refactoring later.

**No Data Persistence or Caching:**
- Current capacity: All state is volatile; closing the app loses all state
- Limit: The app has no mechanism for persisting user data, preferences, or app state
- Scaling path: Integrate `react-native-async-storage` or similar for local data persistence. Plan for offline-first sync mechanisms if the app will interact with remote APIs.

**Hardcoded Routes Without Type Safety:**
- Current capacity: Routes work with the current file structure but type safety is limited
- Limit: The app uses string-based navigation (e.g., `href="/"`, `href="/modal"`) which are not validated against actual route definitions
- Scaling path: Leverage `expo-router`'s `typedRoutes` experiment (enabled in `app.json`, line 45) to get full type safety on all route strings. Document and enforce strict route naming conventions.

## Dependencies at Risk

**React 19.1.0 and React Native 0.81.5:**
- Risk: These versions are recent and may have stability issues. React Native 0.81.5 is a relatively new release with fewer production users than stable LTS versions.
- Impact: Breaking changes in minor/patch versions could affect the app. Community support and third-party libraries may lag behind cutting-edge React versions.
- Migration plan: Pin specific versions in production. Establish a careful update process with testing before upgrading React or React Native. Monitor the Expo and React Native release notes for known issues.

**React Native New Architecture:**
- Risk: The app has `"newArchEnabled": true` in `app.json` (line 10), which enables the experimental new React Native architecture. This is not yet production-ready for all use cases.
- Impact: Unexpected stability issues, performance regressions, or incompatibilities with native modules that haven't been updated for the new architecture.
- Migration plan: Document the new architecture decision and its implications. Plan regular testing on target devices. Have a rollback plan if instability is discovered.

**Unversioned Dev Dependencies:**
- Risk: ESLint uses `^9.25.0` (allowing up to 10.x), which could introduce breaking changes in the linting rules.
- Impact: CI/CD pipelines or local linting may suddenly fail with rule violations that didn't exist before.
- Migration plan: Pin ESLint to exact version in production environments. Review major version upgrades carefully before applying.

## Missing Critical Features

**No Error Boundary:**
- Problem: The app has no React Error Boundary component to catch render errors in screens or components. If any component throws during render, the entire app will crash.
- Blocks: Resilient error handling, user-friendly error messages, recovery mechanisms

**No Logging or Monitoring:**
- Problem: No console logging infrastructure or error tracking service (e.g., Sentry, LogRocket). Errors in production will be invisible to developers.
- Blocks: Production debugging, error tracking, analytics, user issue investigation

**No Testing:**
- Problem: No test files exist in the codebase. No unit tests, integration tests, or E2E tests are present.
- Blocks: Regression detection, refactoring safety, confidence in feature changes

**No Navigation Error Handling:**
- Problem: Navigation errors (invalid routes, failed deep links) are not explicitly handled. The app will crash or silently fail.
- Blocks: Deep linking support, reliable navigation, user feedback on navigation failures

## Test Coverage Gaps

**No Component Tests:**
- What's not tested: All UI components (`ThemedText`, `ThemedView`, `Collapsible`, `ParallaxScrollView`, `IconSymbol`, etc.)
- Files: `components/*`, `app/*`
- Risk: Rendering bugs, event handler failures, style regressions will only be caught manually during development
- Priority: High - these components are the foundation of the app

**No Hook Tests:**
- What's not tested: Color scheme detection (`useColorScheme`, `useThemeColor`), platform-specific behavior (`usePlatform` if created)
- Files: `hooks/*`
- Risk: Hydration mismatches, platform-specific bugs, null/undefined handling errors will silently fail
- Priority: High - hooks determine core app behavior across platforms

**No Integration Tests:**
- What's not tested: Screen transitions, modal presentation, navigation flows
- Files: `app/`, full app flow
- Risk: Navigation bugs, state loss during transitions, layout shifts will only be caught in manual testing
- Priority: Medium - important for user-facing flows

**No E2E Tests:**
- What's not tested: Full app workflows from cold start through key user journeys
- Files: Integration with all screens and features
- Risk: Deployment regressions, critical path failures, unexpected interactions between features
- Priority: Medium - important for release confidence

---

*Concerns audit: 2026-02-08*
