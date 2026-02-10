import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authTheme } from '@/constants/theme';
import { useProfileForm } from '@/lib/profile-context';
import { ProfilePhotoDisplay } from '@/components/profile/profile-photo-display';
import { saveProfile } from '@/lib/profile-service';
import { useAuth } from '@/lib/auth-context';
import { useProfileGate } from '@/lib/profile-gate';
import { showAuthSuccess, showAuthError } from '@/lib/auth-toast';
import { ROLE_CATEGORIES } from '@/constants/roles';

/**
 * Onboarding Step 6: Review and submit
 * User reviews complete profile before saving atomically
 */
export default function ReviewScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { formData, resetFormData } = useProfileForm();
  const { markProfileComplete } = useProfileGate();
  const [isSaving, setIsSaving] = useState(false);

  const roleLabel =
    ROLE_CATEGORIES.find((r) => r.key === formData.role)?.label || formData.role;

  const handleEdit = (step: string) => {
    router.push(`/(onboarding)/${step}` as any);
  };

  const handleSave = async () => {
    if (!session?.user?.id || !formData.role || !formData.photoUri) {
      showAuthError(new Error('Missing required profile data'));
      return;
    }

    try {
      setIsSaving(true);

      await saveProfile(session.user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        zipCode: formData.zipCode,
        bio: formData.bio,
        photoUri: formData.photoUri,
      });

      showAuthSuccess('Profile created!');
      markProfileComplete();
    } catch (error) {
      if (error instanceof Error) {
        showAuthError(error);
      }
    } finally {
      setIsSaving(false);
    }
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
            <Text style={styles.heading}>Review your profile</Text>
            <Text style={styles.subtext}>Make sure everything looks right</Text>
          </View>

          {/* Profile Summary Card */}
          <View style={styles.card}>
            {/* Photo */}
            <View style={styles.photoSection}>
              <ProfilePhotoDisplay
                uri={formData.photoUri}
                size={120}
                firstName={formData.firstName}
                lastName={formData.lastName}
              />
            </View>

            {/* Name */}
            <TouchableOpacity
              style={styles.section}
              onPress={() => handleEdit('name')}
              activeOpacity={0.7}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Name</Text>
                <Ionicons name="pencil-outline" size={16} color={authTheme.colors.gold} />
              </View>
              <Text style={styles.displayName}>
                {formData.firstName} {formData.lastName}
              </Text>
            </TouchableOpacity>

            {/* Role */}
            <TouchableOpacity
              style={styles.section}
              onPress={() => handleEdit('role')}
              activeOpacity={0.7}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Role</Text>
                <Ionicons name="pencil-outline" size={16} color={authTheme.colors.gold} />
              </View>
              <Text style={styles.roleText}>{roleLabel}</Text>
            </TouchableOpacity>

            {/* Location */}
            <TouchableOpacity
              style={styles.section}
              onPress={() => handleEdit('location')}
              activeOpacity={0.7}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Location</Text>
                <Ionicons name="pencil-outline" size={16} color={authTheme.colors.gold} />
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={authTheme.colors.muted} />
                <Text style={styles.locationText}>{formData.zipCode}</Text>
              </View>
            </TouchableOpacity>

            {/* Bio */}
            <TouchableOpacity
              style={[styles.section, styles.lastSection]}
              onPress={() => handleEdit('bio')}
              activeOpacity={0.7}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Bio</Text>
                <Ionicons name="pencil-outline" size={16} color={authTheme.colors.gold} />
              </View>
              <Text style={styles.bioText}>{formData.bio}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Complete Profile button - fixed at bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            <LinearGradient
              colors={[...authTheme.colors.goldGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.button, isSaving && styles.buttonDisabled]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={authTheme.colors.background} />
              ) : (
                <Text style={styles.buttonText}>Complete Profile</Text>
              )}
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
  card: {
    backgroundColor: authTheme.colors.surface,
    borderRadius: authTheme.borderRadius.md,
    padding: authTheme.spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: authTheme.spacing.lg,
  },
  section: {
    paddingVertical: authTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: authTheme.colors.inputBorder,
  },
  lastSection: {
    borderBottomWidth: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: authTheme.spacing.xs,
  },
  sectionLabel: {
    fontSize: authTheme.typography.caption,
    color: authTheme.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: authTheme.colors.white,
  },
  roleText: {
    fontSize: authTheme.typography.body,
    color: authTheme.colors.gold,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authTheme.spacing.xs,
  },
  locationText: {
    fontSize: authTheme.typography.body,
    color: authTheme.colors.white,
  },
  bioText: {
    fontSize: authTheme.typography.body,
    color: authTheme.colors.muted,
    lineHeight: 22,
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
