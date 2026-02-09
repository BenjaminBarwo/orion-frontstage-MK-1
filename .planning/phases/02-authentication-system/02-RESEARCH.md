# Phase 2: Authentication System - Research

**Researched:** 2026-02-09
**Domain:** Supabase Auth with React Native/Expo
**Confidence:** HIGH

## Summary

Phase 2 implements a complete authentication system for founding pros using Supabase Auth in an Expo/React Native environment. The research confirms that all required features—email/password auth, social login (Google/Apple), email verification, password reset, and persistent sessions—are well-supported by the current Expo SDK 54 + Supabase stack. The project's existing `lib/supabase.ts` setup with `expo-sqlite` localStorage polyfill already establishes the foundation for session persistence.

The authentication domain in React Native requires careful orchestration of multiple concerns: Supabase Auth SDK integration, native social sign-in modules, Expo Router protected routes, secure session storage, keyboard handling for forms, visual feedback (toast notifications), input validation, and smooth UI transitions. All of these have mature, well-documented solutions in the current ecosystem.

**Primary recommendation:** Use Supabase Auth's built-in email/password flow with magic link verification (default), implement social login with `expo-apple-authentication` and `@react-native-google-signin/google-signin`, protect routes with Expo Router's `Stack.Protected` pattern using React Context for session management, and handle auth errors with `react-native-toast-message` for non-blocking user feedback.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Sign-up flow:**
- Email + password only — no name or profile fields at sign-up (deferred to Phase 3)
- Single screen layout — email, password, and sign-up button all on one screen
- Social login: Google + Apple alongside email/password
- Default landing screen is sign-up (not login) — "Already have an account?" link to login
- Sign-up first makes sense for a new app acquiring founding pros

**Session & logout behavior:**
- Sessions persist indefinitely — no auto-logout timeout
- Multi-device sessions allowed — no single-device restriction
- Logout accessible from Settings screen only — low prominence
- Logout is immediate — no confirmation dialog

**Verification & recovery:**
- Email verification is optional with periodic reminder nudges — not required to use the app
- Forgot Password flow included in this phase — standard password reset via email
- Auth errors displayed as toast notifications (not inline below fields)

**Auth screen design:**
- Dark & premium visual tone — dark background, gold/white accents signaling exclusivity for $100/month founding tier
- Logo + tagline on the auth screen
- Visual password strength meter (color-coded weak/medium/strong)
- Smooth transitions between auth screens — fade in/out with card swipe/movement animations
- After sign-up: single welcome card (logo, welcome message, brief value prop, "Get Started" button)
- Post-welcome destination: into the app (profile setup prompted in Phase 3)

### Claude's Discretion

- Verification method (magic link vs 6-digit code) — pick based on Supabase capabilities and UX
- Social login button placement relative to email fields — pick based on conversion patterns
- Auth screen copy/tagline — write copy fitting dark & premium tone for real estate pros; remember MVR = "Most Valuable Relationships" and it's a routing system
- Exact color values, typography, and spacing within the dark & premium direction
- Welcome card copy and layout

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | ^2.95.3 | Auth backend, session management | Official Supabase client, handles email/password, OAuth, session persistence, password reset |
| `expo-sqlite` | ~16.0.10 | localStorage polyfill for RN | Required for Supabase session persistence in React Native (already installed) |
| `@react-native-async-storage/async-storage` | 2.2.0 | Async storage for sessions | Standard for React Native storage, already installed |
| `expo-apple-authentication` | latest | Apple Sign In native module | Official Expo module, App Store requirement when offering social auth |
| `@react-native-google-signin/google-signin` | ^14.2.0 | Google Sign In native module | Industry standard, native sign-in experience for Android/iOS |
| `expo-web-browser` | ~15.0.10 | Deep linking for OAuth callbacks | Required for social OAuth redirects, already installed |
| `react-native-reanimated` | ~4.1.1 | Smooth UI animations | Already installed, best performance for gesture-driven animations |
| `react-hook-form` | ^7.54.2 | Form state management | Industry standard, minimal re-renders, excellent performance |
| `zod` | ^3.24.1 | Schema validation | TypeScript-first validation, type inference, modern approach |
| `react-native-toast-message` | ^2.2.1 | Toast notifications | Most popular non-blocking notification library for RN |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `expo-secure-store` | latest | Secure key storage | For MMKV encryption key storage (multi-device sessions) |
| `react-native-mmkv` | latest | Fast encrypted storage | Alternative to AsyncStorage for session encryption (optional enhancement) |
| `@hookform/resolvers` | ^3.9.1 | React Hook Form + Zod integration | Connects Zod schemas to React Hook Form |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Magic links | Email OTP (6-digit code) | OTP requires manual code entry; magic links = one-click. Magic links are default, require no template changes, better UX for first-time users |
| `react-native-toast-message` | `toastify-react-native` | Slightly less popular but similar features. Stick with `react-native-toast-message` (153 npm projects vs fewer) |
| Zod | Yup | Yup is JavaScript-first, Zod is TypeScript-first with better type inference. Project uses TypeScript strict mode → Zod is the better fit |
| `@react-native-google-signin/google-signin` | `@react-oauth/google` (web-only) | Web-only solution doesn't provide native sign-in experience. Native module required for iOS/Android |
| AsyncStorage | MMKV with encryption | MMKV is faster and supports encryption. AsyncStorage works fine for MVP; MMKV is an enhancement (deferred) |

