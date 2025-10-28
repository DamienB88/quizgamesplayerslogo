import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';

interface UserPreferences {
  autoPublishMode: boolean;
  notificationsEnabled: boolean;
  biometricAuthEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
}

interface PreferencesState extends UserPreferences {
  isLoading: boolean;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => Promise<void>;
  loadPreferences: () => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  autoPublishMode: false,
  notificationsEnabled: true,
  biometricAuthEnabled: false,
  theme: 'auto',
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...DEFAULT_PREFERENCES,
  isLoading: false,

  updatePreference: async (key, value) => {
    set({ isLoading: true });
    try {
      const currentPrefs = {
        autoPublishMode: get().autoPublishMode,
        notificationsEnabled: get().notificationsEnabled,
        biometricAuthEnabled: get().biometricAuthEnabled,
        theme: get().theme,
      };

      const updatedPrefs = { ...currentPrefs, [key]: value };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPrefs));

      set({ [key]: value, isLoading: false });
    } catch (error) {
      console.error('Failed to update preference:', error);
      set({ isLoading: false });
    }
  },

  loadPreferences: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (stored) {
        const prefs = JSON.parse(stored);
        set({ ...prefs, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      set({ isLoading: false });
    }
  },

  resetPreferences: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
      set(DEFAULT_PREFERENCES);
    } catch (error) {
      console.error('Failed to reset preferences:', error);
    }
  },
}));
