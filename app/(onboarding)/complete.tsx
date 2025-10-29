/**
 * Complete Onboarding Screen
 * Finish onboarding and navigate to main app
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { onboarding } from '@/services/onboarding';
import { logger } from '@/services/logger';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
} from 'react-native-reanimated';

export default function CompleteScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [autoPublishMode, setAutoPublishMode] = useState(false);

  // Animation values
  const emojiScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Get user's preference from onboarding state
    const loadPreference = async () => {
      const preference = await onboarding.getAutoPublishPreference();
      setAutoPublishMode(preference);
    };
    loadPreference();

    // Animate entrance
    emojiScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
    contentOpacity.value = withDelay(300, withSpring(1));
  }, []);

  const handleComplete = async () => {
    if (!user) {
      logger.error('No user found when completing onboarding');
      return;
    }

    setIsUpdating(true);

    try {
      // Complete onboarding with user's preference
      const success = await onboarding.completeOnboarding(
        user.id,
        autoPublishMode
      );

      if (success) {
        // Update local user state
        setUser({
          ...user,
          onboardingCompleted: true,
          autoPublishMode,
        });

        logger.info('Onboarding completed successfully', {
          userId: user.id,
          autoPublishMode,
        });

        // Navigate to main app
        router.replace('/(tabs)/home');
      } else {
        logger.error('Failed to complete onboarding');
        // Show error to user
        alert('Failed to complete onboarding. Please try again.');
      }
    } catch (error) {
      logger.error('Complete onboarding error', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text style={[styles.emoji, emojiAnimatedStyle]}>
          🎉
        </Animated.Text>

        <Animated.View style={contentAnimatedStyle}>
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Welcome to Privacy Social. Start by creating your first private group and
            inviting friends and family.
          </Text>

          {/* Show selected mode */}
          <View style={styles.selectedMode}>
            <Text style={styles.selectedModeLabel}>Your Mode:</Text>
            <Text style={styles.selectedModeValue}>
              {autoPublishMode ? '🚀 Auto-Publish' : '🔍 Review'}
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.featureNumber}>1</Text>
              <Text style={styles.featureText}>Create a private group</Text>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureNumber}>2</Text>
              <Text style={styles.featureText}>Invite friends and family</Text>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureNumber}>3</Text>
              <Text style={styles.featureText}>
                {autoPublishMode
                  ? 'Share random photos automatically'
                  : 'Review and approve photos before sharing'}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isUpdating && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Get Started</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  selectedMode: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selectedModeLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedModeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  features: {
    gap: 24,
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  featureNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