**Installation:**

```bash
# New packages needed
npx expo install expo-apple-authentication
npm install @react-native-google-signin/google-signin react-hook-form zod @hookform/resolvers react-native-toast-message

# Already installed (verify versions)
# @supabase/supabase-js ^2.95.3 ✓
# expo-sqlite ~16.0.10 ✓
# @react-native-async-storage/async-storage 2.2.0 ✓
# expo-web-browser ~15.0.10 ✓
# react-native-reanimated ~4.1.1 ✓
```

## Architecture Patterns

### Recommended Project Structure

```
app/
├── (auth)/              # Auth route group (unauthenticated)
│   ├── _layout.tsx      # Stack navigator for auth screens
│   ├── sign-up.tsx      # Default: sign-up screen
│   ├── sign-in.tsx      # Login screen
│   └── forgot-password.tsx  # Password reset
├── (tabs)/              # Protected app routes (existing)
│   ├── _layout.tsx
│   ├── index.tsx
│   └── explore.tsx
├── welcome.tsx          # Post-signup welcome card (modal or screen)
├── _layout.tsx          # Root layout with SessionProvider
└── ...

components/
├── auth/
│   ├── auth-form.tsx           # Reusable email/password form
│   ├── social-auth-buttons.tsx # Google + Apple buttons
│   ├── password-strength-meter.tsx  # Visual strength indicator
│   └── auth-error-toast.tsx    # Toast wrapper for auth errors
├── ui/                  # Existing UI primitives
└── ...

lib/
├── supabase.ts          # Existing Supabase client
├── auth-context.tsx     # Session context provider
└── validation/
    └── auth-schemas.ts  # Zod schemas for auth forms

hooks/
├── use-auth.ts          # Custom hook: useAuth() → session, signIn, signOut, etc.
└── use-session-storage.ts  # Persist session with expo-secure-store
```

### Pattern 1: Session Management with React Context

**What:** Create an `AuthContext` that wraps the app, provides session state, and exposes `signIn()`, `signOut()`, `signUp()`, and `session` values.

**When to use:** This is the foundation pattern for all authentication. Required for Expo Router protected routes.

**Example:**

```typescript
// lib/auth-context.tsx
// Source: https://docs.expo.dev/router/advanced/authentication/

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    // Implementation in Pattern 3
  };

  const signInWithApple = async () => {
    // Implementation in Pattern 3
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signIn, signUp, signOut, signInWithGoogle, signInWithApple }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within SessionProvider');
  return context;
}
```

### Pattern 2: Protected Routes with Expo Router

**What:** Use `Stack.Protected` component to guard authenticated routes based on session state. Redirect unauthenticated users to sign-up/sign-in screens.

**When to use:** For protecting app routes (tabs) and ensuring only authenticated users can access the main app.

**Example:**

```typescript
// app/_layout.tsx
// Source: https://docs.expo.dev/router/advanced/authentication/

import { Stack } from 'expo-router';
import { SessionProvider, useAuth } from '@/lib/auth-context';
import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        {/* Protected routes only accessible when logged in */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ presentation: 'modal' }} />
      </Stack.Protected>

      {/* Unauthenticated routes (outside protection) */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootLayoutNav />
    </SessionProvider>
  );
}
```

### Pattern 3: Social Login Integration

**What:** Implement Google and Apple Sign In using native modules, then exchange identity tokens for Supabase sessions.

**When to use:** For social authentication flows alongside email/password.

**Example:**

