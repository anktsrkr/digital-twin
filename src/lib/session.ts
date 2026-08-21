/**
 * Recruiter Session State Storage
 * Caches recruiter identity and bearer token in localStorage for session resilience.
 */

export interface RecruiterSession {
  email: string;
  company?: string;
  userId?: string;
  token?: string;
  authenticatedAt: string;
}

const STORAGE_KEY_SESSION = 'recruiter_session';
const STORAGE_KEY_EMAIL = 'recruiter_email';
const STORAGE_KEY_COMPANY = 'recruiter_company';
const STORAGE_KEY_TOKEN = 'recruiter_token';

/**
 * Retrieves saved session from localStorage.
 */
export function getSavedRecruiterSession(): RecruiterSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  const email = localStorage.getItem(STORAGE_KEY_EMAIL);
  const company = localStorage.getItem(STORAGE_KEY_COMPANY);
  const token = localStorage.getItem(STORAGE_KEY_TOKEN);
  if (email) {
    return {
      email,
      company: company || undefined,
      token: token || undefined,
      authenticatedAt: new Date().toISOString()
    };
  }

  return null;
}

/**
 * Stores active recruiter session in localStorage.
 */
export function saveRecruiterSession(session: RecruiterSession): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEY_EMAIL, session.email);
    if (session.company) {
      localStorage.setItem(STORAGE_KEY_COMPANY, session.company);
    } else {
      localStorage.removeItem(STORAGE_KEY_COMPANY);
    }
    if (session.token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, session.token);
    }
  } catch {}
}

/**
 * Clears active recruiter session on sign-out.
 */
export function clearRecruiterSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_EMAIL);
    localStorage.removeItem(STORAGE_KEY_COMPANY);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  } catch {}
}
