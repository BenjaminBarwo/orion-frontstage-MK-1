import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authTheme } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { signInSchema, SignInInput } from '@/lib/validation/auth-schemas';
import { showAuthError } from '@/lib/auth-toast';
import { AuthInput } from '@/components/auth/auth-input';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { TextInput } from 'react-native';

/**
 * Sign-in screen with social login buttons and email/password form
 */
export default function SignInScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: SignInInput) => {
    try {
      setIsSubmitting(true);
      await signIn(data.email, data.password);
      // Session change will trigger redirect in root layout
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
                <AuthInput
                  ref={passwordInputRef}
                  label="Password"
                  placeholder="Enter your password"
                  secureTextEntry
                  autoComplete="password"
                  returnKeyType="done"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={authTheme.colors.background} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <Text style={styles.footerLink}>Sign up</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -authTheme.spacing.sm,
  },
  forgotPasswordText: {
    color: authTheme.colors.gold,
    fontSize: authTheme.typography.caption,
    fontWeight: '600',
  },
  button: {
    height: 52,
    backgroundColor: authTheme.colors.gold,
    borderRadius: authTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: authTheme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: authTheme.colors.background,
    fontSize: authTheme.typography.body,
    fontWeight: 'bold',
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
