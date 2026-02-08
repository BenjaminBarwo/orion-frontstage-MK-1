# External Integrations

**Analysis Date:** 2026-02-08

## APIs & External Services

**Networking:**
- Native fetch API - Standard HTTP requests
- whatwg-fetch polyfill - Browser fetch compatibility
- node-fetch - Node.js fetch support (transitive dependency)
- cross-fetch - Fetch abstraction layer (transitive dependency)

**No explicit API integrations detected** - Application currently uses only built-in fetch capabilities.

## Data Storage

**Databases:**
- Not detected - No database client configured
- No Supabase, Firebase, MongoDB, PostgreSQL, or MySQL integration

**File Storage:**
- Local filesystem only - Asset loading via `expo-image` and require()
- Asset locations: `assets/images/` directory

**Caching:**
- Not configured - React component-level caching only
- Native caching via expo modules for images and fonts

## Authentication & Identity

**Auth Provider:**
- Not implemented - No authentication service configured
- No OAuth, JWT, or custom auth mechanisms detected

**Linking & Deep Navigation:**
- expo-linking ~8.0.11 - Deep linking support available but not actively used

## Monitoring & Observability

**Error Tracking:**
- Not configured - No error tracking service integrated

**Logs:**
- console API - Standard JavaScript console for logging
- No external logging service configured

**Debugging:**
- React Native debugger - Built-in Expo development tools
- Platform-specific dev tools: `cmd+d` (iOS), `cmd+m` (Android), `F12` (web)

## CI/CD & Deployment

**Hosting:**
- Expo - Primary deployment platform
- iOS deployment: Via Xcode or Expo Build Service
- Android deployment: Via Android Studio or Expo Build Service
- Web deployment: Static hosting (output to `dist/` directory)

**CI Pipeline:**
- Not configured - No GitHub Actions, CircleCI, or similar detected
- Build system: Expo CLI (`expo start`, `expo start --ios`, `expo start --android`, `expo start --web`)

**Linting & Code Quality:**
- ESLint 9.25.0 - Linting via `npm run lint`
- No pre-commit hooks or automated checks configured

## Environment Configuration

**Required env vars:**
- No required environment variables currently configured
- Pattern support: `.env*.local` files (gitignored)

**Optional env vars:**
- Environment configuration available but not implemented
- Expo constants loaded via `expo-constants` (platform metadata only)

**Secrets location:**
- Not configured - No secrets management in place
- Development: Environment variables would go in `.env.local`
- Production: Should use Expo build variables or platform-specific secret management

## Webhooks & Callbacks

**Incoming:**
- Deep linking endpoints via expo-linking
- No API endpoints configured

**Outgoing:**
- Not detected - No outbound webhook calls to external services

## Platform-Specific Integrations

**iOS:**
- Adaptive design support
- Tablet support enabled (`supportsTablet: true`)
- Automatic dark/light mode switching (`userInterfaceStyle: "automatic"`)
- Custom scheme: `orionfrontstagemk1`

**Android:**
- Adaptive icon support
- Edge-to-edge display support enabled
- Predictive back gesture disabled
- Status bar color: `#E6F4FE`

**Web:**
- Static output mode (`output: "static"`)
- Favicon: `assets/images/favicon.png`
- React DOM 19.1.0 for web rendering

## Third-Party Services

**Video Playback:**
- expo-video ~3.0.15 - Media playback (service hooks available)

**System Integration:**
- expo-haptics ~15.0.8 - Device haptic feedback
- expo-status-bar ~3.0.9 - Status bar management
- expo-system-ui ~6.0.9 - System UI customization

**Icon/Font Resources:**
- @expo/vector-icons - Icon library (no external CDN)
- expo-font - Font loading from local assets

**Web Browser:**
- expo-web-browser ~15.0.10 - In-app browser capabilities

---

*Integration audit: 2026-02-08*

**Summary:** This is a greenfield Expo application with minimal external integrations. It currently uses only Expo modules and React Native APIs. No backend services, databases, or third-party APIs are integrated. All data storage and display are currently local/built-in only.
