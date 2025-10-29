/**
 * Complete Onboarding Screen
 * Finish onboarding and navigate to main app
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/config/supabase';

export default function CompleteScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleComplete = async () => {
    if (!user) return;

    setIsUpdating(true);

    try {
      // Mark onboarding as completed in database
      const { error } = await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (error) {
        console.error('Failed to update onboarding status:', error);
      }

      // Update local user state
      setUser({
        ...user,
        onboardingCompleted: true,
      });

      // Navigate to main app
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Complete onboarding error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>
          Welcome to Privacy Social. Start by creating your first private group and
          inviting friends and family.
        </Text>

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
              Share random photos automatically
            </Text>
          </View>
        </View>
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
    marginBottom: 40,
    paddingHorizontal: 20,
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
