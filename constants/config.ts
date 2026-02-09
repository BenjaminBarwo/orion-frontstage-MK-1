import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra;

export const SUPABASE_URL: string = extra?.supabaseUrl ?? '';
export const SUPABASE_ANON_KEY: string = extra?.supabaseAnonKey ?? '';
export const SENTRY_DSN: string = extra?.sentryDsn ?? '';
export const POSTHOG_API_KEY: string = extra?.posthogApiKey ?? '';
export const GOOGLE_WEB_CLIENT_ID: string = extra?.googleWebClientId ?? '';
export const GOOGLE_IOS_CLIENT_ID: string = extra?.googleIosClientId ?? '';

/**
 * Validate required environment variables at startup.
 * Warns in development mode if any required variables are missing.
 */
function validateConfig() {
  if (__DEV__) {
    const variables = [
      { name: 'EXPO_PUBLIC_SUPABASE_URL', value: SUPABASE_URL },
      { name: 'EXPO_PUBLIC_SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY },
      { name: 'EXPO_PUBLIC_SENTRY_DSN', value: SENTRY_DSN },
      { name: 'EXPO_PUBLIC_POSTHOG_API_KEY', value: POSTHOG_API_KEY },
    ];

    variables.forEach(({ name, value }) => {
      if (!value) {
        console.warn(
          `[Config] Missing environment variable: ${name}\n` +
          `Add it to .env.local or check .env.example for setup instructions.`
        );
      }
    });
  }
}

// Run validation on import
validateConfig();
