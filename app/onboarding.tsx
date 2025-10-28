import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, COLORS, SPACING, TYPOGRAPHY } from '@/constants';

/**
 * Onboarding screen that introduces users to the app
 * Shows educational slides about privacy and features
 * TODO: Implement full carousel with animations
 */
export default function Onboarding() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to PrivacyFirst Social</Text>
        <Text style={styles.description}>
          A privacy-first social media app where you control your content
        </Text>

        {/* TODO: Add carousel with educational slides */}
        {/* TODO: Add Lottie animations */}
        {/* TODO: Add progress indicators */}

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Onboarding Carousel Coming Soon
          </Text>
          <Text style={styles.placeholderSubtext}>
            Will include:
            {'\n'}• App introduction
            {'\n'}• How random photo selection works
            {'\n'}• Private groups explanation
            {'\n'}• Privacy features
            {'\n'}• Preference selection
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={completeOnboarding}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl * 2,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    marginVertical: SPACING.xl,
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  placeholderSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
