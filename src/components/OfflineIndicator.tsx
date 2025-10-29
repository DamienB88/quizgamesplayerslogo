/**
 * Offline Indicator Component
 * Shows a banner when the device is offline
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStore } from '@/services/network';

export const OfflineIndicator: React.FC = () => {
  const { isOffline } = useNetworkStore();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>No Internet Connection</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF3B30',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
