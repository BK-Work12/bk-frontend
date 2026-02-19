/**
 * Simple sessionStorage cache for API responses.
 * Uses stale-while-revalidate pattern: show cached data instantly,
 * then refresh in background.
 */

const CACHE_PREFIX = 'varntix_cache_';

export function getCached<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCache(key: string, data: unknown): void {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch {
    // sessionStorage full or unavailable – ignore
  }
}