```typescript
// lib/auth-context.tsx (add to SessionProvider)
// Source: https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth

import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as WebBrowser from 'expo-web-browser';

// Configure Google Sign In (call once on app start)
GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // From Google Cloud Console
  iosClientId: 'YOUR_IOS_CLIENT_ID', // Optional, from Google Cloud Console
});

// Apple Sign In
const signInWithApple = async () => {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    ],
  });

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken!,
  });

  if (error) throw error;
};

// Google Sign In
const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();

  if (userInfo.data?.idToken) {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.data.idToken,
    });
    if (error) throw error;
  }
};
```

### Pattern 4: Form Validation with React Hook Form + Zod

**What:** Define Zod schemas for auth forms, connect to React Hook Form with `@hookform/resolvers/zod`, get type-safe validation.

**When to use:** For all auth forms (sign-up, sign-in, password reset).

**Example:**

```typescript
// lib/validation/auth-schemas.ts
import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const passwordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
```

```typescript
// app/(auth)/sign-up.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpInput } from '@/lib/validation/auth-schemas';

export default function SignUpScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    try {
      await signUp(data.email, data.password);
    } catch (error) {
      // Handle error with toast
    }
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && <Text>{errors.email.message}</Text>}
      {/* Similar for password field */}
    </View>
  );
}
```

### Pattern 5: Password Strength Meter

**What:** Real-time visual feedback on password strength with color-coded indicator (weak/medium/strong).

**When to use:** Sign-up screen only (not sign-in or password reset).

**Example:**

```typescript
// components/auth/password-strength-meter.tsx
import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type PasswordStrength = 'weak' | 'medium' | 'strong';

function calculateStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score === 3 || score === 4) return 'medium';
  return 'strong';
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = useMemo(() => calculateStrength(password), [password]);

  const color = {
    weak: '#FF4444',    // Red
    medium: '#FFB84D',  // Gold/Orange
    strong: '#4CAF50',  // Green
  }[strength];

  const progress = {
    weak: 0.33,
    medium: 0.66,
    strong: 1.0,
  }[strength];

  if (!password) return null;

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.label, { color }]}>
        {strength.charAt(0).toUpperCase() + strength.slice(1)}
      </Text>
    </View>
  );
}
```

### Pattern 6: Toast Error Notifications

**What:** Non-blocking toast notifications for auth errors (not inline below fields).

**When to use:** All auth error scenarios (sign-up, sign-in, social login failures).

**Example:**

```typescript
// components/auth/auth-error-toast.tsx
import Toast from 'react-native-toast-message';

export function showAuthError(error: Error) {
  Toast.show({
    type: 'error',
    text1: 'Authentication Error',
    text2: error.message,
    position: 'top',
    visibilityTime: 4000,
  });
}

export function showAuthSuccess(message: string) {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
}

// Usage in sign-up screen
try {
  await signUp(email, password);
  showAuthSuccess('Account created! Check your email for verification.');
} catch (error) {
  showAuthError(error as Error);
}
```

```typescript
// app/_layout.tsx (add Toast root component)
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootLayoutNav />
      <Toast /> {/* Must be last child */}
    </SessionProvider>
  );
}
```

### Pattern 7: Password Reset Flow with Deep Linking

**What:** Send password reset email with deep link, handle redirect in app, allow user to set new password.

**When to use:** Forgot password flow.

**Example:**

```typescript
// app/(auth)/forgot-password.tsx
import { supabase } from '@/lib/supabase';
import { Linking } from 'react-native';

export default function ForgotPasswordScreen() {
  const handlePasswordReset = async (email: string) => {
    const redirectTo = Linking.createURL('reset-password');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) throw error;

    showAuthSuccess('Check your email for password reset instructions.');
  };

  // Form UI with email input
}
```

```typescript
// app/(auth)/reset-password.tsx
// Handles deep link callback after user clicks email link

import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');

  const handleUpdatePassword = async () => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    showAuthSuccess('Password updated successfully!');
    router.replace('/(auth)/sign-in');
  };

  // Form UI with new password input
}
```

### Pattern 8: Card Swipe/Fade Transitions with Reanimated

**What:** Smooth fade-in/fade-out and card-style transitions between auth screens using `react-native-reanimated`.

**When to use:** Auth screen navigation (sign-up → sign-in → forgot password).

**Example:**

```typescript
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';
import { withLayoutContext } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade', // Built-in Expo Router animation
        // For custom card swipe, use Reanimated custom transitions
      }}
    >
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
```

