/**
 * Prompt Cache - Caches generated prompts to avoid redundant AI calls.
 */

interface CacheEntry {
  key: string;
  prompts: unknown;
  timeline: unknown;
  createdAt: number;
  ttlMs: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a cache key from pipeline inputs.
 */
export function generateCacheKey(productName: string, truthHash: string): string {
  return `prompt_${productName.toLowerCase().replace(/\s+/g, "_")}_${truthHash}`;
}

/**
 * Get cached prompts if available and not expired.
 */
export function getCachedPrompts(key: string): CacheEntry | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.createdAt > entry.ttlMs) {
    cache.delete(key);
    return null;
  }

  return entry;
}

/**
 * Store generated prompts in cache.
 */
export function setCachedPrompts(
  key: string,
  prompts: unknown,
  timeline: unknown,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  cache.set(key, {
    key,
    prompts,
    timeline,
    createdAt: Date.now(),
    ttlMs,
  });
}

/**
 * Clear the entire cache or a specific key.
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * Get cache stats.
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
