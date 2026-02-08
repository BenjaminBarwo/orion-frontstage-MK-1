# Testing Patterns

**Analysis Date:** 2026-02-08

## Test Framework

**Status:** No testing framework configured

**Not Present:**
- No `jest.config.js`, `vitest.config.js`, or similar config files
- No test dependencies in `package.json`
- No test files (`.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx`) found in codebase
- No testing scripts in package.json

**Current Dependencies:**
The project only includes:
```json
"devDependencies": {
  "@types/react": "~19.1.0",
  "typescript": "~5.9.2",
  "eslint": "^9.25.0",
  "eslint-config-expo": "~10.0.0"
}
```

## Recommendations for Testing Setup

**For Unit/Component Testing:**
Consider adding:
- **Jest** as test runner: `npm install --save-dev jest @types/jest`
- **React Native Testing Library** for component testing: `npm install --save-dev @testing-library/react-native @testing-library/jest-native`
- **Babel setup** for Jest to transpile TSX/TS files

**Config Template (if Jest added):**
```javascript
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
```

## Test File Organization

**Suggested Location Pattern:**
- Co-located with source files (preferred for maintainability)
- Structure: `components/themed-text.test.tsx` alongside `components/themed-text.tsx`
- Alternative: Separate `__tests__` directory at same level

**Naming Convention:**
- `.test.ts` or `.test.tsx` suffix for test files
- Match the file being tested: `themed-text.tsx` → `themed-text.test.tsx`

**Test Suite Structure:**
No existing test pattern to reference, but recommended structure for this codebase:

```typescript
import { render } from '@testing-library/react-native';
import { ThemedText } from './themed-text';

describe('ThemedText', () => {
  it('renders text with default type', () => {
    const { getByText } = render(<ThemedText>Hello</ThemedText>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('applies correct styles for title type', () => {
    const { getByText } = render(<ThemedText type="title">Title</ThemedText>);
    const element = getByText('Title');
    expect(element.props.style).toContainEqual({
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 32,
    });
  });

  it('applies theme colors when darkColor provided', () => {
    const { getByText } = render(
      <ThemedText lightColor="white" darkColor="black">
        Themed
      </ThemedText>
    );
    expect(getByText('Themed')).toBeTruthy();
  });
});
```

## Mocking

**Framework if Added:** Jest with manual mocks

**Hook Mocking Pattern:**
```typescript
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#ffffff',
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));
```

**What to Mock:**
- Theme hooks: `useThemeColor`, `useColorScheme`
- Navigation hooks: `useRouter`, `Link` (from expo-router)
- Animated APIs: Can be partially mocked or use react-native-reanimated test utilities
- External APIs if any are integrated

**What NOT to Mock:**
- Core React Native components (`View`, `Text`, `StyleSheet`)
- Component logic that should be tested in integration
- Navigation flow when testing app navigation

**Platform-Specific Testing:**
Account for `.web.ts` and `.ios.tsx` variants:
```typescript
// Use Jest config to map platform-specific imports
moduleNameMapper: {
  '^@/hooks/use-color-scheme$': '<rootDir>/hooks/use-color-scheme.ts',
}
```

## Fixtures and Factories

**Not Currently Used**

**Suggested Pattern for Test Data:**
Create `__tests__/fixtures/` directory for reusable test data:

```typescript
// __tests__/fixtures/theme-props.ts
export const lightThemeProps = {
  lightColor: '#ffffff',
  darkColor: '#000000',
};

export const darkThemeProps = {
  lightColor: '#f0f0f0',
  darkColor: '#1a1a1a',
};

// Usage in test:
import { lightThemeProps } from '@/__tests__/fixtures/theme-props';

describe('ThemedView', () => {
  it('uses light theme', () => {
    const { getByTestId } = render(
      <ThemedView {...lightThemeProps} testID="view">
        Content
      </ThemedView>
    );
    expect(getByTestId('view')).toBeTruthy();
  });
});
```

## Coverage

**Requirements:** Not enforced (no test setup exists)

**Suggested Target:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**View Coverage Command (if Jest added):**
```bash
npm test -- --coverage
```

**Generate Coverage Report:**
```bash
npm test -- --coverage --collectCoverageFrom='app/**/*.{ts,tsx}' --collectCoverageFrom='components/**/*.{ts,tsx}'
```

## Test Types

**Unit Tests:** Not yet implemented
- Should test individual components: `ThemedText`, `Collapsible`, `IconSymbol`
- Test hooks: `useThemeColor`, `useColorScheme`
- Test utility functions in `constants/theme.ts`

**Integration Tests:** Not yet implemented
- Test component composition: `ParallaxScrollView` with children
- Test navigation flow: `(tabs)/_layout.tsx` navigation between Home and Explore
- Test theme switching across components

**E2E Tests:** Not configured
- Consider Detox or native test runner for mobile E2E
- Test user flows: navigation, theme switching, interaction with modals

## Common Test Patterns

**Async Testing (if hooks use async):**
```typescript
it('loads theme asynchronously', async () => {
  const { result } = renderHook(() => useThemeColor({}));
  await waitFor(() => {
    expect(result.current).toBeDefined();
  });
});
```

**Error Testing:**
```typescript
it('handles missing color gracefully', () => {
  // Test behavior when color is undefined
  const color = useThemeColor({}, 'text');
  expect(color).toBeDefined();
});
```

**Component Rendering with Props:**
```typescript
it('respects custom styles', () => {
  const customStyle = { marginTop: 10 };
  const { getByText } = render(
    <ThemedText style={customStyle}>Custom</ThemedText>
  );
  const element = getByText('Custom');
  expect(element.props.style).toContainEqual(customStyle);
});
```

## Files for Testing

**Key Components to Test:**
- `components/themed-text.tsx`: Core styled text component
- `components/themed-view.tsx`: Core styled view component
- `components/ui/collapsible.tsx`: Interactive component with state
- `hooks/use-theme-color.ts`: Theme resolution logic
- `hooks/use-color-scheme.ts` and `.web.ts`: Platform-specific hook behavior

**Entry Points to Test:**
- `app/(tabs)/_layout.tsx`: Navigation setup
- `app/(tabs)/index.tsx`: Home screen rendering
- `app/_layout.tsx`: Root layout with theme provider

---

*Testing analysis: 2026-02-08*
