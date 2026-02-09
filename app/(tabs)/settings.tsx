import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authTheme } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { showAuthError, showAuthSuccess } from '@/lib/auth-toast';
import { supabase } from '@/lib/supabase';

/**
 * Settings screen with user account info and logout button
 * Logout is low-prominence per user decision, no confirmation dialog
 */
export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const userEmail = session?.user.email;
  const isEmailVerified = !!session?.user.email_confirmed_at;

  const handleLogout = async () => {
    try {
      await signOut();
      // Session change will trigger redirect in root layout
    } catch (error) {
      showAuthError(error as Error);
    }
  };

  const handleResendVerification = async () => {
    if (!userEmail) return;

    try {
      setIsResendingEmail(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });
      if (error) throw error;
      showAuthSuccess('Verification email sent! Check your inbox.');
    } catch (error) {
      showAuthError(error as Error);
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Screen title */}
        <Text style={styles.title}>Settings</Text>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          {/* Email */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{userEmail}</Text>
          </View>

          {/* Email verification status */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusContainer}>
              {isEmailVerified ? (
                <Text style={styles.verified}>Verified</Text>
              ) : (
                <View style={styles.notVerifiedContainer}>
                  <Text style={styles.notVerified}>Not verified</Text>
                  <TouchableOpacity
                    onPress={handleResendVerification}
                    disabled={isResendingEmail}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.verifyLink, isResendingEmail && styles.verifyLinkDisabled]}>
                      {isResendingEmail ? 'Sending...' : 'Verify email'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Logout button - positioned lower with low prominence */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: authTheme.spacing.lg,
    paddingTop: authTheme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: authTheme.colors.white,
    marginBottom: authTheme.spacing.xl,
  },
  section: {
    marginBottom: authTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: authTheme.colors.white,
    marginBottom: authTheme.spacing.md,
  },
  infoRow: {
    paddingVertical: authTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: authTheme.colors.inputBorder,
  },
  label: {
    fontSize: 13,
    color: authTheme.colors.muted,
    marginBottom: authTheme.spacing.xs,
  },
  value: {
    fontSize: 16,
    color: authTheme.colors.white,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verified: {
    fontSize: 16,
    color: authTheme.colors.success,
    fontWeight: '600',
  },
  notVerifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authTheme.spacing.md,
  },
  notVerified: {
    fontSize: 16,
    color: authTheme.colors.muted,
  },
  verifyLink: {
    fontSize: 14,
    color: authTheme.colors.gold,
    fontWeight: '600',
  },
  verifyLinkDisabled: {
    opacity: 0.5,
  },
  logoutContainer: {
    marginTop: authTheme.spacing.xxl,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '600',
  },
});
