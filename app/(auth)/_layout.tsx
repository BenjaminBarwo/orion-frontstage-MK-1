import { Stack } from 'expo-router';
import { authTheme } from '@/constants/theme';

/**
 * Auth route group layout
 * Uses simple fade for replace transitions (sign-up <-> sign-in)
 * and fade_from_bottom for push transitions (-> forgot-password)
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationTypeForReplace: 'pop',
        animationDuration: 250,
        contentStyle: {
          backgroundColor: authTheme.colors.background,
        },
      }}
    >
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen
        name="forgot-password"
        options={{ animation: 'fade_from_bottom' }}
      />
    </Stack>
  );
}
