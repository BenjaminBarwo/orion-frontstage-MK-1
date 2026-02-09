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
import { TextInput } from 'react-native';
import { authTheme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { newPasswordSchema, NewPasswordInput } from '@/lib/validation/auth-schemas';
import { showAuthError, showAuthSuccess } from '@/lib/auth-toast';
import { AuthInput } from '@/components/auth/auth-input';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';

/**
 * Reset password screen for deep link callback
 * Handles password update after user clicks reset link in email
 */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (data: NewPasswordInput) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      showAuthSuccess('Password updated successfully!');
      router.replace('/(auth)/sign-in');
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.heading}>Set New Password</Text>
            <Text style={styles.subtitle}>Enter your new password below</Text>
          </View>

          {/* New Password Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <AuthInput
                    label="New Password"
                    placeholder="Enter your new password"
                    secureTextEntry
                    autoComplete="new-password"
                    returnKeyType="next"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                  />
                  <PasswordStrengthMeter password={value} />
                </>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  ref={confirmPasswordInputRef}
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  secureTextEntry
                  autoComplete="new-password"
                  returnKeyType="done"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />
          </View>

          {/* Update Password Button */}
          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={authTheme.colors.background} />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
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
    marginBottom: authTheme.spacing.xl,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: authTheme.colors.white,
    marginBottom: authTheme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: authTheme.colors.muted,
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
});
