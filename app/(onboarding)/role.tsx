import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { authTheme } from '@/constants/theme';
import { useProfileForm } from '@/lib/profile-context';
import { ROLE_CATEGORIES } from '@/constants/roles';
import { RoleCard } from '@/components/profile/role-card';

/**
 * Onboarding Step 1: Role selection
 * User selects their primary professional role from 5 cards
 */
export default function RoleScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useProfileForm();

  const handleContinue = () => {
    router.push('/(onboarding)/name');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.heading}>What do you do?</Text>
            <Text style={styles.subtext}>Select your primary role</Text>
          </View>

          {/* Role cards */}
          <View style={styles.cardsContainer}>
            {ROLE_CATEGORIES.map((role) => (
              <View key={role.key} style={styles.cardWrapper}>
                <RoleCard
                  role={role.label}
                  selected={formData.role === role.key}
                  onPress={() => updateFormData({ role: role.key })}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Continue button - fixed at bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!formData.role}
          >
            <LinearGradient
              colors={[...authTheme.colors.goldGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.button, !formData.role && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </LinearGradient>
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
  },
  scrollContent: {
    paddingHorizontal: authTheme.spacing.lg,
    paddingBottom: 100, // Space for fixed button
  },
  header: {
    marginTop: authTheme.spacing.xl,
    marginBottom: authTheme.spacing.xl,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: authTheme.colors.white,
    marginBottom: authTheme.spacing.sm,
  },
  subtext: {
    fontSize: authTheme.typography.body,
    color: authTheme.colors.muted,
  },
  cardsContainer: {
    gap: 12,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: authTheme.spacing.lg,
    left: authTheme.spacing.lg,
    right: authTheme.spacing.lg,
  },
  button: {
    height: 56,
    borderRadius: authTheme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: authTheme.colors.background,
    fontSize: authTheme.typography.body,
    fontWeight: 'bold',
  },
});
