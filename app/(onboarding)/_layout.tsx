import { Stack } from 'expo-router';
import { ProfileProvider } from '@/lib/profile-context';

export default function OnboardingLayout() {
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
