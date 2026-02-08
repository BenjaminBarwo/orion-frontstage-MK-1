import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { PostHogProvider } from 'posthog-react-native';
import { POSTHOG_API_KEY } from '@/constants/config';
import { initSentry } from '@/lib/sentry';

// Initialize Sentry before any component renders
initSentry();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const content = (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
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
