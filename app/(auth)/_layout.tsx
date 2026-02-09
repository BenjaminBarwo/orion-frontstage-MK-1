import { Stack } from 'expo-router';
import { authTheme } from '@/constants/theme';

/**
 * Auth route group layout
 * Provides card-style fade animations and dark premium background
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        animationDuration: 200,
        contentStyle: {
          backgroundColor: authTheme.colors.background,
        },
      }}
    >
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
