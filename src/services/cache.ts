/**
 * Redis Caching Service
 * Provides caching layer for frequently accessed data
 */

import { Redis } from 'https://esm.sh/@upstash/redis@1.28.0';

export interface CacheConfig {
  url: string;
  token: string;
  defaultTTL?: number; // Default time-to-live in seconds
}

export class CacheService {
  private redis: Redis;
  private defaultTTL: number;

  constructor(config: CacheConfig) {
    if (!config.url || !config.token) {
      throw new Error('Redis URL and token are required');
    }

    this.redis = new Redis({
      url: config.url,
      token: config.token,
    });

    this.defaultTTL = config.defaultTTL || 3600; // 1 hour default
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const expirationTime = ttl || this.defaultTTL;
      await this.redis.set(key, value, { ex: expirationTime });
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;

      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`Cache deletePattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set pattern: Get from cache, or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function to get fresh data
    const fresh = await fetchFn();

    // Cache the result
    await this.set(key, fresh, ttl);

    return fresh;
  }

  /**
   * Increment a value (for counters, rate limiting, etc.)
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Set TTL on existing key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      await this.redis.expire(key, seconds);
      return true;
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }
}

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
  // User cache keys
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  userGroups: (userId: string) => `user:${userId}:groups`,

  // Group cache keys
  group: (groupId: string) => `group:${groupId}`,
  groupMembers: (groupId: string) => `group:${groupId}:members`,
  groupFeed: (groupId: string, page: number = 0) => `group:${groupId}:feed:${page}`,

  // Share cache keys
  share: (shareId: string) => `share:${shareId}`,
  shareDetails: (shareId: string) => `share:${shareId}:details`,
  shareComments: (shareId: string) => `share:${shareId}:comments`,
  shareReactions: (shareId: string) => `share:${shareId}:reactions`,

  // Daily selection cache keys
  dailySelection: (userId: string, groupId: string, date: string) =>
    `selection:${userId}:${groupId}:${date}`,

  // Invite code cache
  inviteCode: (code: string) => `invite:${code}`,

  // Rate limiting keys
  rateLimit: (userId: string, action: string) => `rate:${userId}:${action}`,
} as const;

/**
 * Default TTL values (in seconds)
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
} as const;

/**
 * Initialize cache service with environment variables
 */
export function createCacheService(): CacheService {
  const url = process.env.REDIS_URL;
  const token = process.env.REDIS_TOKEN || '';

  if (!url) {
    throw new Error('REDIS_URL environment variable is required');
  }

  return new CacheService({
    url,
    token,
    defaultTTL: CacheTTL.MEDIUM,
  });
}

// Export singleton instance
let cacheInstance: CacheService | null = null;

export function getCache(): CacheService {
  if (!cacheInstance) {
    cacheInstance = createCacheService();
  }
  return cacheInstance;
}
