import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authTheme } from '@/constants/theme';
import { ProfilePhotoDisplay } from '@/components/profile/profile-photo-display';
import { ROLE_CATEGORIES } from '@/constants/roles';
import type { Profile } from '@/lib/profile-service';

interface ProfileHeaderProps {
  profile: Profile;
  onEditPress: () => void;
}

export function ProfileHeader({ profile, onEditPress }: ProfileHeaderProps) {
  // Get role label from key
  const roleLabel = ROLE_CATEGORIES.find(
    (role) => role.key === profile.role_category
  )?.label || profile.role_category;

  return (
    <View style={[styles.card, authTheme.shadows.card]}>
      {/* Edit button (top-right corner) */}
      <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
        <Ionicons name="create-outline" size={24} color={authTheme.colors.gold} />
      </TouchableOpacity>

      {/* Profile photo */}
      <View style={styles.photoContainer}>
        <ProfilePhotoDisplay
          uri={profile.avatar_url}
          size={120}
          firstName={profile.first_name || undefined}
          lastName={profile.last_name || undefined}
        />
      </View>

      {/* Display name */}
      <Text style={styles.displayName}>{profile.display_name}</Text>

      {/* Role badge */}
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{roleLabel}</Text>
      </View>

      {/* Location */}
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={16} color={authTheme.colors.muted} />
        <Text style={styles.locationText}>{profile.zip_code}</Text>
      </View>

      {/* Bio */}
      {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: authTheme.colors.surface,
    borderRadius: authTheme.borderRadius.lg,
    padding: authTheme.spacing.lg,
    marginHorizontal: authTheme.spacing.md,
    marginTop: authTheme.spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: authTheme.spacing.md,
    right: authTheme.spacing.md,
    zIndex: 1,
  },
  photoContainer: {
    marginTop: authTheme.spacing.sm,
    marginBottom: authTheme.spacing.md,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: authTheme.colors.white,
    marginBottom: authTheme.spacing.sm,
  },
  roleBadge: {
    backgroundColor: authTheme.colors.background,
    borderColor: authTheme.colors.gold,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: authTheme.spacing.md,
    paddingVertical: authTheme.spacing.xs,
    marginBottom: authTheme.spacing.sm,
  },
  roleText: {
    color: authTheme.colors.gold,
    fontSize: authTheme.typography.caption,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: authTheme.spacing.md,
  },
  locationText: {
    color: authTheme.colors.muted,
    fontSize: authTheme.typography.body,
    marginLeft: authTheme.spacing.xs,
  },
  bio: {
    color: authTheme.colors.muted,
    fontSize: authTheme.typography.body,
    lineHeight: 22,
    textAlign: 'left',
    width: '100%',
  },
});