For custom card swipe animations (user decision: "card swipe/movement animations"):

```typescript
// Use SharedValue and useAnimatedStyle from react-native-reanimated
// Source: https://medium.com/@southxzx/react-native-fading-swiper-with-react-native-reanimated-c6568b5ff90c

import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// Implement custom transition animation in auth screens
// Details in implementation phase based on final design
```

### Anti-Patterns to Avoid

- **Storing passwords in component state without clearing on unmount:** Always clear sensitive form data when navigating away
- **Using `getSession()` instead of `getUser()` for multi-platform logout:** `getUser()` validates token server-side, prevents `AuthSessionMissingError` when logging out from different platforms
- **Blocking UI with inline error messages below fields:** User decision requires toast notifications, not inline errors
- **Auto-logout on timeout:** User decision is "sessions persist indefinitely — no auto-logout timeout"
- **Requiring email verification to use the app:** User decision is "optional with periodic reminder nudges — not required to use the app"
- **Showing logout in navigation or prominent places:** User decision is "logout accessible from Settings screen only — low prominence"
- **Confirmation dialog for logout:** User decision is "logout is immediate — no confirmation dialog"

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session persistence | Custom token storage with AsyncStorage encryption | Supabase Auth with `expo-sqlite` localStorage polyfill (already set up) | Supabase handles token refresh, encryption, expiration, and auto-refresh. Custom implementation misses edge cases like concurrent refresh attempts, offline session recovery, token rotation |
| Password strength calculation | Custom regex scoring algorithm | Industry-standard scoring algorithm (zxcvbn or similar) OR simple rule-based (8+ chars, upper, lower, number) | Password strength is deceptively complex (dictionary attacks, common patterns, entropy). For MVP, simple rule-based is sufficient and transparent to users |
| Form validation | Custom error state management | React Hook Form + Zod | Hand-rolled validation misses: field-level validation, async validation, type inference, re-render optimization, touched/dirty state |
| Social login OAuth flows | Manual OAuth token exchange | Native modules (`expo-apple-authentication`, `@react-native-google-signin/google-signin`) + Supabase `signInWithIdToken()` | OAuth 2.0 has security complexities: PKCE, state parameters, nonce, token expiration, refresh flows. Native modules + Supabase handle this correctly |
| Email verification | Custom OTP generation and storage | Supabase Auth built-in email verification (magic links or OTP) | Requires secure token generation, expiration tracking, rate limiting, email template management, deep linking. Supabase provides all of this out-of-the-box |
| Toast notifications | Custom `Alert` or `Modal` wrapper | `react-native-toast-message` | Toast libraries handle: stacking multiple toasts, auto-dismiss timers, gesture dismissal, positioning, animation, accessibility |
| Deep linking for OAuth/password reset | Custom URL parsing and routing | `expo-web-browser` + `Linking.createURL()` + Expo Router automatic deep link handling | Deep linking requires URL scheme registration, query param parsing, state restoration. Expo handles platform differences (iOS universal links, Android App Links) |

**Key insight:** Authentication is security-critical with subtle edge cases. The Supabase + Expo ecosystem has battle-tested solutions for every auth concern. Building custom solutions risks security holes, poor UX, and maintenance burden. Use the standard stack and focus implementation effort on the premium UI/UX (dark theme, animations, password strength meter, copy/messaging).

## Common Pitfalls

### Pitfall 1: Session Lost on Offline App Start

**What goes wrong:** User opens app without internet connection, session expires after refresh token retries fail, user is logged out even though `persistSession: true` is set.

**Why it happens:** Supabase Auth attempts to validate the session on app start, and if network is unavailable, token refresh fails. Without additional offline handling, the session is cleared.

