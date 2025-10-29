/**
 * Network Service
 * Monitor network connectivity and manage offline state
 */

import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { create } from 'zustand';
import { logger } from './logger';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: NetInfoStateType;
  isOffline: boolean;
}

interface NetworkStore extends NetworkState {
  setNetworkState: (state: Partial<NetworkState>) => void;
}

// Zustand store for network state
export const useNetworkStore = create<NetworkStore>((set) => ({
  isConnected: true,
  isInternetReachable: true,
  type: 'unknown',
  isOffline: false,

  setNetworkState: (state) => set((current) => ({ ...current, ...state })),
}));

class NetworkService {
  private unsubscribe: (() => void) | null = null;

  /**
   * Initialize network monitoring
   */
  initialize(): void {
    // Subscribe to network state changes
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      this.handleNetworkChange(state);
    });

    // Fetch initial state
    NetInfo.fetch().then((state) => {
      this.handleNetworkChange(state);
    });

    logger.info('Network service initialized');
  }

  /**
   * Clean up network monitoring
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    logger.info('Network service cleaned up');
  }

  /**
   * Handle network state change
   */
  private handleNetworkChange(state: NetInfoState): void {
    const isConnected = state.isConnected ?? false;
    const isInternetReachable = state.isInternetReachable ?? false;
    const type = state.type;
    const isOffline = !isConnected || !isInternetReachable;

    useNetworkStore.getState().setNetworkState({
      isConnected,
      isInternetReachable,
      type,
      isOffline,
    });

    if (isOffline) {
      logger.warn('Device is offline', { type });
    } else {
      logger.info('Device is online', { type });
    }
  }

  /**
   * Get current network state
   */
  async getCurrentState(): Promise<NetInfoState> {
    return await NetInfo.fetch();
  }

  /**
   * Refresh network state
   */
  async refresh(): Promise<void> {
    const state = await NetInfo.refresh();
    this.handleNetworkChange(state);
  }
}

// Export singleton instance
let networkServiceInstance: NetworkService | null = null;

export function getNetworkService(): NetworkService {
  if (!networkServiceInstance) {
    networkServiceInstance = new NetworkService();
  }
  return networkServiceInstance;
}

// Export convenience functions
export const network = {
  initialize: () => getNetworkService().initialize(),
  cleanup: () => getNetworkService().cleanup(),
  getCurrentState: () => getNetworkService().getCurrentState(),
  refresh: () => getNetworkService().refresh(),
};

// Initialize network service automatically
if (typeof window !== 'undefined') {
  network.initialize();
}
