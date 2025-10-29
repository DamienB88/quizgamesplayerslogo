/**
 * Welcome Onboarding Screen
 * Introduction to Privacy Social
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🔒</Text>
          <Text style={styles.title}>Welcome to Privacy Social</Text>
          <Text style={styles.subtitle}>
            Share random moments with complete privacy
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>📸</Text>
            <Text style={styles.featureTitle}>Random Photo Sharing</Text>
            <Text style={styles.featureText}>
              App randomly selects photos from your library to share with your
              groups
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>👥</Text>
            <Text style={styles.featureTitle}>Private Groups Only</Text>
            <Text style={styles.featureText}>
              Create intimate groups with friends and family. No public posts, no
              strangers
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>⏰</Text>
            <Text style={styles.featureTitle}>Auto-Delete After 30 Days</Text>
            <Text style={styles.featureText}>
              All photos automatically disappear after 30 days for maximum privacy
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>🔐</Text>
            <Text style={styles.featureTitle}>End-to-End Encrypted</Text>
            <Text style={styles.featureText}>
              Your photos are encrypted before upload. Only group members can see
              them
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(onboarding)/permissions')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
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
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  features: {
    gap: 32,
  },
  feature: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  featureEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
