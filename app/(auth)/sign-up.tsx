import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authTheme } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { signUpSchema, SignUpInput } from '@/lib/validation/auth-schemas';
import { showAuthError, showAuthSuccess } from '@/lib/auth-toast';
import { AuthInput } from '@/components/auth/auth-input';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { GoldButton } from '@/components/auth/gold-button';
import { TextInput } from 'react-native';

/**
 * Sign-up screen with social login buttons, email/password form, and password strength meter
 */
export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
  });

  const password = watch('password');

  const onSubmit = async (data: SignUpInput) => {
    try {
      setIsSubmitting(true);
      await signUp(data.email, data.password);
      showAuthSuccess('Account created! Welcome to MVR.');
      // Session change triggers welcome card redirect in root layout
    } catch (error) {
      showAuthError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGooglePress = async () => {
    try {
      setIsSocialLoading(true);
      await signInWithGoogle();
      // Session change will trigger redirect in root layout
    } catch (error) {
      showAuthError(error as Error);
    } finally {
      setIsSocialLoading(false);
    }
  };

  const handleApplePress = async () => {
    try {
      setIsSocialLoading(true);
      await signInWithApple();
      // Session change will trigger redirect in root layout
    } catch (error) {
      showAuthError(error as Error);
    } finally {
      setIsSocialLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo + Tagline */}
          <View style={styles.header}>
            <Text style={styles.logo}>MVR</Text>
            <Text style={styles.tagline}>Where Most Valuable Relationships Begin</Text>
          </View>

          {/* Social Login Buttons */}
          <SocialAuthButtons
            onGooglePress={handleGooglePress}
            onApplePress={handleApplePress}
            isLoading={isSocialLoading}
          />

          {/* OR Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email + Password Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <AuthInput
                    ref={passwordInputRef}
                    label="Password"
                    placeholder="Create a strong password"
                    secureTextEntry
                    autoComplete="new-password"
                    returnKeyType="done"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                  <PasswordStrengthMeter password={value} />
                </>
              )}
            />
          </View>

          {/* Sign Up Button */}
          <GoldButton
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            style={styles.buttonContainer}
          />

          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: authTheme.spacing.lg,
    paddingTop: authTheme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: authTheme.spacing.xl,
  },
  logo: {
    fontSize: authTheme.typography.heading,
    fontWeight: 'bold',
    color: authTheme.colors.white,
    marginBottom: authTheme.spacing.sm,
  },
  tagline: {
    fontSize: authTheme.typography.body,
    color: authTheme.colors.muted,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: authTheme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: authTheme.colors.inputBorder,
  },
  dividerText: {
    color: authTheme.colors.muted,
    paddingHorizontal: authTheme.spacing.md,
    fontSize: authTheme.typography.caption,
  },
  form: {
    marginBottom: authTheme.spacing.lg,
  },
  buttonContainer: {
    marginBottom: authTheme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: authTheme.colors.muted,
    fontSize: authTheme.typography.body,
  },
  footerLink: {
    color: authTheme.colors.gold,
    fontSize: authTheme.typography.body,
    fontWeight: '600',
  },
});
