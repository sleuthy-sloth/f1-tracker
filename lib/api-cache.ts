/**
 * Client-side API response cache
 * Stores API responses in localStorage with TTL to avoid rate limit issues
 * with NVIDIA/OpenRouter free tiers (200 req/day).
 */

const CACHE_PREFIX = 's1-cache-';
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

export interface CacheEntry<T> {
  data: T;
  cachedAt: string;
  ttl: number; // milliseconds
}

/**
 * Get a cached value
 */
export function getCached<T>(key: string): { data: T; cachedAt: string } | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    
    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - new Date(entry.cachedAt).getTime();
    
    if (age > entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    
    return { data: entry.data, cachedAt: entry.cachedAt };
  } catch {
    return null;
  }
}

/**
 * Set a cached value with TTL
 */
export function setCache<T>(key: string, data: T, ttl?: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const entry: CacheEntry<T> = {
      data,
      cachedAt: new Date().toISOString(),
      ttl: ttl ?? DEFAULT_TTL_MS,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/**
 * Clear all caches with the app prefix
 */
export function clearAllCaches(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // silently fail
  }
}