/**
 * API Service - Axios Instance & Interceptors
 * 
 * Core HTTP client configuration with auth token handling.
 */

import axios from 'axios';
import {
  getAccessToken,
  getAnonymousSession,
  setAnonymousSession,
} from '@/utils/tokenStorage';

// Use environment variable or default to localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor to include JWT token in requests
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Include anonymous session for rate limiting
  const anonSession = getAnonymousSession();
  if (anonSession) {
    config.headers['X-Anonymous-Session'] = anonSession;
  }

  return config;
});

// Handle response to save anonymous session token
apiClient.interceptors.response.use((response) => {
  const anonSession = response.headers['x-anonymous-session'];
  if (anonSession) {
    setAnonymousSession(anonSession);
  }
  return response;
});

/**
 * Generic API response type
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Rate limit error details
 */
export interface RateLimitError {
  detail: string;
  queries_used: number;
  queries_limit: number;
  reset_at: string;
  message: string;
}

/**
 * Handle API errors and return standardized response
 */
export function handleApiError<T>(error: unknown): ApiResponse<T> {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    // Handle rate limit errors (429)
    if (error.response?.status === 429 && responseData?.detail) {
      const detail = responseData.detail;
      if (typeof detail === 'object' && 'queries_used' in detail) {
        return {
          success: false,
          error: detail.message || 'Rate limit exceeded',
          data: { rateLimitError: detail } as unknown as T,
        };
      }
      return {
        success: false,
        error: typeof detail === 'string' ? detail : 'Rate limit exceeded',
      };
    }

    // Handle other errors
    const errorMessage =
      responseData?.error ||
      responseData?.message ||
      (typeof responseData?.detail === 'string' ? responseData.detail : null) ||
      error.message ||
      'An error occurred';

    return {
      success: false,
      error: errorMessage,
    };
  }
  return {
    success: false,
    error: error instanceof Error ? error.message : 'An unknown error occurred',
  };
}


