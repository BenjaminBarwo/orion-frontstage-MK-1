import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { PostHogProvider } from 'posthog-react-native';
import { POSTHOG_API_KEY } from '@/constants/config';
import { initSentry, sentryNavigationIntegration } from '@/lib/sentry';
import { AppErrorBoundary } from '@/components/error-boundary';

// Initialize Sentry before any component renders
initSentry();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayout() {
  const colorScheme = useColorScheme();
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (navigationRef) {
      sentryNavigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  const content = (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppErrorBoundary>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </AppErrorBoundary>
      <StatusBar style="auto" />
    </ThemeProvider>
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
