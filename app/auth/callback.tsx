import { useConvexAuth } from 'convex/react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function AuthCallback() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const redirectedRef = useRef(false);
  const params = useLocalSearchParams<{ code?: string; state?: string }>();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const hasOAuthParams =
        url.searchParams.has('code') || url.searchParams.has('state');

      if (hasOAuthParams) {
        // Check if this is a mobile OAuth callback by looking for indicators
        // The mobile browser will have the OAuth params, and we need to redirect
        // back to the native app with those params
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobileDevice =
          /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
            userAgent
          );

        if (isMobileDevice && !redirectedRef.current) {
          // Redirect to native app with the OAuth params
          redirectedRef.current = true;
          const nativeUrl = `trading-journal://auth/callback${url.search}`;
          window.location.href = nativeUrl;
          return;
        }

        // For web: clean up OAuth params after Convex processes them
        // Wait a moment to let Convex Auth process the code first
        const cleanupTimeout = setTimeout(() => {
          const currentUrl = new URL(window.location.href);
          if (
            currentUrl.searchParams.has('code') ||
            currentUrl.searchParams.has('state')
          ) {
            currentUrl.searchParams.delete('code');
            currentUrl.searchParams.delete('state');
            window.history.replaceState(null, '', currentUrl.pathname);
          }
        }, 1000);

        return () => clearTimeout(cleanupTimeout);
      }
    }
  }, []);

  // Log params for debugging on native
  useEffect(() => {
    if (Platform.OS !== 'web' && (params.code || params.state)) {
      console.log('Native OAuth callback received params:', params);
    }
  }, [params]);

  // Once authenticated, redirect to home
  if (!isLoading && isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  text: {
    marginTop: 16,
  },
});
