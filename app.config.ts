import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const appVariant = process.env.APP_VARIANT || 'development';

  // Build plugins array with conditional Google Sign-In
  const plugins: ExpoConfig['plugins'] = [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    'expo-video',
    'expo-sqlite',
    'expo-localization',
    'expo-apple-authentication',
  ];

  // Only add Google Sign-In plugin if URL scheme is configured
  if (process.env.GOOGLE_IOS_URL_SCHEME) {
    plugins.push([
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: process.env.GOOGLE_IOS_URL_SCHEME,
      },
    ]);
  }

  // Add Sentry last
  plugins.push([
    '@sentry/react-native/expo',
    {
      organization: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    },
  ]);

  return {
    ...config,
    name: appVariant === 'production' ? 'MVR' : 'MVR (Dev)',
    slug: 'orion_frontstage_MK-1',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'orionfrontstagemk1',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins,
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  };
};
