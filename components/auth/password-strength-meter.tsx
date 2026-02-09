import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { authTheme } from '@/constants/theme';

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthLevel {
  label: string;
  color: string;
  width: number;
}

/**
 * Calculate password strength score
 * Score: 0-2 = weak, 3-4 = medium, 5 = strong
 */
function calculateStrength(password: string): StrengthLevel {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { label: 'Weak', color: authTheme.colors.error, width: 33 };
  } else if (score <= 4) {
    return { label: 'Medium', color: authTheme.colors.gold, width: 66 };
  } else {
    return { label: 'Strong', color: authTheme.colors.success, width: 100 };
  }
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${strength.width}%`, { duration: 300 }),
      backgroundColor: strength.color,
    };
  });

  // Don't show meter if password is empty
  if (!password) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, animatedStyle]} />
      </View>
      <Text style={[styles.label, { color: strength.color }]}>{strength.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: authTheme.spacing.sm,
  },
  barBackground: {
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  label: {
    marginTop: authTheme.spacing.xs,
    fontSize: authTheme.typography.caption,
    fontWeight: '600',
  },
});
