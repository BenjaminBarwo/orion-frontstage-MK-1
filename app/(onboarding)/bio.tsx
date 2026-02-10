import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { authTheme } from '@/constants/theme';
import { useProfileForm } from '@/lib/profile-context';
import { bioSchema } from '@/lib/validation/profile-schemas';

/**
 * Onboarding Step 5: Bio entry
 * User writes bio with 300 character limit and live counter
 */
export default function BioScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useProfileForm();
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    // Validate before proceeding
    const result = bioSchema.safeParse({
      bio: formData.bio,
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setError(errors.bio?.[0] || 'Invalid bio');
      return;
    }

    router.push('/(onboarding)/review');
  };

  const handleBioChange = (text: string) => {
    updateFormData({ bio: text });
    setError(null);
  };

  const isValid = formData.bio.trim().length >= 1;
  const charCount = formData.bio.length;
  const isNearLimit = charCount >= 280;
  const isAtLimit = charCount >= 300;

  // Determine counter color
  const counterColor = isAtLimit
    ? authTheme.colors.error
    : isNearLimit
      ? authTheme.colors.gold
      : authTheme.colors.muted;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.content}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.heading}>Tell pros about you</Text>
              <Text style={styles.subtext}>What makes you the right pro?</Text>
            </View>

            {/* Bio Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Share your experience, specialties, and what sets you apart..."
                placeholderTextColor={authTheme.colors.muted}
                value={formData.bio}
                onChangeText={handleBioChange}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={300}
                autoCorrect
              />
              <View style={styles.counterContainer}>
                <Text style={[styles.counter, { color: counterColor }]}>
                  {charCount} / 300
                </Text>
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          </ScrollView>

          {/* Continue button - fixed at bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleContinue} activeOpacity={0.8} disabled={!isValid}>
              <LinearGradient
                colors={[...authTheme.colors.goldGradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.button, !isValid && styles.buttonDisabled]}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authTheme.colors.background,
  },
  keyboardView: {
    flex: 1,
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
  inputContainer: {
    marginBottom: authTheme.spacing.lg,
  },
  input: {
    backgroundColor: authTheme.colors.inputBackground,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    borderRadius: authTheme.borderRadius.md,
    paddingHorizontal: authTheme.spacing.md,
    paddingVertical: authTheme.spacing.md,
    fontSize: authTheme.typography.body,
    color: authTheme.colors.white,
    height: 140,
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: authTheme.spacing.sm,
  },
  counter: {
    fontSize: authTheme.typography.caption,
    fontWeight: '500',
  },
  errorText: {
    color: authTheme.colors.error,
    fontSize: authTheme.typography.caption,
    marginTop: authTheme.spacing.sm,
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
