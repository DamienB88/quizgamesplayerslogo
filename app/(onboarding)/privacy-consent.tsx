/**
 * Privacy Consent Screen
 * Explains media library access and requires user consent
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

export default function PrivacyConsentScreen() {
  const router = useRouter();
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const checkboxScale = useSharedValue(1);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isScrolledToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isScrolledToBottom && !hasReadTerms) {
      setHasReadTerms(true);
    }
  };

  const handleCheckboxPress = () => {
    if (!hasReadTerms) {
      return; // Must read terms first
    }

    checkboxScale.value = withSpring(1.2, { damping: 5 }, () => {
      checkboxScale.value = withSpring(1);
      runOnJS(setAgreedToTerms)(!agreedToTerms);
    });
  };

  const handleContinue = () => {
    if (agreedToTerms) {
      router.push('/(onboarding)/preferences');
    }
  };

  const handleOpenTerms = () => {
    // TODO: Replace with actual terms URL
    Linking.openURL('https://privacysocial.app/terms');
  };

  const handleOpenPrivacy = () => {
    // TODO: Replace with actual privacy policy URL
    Linking.openURL('https://privacysocial.app/privacy');
  };

  const checkboxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📷</Text>
        <Text style={styles.headerTitle}>Media Library Access</Text>
        <Text style={styles.headerSubtitle}>
          Please review and agree to our privacy terms
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Access</Text>
          <Text style={styles.text}>
            Privacy Social requires access to your photo library to enable random
            photo sharing with your private groups.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Photos</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Random Selection:</Text> Our algorithm
              randomly selects photos from your library to share with your groups.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Encryption:</Text> All photos are
              end-to-end encrypted before upload. Only group members can decrypt
              and view them.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Auto-Deletion:</Text> Photos
              automatically delete after 30 days for maximum privacy.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>No Analysis:</Text> We do not scan,
              analyze, or train AI models on your photos.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Control</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              You can revoke photo library access at any time in Settings
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              You can enable "Review Mode" to approve photos before sharing
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              You can delete shared photos from groups at any time
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Photos are only shared with private groups you explicitly join or
              create
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage</Text>
          <Text style={styles.text}>
            Photos are stored encrypted on secure servers with automatic 30-day
            deletion. We never have access to your unencrypted photos. Your
            encryption keys are stored securely on your device only.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Third-Party Access</Text>
          <Text style={styles.text}>
            We will never sell, share, or provide third-party access to your
            photos or personal information. Your privacy is our #1 priority.
          </Text>
        </View>

        {/* Links to full terms */}
        <View style={styles.linksSection}>
          <TouchableOpacity onPress={handleOpenTerms}>
            <Text style={styles.link}>Read Full Terms & Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenPrivacy}>
            <Text style={styles.link}>Read Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding for scroll indicator */}
        <View style={styles.scrollIndicator}>
          {!hasReadTerms && (
            <Text style={styles.scrollHint}>
              ↓ Scroll to bottom to continue ↓
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Consent Checkbox */}
      <View style={styles.consentContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={handleCheckboxPress}
          disabled={!hasReadTerms}
        >
          <Animated.View
            style={[
              styles.checkbox,
              agreedToTerms && styles.checkboxChecked,
              !hasReadTerms && styles.checkboxDisabled,
              checkboxAnimatedStyle,
            ]}
          >
            {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
          </Animated.View>
          <Text style={[styles.consentText, !hasReadTerms && styles.disabledText]}>
            I understand and agree to allow Privacy Social to access my photo
            library for random photo selection only
          </Text>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !agreedToTerms && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!agreedToTerms}
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
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
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingRight: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 8,
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
    color: '#000000',
  },
  linksSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  link: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  scrollIndicator: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  scrollHint: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  consentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#F9F9F9',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkboxDisabled: {
    borderColor: '#CCCCCC',
    backgroundColor: '#F5F5F5',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: '#333333',
    lineHeight: 20,
  },
  disabledText: {
    color: '#999999',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
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
