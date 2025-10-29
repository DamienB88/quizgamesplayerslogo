/**
 * Root Layout Component
 * Handles authentication state, route protection, and session initialization
 */

import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore, startSessionRefresh, stopSessionRefresh } from '@/store/authStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, loadSession, user } = useAuthStore();

  // Load persisted session on app start
  useEffect(() => {
    loadSession();
  }, []);

  // Start automatic session refresh when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      startSessionRefresh();
    } else {
      stopSessionRefresh();
    }

    return () => {
      stopSessionRefresh();
    };
  }, [isAuthenticated]);

  // Protected route navigation
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';
    const isIndex = segments.length === 0 || segments[0] === 'index';

    if (!isAuthenticated && !inAuthGroup && !isIndex) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && (inAuthGroup || isIndex)) {
      // Check if onboarding is completed
      if (!user?.onboardingCompleted) {
        router.replace('/(onboarding)/welcome');
      } else {
        router.replace('/(tabs)/home');
      }
    } else if (isAuthenticated && !user?.onboardingCompleted && !inOnboarding) {
      // Redirect to onboarding if not completed
      router.replace('/(onboarding)/welcome');
    }
  }, [isAuthenticated, isLoading, segments, user?.onboardingCompleted]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Slot />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
