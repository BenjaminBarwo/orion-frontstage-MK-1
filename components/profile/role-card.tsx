import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authTheme } from '@/constants/theme';

interface RoleCardProps {
  role: string;
  selected: boolean;
  onPress: () => void;
}

export function RoleCard({ role, selected, onPress }: RoleCardProps) {
  if (selected) {
    // Selected state: gold gradient border
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <LinearGradient
          colors={authTheme.colors.goldGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.innerCard}>
            <Text style={styles.text}>{role}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Unselected state: dark border
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.unselectedCard}>
      <View style={styles.innerCard}>
        <Text style={styles.text}>{role}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: authTheme.borderRadius.md,
    padding: 2, // Creates 2px border effect
  },
  unselectedCard: {
    borderRadius: authTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: authTheme.colors.inputBorder,
  },
  innerCard: {
    backgroundColor: authTheme.colors.surface,
    borderRadius: authTheme.borderRadius.md - 2, // Slightly smaller to account for padding
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: authTheme.colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});
