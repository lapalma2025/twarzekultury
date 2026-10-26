/** Client-side cookie consent (GDPR / ePrivacy). Persisted in localStorage. */

export const COOKIE_CONSENT_KEY = 'tk_cookie_consent_v1';

export type CookieCategory = 'necessary' | 'preferences' | 'analytics' | 'marketing';

export interface CookieConsentState {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
  version: 1;
}

export const DEFAULT_REJECTED: Omit<CookieConsentState, 'decidedAt'> = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
  version: 1,
};

export const DEFAULT_ACCEPTED: Omit<CookieConsentState, 'decidedAt'> = {
  necessary: true,
  preferences: true,
  analytics: true,
  marketing: true,
  version: 1,
};

export function readCookieConsent(): CookieConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentState;
    if (parsed?.version !== 1 || parsed.necessary !== true || !parsed.decidedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCookieConsent(partial: Omit<CookieConsentState, 'decidedAt' | 'version' | 'necessary'> & { necessary?: true }): CookieConsentState {
  const state: CookieConsentState = {
    necessary: true,
    preferences: Boolean(partial.preferences),
    analytics: Boolean(partial.analytics),
    marketing: Boolean(partial.marketing),
    decidedAt: new Date().toISOString(),
    version: 1,
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('tk-cookie-consent', { detail: state }));
  return state;
}

export function hasCookieDecision(): boolean {
  return readCookieConsent() !== null;
}
