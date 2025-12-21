import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthResponse, LoginRequest, RegisterRequest, TokenResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'adaptiva_access_token';
const REFRESH_TOKEN_KEY = 'adaptiva_refresh_token';
const USER_KEY = 'adaptiva_user';

// Helper functions for token management
const getStoredTokens = () => ({
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
});

const getStoredUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
  return null;
};

const storeAuthData = (data: AuthResponse) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
};

const clearAuthData = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = getStoredUser();
    const { accessToken } = getStoredTokens();
    
    if (storedUser && accessToken) {
      setUser(storedUser);
      // Optionally verify token is still valid
      verifyToken(accessToken).then((isValid) => {
        if (!isValid) {
          // Try to refresh
          refreshTokenInternal().then((success) => {
            if (!success) {
              clearAuthData();
              setUser(null);
            }
          });
        }
      });
    }
    setIsLoading(false);
  }, []);

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const refreshTokenInternal = async (): Promise<boolean> => {
    const { refreshToken: storedRefreshToken } = getStoredTokens();
    if (!storedRefreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });

      if (response.ok) {
        const data: TokenResponse = await response.json();
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        storeAuthData(data);
        setUser(data.user);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  };

  const register = async (data: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const authData: AuthResponse = await response.json();
        storeAuthData(authData);
        setUser(authData.user);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  };

  const logout = async (): Promise<void> => {
    const { refreshToken: storedRefreshToken } = getStoredTokens();
    
    // Call logout endpoint if we have a refresh token
    if (storedRefreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: storedRefreshToken }),
        });
      } catch {
        // Ignore errors on logout - we'll clear local state anyway
      }
    }
    
    clearAuthData();
    setUser(null);
  };

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const success = await refreshTokenInternal();
    if (!success) {
      clearAuthData();
      setUser(null);
    }
    return success;
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export function to get current access token for API calls
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// Export function to get anonymous session token
const ANON_SESSION_KEY = 'adaptiva_anon_session';

export function getAnonymousSession(): string | null {
  return localStorage.getItem(ANON_SESSION_KEY);
}

export function setAnonymousSession(token: string): void {
  localStorage.setItem(ANON_SESSION_KEY, token);
}
