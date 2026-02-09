import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authTheme } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { getProfile } from '@/lib/profile-service';
import type { Profile } from '@/lib/profile-service';
import { ProfileHeader } from '@/components/profile/profile-header';

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getProfile(session.user.id);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Load profile on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleEditPress = () => {
    router.push('/edit-profile' as any);
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

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'Profile not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileHeader profile={profile} onEditPress={handleEditPress} />

        {/* Placeholder for future video content grid */}
        <View style={styles.videoPlaceholder}>
          <View style={styles.videoPlaceholderContent}>
            <Ionicons name="videocam-outline" size={48} color={authTheme.colors.muted} />
            <Text style={styles.videoPlaceholderText}>Your videos will appear here</Text>
          </View>
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
    paddingBottom: authTheme.spacing.xl,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: authTheme.spacing.lg,
  },
  errorText: {
    color: authTheme.colors.error,
    fontSize: authTheme.typography.body,
    marginBottom: authTheme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: authTheme.spacing.lg,
    paddingVertical: authTheme.spacing.sm,
    backgroundColor: authTheme.colors.surface,
    borderRadius: authTheme.borderRadius.sm,
  },
  retryText: {
    color: authTheme.colors.gold,
    fontSize: authTheme.typography.body,
    fontWeight: '600',
  },
  videoPlaceholder: {
    marginTop: authTheme.spacing.lg,
    marginHorizontal: authTheme.spacing.md,
  },
  videoPlaceholderContent: {
    borderWidth: 2,
    borderColor: authTheme.colors.inputBorder,
    borderStyle: 'dashed',
    borderRadius: authTheme.borderRadius.lg,
    padding: authTheme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    color: authTheme.colors.muted,
    fontSize: authTheme.typography.body,
    marginTop: authTheme.spacing.md,
  },
});
