import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { SENTRY_DSN } from '@/constants/config';

/**
 * Navigation integration — must be created before Sentry.init()
 * and registered with the navigation container ref in _layout.tsx.
 */
export const sentryNavigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

export const initSentry = (): void => {
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.warn('[Sentry] No DSN configured, skipping initialization');
    }
    return;
  }

  const slug = Constants.expoConfig?.slug ?? 'mvr';
  const version = Constants.expoConfig?.version ?? '0.0.0';

  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment & release
    environment: __DEV__ ? 'development' : (process.env.APP_VARIANT ?? 'production'),
    release: `${slug}@${version}`,
    dist: Constants.nativeBuildVersion ?? undefined,

    // Performance
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    profilesSampleRate: __DEV__ ? 1.0 : 0.1,
    enableCaptureFailedRequests: true,

    // Native
    enableNative: true,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    enableAppHangTracking: true,
    appHangTimeoutInterval: 2000,

    // Breadcrumbs & context
    maxBreadcrumbs: 100,
    attachStacktrace: true,
    normalizeDepth: 5,

    // Integrations
    integrations: [sentryNavigationIntegration],

    // Debug (dev only)
    debug: __DEV__,

    // Strip PII from outbound events
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      return event;
    },

    beforeBreadcrumb(breadcrumb) {
      // Drop noisy health-check breadcrumbs
      if (
        breadcrumb.category === 'xhr' &&
        breadcrumb.data?.url &&
        typeof breadcrumb.data.url === 'string' &&
        breadcrumb.data.url.includes('/health')
      ) {
        return null;
      }
      return breadcrumb;
    },
  });
};

// ── User context ──────────────────────────────────────────────

export const setSentryUser = (userId: string, email?: string): void => {
  Sentry.setUser({ id: userId, email });
};

export const clearSentryUser = (): void => {
  Sentry.setUser(null);
};

// ── Manual capture helpers ────────────────────────────────────

interface CaptureContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: Sentry.SeverityLevel;
}

export const captureError = (
  error: unknown,
  context?: CaptureContext,
): string => {
  return Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level ?? 'error',
  });
};

export const captureMessage = (
  message: string,
  context?: CaptureContext,
): string => {
  return Sentry.captureMessage(message, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level ?? 'info',
  });
};

export const addBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info',
): void => {
  Sentry.addBreadcrumb({ category, message, data, level });
};

// ── Supabase error helper ─────────────────────────────────────

interface SupabaseErrorLike {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export const captureSupabaseError = (
  operation: string,
  error: SupabaseErrorLike,
  extra?: Record<string, unknown>,
): string => {
  return captureError(new Error(`Supabase: ${operation} — ${error.message}`), {
    tags: {
      'supabase.operation': operation,
      ...(error.code ? { 'supabase.code': error.code } : {}),
    },
    extra: {
      details: error.details,
      hint: error.hint,
      ...extra,
    },
  });
};
