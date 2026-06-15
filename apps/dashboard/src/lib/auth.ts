export interface AuthSession {
  adminId: string;
  email: string;
  displayName: string;
  isSuperAdmin: boolean;
  accessToken: string;
  refreshToken: string;
}

const AUTH_KEY = 'commerce_auth';

export function getStoredAuth(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    return null;
  }
}

export function storeAuth(auth: AuthSession): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  const auth = getStoredAuth();
  if (!auth) return false;
  try {
    const payload = JSON.parse(atob(auth.accessToken.split('.')[1] ?? ''));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
