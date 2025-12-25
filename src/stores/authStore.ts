/**
 * Auth Store - Zustand store for authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import {
  getStoredTokens,
  storeAuthData,
  clearAllAuthData,
  setAccessToken,
  setRefreshToken,
} from '@/utils/tokenStorage';
import type { User, LoginRequest, RegisterRequest } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        const result = await authService.login(credentials);
        
        if (result.success && result.data) {
          storeAuthData({
            accessToken: result.data.access_token,
            refreshToken: result.data.refresh_token,
            user: result.data.user,
          });
          
          set({
            user: result.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return { success: true };
        } else {
          set({ isLoading: false, error: result.error });
          return { success: false, error: result.error };
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        const result = await authService.register(data);
        
        if (result.success && result.data) {
          storeAuthData({
            accessToken: result.data.access_token,
            refreshToken: result.data.refresh_token,
            user: result.data.user,
          });
          
          set({
            user: result.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return { success: true };
        } else {
          set({ isLoading: false, error: result.error });
          return { success: false, error: result.error };
        }
      },

      logout: async () => {
        const { refreshToken } = getStoredTokens();
        
        if (refreshToken) {
          await authService.logout(refreshToken);
        }
        
        clearAllAuthData();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      refreshToken: async () => {
        const { refreshToken } = getStoredTokens();
        
        if (!refreshToken) {
          return false;
        }

        const result = await authService.refreshToken(refreshToken);
        
        if (result.success && result.data) {
          setAccessToken(result.data.access_token);
          setRefreshToken(result.data.refresh_token);
          return true;
        }
        
        // Refresh failed, clear auth
        await get().logout();
        return false;
      },

      initializeAuth: async () => {
        const { accessToken, refreshToken } = getStoredTokens();
        
        if (!accessToken || !refreshToken) {
          set({ isLoading: false });
          return;
        }

        // Verify token is still valid
        const isValid = await authService.verifyToken(accessToken);
        
        if (isValid) {
          // Get current user
          const userResult = await authService.getCurrentUser(accessToken);
          if (userResult.success && userResult.data) {
            set({
              user: userResult.data,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        }

        // Token invalid, try to refresh
        const refreshed = await get().refreshToken();
        
        if (refreshed) {
          const { accessToken: newToken } = getStoredTokens();
          if (newToken) {
            const userResult = await authService.getCurrentUser(newToken);
            if (userResult.success && userResult.data) {
              set({
                user: userResult.data,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          }
        }

        // All attempts failed
        clearAllAuthData();
        set({ isLoading: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Only persist user data, not loading/error state
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook alias for cleaner imports
export const useAuth = useAuthStore;


