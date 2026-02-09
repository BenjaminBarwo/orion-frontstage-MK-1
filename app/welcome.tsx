import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { authTheme } from '@/constants/theme';

/**
 * Post-signup welcome card with dark premium styling
 * User must tap "Get Started" to proceed - no swipe dismiss
 */
export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
        {/* Premium accent - gold line */}
        <View style={styles.accent} />

        {/* Logo */}
        <Text style={styles.logo}>MVR</Text>

        {/* Welcome heading */}
        <Text style={styles.heading}>Welcome to the Inner Circle</Text>

        {/* Value proposition */}
        <Text style={styles.description}>
          You're one of the first to join MVR — the platform that routes clients to pros who show
          up. Post your first video, build your reputation, and get priority placement when we go
          live.
        </Text>

        {/* Get Started button - positioned near bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authTheme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: authTheme.spacing.lg,
  },
  accent: {
    width: 60,
    height: 2,
    backgroundColor: authTheme.colors.gold,
    marginBottom: authTheme.spacing.lg,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: authTheme.colors.white,
    marginBottom: authTheme.spacing.lg,
    letterSpacing: 2,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: authTheme.colors.white,
    textAlign: 'center',
    marginBottom: authTheme.spacing.md,
  },
  description: {
    fontSize: 16,
    color: authTheme.colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: authTheme.spacing.xxl,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: authTheme.spacing.xxl,
    left: authTheme.spacing.lg,
    right: authTheme.spacing.lg,
  },
  button: {
    height: 56,
    backgroundColor: authTheme.colors.gold,
    borderRadius: authTheme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: authTheme.colors.background,
    fontSize: authTheme.typography.body,
    fontWeight: 'bold',
  },
});
