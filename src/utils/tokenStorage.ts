/**
 * Token Storage Utility
 * 
 * Centralized token management to avoid circular dependencies
 * between auth store and API services.
 */

// Storage keys
const ACCESS_TOKEN_KEY = 'adaptiva_access_token';
const REFRESH_TOKEN_KEY = 'adaptiva_refresh_token';
const USER_KEY = 'adaptiva_user';
const ANON_SESSION_KEY = 'adaptiva_anon_session';

// Access Token
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// Refresh Token
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function removeRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// User Data
export function getStoredUser<T>(): T | null {
  const userJson = localStorage.getItem(USER_KEY);
  if (userJson) {
    try {
      return JSON.parse(userJson) as T;
    } catch {
      return null;
    }
  }
  return null;
}

export function setStoredUser<T>(user: T): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

// Anonymous Session (for rate limiting)
export function getAnonymousSession(): string | null {
  return localStorage.getItem(ANON_SESSION_KEY);
}

export function setAnonymousSession(token: string): void {
  localStorage.setItem(ANON_SESSION_KEY, token);
}

// Clear all auth data
export function clearAllAuthData(): void {
  removeAccessToken();
  removeRefreshToken();
  removeStoredUser();
}

// Store all auth data at once
export function storeAuthData(data: {
  accessToken: string;
  refreshToken: string;
  user: unknown;
}): void {
  setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken);
  setStoredUser(data.user);
}

// Get all tokens
export function getStoredTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  };
}


