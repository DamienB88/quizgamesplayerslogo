/**
 * Permissions Onboarding Screen
 * Request necessary permissions from the user
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function PermissionsScreen() {
  const router = useRouter();

  const requestPhotoPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === 'granted') {
      Alert.alert('Permission Granted', 'You can now share photos with your groups!');
      return true;
    } else {
      Alert.alert(
        'Permission Denied',
        'Photo library access is required to share photos. You can enable it later in Settings.'
      );
      return false;
    }
  };

  const handleContinue = async () => {
    await requestPhotoPermission();
    router.push('/(onboarding)/complete');
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Permissions',
      'You can grant permissions later in Settings when you want to share photos.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => router.push('/(onboarding)/complete'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>📷</Text>
          <Text style={styles.title}>Photo Library Access</Text>
          <Text style={styles.subtitle}>
            Privacy Social needs access to your photo library to share random photos
            with your groups
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>✓</Text>
            <Text style={styles.infoText}>
              We randomly select photos to share - you stay surprised too!
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>✓</Text>
            <Text style={styles.infoText}>
              You can control which photos are included in the selection pool
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>✓</Text>
            <Text style={styles.infoText}>
              All photos are encrypted before upload
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>✓</Text>
            <Text style={styles.infoText}>
              Photos automatically delete after 30 days
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Grant Access</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for Now</Text>
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
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  infoSection: {
    gap: 20,
    paddingTop: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  infoEmoji: {
    fontSize: 20,
    marginRight: 12,
    color: '#34C759',
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
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
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
});
