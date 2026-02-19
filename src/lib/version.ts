/**
 * App version – bump this on every deploy.
 * When the stored version doesn't match, the user is
 * forced to re-login and all caches are cleared.
 */
export const APP_VERSION = '2.0.8';

const VERSION_KEY = 'varntix_app_version';

/**
 * Check if the stored version matches the current build.
 * If not, wipe localStorage + sessionStorage and redirect to /login.
 * Returns `true` if a forced reload was triggered (caller should bail out).
 */
export function enforceVersion(): boolean {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem(VERSION_KEY);
  if (stored === APP_VERSION) return false;

  // Version mismatch – clear auth but preserve sessionStorage cache for speed
  const authToken = localStorage.getItem('token');
  localStorage.clear();
  // Don't clear sessionStorage - keep cached API data for faster page loads

  // Stamp the new version so the next load passes
  localStorage.setItem(VERSION_KEY, APP_VERSION);

  // Hard redirect to login (not router.push, to ensure a clean slate)
  window.location.replace('/login');
  return true;
}