**How to avoid:**
- Use `getUser()` instead of `getSession()` for initial session check (validates locally first, then server-side when online)
- Implement AppState listener to refresh session only when app comes to foreground with internet connection
- Handle network errors gracefully in AuthContext (don't clear session on network failures)

**Warning signs:**
- User reports being logged out after opening app on plane/subway
- "AuthSessionMissingError" in logs when app starts offline

**Source:** [Supabase Discussion #36906](https://github.com/orgs/supabase/discussions/36906)

### Pitfall 2: Email Verification Blocks User Access (Against User Decision)

**What goes wrong:** Supabase Auth default requires email verification before creating a session. User signs up, but can't access app until email is verified.

**Why it happens:** Supabase Auth → Email → "Confirm email" setting is enabled by default.

**How to avoid:**
- Disable "Confirm email" in Supabase dashboard: Authentication → Providers → Email → "Confirm email" toggle OFF
- Implement periodic reminder nudges (Phase 3 or later) for unverified users via `user.email_confirmed_at` check

**Warning signs:**
- User reports "can't log in after signing up"
- Session is null after `signUp()` call even though no error is returned

**Source:** [Supabase Docs - Email Verification](https://supabase.com/docs/guides/auth/quickstarts/react-native)

### Pitfall 3: Social Login Requires Development Build (Not Expo Go)

**What goes wrong:** Developer tries to test Google Sign In in Expo Go, app crashes or shows "module not found" error.

**Why it happens:** `@react-native-google-signin/google-signin` uses native code and cannot run in Expo Go. Only works with custom development builds or production builds.

**How to avoid:**
- Create an Expo development build with `npx expo run:ios` or `npx expo run:android`
- Or use EAS Build to create a development build: `eas build --profile development --platform ios`
- Document this requirement in team setup guide

**Warning signs:**
- "Cannot find module" error for Google Sign In in Expo Go
- Apple Sign In works but Google Sign In fails

**Source:** [Expo Docs - Google Authentication](https://docs.expo.dev/guides/google-authentication/)

### Pitfall 4: Deep Link Redirect URLs Not Whitelisted

**What goes wrong:** Password reset email contains a redirect link, user clicks it, app doesn't open or shows "invalid redirect URL" error.

**Why it happens:** Supabase Auth requires all redirect URLs to be whitelisted in dashboard: Authentication → URL Configuration → Redirect URLs. Deep link URLs generated by `Linking.createURL()` must match whitelist.

**How to avoid:**
- Add redirect URLs to whitelist: `exp://127.0.0.1:8081/--/reset-password` (local dev), `myapp://reset-password` (production)
- Use wildcard for dev: `exp://127.0.0.1:*/**` (if allowed)
- Test password reset flow in both dev and production environments

**Warning signs:**
- Password reset email link doesn't open app
- Supabase error: "redirect URL not allowed"

**Source:** [Supabase Docs - Password Reset](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)

### Pitfall 5: Google Sign In Requires SHA-1 Certificate from Production Build

**What goes wrong:** Google Sign In works in development but fails in production with "API key invalid" or "unauthorized" error.

**Why it happens:** Google Cloud Console requires SHA-1 certificate fingerprint from the production build APK/IPA, not just the development build. Each build has a different certificate.

**How to avoid:**
- Generate production build with `eas build --profile production --platform android`
- Extract SHA-1 from production build: `keytool -list -v -keystore your-release-key.keystore` (Android)
- Add production SHA-1 to Google Cloud Console (in addition to development SHA-1)
- Test Google Sign In with a production build before release

**Warning signs:**
- Google Sign In works in dev, fails in TestFlight/Play Store builds
- "Error 10" or "Sign in failed" on production

**Source:** [Expo Docs - Google Authentication](https://docs.expo.dev/guides/google-authentication/)

### Pitfall 6: Keyboard Covering Input Fields on Auth Screens

**What goes wrong:** User taps password field, keyboard appears and covers the "Sign Up" button or password strength meter.

**Why it happens:** React Native doesn't automatically adjust layout when keyboard appears. Requires `KeyboardAvoidingView` or similar solution.

**How to avoid:**
- Wrap auth forms in `KeyboardAvoidingView` with `behavior="padding"` (iOS) or `behavior="height"` (Android)
- Or use `ScrollView` with `keyboardShouldPersistTaps="handled"` for longer forms
- Test on physical devices (simulator keyboard behavior differs)

**Warning signs:**
- User can't see submit button when keyboard is open
- Password strength meter is hidden behind keyboard

**Source:** [Expo Docs - Keyboard Handling](https://docs.expo.dev/guides/keyboard-handling/)

### Pitfall 7: Password Strength Meter Causes Performance Issues

**What goes wrong:** Password input feels laggy, UI freezes on every keystroke.

**Why it happens:** Strength calculation runs on every character change without optimization, or triggers unnecessary re-renders.

**How to avoid:**
- Use `useMemo` to memoize strength calculation
- Debounce strength calculation with `lodash.debounce` or custom hook (optional, only if needed)
- Keep calculation lightweight (simple regex checks, not complex dictionary lookups)

**Warning signs:**
- Input lag when typing password
- Frame drops on low-end Android devices

**Source:** Best practice from performance profiling

### Pitfall 8: Toast Notifications Covered by Modals or Keyboards

**What goes wrong:** Auth error toast appears but is hidden behind the keyboard or modal screen.

**Why it happens:** Toast z-index is lower than keyboard/modal, or Toast component is not rendered at root level.

**How to avoid:**
- Place `<Toast />` component as last child in root `_layout.tsx` (highest z-index)
- Use `position: 'top'` for toasts (appears above keyboard)
- Avoid `useModal: true` in toast config (blocks interaction)

**Warning signs:**
- User doesn't see error messages
- Toast appears briefly then disappears behind keyboard

**Source:** [react-native-toast-message docs](https://www.npmjs.com/package/react-native-toast-message)

## Code Examples

Verified patterns from official sources:

### Supabase Auth Sign-Up with Email Verification

```typescript
// Source: https://supabase.com/docs/guides/auth/quickstarts/react-native

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123',
  options: {
    emailRedirectTo: 'myapp://verify-email', // Deep link for email verification
  },
});

if (error) {
  showAuthError(error);
} else {
  showAuthSuccess('Account created! Check your email to verify.');
}
```

### Supabase Auth Sign-In

```typescript
// Source: https://supabase.com/docs/guides/auth/quickstarts/react-native

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securePassword123',
});

if (error) {
  showAuthError(error);
} else {
  // Session is automatically stored, onAuthStateChange listener will fire
  router.replace('/');
}
```

### Password Reset Flow

```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

// Step 1: Send reset email (forgot-password.tsx)
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: Linking.createURL('reset-password'),
});

// Step 2: Handle deep link callback (reset-password.tsx)
// User clicks email link, app opens to this screen

const { error } = await supabase.auth.updateUser({
  password: newPassword,
});

if (error) {
  showAuthError(error);
} else {
  showAuthSuccess('Password updated!');
  router.replace('/(auth)/sign-in');
}
```

### Apple Sign In

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/apple-authentication/

import * as AppleAuthentication from 'expo-apple-authentication';

const credential = await AppleAuthentication.signInAsync({
  requestedScopes: [
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
  ],
});

// credential.identityToken is the JWT token
// Exchange with Supabase
const { error } = await supabase.auth.signInWithIdToken({
  provider: 'apple',
  token: credential.identityToken,
});
```

### Google Sign In

```typescript
// Source: https://react-native-google-signin.github.io/docs/setting-up/expo

import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure once at app start
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
});

// Sign in
await GoogleSignin.hasPlayServices();
const userInfo = await GoogleSignin.signIn();

if (userInfo.data?.idToken) {
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: userInfo.data.idToken,
  });
}
```

### Keyboard Handling on Auth Screens

```typescript
// Source: https://docs.expo.dev/guides/keyboard-handling/

import { KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <ScrollView
    contentContainerStyle={{ flexGrow: 1 }}
    keyboardShouldPersistTaps="handled"
  >
    {/* Auth form inputs */}
  </ScrollView>
</KeyboardAvoidingView>
```

### React Hook Form with Zod Controller

```typescript
// Source: React Hook Form docs + Zod integration

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(signUpSchema),
  defaultValues: {
    email: '',
    password: '',
  },
});

<Controller
  control={control}
  name="email"
  render={({ field: { onChange, onBlur, value } }) => (
    <TextInput
      placeholder="Email"
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
      autoCapitalize="none"
      keyboardType="email-address"
      returnKeyType="next"
    />
  )}
/>
{errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
```

### Toast Root Component Setup

```typescript
// Source: https://www.npmjs.com/package/react-native-toast-message

// app/_layout.tsx
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <SessionProvider>
      <Stack>
        {/* routes */}
      </Stack>
      <Toast /> {/* Must be last child, renders on top of all screens */}
    </SessionProvider>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom OAuth flows with `expo-auth-session` | Native modules (`expo-apple-authentication`, `@react-native-google-signin/google-signin`) | 2023-2024 | Better UX (native sign-in sheets), simpler implementation, fewer security risks |
| Manual protected route checks with `useEffect` | `Stack.Protected` component in Expo Router | Expo Router v3+ (2024) | Declarative, less boilerplate, built-in redirect handling |
| Formik for form state | React Hook Form | 2022-2023 | Fewer re-renders, better performance, smaller bundle size |
| Yup for validation | Zod (TypeScript projects) | 2023-2024 | Type inference, schema-first types, better DX for TS |
| `react-native-root-toast` | `react-native-toast-message` | 2023 | Better maintained, more features, Expo compatibility |
| Expo SecureStore for entire session | AsyncStorage with expo-sqlite polyfill | Supabase recommendation (2023+) | Supabase sessions exceed SecureStore 2KB limit, AsyncStorage works better |
| Manual session management with AsyncStorage | Supabase Auth SDK with auto-refresh | Always (Supabase best practice) | Handles token refresh, expiration, multi-tab sync automatically |

**Deprecated/outdated:**

- **`expo-auth-session` for social login:** Still works, but native modules (`expo-apple-authentication`, Google Sign In) provide better UX with native sign-in sheets. Use native modules instead.
- **`react-native-root-toast`:** Package has compatibility issues with recent Expo/RN versions. Use `react-native-toast-message` instead.
- **Storing entire Supabase session in Expo SecureStore:** SecureStore has 2KB limit, Supabase session exceeds this. Use AsyncStorage (or MMKV) instead.
- **Email OTP without user request:** Magic links are default and better UX (one-click vs manual code entry). Only use OTP if user decision requires it (current decision: Claude's discretion → recommend magic links).

## Open Questions

### 1. Magic Link vs Email OTP for Verification

**What we know:**
- User decision: "Claude's Discretion — pick based on Supabase capabilities and UX"
- Supabase supports both magic links (default) and email OTP (6-digit code)
- Magic links: one-click, no manual entry, better UX for first-time users
- Email OTP: requires manual code entry, works without deep linking (if deep links fail)
- Both expire after 1 hour, rate-limited to once per 60 seconds

**What's unclear:**
- Whether deep linking will work reliably in all environments (simulator, TestFlight, production)
- User preference: some users expect OTP codes (common pattern in 2026)

**Recommendation:**
- **Start with magic links** (Supabase default, better UX, no template changes required)
- If deep linking issues arise during testing, switch to OTP by modifying email template
- User decision is "optional verification with periodic nudges," so verification method is low-stakes (not blocking access)

### 2. Social Login Button Placement

**What we know:**
- User decision: "Claude's Discretion — pick based on conversion patterns"
- Two common patterns:
  1. Social buttons above email/password fields ("Quick sign-up with...")
  2. Social buttons below email/password fields with "OR" divider
- Apple requires Apple Sign In if Google Sign In is present

**What's unclear:**
- Conversion data for real estate professional audience (no prior data for MVR)
- Whether "premium" positioning (user decision: dark & premium tone) favors social-first or email-first

**Recommendation:**
- **Social buttons ABOVE email/password fields** with "Quick sign-up" copy
- Reasoning: Premium product ($100/month) → reduce friction for founding pros (quick social login = higher conversion)
- "Already have an account? Sign in" link below social buttons, then email/password form below that
- A/B test in Phase 4 (analytics) if conversion data suggests email-first is better

### 3. Password Reset Deep Link Testing Strategy

**What we know:**
- Password reset requires deep linking: user clicks email link → app opens to reset-password screen
- Deep links work differently in dev (`exp://`) vs production (`myapp://`)
- Must whitelist redirect URLs in Supabase dashboard

**What's unclear:**
- Exact redirect URLs for all environments (local dev, Expo Go [won't work], dev build, TestFlight, production)
- Whether universal links (iOS) or App Links (Android) are needed for production

**Recommendation:**
- **Phase 2:** Implement basic deep linking for dev builds and production
- Test with `Linking.createURL()` for dev builds
- Configure universal links/App Links in `app.json` for production (Expo handles this)
- Add all redirect URLs to Supabase whitelist:
  - Dev: `exp://127.0.0.1:8081/--/reset-password`
  - Production: `myapp://reset-password` (replace `myapp` with actual scheme)
- Document testing steps in verification plan (test in dev build, TestFlight, production)

### 4. Welcome Card Implementation (Modal vs Screen)

**What we know:**
- User decision: "After sign-up: single welcome card (logo, welcome message, brief value prop, 'Get Started' button)"
- User decision: "Post-welcome destination: into the app (profile setup prompted in Phase 3)"
- Two options: modal (dismissable overlay) or screen (full-screen route)

**What's unclear:**
- Whether welcome card should be dismissable (modal) or require interaction (screen)
- Whether welcome card should show on every sign-up or only first sign-up (check profile completion in Phase 3?)

**Recommendation:**
- **Full-screen route** (`app/welcome.tsx`) with modal presentation style
- Reasoning: "Get Started" button suggests required interaction, not dismissable
- Navigation flow: Sign-up → automatic redirect to `welcome` → user taps "Get Started" → redirect to main app
- Non-dismissable (no close button), requires button tap to continue
- Show on every sign-up (Phase 2 scope), track "first launch" in Phase 3 if needed

## Sources

### Primary (HIGH confidence)

- [Supabase Docs - React Native Auth Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react-native) - Email/password auth, session persistence, email verification
- [Supabase Docs - Expo React Native Social Auth](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth) - Google and Apple Sign In integration
- [Supabase Docs - Passwordless Email Authentication](https://supabase.com/docs/guides/auth/auth-email-passwordless) - Magic links vs OTP comparison
- [Supabase JS API Reference - resetPasswordForEmail](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail) - Password reset implementation
- [Expo Docs - Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/) - expo-apple-authentication setup and usage
- [Expo Docs - Google Authentication](https://docs.expo.dev/guides/google-authentication/) - Google Sign In setup for Expo
- [Expo Docs - Expo Router Authentication](https://docs.expo.dev/router/advanced/authentication/) - Protected routes, session management, AuthContext pattern
- [Expo Docs - Keyboard Handling](https://docs.expo.dev/guides/keyboard-handling/) - KeyboardAvoidingView, keyboard dismiss
- [React Native Google Sign In Docs - Expo Setup](https://react-native-google-signin.github.io/docs/setting-up/expo) - @react-native-google-signin/google-signin configuration

### Secondary (MEDIUM confidence)

- [Medium - Supabase Password Reset: Magic Links vs OTP](https://medium.com/@sscodes/how-i-ended-up-choosing-supabase-magic-links-over-otp-for-password-reset-823cc4d41765) - Real-world comparison, magic links recommended
- [Medium - Expo Router Authentication with Protected Routes](https://medium.com/@siddhantshelake/expo-router-authentication-with-protected-routes-persistent-login-eed364e310cc) - Stack.Protected pattern example
- [Medium - React Native Fading Swiper with Reanimated](https://medium.com/@southxzx/react-native-fading-swiper-with-react-native-reanimated-c6568b5ff90c) - Card swipe animation patterns
- [Medium - Building Forms in React Native with React Hook Form and Zod](https://medium.com/@rutikpanchal121/building-a-robust-form-in-react-native-with-react-hook-form-and-zod-for-validation-7583678970c3) - Form validation pattern
- [Better Stack - Yup vs Zod Comparison](https://betterstack.com/community/guides/scaling-nodejs/yup-vs-zod/) - Validation library comparison
- [Medium - Form Validation: Yup vs Zod vs Joi (Jan 2026)](https://medium.com/@osmion/form-validation-yup-vs-zod-vs-joi-which-one-should-you-actually-use-681988f84692) - Current recommendation: Zod for TypeScript
- [npm - react-native-toast-message](https://www.npmjs.com/package/react-native-toast-message) - Toast library setup and API
- [GitHub - Supabase Discussion #36906](https://github.com/orgs/supabase/discussions/36906) - Session lost on offline app start pitfall
- [GitHub - Supabase Discussion #4837](https://github.com/orgs/supabase/discussions/4837) - OTP vs magic link implementation

### Tertiary (LOW confidence - flagged for validation)

- Various blog posts and tutorials on password strength meters (no single authoritative source)
- Community discussions on toast notification z-index issues (multiple sources, anecdotal)

## Metadata

**Confidence breakdown:**

- **Standard stack:** HIGH - All libraries verified via official docs, package.json shows existing installations, Supabase + Expo is well-documented stack
- **Architecture patterns:** HIGH - Patterns sourced from official Expo Router docs and Supabase quickstarts, verified with current versions
- **Pitfalls:** MEDIUM-HIGH - Most pitfalls verified via GitHub discussions and official docs, some are based on community experience (session offline issue, SHA-1 production certificate)
- **Social login implementation:** MEDIUM - Apple Sign In is straightforward (official Expo module), Google Sign In requires native build (verified but not tested in this project yet)
- **UI/UX decisions (password strength, animations, copy):** MEDIUM - Technical implementation is clear, but visual design details (colors, exact animations) are user's discretion and will be refined during implementation

**Research date:** 2026-02-09

**Valid until:** 2026-03-09 (30 days - stable ecosystem, Expo SDK 54 is current, Supabase Auth API is stable)
