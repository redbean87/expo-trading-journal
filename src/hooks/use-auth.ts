import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';

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
    logout,
  };
}
