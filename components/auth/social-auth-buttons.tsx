import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authTheme } from '@/constants/theme';

interface SocialAuthButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
  isLoading: boolean;
}

export function SocialAuthButtons({
  onGooglePress,
  onApplePress,
  isLoading,
}: SocialAuthButtonsProps) {
  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={styles.button}
          onPress={onApplePress}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={authTheme.colors.white} />
          ) : (
            <>
              <Ionicons name="logo-apple" size={20} color={authTheme.colors.white} />
              <Text style={styles.buttonText}>Continue with Apple</Text>
            </>
          )}
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={onGooglePress}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color={authTheme.colors.white} />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color={authTheme.colors.white} />
            <Text style={styles.buttonText}>Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  button: {
    height: 52,
    backgroundColor: authTheme.colors.surface,
    borderRadius: authTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: authTheme.spacing.sm,
  },
  buttonText: {
    color: authTheme.colors.white,
    fontSize: authTheme.typography.body,
    fontWeight: '600',
  },
});
