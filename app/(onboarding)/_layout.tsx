/**
 * Onboarding Layout
 * Stack navigation for onboarding flow
 *
 * Flow:
 * 1. welcome - Animated logo splash screen
 * 2. carousel - 4 educational slides explaining features
 * 3. privacy-consent - Media library consent with terms
 * 4. preferences - Choose auto-publish vs review mode
 * 5. permissions - Request actual permissions
 * 6. complete - Finish onboarding
 */

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false, // Prevent swipe back during onboarding
        contentStyle: {
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="carousel" />
      <Stack.Screen name="privacy-consent" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
