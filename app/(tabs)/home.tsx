/**
 * Home Screen
 * Main feed showing daily photos from groups
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/authStore';

export default function HomeScreen() {
  const { user } = useAuthStore();

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
        </View>
      </ScrollView>
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
});
