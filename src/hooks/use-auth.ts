import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

/**
 * Hook to access authentication state and actions
 */
export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();

  const login = async (email: string, password: string) => {
    try {
      await signIn('password', {
        email,
        password,
        flow: 'signIn',
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await signIn('password', {
        email,
        password,
        flow: 'signUp',
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signIn('google');

      if (result?.redirect) {
        const loginUrl = result.redirect.toString();

        if (Platform.OS === 'web') {
          window.location.href = loginUrl;
        } else {
          // Open OAuth flow in browser
          // The SITE_URL callback page will redirect to trading-journal:// scheme
          const authResult = await WebBrowser.openAuthSessionAsync(
            loginUrl,
            'trading-journal://auth/callback'
          );

          // If user cancelled or dismissed the browser
          if (authResult.type !== 'success') {
            console.log('OAuth cancelled or dismissed:', authResult.type);
          }
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    isLoading,
    isAuthenticated,
    login,
    register,
    signInWithGoogle,
    logout,
  };
}
