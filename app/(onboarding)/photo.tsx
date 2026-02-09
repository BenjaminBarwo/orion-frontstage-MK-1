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
import { pickProfilePhoto, takeProfilePhoto } from '@/components/profile/profile-photo-picker';
import { showAuthError } from '@/lib/auth-toast';

/**
 * Onboarding Step 4: Profile photo selection
 * User picks photo from camera roll or takes a new photo
 */
export default function PhotoScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useProfileForm();
  const [isLoading, setIsLoading] = useState(false);

  const handlePickPhoto = async () => {
    try {
      setIsLoading(true);
      const uri = await pickProfilePhoto();
      if (uri) {
        updateFormData({ photoUri: uri });
      }
    } catch (error) {
      if (error instanceof Error) {
        showAuthError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);
      const uri = await takeProfilePhoto();
      if (uri) {
        updateFormData({ photoUri: uri });
      }
    } catch (error) {
      if (error instanceof Error) {
        showAuthError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/(onboarding)/bio');
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
            <Text style={styles.heading}>Show your face</Text>
            <Text style={styles.subtext}>Clients trust pros they can see</Text>
          </View>

          {/* Photo Display */}
          <View style={styles.photoContainer}>
            <ProfilePhotoDisplay
              uri={formData.photoUri}
              size={180}
              firstName={formData.firstName}
              lastName={formData.lastName}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePickPhoto}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="images-outline" size={24} color={authTheme.colors.gold} />
              <Text style={styles.actionText}>Choose from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTakePhoto}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={24} color={authTheme.colors.gold} />
              <Text style={styles.actionText}>Take Photo</Text>
            </TouchableOpacity>
          </View>

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={authTheme.colors.gold} />
              <Text style={styles.loadingText}>Processing photo...</Text>
            </View>
          )}
        </ScrollView>

        {/* Continue button - fixed at bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!formData.photoUri}
          >
            <LinearGradient
              colors={[...authTheme.colors.goldGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.button, !formData.photoUri && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>Continue</Text>
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
  photoContainer: {
    alignItems: 'center',
    marginVertical: authTheme.spacing.xl,
  },
  actionsContainer: {
    gap: authTheme.spacing.md,
    marginTop: authTheme.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.colors.surface,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    borderRadius: authTheme.borderRadius.md,
    paddingVertical: 16,
    paddingHorizontal: authTheme.spacing.lg,
    gap: authTheme.spacing.sm,
  },
  actionText: {
    color: authTheme.colors.white,
    fontSize: authTheme.typography.body,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: authTheme.spacing.sm,
    marginTop: authTheme.spacing.md,
  },
  loadingText: {
    color: authTheme.colors.muted,
    fontSize: authTheme.typography.caption,
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
