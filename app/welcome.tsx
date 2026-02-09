import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authTheme } from '@/constants/theme';

/**
 * Welcome screen placeholder
 * TODO: Will be implemented in a future plan with onboarding flow
 */
export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to MVR!</Text>
        <Text style={styles.subtitle}>Your account has been created.</Text>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: authTheme.spacing.lg,
  },
  title: {
    fontSize: authTheme.typography.heading,
    fontWeight: 'bold',
    color: authTheme.colors.white,
    marginBottom: authTheme.spacing.sm,
  },
  subtitle: {
    fontSize: authTheme.typography.body,
    color: authTheme.colors.muted,
    textAlign: 'center',
  },
});
