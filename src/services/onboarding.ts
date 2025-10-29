/**
 * Onboarding Service
 * Track onboarding progress and save user preferences
 */

import { supabase } from '@/config/supabase';
import { logger } from './logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_state';

export interface OnboardingState {
  completed: boolean;
  welcomeViewed: boolean;
  carouselViewed: boolean;
  privacyConsented: boolean;
  preferencesSet: boolean;
  permissionsGranted: boolean;
  autoPublishMode: boolean;
  timestamp: string;
}

class OnboardingService {
  /**
   * Get current onboarding state from AsyncStorage
   */
  async getOnboardingState(): Promise<OnboardingState | null> {
    try {
      const stateJson = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!stateJson) return null;

      return JSON.parse(stateJson);
    } catch (error) {
      logger.error('Failed to get onboarding state', error);
      return null;
    }
  }

  /**
   * Save onboarding state to AsyncStorage
   */
  async saveOnboardingState(state: Partial<OnboardingState>): Promise<boolean> {
    try {
      const currentState = await this.getOnboardingState();
      const newState: OnboardingState = {
        completed: false,
        welcomeViewed: false,
        carouselViewed: false,
        privacyConsented: false,
        preferencesSet: false,
        permissionsGranted: false,
        autoPublishMode: false,
        timestamp: new Date().toISOString(),
        ...currentState,
        ...state,
      };

      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(newState));
      logger.info('Onboarding state saved', { state: newState });
      return true;
    } catch (error) {
      logger.error('Failed to save onboarding state', error);
      return false;
    }
  }

  /**
   * Mark welcome screen as viewed
   */
  async markWelcomeViewed(): Promise<boolean> {
    return await this.saveOnboardingState({ welcomeViewed: true });
  }

  /**
   * Mark carousel as viewed
   */
  async markCarouselViewed(): Promise<boolean> {
    return await this.saveOnboardingState({ carouselViewed: true });
  }

  /**
   * Mark privacy consent as accepted
   */
  async markPrivacyConsented(): Promise<boolean> {
    return await this.saveOnboardingState({ privacyConsented: true });
  }

  /**
   * Save user preference for auto-publish mode
   */
  async savePreference(autoPublishMode: boolean): Promise<boolean> {
    return await this.saveOnboardingState({
      preferencesSet: true,
      autoPublishMode,
    });
  }

  /**
   * Mark permissions as granted
   */
  async markPermissionsGranted(): Promise<boolean> {
    return await this.saveOnboardingState({ permissionsGranted: true });
  }

  /**
   * Complete onboarding and update database
   */
  async completeOnboarding(userId: string, autoPublishMode: boolean): Promise<boolean> {
    try {
      // Update local state
      await this.saveOnboardingState({
        completed: true,
        autoPublishMode,
      });

      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          auto_publish_mode: autoPublishMode,
        })
        .eq('id', userId);

      if (error) {
        logger.error('Failed to update user onboarding status', error);
        return false;
      }

      logger.info('Onboarding completed', { userId, autoPublishMode });
      return true;
    } catch (error) {
      logger.error('Failed to complete onboarding', error);
      return false;
    }
  }

  /**
   * Reset onboarding state (for testing or re-onboarding)
   */
  async resetOnboarding(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      logger.info('Onboarding state reset');
      return true;
    } catch (error) {
      logger.error('Failed to reset onboarding', error);
      return false;
    }
  }

  /**
   * Check if onboarding is completed
   */
  async isOnboardingCompleted(): Promise<boolean> {
    const state = await this.getOnboardingState();
    return state?.completed ?? false;
  }

  /**
   * Get user's auto-publish preference
   */
  async getAutoPublishPreference(): Promise<boolean> {
    const state = await this.getOnboardingState();
    return state?.autoPublishMode ?? false;
  }
}

// Export singleton instance
let onboardingServiceInstance: OnboardingService | null = null;

export function getOnboardingService(): OnboardingService {
  if (!onboardingServiceInstance) {
    onboardingServiceInstance = new OnboardingService();
  }
  return onboardingServiceInstance;
}

// Export convenience functions
export const onboarding = {
  getOnboardingState: () => getOnboardingService().getOnboardingState(),
  saveOnboardingState: (state: Partial<OnboardingState>) =>
    getOnboardingService().saveOnboardingState(state),
  markWelcomeViewed: () => getOnboardingService().markWelcomeViewed(),
  markCarouselViewed: () => getOnboardingService().markCarouselViewed(),
  markPrivacyConsented: () => getOnboardingService().markPrivacyConsented(),
  savePreference: (autoPublishMode: boolean) =>
    getOnboardingService().savePreference(autoPublishMode),
  markPermissionsGranted: () => getOnboardingService().markPermissionsGranted(),
  completeOnboarding: (userId: string, autoPublishMode: boolean) =>
    getOnboardingService().completeOnboarding(userId, autoPublishMode),
  resetOnboarding: () => getOnboardingService().resetOnboarding(),
  isOnboardingCompleted: () => getOnboardingService().isOnboardingCompleted(),
  getAutoPublishPreference: () => getOnboardingService().getAutoPublishPreference(),
};
