import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import * as Sentry from '@sentry/react-native';

interface FallbackProps {
  resetError: () => void;
}

function ErrorFallback({ resetError }: FallbackProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>
        The app ran into an unexpected error. Our team has been notified.
      </Text>
      <Pressable style={styles.button} onPress={resetError}>
        <Text style={styles.buttonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
}

export function AppErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const FallbackComponent = fallback ?? ErrorFallback;

  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => (
        <FallbackComponent resetError={resetError} />
      )}
      beforeCapture={(scope) => {
        scope.setTag('boundary', 'app');
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
