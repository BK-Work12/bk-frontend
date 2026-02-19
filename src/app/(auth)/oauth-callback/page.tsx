'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

/**
 * OAuth callback page.
 *
 * Communication strategy (popup → opener):
 *  1. window.opener.postMessage  – works when COOP headers don't null the opener
 *  2. localStorage 'storage' event – works across same-origin tabs even when
 *     window.opener is null (Google sets Cross-Origin-Opener-Policy which
 *     breaks window.opener in modern browsers)
 *  3. Fallback: if nothing works, treat as a normal redirect (set token + navigate)
 */

const LS_KEY = 'varntix-oauth-result';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [showClose, setShowClose] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    // --- Channel 1: window.opener (classic popup) ---
    const hasOpener = !!window.opener;
    if (hasOpener) {
      try {
        if (token) {
          window.opener.postMessage({ type: 'varntix-oauth-success', token }, window.location.origin);
        } else {
          window.opener.postMessage(
            { type: 'varntix-oauth-error', message: error || 'Sign in failed' },
            window.location.origin
          );
        }
        setTimeout(() => window.close(), 100);
        return;
      } catch {
        // opener access blocked – fall through to localStorage
      }
    }

    // --- Channel 2: localStorage event (cross-tab, works even without opener) ---
    // Detect if we were opened as a popup (has certain window features or small size)
    const isLikelyPopup =
      window.opener != null ||
      window.history.length <= 2 ||
      (window.outerWidth < 600 && window.outerHeight < 700);

    if (isLikelyPopup || window.name.startsWith('varntix-')) {
      // Write result to localStorage so the parent tab picks it up via 'storage' event
      if (token) {
        localStorage.setItem(LS_KEY, JSON.stringify({ type: 'varntix-oauth-success', token, ts: Date.now() }));
      } else {
        localStorage.setItem(LS_KEY, JSON.stringify({ type: 'varntix-oauth-error', message: error || 'Sign in failed', ts: Date.now() }));
      }
      // Clean up after a short delay (so the storage event fires first)
      setTimeout(() => {
        try { localStorage.removeItem(LS_KEY); } catch {}
      }, 2000);

      // Try to close the popup
      try { window.close(); } catch {}

      // If window.close() didn't work (some browsers block it), show a message
      setTimeout(() => setShowClose(true), 500);
      return;
    }

    // --- Fallback: normal redirect (not a popup, or detection failed) ---
    if (token) {
      setToken(token);
      refreshUser().then(() => {
        router.replace('/dashboard?login=success');
      });
      return;
    }
    router.replace('/login?error=' + encodeURIComponent(error || 'Missing token'));
  }, [router, refreshUser]);

  if (showClose) {
    return (
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-[#111111] text-white">
        <p className="text-lg font-medium">Sign-in complete!</p>
        <p className="text-sm text-[#FFFFFF80]">You can close this window and return to Varntix.</p>
        <button
          onClick={() => window.close()}
          className="mt-2 px-6 py-2 rounded-lg text-black font-semibold"
          style={{ background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)' }}
        >
          Close Window
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] text-white">
      <svg
        className="h-12 w-12 animate-spin text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
