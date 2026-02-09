import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { GOOGLE_WEB_CLIENT_ID } from '@/constants/config';
import { Platform, NativeModules } from 'react-native';

/**
 * Auth context type definition
 */
interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Lazy-load Google Sign In to avoid native module crash in Expo Go.
 * Returns GoogleSignin or null if the native module isn't available.
 */
let googleSigninModule: typeof import('@react-native-google-signin/google-signin') | null = null;
let googleConfigured = false;

function getGoogleSignin() {
  // NativeModules is a safe proxy — returns undefined for missing modules without throwing.
  // TurboModuleRegistry.getEnforcing (used by require()) throws a fatal invariant violation.
  if (!NativeModules.RNGoogleSignin) {
    return null;
  }
  if (!googleSigninModule) {
    googleSigninModule = require('@react-native-google-signin/google-signin');
  }
  if (!googleConfigured && GOOGLE_WEB_CLIENT_ID && googleSigninModule) {
    googleSigninModule.GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
    googleConfigured = true;
  }
  return googleSigninModule?.GoogleSignin ?? null;
}

interface SessionProviderProps {
  children: ReactNode;
}

/**
 * SessionProvider wraps the app and provides auth state and methods
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  /**
   * Sign in with Apple
   * Silently handles user cancellation
   */
  const signInWithApple = async () => {
    let AppleAuthentication: typeof import('expo-apple-authentication');
    try {
      AppleAuthentication = require('expo-apple-authentication');
    } catch {
      throw new Error('Apple Sign In is not available in this environment');
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) {
          throw error;
        }
      } else {
        throw new Error('No identity token returned from Apple');
      }
    } catch (error: any) {
      // Check if user cancelled the sign-in flow
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User cancelled, silently return
        return;
      }
      throw error;
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    const GoogleSignin = getGoogleSignin();
    if (!GoogleSignin || !GOOGLE_WEB_CLIENT_ID) {
      throw new Error('Google Sign In is not available in this environment');
    }

    try {
      // Check if Play Services are available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
      }

      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data?.idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });

        if (error) {
          throw error;
        }
      } else {
        throw new Error('No ID token returned from Google');
      }
    } catch (error: any) {
      // Check if user cancelled the sign-in flow
      if (error.code === '-5' || error.code === 'SIGN_IN_CANCELLED') {
        // User cancelled, silently return
        return;
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithApple,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * Must be used within SessionProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within SessionProvider');
  }
  return context;
}
