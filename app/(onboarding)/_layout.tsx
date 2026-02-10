import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ProfileProvider } from '@/lib/profile-context';

export default function OnboardingLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // ProfileContext is in-memory only. On app restart, Expo Router may
    // restore navigation to a mid-flow screen (e.g. bio) but the context
    // is empty. Reset to step 1 only if navigated to a non-role screen.
    const currentScreen = segments[segments.length - 1];
    if (currentScreen && currentScreen !== 'role') {
      router.replace('/(onboarding)/role');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProfileProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: true,
        }}
      />
    </ProfileProvider>
  );
}
