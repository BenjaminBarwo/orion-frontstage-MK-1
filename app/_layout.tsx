'use no memo';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useNavigationContainerRef, SplashScreen, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { PostHogProvider } from 'posthog-react-native';
import { POSTHOG_API_KEY } from '@/constants/config';
import { initSentry, sentryNavigationIntegration } from '@/lib/sentry';
import { AppErrorBoundary } from '@/components/error-boundary';
import { SessionProvider, useAuth } from '@/lib/auth-context';
import { getProfile } from '@/lib/profile-service';
import { ProfileGateProvider } from '@/lib/profile-gate';

const POSTHOG_OPTIONS = {
  host: 'https://us.i.posthog.com',
  captureAppLifecycleEvents: true,
} as const;

// Initialize Sentry before any component renders
initSentry();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * Inner layout component that handles auth-based routing
 * Separated to allow useAuth hook access
 */
function RootLayoutNav() {
  const { session, isLoading, isNewSignUp } = useAuth();
  const colorScheme = useColorScheme();
  const navigationRef = useNavigationContainerRef();
  const router = useRouter();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const lastRouteStateRef = useRef<string>('');
  const markProfileComplete = useCallback(() => setProfileComplete(true), []);
  const profileGateValue = useMemo(() => ({ markProfileComplete }), [markProfileComplete]);

  // Register Sentry navigation tracking
  useEffect(() => {
    if (navigationRef) {
      sentryNavigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  // Check profile completeness when session exists
  useEffect(() => {
    if (isLoading) return;
    if (!session?.user?.id) {
      setProfileComplete(null);
      return;
    }

    let cancelled = false;
    async function checkProfile() {
      try {
        const profile = await getProfile(session!.user.id);
        if (cancelled) return;
        setProfileComplete(profile?.onboarding_completed === true);
      } catch {
        if (cancelled) return;
        setProfileComplete(false);
      }
    }
    checkProfile();
    return () => { cancelled = true; };
  }, [session, isLoading]);

  // Hide splash screen once auth state is resolved
  useEffect(() => {
    const shouldHide = !isLoading && (profileComplete !== null || !session);
    if (shouldHide) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, profileComplete, session]);

  // Single routing effect — state machine for all navigation
  useEffect(() => {
    if (isLoading) return;
    if (session && profileComplete === null) return;

    let target: string;
    if (!session) {
      target = '/(auth)/sign-up';
    } else if (isNewSignUp) {
      target = '/welcome';
    } else if (profileComplete === false) {
      target = '/(onboarding)/role';
    } else {
      target = '/(tabs)';
    }

    if (lastRouteStateRef.current === target) return;

    lastRouteStateRef.current = target;
    setTimeout(() => router.replace(target as any), 0);
  }, [isLoading, session, profileComplete, isNewSignUp, router]);

  // Show nothing while loading session or checking profile (splash screen stays visible)
  if (isLoading || (session && profileComplete === null)) {
    return null;
  }

  return (
    <ProfileGateProvider value={profileGateValue}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppErrorBoundary>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="(auth)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(onboarding)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="welcome"
              options={{
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </AppErrorBoundary>
        <StatusBar style="auto" />
        <Toast />
      </ThemeProvider>
    </ProfileGateProvider>
  );
}

/**
 * Root layout wraps app in SessionProvider and optional PostHogProvider
 */
function RootLayout() {
  const content = (
    <SessionProvider>
      <RootLayoutNav />
    </SessionProvider>
  );

  if (!POSTHOG_API_KEY) {
    return content;
  }

  return (
    <PostHogProvider
      apiKey={POSTHOG_API_KEY}
      options={POSTHOG_OPTIONS}
      autocapture
    >
      {content}
    </PostHogProvider>
  );
}

export default Sentry.wrap(RootLayout);
