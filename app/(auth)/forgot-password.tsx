import { useState } from 'react';
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
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { authTheme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { passwordResetSchema, PasswordResetInput } from '@/lib/validation/auth-schemas';
import { showAuthError, showAuthSuccess } from '@/lib/auth-toast';
import { AuthInput } from '@/components/auth/auth-input';

/**
 * Password reset request screen
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: PasswordResetInput) => {
    try {
      setIsSubmitting(true);
      const redirectTo = Linking.createURL('reset-password');
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo });
      if (error) throw error;
      showAuthSuccess('Check your email for reset instructions.');
      setEmailSent(true);
    } catch (error) {
      showAuthError(error as Error);
    } finally {
      setIsSubmitting(false);
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
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={authTheme.colors.white} />
          </TouchableOpacity>

          {!emailSent ? (
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.heading}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Enter your email and we'll send you instructions to reset your password
                </Text>
              </View>

              {/* Email Form */}
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
                      returnKeyType="done"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                  )}
                />
              </View>

              {/* Send Reset Link Button */}
              <TouchableOpacity
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={authTheme.colors.background} />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>

              {/* Back to Sign In Link */}
              <TouchableOpacity
                style={styles.footer}
                onPress={() => router.push('/(auth)/sign-in')}
              >
                <Text style={styles.footerLink}>Back to Sign in</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Success State */}
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={64} color={authTheme.colors.success} />
                </View>
                <Text style={styles.successHeading}>Email Sent!</Text>
                <Text style={styles.successText}>
                  Check your inbox for instructions to reset your password.
                </Text>
              </View>

              {/* Back to Sign In Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(auth)/sign-in')}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}
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
    paddingTop: authTheme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: authTheme.spacing.lg,
  },
  header: {
    marginBottom: authTheme.spacing.xl,
  },
  heading: {
    fontSize: authTheme.typography.heading,
    fontWeight: 'bold',
    color: authTheme.colors.white,
    marginBottom: authTheme.spacing.sm,
  },
  subtitle: {
    fontSize: authTheme.typography.body,
    color: authTheme.colors.muted,
    lineHeight: 24,
  },
  form: {
    marginBottom: authTheme.spacing.lg,
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
    alignItems: 'center',
  },
  footerLink: {
    color: authTheme.colors.gold,
    fontSize: authTheme.typography.body,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: authTheme.spacing.xxl,
  },
  successIcon: {
    marginBottom: authTheme.spacing.lg,
  },
  successHeading: {
    fontSize: authTheme.typography.heading,
    fontWeight: 'bold',
    color: authTheme.colors.white,
    marginBottom: authTheme.spacing.sm,
  },
  successText: {
    fontSize: authTheme.typography.body,
    color: authTheme.colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
