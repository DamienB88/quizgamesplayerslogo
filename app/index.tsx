import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, COLORS } from '@/constants';

/**
 * Initial splash/loading screen that determines where to navigate
 * Based on authentication status and onboarding completion
 */
export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Wait for auth to finish loading
        if (isLoading) return;

        // Check if user has completed onboarding
        const onboardingCompleted = await AsyncStorage.getItem(
          STORAGE_KEYS.ONBOARDING_COMPLETED
        );

        if (!onboardingCompleted) {
          // First time user - show onboarding
          router.replace('/onboarding');
        } else if (!isAuthenticated) {
          // Onboarding done but not logged in
          router.replace('/auth/login');
        } else {
          // Logged in - go to main app
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // On error, show onboarding to be safe
        router.replace('/onboarding');
      }
    };

    checkOnboarding();
  }, [isAuthenticated, isLoading, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
