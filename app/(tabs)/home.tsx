/**
 * Home Screen
 * Main feed showing daily photos from groups
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { usePhotoStore } from '@/store/photoStore';
import { PhotoPreviewModal } from '@/components/PhotoPreviewModal';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const {
    currentPhoto,
    showPreviewModal,
    isProcessing,
    isUploading,
    uploadProgress,
    error,
    selectRandomPhoto,
    uploadPhoto,
    setShowPreviewModal,
    clearError,
  } = usePhotoStore();

  const handleSelectPhoto = async () => {
    clearError();
    await selectRandomPhoto();
  };

  const handlePush = async (caption?: string) => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // TODO: Get actual groupId from selected group
    const groupId = 'demo-group-id';

    const success = await uploadPhoto(user.id, groupId, caption);

    if (success) {
      Alert.alert('Success', 'Photo shared with your group!');
      setShowPreviewModal(false);
    } else {
      Alert.alert('Error', error || 'Failed to upload photo');
    }
  };

  const handleTryAgain = async () => {
    await selectRandomPhoto();
  };

  const handleRefuse = () => {
    setShowPreviewModal(false);
    Alert.alert('Declined', 'Photo selection declined');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Social</Text>
        <Text style={styles.headerSubtitle}>Welcome, {user?.displayName || 'User'}!</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>📸</Text>
          <Text style={styles.placeholderTitle}>Your Daily Feed</Text>
          <Text style={styles.placeholderText}>
            Random photos from your private groups will appear here each day.
          </Text>
          <Text style={styles.placeholderText}>
            Photos disappear after 30 days for complete privacy.
          </Text>

          {/* Demo Button */}
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleSelectPhoto}
            disabled={isProcessing}
          >
            <Text style={styles.demoButtonText}>
              {isProcessing ? '🎲 Selecting...' : '🎲 Test Random Selection'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Photo Preview Modal */}
      <PhotoPreviewModal
        visible={showPreviewModal}
        photo={currentPhoto}
        onPush={handlePush}
        onTryAgain={handleTryAgain}
        onRefuse={handleRefuse}
        onClose={() => setShowPreviewModal(false)}
        isProcessing={isUploading}
        uploadProgress={uploadProgress}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  demoButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
