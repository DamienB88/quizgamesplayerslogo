import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Splash screen and initial route resolver
 * Determines whether to show onboarding, auth, or main app
 */
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has completed onboarding
    // Check if user is authenticated
    // Navigate to appropriate screen

    // TODO: Implement actual logic in Phase 2
    // For now, this is a placeholder that will be expanded

    const checkInitialRoute = async () => {
      // Simulated delay for splash screen
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Will implement actual routing logic:
      // 1. Check AsyncStorage for onboarding completion
      // 2. Check Supabase auth state
      // 3. Navigate to appropriate route

      // Placeholder navigation (will be replaced)
      // router.replace('/(onboarding)');
    };

    checkInitialRoute();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
