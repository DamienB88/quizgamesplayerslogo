/**
 * Photo Preview Modal
 * Shows randomly selected photo with actions: comment, push, try again, refuse
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PhotoInfo } from '@/services/photoSelection';
import { logger } from '@/services/logger';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PhotoPreviewModalProps {
  visible: boolean;
  photo: PhotoInfo | null;
  onPush: (caption?: string) => void;
  onTryAgain: () => void;
  onRefuse: () => void;
  onClose: () => void;
  isProcessing?: boolean;
  uploadProgress?: number;
}

export function PhotoPreviewModal({
  visible,
  photo,
  onPush,
  onTryAgain,
  onRefuse,
  onClose,
  isProcessing = false,
  uploadProgress = 0,
}: PhotoPreviewModalProps) {
  const [caption, setCaption] = useState('');
  const [showCaptionInput, setShowCaptionInput] = useState(false);

  // Animation values
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const imageOpacity = useSharedValue(0);

  // Animate modal entrance
  const animateIn = () => {
    modalOpacity.value = withTiming(1, { duration: 300 });
    modalScale.value = withSpring(1, { damping: 15 });
    imageOpacity.value = withTiming(1, { duration: 500 });
  };

  // Animate modal exit
  const animateOut = (callback: () => void) => {
    modalOpacity.value = withTiming(0, { duration: 200 });
    modalScale.value = withTiming(0.9, { duration: 200 });
    setTimeout(callback, 200);
  };

  const handlePush = () => {
    onPush(caption || undefined);
    setCaption('');
    setShowCaptionInput(false);
  };

  const handleTryAgain = () => {
    setCaption('');
    setShowCaptionInput(false);
    onTryAgain();
  };

  const handleRefuse = () => {
    animateOut(() => {
      setCaption('');
      setShowCaptionInput(false);
      onRefuse();
    });
  };

  const handleClose = () => {
    animateOut(() => {
      setCaption('');
      setShowCaptionInput(false);
      onClose();
    });
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  // Animate in when modal becomes visible
  if (visible && modalOpacity.value === 0) {
    animateIn();
  }

  if (!visible || !photo) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, modalAnimatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Random Photo Selected!</Text>
            <Text style={styles.headerSubtitle}>
              Review and decide what to do
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Photo Preview */}
            <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
              <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="cover" />
            </Animated.View>

            {/* Photo Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Photo Details</Text>
              <Text style={styles.infoText}>
                📐 {photo.width} × {photo.height}
              </Text>
              <Text style={styles.infoText}>
                📅 {new Date(photo.creationTime).toLocaleDateString()}
              </Text>
            </View>

            {/* Caption Input (conditional) */}
            {showCaptionInput ? (
              <View style={styles.captionContainer}>
                <Text style={styles.captionLabel}>Add a caption (optional)</Text>
                <TextInput
                  style={styles.captionInput}
                  placeholder="What's the story behind this photo?"
                  placeholderTextColor="#999"
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  maxLength={500}
                  numberOfLines={4}
                  editable={!isProcessing}
                />
                <Text style={styles.captionCounter}>{caption.length}/500</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addCaptionButton}
                onPress={() => setShowCaptionInput(true)}
                disabled={isProcessing}
              >
                <Text style={styles.addCaptionButtonText}>+ Add Caption</Text>
              </TouchableOpacity>
            )}

            {/* Upload Progress */}
            {isProcessing && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>
                  Uploading... {Math.round(uploadProgress)}%
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${uploadProgress}%` }]}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Primary Actions */}
            <View style={styles.primaryActions}>
              <TouchableOpacity
                style={[styles.primaryButton, styles.pushButton]}
                onPress={handlePush}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonEmoji}>🚀</Text>
                    <Text style={styles.primaryButtonText}>Push to Group</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Secondary Actions */}
            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleTryAgain}
                disabled={isProcessing}
              >
                <Text style={styles.secondaryButtonEmoji}>🎲</Text>
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, styles.refuseButton]}
                onPress={handleRefuse}
                disabled={isProcessing}
              >
                <Text style={styles.secondaryButtonEmoji}>❌</Text>
                <Text style={styles.secondaryButtonText}>Refuse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH - 32,
    maxHeight: SCREEN_HEIGHT - 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666666',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  addCaptionButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addCaptionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  captionContainer: {
    marginBottom: 16,
  },
  captionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  captionInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#000000',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  captionCounter: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  primaryActions: {
    marginBottom: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  pushButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonEmoji: {
    fontSize: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    gap: 6,
  },
  refuseButton: {
    backgroundColor: '#FFE5E5',
  },
  secondaryButtonEmoji: {
    fontSize: 16,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
});
