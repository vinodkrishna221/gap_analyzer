import NodeCache from 'node-cache';

// Create cache instances with different TTLs
const shortCache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 min
const mediumCache = new NodeCache({ stdTTL: 1800, checkperiod: 300 }); // 30 min
const longCache = new NodeCache({ stdTTL: 7200, checkperiod: 600 }); // 2 hours

export type CacheDuration = 'short' | 'medium' | 'long';

function getCache(duration: CacheDuration): NodeCache {
    switch (duration) {
        case 'short': return shortCache;
        case 'medium': return mediumCache;
        case 'long': return longCache;
    }
}

/**
 * Get a cached value or compute and cache it
 */
export async function getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    duration: CacheDuration = 'medium'
): Promise<T> {
    const cache = getCache(duration);
    const cached = cache.get<T>(key);

    if (cached !== undefined) {
        console.log(`[Cache HIT] ${key}`);
        return cached;
    }

    console.log(`[Cache MISS] ${key}`);
    const result = await fetcher();
    cache.set(key, result);
    return result;
}

/**
 * Get a cached value
 */
export function get<T>(key: string, duration: CacheDuration = 'medium'): T | undefined {
    return getCache(duration).get<T>(key);
}

/**
 * Set a cached value
 */
export function set<T>(key: string, value: T, duration: CacheDuration = 'medium'): void {
    getCache(duration).set(key, value);
}

/**
 * Delete a cached value
 */
export function del(key: string, duration: CacheDuration = 'medium'): void {
    getCache(duration).del(key);
}

/**
 * Clear all caches
 */
export function flushAll(): void {
    shortCache.flushAll();
    mediumCache.flushAll();
    longCache.flushAll();
}

/**
 * Generate a cache key from user ID and data
 */
export function generateCacheKey(prefix: string, userId: string, data?: string): string {
    const hash = data ? hashString(data) : '';
    return `${prefix}:${userId}${hash ? ':' + hash : ''}`;
}

/**
 * Simple string hash for cache keys
 */
function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}
