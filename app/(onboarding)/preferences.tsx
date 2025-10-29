/**
 * Preferences Selection Screen
 * Choose between auto-publish mode and review mode
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { onboarding } from '@/services/onboarding';
import { logger } from '@/services/logger';

type PublishMode = 'auto' | 'review' | null;

export default function PreferencesScreen() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<PublishMode>(null);

  const autoScale = useSharedValue(1);
  const reviewScale = useSharedValue(1);

  const handleSelectMode = (mode: PublishMode) => {
    setSelectedMode(mode);

    // Animate selection
    if (mode === 'auto') {
      autoScale.value = withSpring(1.05, { damping: 10 }, () => {
        autoScale.value = withSpring(1);
      });
    } else if (mode === 'review') {
      reviewScale.value = withSpring(1.05, { damping: 10 }, () => {
        reviewScale.value = withSpring(1);
      });
    }
  };

  const handleContinue = async () => {
    if (selectedMode) {
      // Save preference to onboarding state
      const autoPublishMode = selectedMode === 'auto';
      await onboarding.savePreference(autoPublishMode);

      logger.info('User preference saved', { autoPublishMode });

      router.push('/(onboarding)/permissions');
    }
  };

  const autoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: autoScale.value }],
  }));

  const reviewAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reviewScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>⚙️</Text>
        <Text style={styles.headerTitle}>Choose Your Sharing Mode</Text>
        <Text style={styles.headerSubtitle}>
          You can change this anytime in Settings
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Auto-Publish Mode */}
        <Animated.View style={autoAnimatedStyle}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedMode === 'auto' && styles.optionCardSelected,
            ]}
            onPress={() => handleSelectMode('auto')}
            activeOpacity={0.7}
          >
            <View style={styles.optionHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.optionEmoji}>🚀</Text>
              </View>
              <View style={styles.optionTitleContainer}>
                <Text style={styles.optionTitle}>Auto-Publish Mode</Text>
                <Text style={styles.optionBadge}>Recommended</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selectedMode === 'auto' && styles.radioSelected,
                ]}
              >
                {selectedMode === 'auto' && <View style={styles.radioInner} />}
              </View>
            </View>

            <Text style={styles.optionDescription}>
              Photos are automatically shared with your groups at random times.
              You'll be surprised along with everyone else!
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Fully automated - no manual work
                </Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Spontaneous and surprising
                </Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  True to the app's privacy philosophy
                </Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Can delete after sharing if needed
                </Text>
              </View>
            </View>

            <View style={styles.bestFor}>
              <Text style={styles.bestForLabel}>Best for:</Text>
              <Text style={styles.bestForText}>
                Users who want a hands-off, spontaneous sharing experience
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Review Mode */}
        <Animated.View style={reviewAnimatedStyle}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedMode === 'review' && styles.optionCardSelected,
            ]}
            onPress={() => handleSelectMode('review')}
            activeOpacity={0.7}
          >
            <View style={styles.optionHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.optionEmoji}>🔍</Text>
              </View>
              <View style={styles.optionTitleContainer}>
                <Text style={styles.optionTitle}>Review Mode</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selectedMode === 'review' && styles.radioSelected,
                ]}
              >
                {selectedMode === 'review' && <View style={styles.radioInner} />}
              </View>
            </View>

            <Text style={styles.optionDescription}>
              Review randomly selected photos before they're shared with your
              groups. You have full control over what gets published.
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Approve before sharing
                </Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Full control over content
                </Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Skip photos you don't want shared
                </Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Peace of mind for sensitive content
                </Text>
              </View>
            </View>

            <View style={styles.bestFor}>
              <Text style={styles.bestForLabel}>Best for:</Text>
              <Text style={styles.bestForText}>
                Users who want to preview content before sharing
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !selectedMode && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selectedMode}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: '#007AFF',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionTitleContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  optionBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#007AFF',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  optionDescription: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 16,
  },
  featuresList: {
    gap: 10,
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 14,
    color: '#34C759',
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  bestFor: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  bestForLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  bestForText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
