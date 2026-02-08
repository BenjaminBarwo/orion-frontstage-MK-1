# Coding Conventions

**Analysis Date:** 2026-02-08

## Naming Patterns

**Files:**
- Kebab-case for component files: `themed-text.tsx`, `hello-wave.tsx`, `use-theme-color.ts`
- All lowercase, hyphenated separators
- Platform-specific extensions allowed: `use-color-scheme.web.ts`, `icon-symbol.ios.tsx`
- Layout/route files use parentheses for grouping: `(tabs)`, `(tabs)/_layout.tsx`

**Functions:**
- camelCase for all function and hook names
- Hooks prefixed with `use`: `useThemeColor()`, `useColorScheme()`
- Exported functions capitalized (PascalCase) when component-like: `HelloWave`, `ThemedText`, `Collapsible`, `ExternalLink`
- Regular exported functions may be camelCase or PascalCase based on role

**Variables:**
- camelCase for all variables: `colorScheme`, `scrollRef`, `headerAnimatedStyle`, `isOpen`
- useState setters follow pattern: `isOpen`, `setIsOpen`
- Constants in UPPERCASE when module-level: `HEADER_HEIGHT`, `MAPPING`

**Types:**
- PascalCase for type/interface names: `ThemedTextProps`, `ThemedViewProps`, `Props`, `IconMapping`, `IconSymbolName`
- Object property names are camelCase: `lightColor`, `darkColor`, `headerBackgroundColor`

## Code Style

**Formatting:**
- No explicit Prettier config detected, but code shows consistent patterns:
  - 2-space indentation (implicit from code)
  - Semicolons used consistently
  - Single quotes for strings in JSX attributes
  - Double quotes for JSX content

**Linting:**
- ESLint with expo config (`eslint-config-expo`)
- Config file: `eslint.config.js`
- Run with: `npm run lint`
- Rule enforcement via Expo's recommended config

**Line Length:**
- No explicit rule enforced, but observed lines stay under 100 characters
- Long JSX props wrapped to new lines

## Import Organization

**Order:**
1. React/React Native imports (built-in, external libraries)
2. Expo imports
3. Relative imports using `@/` alias

**Example from `components/themed-text.tsx`:**
```typescript
import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
```

**Path Aliases:**
- `@/` maps to project root: `tsconfig.json` defines `"@/*": ["./*"]`
- Used consistently for all relative imports
- Examples: `@/components/`, `@/hooks/`, `@/constants/`, `@/assets/`

## Error Handling

**Patterns:**
- Conditional returns with early exit: `if (colorFromProps) { return colorFromProps; } else { return Colors[theme][colorName]; }`
- Null coalescing: `colorScheme ?? 'light'` when undefined is possible
- No try-catch blocks observed in codebase (mostly UI components)
- Platform-specific fallbacks: `process.env.EXPO_OS !== 'web'` in `ExternalLink`

**Validation:**
- Type safety via TypeScript strict mode (`"strict": true` in tsconfig)
- Props validation through TypeScript interfaces/types
- No runtime validation libraries detected

## Logging

**Framework:** console (no external logging detected)

**Patterns:**
- No console.log calls observed in production code
- No structured logging framework in use
- Alert boxes used for user feedback: `alert('Action pressed')`

## Comments

**When to Comment:**
- Top-level file comments explaining purpose: `// Fallback for using MaterialIcons on Android and web.`
- JSDoc comments for exported functions and hooks
- Inline comments for non-obvious logic

**JSDoc/TSDoc:**
- Used in some modules: See `hooks/use-color-scheme.web.ts` for example
```typescript
/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() { ... }
```
- Also seen in `components/ui/icon-symbol.tsx` with detailed explanations
- Recommended for all exported hooks and components

## Function Design

**Size:** Functions kept small and focused
- Components typically 20-50 lines
- Hooks 10-25 lines
- Single responsibility principle observed

**Parameters:**
- Destructuring used for props: `function ThemedText({ style, lightColor, darkColor, type = 'default', ...rest }: ThemedTextProps)`
- Type parameters strongly typed: `type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string }`
- Spread operator for remaining props: `{...rest}`, `{...otherProps}`

**Return Values:**
- Functional components return JSX
- Hooks return single values or objects with clear structure
- Null values avoided in favor of conditional rendering

## Module Design

**Exports:**
- Named exports for components: `export function ThemedText(...)`
- Default exports for screen/page components: `export default function HomeScreen()`
- Type exports: `export type ThemedTextProps = ...`

**Barrel Files:**
- Not currently used in project
- Imports are direct: `import { ThemedText } from '@/components/themed-text'`

**Component Composition:**
- Props extended with spread operator
- Clear prop interfaces defined before implementation
- Reusable styled components pattern: `ThemedText`, `ThemedView` wrap platform components with theme logic

---

*Convention analysis: 2026-02-08*
