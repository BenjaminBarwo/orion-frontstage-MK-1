import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authTheme } from '@/constants/theme';

interface ProfilePhotoDisplayProps {
  uri: string | null;
  size?: number;
  firstName?: string;
  lastName?: string;
}

export function ProfilePhotoDisplay({
  uri,
  size = 150,
  firstName,
  lastName,
}: ProfilePhotoDisplayProps) {
  // If URI provided, show circular image
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        contentFit="cover"
      />
    );
  }

  // Generate initials if names provided
  const initials =
    firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : null;

  // Placeholder: circular container with gold gradient border
  return (
    <LinearGradient
      colors={authTheme.colors.goldGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.placeholderBorder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.placeholderInner,
          {
            width: size - 4,
            height: size - 4,
            borderRadius: (size - 4) / 2,
          },
        ]}
      >
        {initials ? (
          <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
        ) : (
          <Ionicons name="person-outline" size={size * 0.5} color={authTheme.colors.gold} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  image: {
    overflow: 'hidden',
  },
  placeholderBorder: {
    padding: 2, // Creates 2px gradient border
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderInner: {
    backgroundColor: authTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: authTheme.colors.white,
    fontWeight: '600',
  },
});
