# Architecture

**Analysis Date:** 2026-02-08

## Pattern Overview

**Overall:** Single-Page Application (SPA) with File-Based Routing - Expo Router

**Key Characteristics:**
- Multi-platform (iOS, Android, Web) React Native application
- File-based routing convention similar to Next.js
- Component-driven architecture with composable UI elements
- Theme-aware rendering with light/dark mode support
- Tab-based navigation as primary UI structure

## Layers

**Route Layer (Pages):**
- Purpose: Entry points for user navigation, screen containers
- Location: `app/` directory
- Contains: Page components (`index.tsx`, `explore.tsx`), modals, layout definitions
- Depends on: Components, hooks, constants
- Used by: Router (Expo Router), navigation system

**Component Layer:**
- Purpose: Reusable UI elements, composable building blocks
- Location: `components/` directory and `components/ui/` subdirectory
- Contains: Themed components (ThemedText, ThemedView), UI elements (Collapsible, HapticTab), layout components (ParallaxScrollView)
- Depends on: Hooks, constants, React Native, external libraries
- Used by: Route layer, other components, layout files

**Hook Layer:**
- Purpose: Stateful logic abstraction, theme management, cross-cutting concerns
- Location: `hooks/` directory
- Contains: `use-color-scheme` (re-exported from react-native), `use-theme-color` (custom theme resolution)
- Depends on: Constants (Colors)
- Used by: Components, pages

**Constants/Configuration Layer:**
- Purpose: Application-wide configuration, theme definitions, static values
- Location: `constants/` directory
- Contains: Theme colors (Colors object), font definitions (Fonts)
- Depends on: React Native Platform module
- Used by: Hooks, components

**Navigation Layer:**
- Purpose: Router configuration, navigation structure, modal presentation
- Location: `app/_layout.tsx` (root), `app/(tabs)/_layout.tsx` (tab navigator)
- Contains: Expo Router configuration, tab definitions, navigation stack setup
- Depends on: Pages, components (HapticTab), hooks (useColorScheme)
- Used by: Application entry point

## Data Flow

**Theme Resolution:**

1. Component requests themed color via `useThemeColor()` hook
2. Hook calls `useColorScheme()` to determine current theme ('light' or 'dark')
3. Hook resolves color from `Colors` constant based on theme and color name
4. Hook returns color to component
5. Component applies color to React Native View or Text element

**Navigation Flow:**

1. User taps tab in bottom tab bar
2. `HapticTab` component detects press event
3. On iOS, haptic feedback triggered via Expo Haptics
4. Expo Router changes to target screen
5. Target screen component renders with current theme

**Component Rendering:**

1. Page component (e.g., `HomeScreen`) initializes with theme-aware containers
2. Page uses `ThemedView` and `ThemedText` components for consistent styling
3. Child components inherit theme context through hook calls
4. Animations (parallax, collapsibles) use react-native-reanimated
5. User interactions trigger state changes or navigation

## Key Abstractions

**Themed Components:**
- Purpose: Abstract away light/dark mode conditional rendering
- Examples: `components/themed-text.tsx`, `components/themed-view.tsx`
- Pattern: Accept optional lightColor/darkColor props, use useThemeColor() to resolve final color, spread remaining props to native component

**ParallaxScrollView:**
- Purpose: Provide scrollable layout with parallax header animation
- Examples: `components/parallax-scroll-view.tsx`
- Pattern: Custom animated scroll container using react-native-reanimated, interpolates scroll offset to transform header

**Icon Symbol Wrapper:**
- Purpose: Normalize icon usage across platforms (SF Symbols on iOS, Material Icons elsewhere)
- Examples: `components/ui/icon-symbol.tsx`, `components/ui/icon-symbol.ios.tsx`
- Pattern: Map SF Symbol names to Material Icon names, conditionally export platform-specific implementation

**Collapsible Component:**
- Purpose: Expandable content container with animated chevron indicator
- Examples: `components/ui/collapsible.tsx`
- Pattern: Local state (isOpen) controls visibility and rotation animation, accepts children

## Entry Points

**Application Entry:**
- Location: `app/_layout.tsx`
- Triggers: Application startup via Expo Router entry point (defined in package.json as "expo-router/entry")
- Responsibilities: Root layout setup, theme provider initialization, navigation stack definition, status bar configuration

**Tab Navigation:**
- Location: `app/(tabs)/_layout.tsx`
- Triggers: Rendered by root layout Stack navigator
- Responsibilities: Tab bar configuration, tab screen definitions, haptic feedback setup, theme color application

**Home Screen:**
- Location: `app/(tabs)/index.tsx`
- Triggers: Tab navigation to home tab
- Responsibilities: Display welcome content, parallax header, navigation examples

**Explore Screen:**
- Location: `app/(tabs)/explore.tsx`
- Triggers: Tab navigation to explore tab
- Responsibilities: Display collapsible documentation sections, feature explanations

**Modal Screen:**
- Location: `app/modal.tsx`
- Triggers: Link navigation from home screen
- Responsibilities: Simple modal content with dismiss action

## Error Handling

**Strategy:** No explicit error handling layer detected - uses React Native default error boundaries and console warnings

**Patterns:**
- Platform-conditional code uses `Platform.select()` to avoid invalid property access
- External link handler wraps browser open in try/async pattern but catches no errors
- No try/catch blocks in components or hooks

## Cross-Cutting Concerns

**Logging:** No logging framework configured; uses React Native console methods implicitly

**Validation:** No validation library detected; uses TypeScript strict mode for compile-time checking

**Authentication:** Not implemented; application is public UI shell

**Styling:** React Native StyleSheet API with platform-specific fonts via constants/theme.ts

**Theme Management:** useColorScheme() hook at global level, theme resolution via useThemeColor() hook in components

---

*Architecture analysis: 2026-02-08*
