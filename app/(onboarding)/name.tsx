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
import { nameSchema } from '@/lib/validation/profile-schemas';

/**
 * Onboarding Step 2: Name entry
 * User enters first name and last name with validation
 */
export default function NameScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useProfileForm();
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);

  const handleContinue = () => {
    // Validate before proceeding
    const result = nameSchema.safeParse({
      firstName: formData.firstName,
      lastName: formData.lastName,
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFirstNameError(errors.firstName?.[0] || null);
      setLastNameError(errors.lastName?.[0] || null);
      return;
    }

    router.push('/(onboarding)/location');
  };

  const handleFirstNameChange = (text: string) => {
    updateFormData({ firstName: text });
    setFirstNameError(null);
  };

  const handleLastNameChange = (text: string) => {
    updateFormData({ lastName: text });
    setLastNameError(null);
  };

  const isValid = formData.firstName.length >= 2 && formData.lastName.length >= 2;

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
              <Text style={styles.heading}>What's your name?</Text>
              <Text style={styles.subtext}>This is how other pros will see you</Text>
            </View>

            {/* First Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="First name"
                placeholderTextColor={authTheme.colors.muted}
                value={formData.firstName}
                onChangeText={handleFirstNameChange}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {firstNameError && <Text style={styles.errorText}>{firstNameError}</Text>}
            </View>

            {/* Last Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                placeholderTextColor={authTheme.colors.muted}
                value={formData.lastName}
                onChangeText={handleLastNameChange}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {lastNameError && <Text style={styles.errorText}>{lastNameError}</Text>}
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
    paddingVertical: 16,
    fontSize: authTheme.typography.body,
    color: authTheme.colors.white,
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
