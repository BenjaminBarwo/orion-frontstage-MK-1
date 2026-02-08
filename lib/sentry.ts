import * as Sentry from '@sentry/react-native';
import { SENTRY_DSN } from '@/constants/config';

export const initSentry = (): void => {
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.warn('[Sentry] No DSN configured, skipping initialization');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    enableNative: true,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    debug: __DEV__,
  });
};

export const setSentryUser = (userId: string, email?: string): void => {
  Sentry.setUser({ id: userId, email });
};

export const clearSentryUser = (): void => {
  Sentry.setUser(null);
};
