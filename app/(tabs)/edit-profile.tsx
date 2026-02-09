import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authTheme } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { getProfile, updateProfile, uploadProfilePhoto } from '@/lib/profile-service';
import type { Profile } from '@/lib/profile-service';
import { ProfilePhotoDisplay } from '@/components/profile/profile-photo-display';
import { pickProfilePhoto, takeProfilePhoto } from '@/components/profile/profile-photo-picker';
import { RoleCard } from '@/components/profile/role-card';
import { ROLE_CATEGORIES, type RoleCategory } from '@/constants/roles';
import { nameSchema, locationSchema, bioSchema } from '@/lib/validation/profile-schemas';

export default function EditProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();

  // Profile state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleCategory, setRoleCategory] = useState<RoleCategory>('agent');
  const [zipCode, setZipCode] = useState('');
  const [bio, setBio] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // UI state
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const data = await getProfile(session.user.id);
      if (data) {
        setProfile(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setRoleCategory(data.role_category as RoleCategory);
        setZipCode(data.zip_code || '');
        setBio(data.bio || '');
        setPhotoUri(data.avatar_url);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Change Photo',
      'Choose a source',
      [
        {
          text: 'Choose from Library',
          onPress: async () => {
            try {
              const uri = await pickProfilePhoto();
              if (uri) setPhotoUri(uri);
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to pick photo');
            }
          },
        },
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const uri = await takeProfilePhoto();
              if (uri) setPhotoUri(uri);
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to take photo');
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    const nameResult = nameSchema.safeParse({ firstName, lastName });
    if (!nameResult.success) {
      nameResult.error.issues.forEach((err) => {
        newErrors[err.path[0] as string] = err.message;
      });
    }

    // Validate location
    const locationResult = locationSchema.safeParse({ zipCode });
    if (!locationResult.success) {
      locationResult.error.issues.forEach((err) => {
        newErrors[err.path[0] as string] = err.message;
      });
    }

    // Validate bio
    const bioResult = bioSchema.safeParse({ bio });
    if (!bioResult.success) {
      bioResult.error.issues.forEach((err) => {
        newErrors[err.path[0] as string] = err.message;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!session?.user?.id || !profile) return;

    // Validate all fields
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setSaving(true);

    try {
      // Check if photo changed
      let avatarUrl = profile.avatar_url;
      if (photoUri && photoUri !== profile.avatar_url) {
        avatarUrl = await uploadProfilePhoto(photoUri, session.user.id);
      }

      // Update profile
      await updateProfile(session.user.id, {
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`,
        role_category: roleCategory,
        zip_code: zipCode,
        bio,
        avatar_url: avatarUrl,
      });

      Alert.alert('Success', 'Profile updated!');
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={authTheme.colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={authTheme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={authTheme.colors.gold} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Photo section */}
          <View style={styles.photoSection}>
            <ProfilePhotoDisplay
              uri={photoUri}
              size={120}
              firstName={firstName}
              lastName={lastName}
            />
            <TouchableOpacity onPress={handleChangePhoto} style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* First Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={authTheme.colors.muted}
              autoCapitalize="words"
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>

          {/* Last Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={authTheme.colors.muted}
              autoCapitalize="words"
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>

          {/* Role */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Role</Text>
            <TouchableOpacity
              style={styles.roleButton}
              onPress={() => setShowRolePicker(!showRolePicker)}
            >
              <Text style={styles.roleButtonText}>
                {ROLE_CATEGORIES.find((r) => r.key === roleCategory)?.label}
              </Text>
              <Ionicons
                name={showRolePicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={authTheme.colors.muted}
              />
            </TouchableOpacity>

            {showRolePicker && (
              <View style={styles.rolePicker}>
                {ROLE_CATEGORIES.map((role) => (
                  <RoleCard
                    key={role.key}
                    role={role.label}
                    selected={roleCategory === role.key}
                    onPress={() => {
                      setRoleCategory(role.key);
                      setShowRolePicker(false);
                    }}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Zip Code */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Zip Code</Text>
            <TextInput
              style={[styles.input, errors.zipCode && styles.inputError]}
              value={zipCode}
              onChangeText={setZipCode}
              placeholder="Enter zip code"
              placeholderTextColor={authTheme.colors.muted}
              keyboardType="number-pad"
              maxLength={5}
            />
            {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
          </View>

          {/* Bio */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Bio</Text>
              <Text
                style={[
                  styles.counter,
                  bio.length >= 280 && bio.length < 300 && styles.counterWarning,
                  bio.length >= 300 && styles.counterLimit,
                ]}
              >
                {bio.length}/300
              </Text>
            </View>
            <TextInput
              style={[styles.bioInput, errors.bio && styles.inputError]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              placeholderTextColor={authTheme.colors.muted}
              multiline
              maxLength={300}
              textAlignVertical="top"
            />
            {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
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
  flex: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: authTheme.spacing.md,
    paddingVertical: authTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: authTheme.colors.inputBorder,
  },
  headerButton: {
    width: 60,
  },
  headerTitle: {
    fontSize: authTheme.typography.heading,
    fontWeight: 'bold',
    color: authTheme.colors.white,
    textAlign: 'center',
  },
  saveText: {
    fontSize: authTheme.typography.body,
    color: authTheme.colors.gold,
    fontWeight: '600',
    textAlign: 'right',
  },
  scrollContent: {
    padding: authTheme.spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: authTheme.spacing.xl,
  },
  changePhotoButton: {
    marginTop: authTheme.spacing.md,
  },
  changePhotoText: {
    color: authTheme.colors.gold,
    fontSize: authTheme.typography.body,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: authTheme.spacing.lg,
  },
  label: {
    color: authTheme.colors.muted,
    fontSize: authTheme.typography.caption,
    fontWeight: '600',
    marginBottom: authTheme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: authTheme.colors.inputBackground,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    borderRadius: authTheme.borderRadius.sm,
    paddingHorizontal: authTheme.spacing.md,
    paddingVertical: authTheme.spacing.md,
    color: authTheme.colors.white,
    fontSize: authTheme.typography.body,
  },
  inputError: {
    borderColor: authTheme.colors.error,
  },
  bioInput: {
    backgroundColor: authTheme.colors.inputBackground,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    borderRadius: authTheme.borderRadius.sm,
    paddingHorizontal: authTheme.spacing.md,
    paddingVertical: authTheme.spacing.md,
    color: authTheme.colors.white,
    fontSize: authTheme.typography.body,
    height: 120,
  },
  errorText: {
    color: authTheme.colors.error,
    fontSize: authTheme.typography.caption,
    marginTop: authTheme.spacing.xs,
  },
  roleButton: {
    backgroundColor: authTheme.colors.inputBackground,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    borderRadius: authTheme.borderRadius.sm,
    paddingHorizontal: authTheme.spacing.md,
    paddingVertical: authTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleButtonText: {
    color: authTheme.colors.white,
    fontSize: authTheme.typography.body,
  },
  rolePicker: {
    marginTop: authTheme.spacing.md,
    gap: authTheme.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: authTheme.spacing.sm,
  },
  counter: {
    color: authTheme.colors.muted,
    fontSize: authTheme.typography.caption,
  },
  counterWarning: {
    color: authTheme.colors.gold,
  },
  counterLimit: {
    color: authTheme.colors.error,
  },
});
