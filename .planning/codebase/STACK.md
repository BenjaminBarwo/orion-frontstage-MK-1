# Technology Stack

**Analysis Date:** 2026-02-08

## Languages

**Primary:**
- TypeScript 5.9.2 - All application code, components, and configuration

**Supporting:**
- JavaScript - Build scripts and configuration
- JSX/TSX - React component syntax

## Runtime

**Environment:**
- Node.js 24.13.0 - Development runtime
- Expo ~54.0.33 - Native app platform and development server

**Package Manager:**
- npm 11.6.2
- Lockfile: `package-lock.json` (present and committed)

## Frameworks

**Core:**
- React 19.1.0 - UI library
- React Native 0.81.5 - Cross-platform native framework
- Expo Router ~6.0.23 - File-based routing and navigation

**Navigation:**
- @react-navigation/native ^7.1.8 - Core navigation
- @react-navigation/bottom-tabs ^7.4.0 - Tab-based navigation
- @react-navigation/elements ^2.6.3 - Navigation components

**UI & Styling:**
- react-native-web ~0.21.0 - Web support for React Native
- react-native-reanimated ~4.1.1 - Gesture and animation library
- react-native-gesture-handler ~2.28.0 - Gesture recognition

**Platform Support:**
- react-native-safe-area-context ~5.6.0 - Safe area handling
- react-native-screens ~4.16.0 - Native navigation optimization
- react-native-worklets 0.5.1 - C++ interop

**Development & Build:**
- eslint 9.25.0 - Code linting
- eslint-config-expo ~10.0.0 - Expo linting rules
- @types/react ~19.1.0 - React TypeScript types
- typescript ~5.9.2 - TypeScript compiler

## Key Dependencies

**Critical:**
- react-dom 19.1.0 - React for web rendering
- @react-navigation/* - Navigation stack dependencies

**Expo Modules:**
- expo-router ~6.0.23 - File-based routing
- expo-constants ~18.0.13 - App constants and metadata
- expo-font ~14.0.11 - Font loading
- expo-image ~3.0.11 - Image optimization
- expo-haptics ~15.0.8 - Haptic feedback
- expo-splash-screen ~31.0.13 - Splash screen management
- expo-status-bar ~3.0.9 - Status bar control
- expo-system-ui ~6.0.9 - System UI integration
- expo-video ~3.0.15 - Video playback
- expo-web-browser ~15.0.10 - Web browser integration
- expo-linking ~8.0.11 - Deep linking
- expo-symbols ~1.0.8 - Symbol icons
- @expo/vector-icons ^15.0.3 - Icon library

**Native Bridge:**
- react-native-worklets 0.5.1 - High-performance threading

## Configuration

**Environment:**
- No explicit environment variables currently configured
- Pattern: `.env*.local` gitignored (supports future env vars)
- Development configuration: `app.json` (Expo configuration)

**Build:**
- Expo build configuration: `app.json`
- TypeScript: `tsconfig.json` with strict mode enabled
- Path aliases: `@/*` → `./*` (root-relative imports)
- ESLint: `eslint.config.js` (flat config format)

**TypeScript Settings:**
- `strict: true` - Full type checking enabled
- Extends: `expo/tsconfig.base` - Expo preset
- Include patterns: `**/*.ts`, `**/*.tsx`, `.expo/types/**/*.ts`

## Platform Requirements

**Development:**
- Node.js 24.13.0+
- npm 11.6.2+
- Xcode (for iOS development)
- Android SDK (for Android development)
- Expo CLI (via npx)

**Supported Targets:**
- iOS (via Expo or development build)
- Android (via Expo or development build)
- Web (static export)

**Deployment:**
- Expo deployment infrastructure
- Web: Static output to `dist/` directory
- Mobile: Expo Go, development builds, or standalone builds

## Key Features Enabled

**New React Compiler:**
- `experiments.reactCompiler: true` - React 19 compiler enabled

**Typed Routes:**
- `experiments.typedRoutes: true` - Type-safe navigation routes

**React Native New Architecture:**
- `newArchEnabled: true` - New React Native architecture

---

*Stack analysis: 2026-02-08*
