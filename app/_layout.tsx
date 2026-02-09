import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useNavigationContainerRef, Redirect, SplashScreen, useRouter } from 'expo-router';
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
  const { session, isLoading, isNewSignUp, clearNewSignUp } = useAuth();
  const colorScheme = useColorScheme();
  const navigationRef = useNavigationContainerRef();
  const router = useRouter();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (navigationRef) {
      sentryNavigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  // Check profile completeness when session exists
  useEffect(() => {
    async function checkProfile() {
      if (!session?.user?.id) {
        setProfileComplete(null);
        return;
      }

      try {
        const { getProfile } = await import('@/lib/profile-service');
        const profile = await getProfile(session.user.id);

        if (profile && profile.onboarding_completed === true) {
          setProfileComplete(true);
        } else {
          setProfileComplete(false);
        }
      } catch (error) {
        // On error, assume incomplete to be safe
        setProfileComplete(false);
      }
    }

    if (!isLoading && session) {
      checkProfile();
    } else if (!session) {
      setProfileComplete(null);
    }
  }, [session, isLoading]);

  // Hide splash screen once session is loaded AND profile check is complete
  useEffect(() => {
    if (!isLoading && profileComplete !== null) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, profileComplete]);

  // Show welcome card only for new sign-ups
  useEffect(() => {
    if (!isLoading && session && isNewSignUp && profileComplete !== null) {
      clearNewSignUp();
      router.replace('/welcome');
    }
  }, [session, isLoading, isNewSignUp, profileComplete]);

  // Show nothing while loading session or checking profile (splash screen stays visible)
  if (isLoading || (session && profileComplete === null)) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(auth)"
            options={{ headerShown: false }}
            redirect={!!session}
          />
          <Stack.Screen
            name="(onboarding)"
            options={{ headerShown: false }}
            redirect={!session || profileComplete !== false}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
            redirect={!session || !profileComplete}
          />
          <Stack.Screen
            name="welcome"
            options={{
              presentation: 'modal',
              headerShown: false,
              gestureEnabled: false,
            }}
          />
        </Stack>
        {!session ? (
          <Redirect href={'/(auth)/sign-up' as any} />
        ) : null}
      </AppErrorBoundary>
      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
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
      options={{
        host: 'https://us.i.posthog.com',
        captureAppLifecycleEvents: true,
      }}
      autocapture
    >
      {content}
    </PostHogProvider>
  );
}

export default Sentry.wrap(RootLayout);
