import axios, { AxiosError } from 'axios';
import type { 
  ApiResponse, 
  DataRow, 
  AIChartResponse, 
  FileUploadResponse, 
  PreviewResponse,
  DataCleaningRequest,
  DataCleaningResponse,
  ChartSettings,
  RateLimitError
} from '../types';
import { getAccessToken, getAnonymousSession, setAnonymousSession } from '../context/AuthContext';

// Use environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
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

export const api = {
  uploadFile: async (file: File): Promise<ApiResponse<FileUploadResponse>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<FileUploadResponse>(error);
    }
  },
  // Unified data cleaning - supports all cleaning operations
  cleanData: async (request: DataCleaningRequest): Promise<ApiResponse<DataCleaningResponse>> => {
    try {
      const response = await apiClient.post('/cleaning', request);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<DataCleaningResponse>(error);
    }
  },

  getInsights: async (data: DataRow[]): Promise<ApiResponse<string | Record<string, unknown>>> => {
    try {
      const response = await apiClient.post('/insights', { data });
      return response.data;
    } catch (error) {
      return handleApiError<string | Record<string, unknown>>(error);
    }
  },  generateAIChart: async (fileId: string, userInstructions?: string, sheetName?: string): Promise<ApiResponse<AIChartResponse>> => {
    try {
      const response = await apiClient.post('/charts/ai', {
        file_id: fileId,
        sheet_name: sheetName ?? null,
        user_instructions: userInstructions || null,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<AIChartResponse>(error);
    }
  },

  generateManualChart: async (
    fileId: string, 
    settings: ChartSettings, 
    sheetName?: string
  ): Promise<ApiResponse<{ chart_json: Record<string, unknown>; message: string }>> => {
    try {
      const response = await apiClient.post('/charts/', {
        file_id: fileId,
        sheet_name: sheetName ?? null,
        chart_type: settings.chart_type || 'bar',
        x_column: settings.x_column,
        y_column: settings.y_column,
        title: settings.title || 'Chart',
        color_column: settings.color_column,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<{ chart_json: Record<string, unknown>; message: string }>(error);
    }
  },

  predict: async (data: DataRow[], instructions?: string): Promise<ApiResponse<string | Record<string, unknown>>> => {
    try {
      const response = await apiClient.post('/predict', { data, instructions });
      return response.data;
    } catch (error) {
      return handleApiError<string | Record<string, unknown>>(error);
    }
  },
  exportData: async (data: DataRow[], format: string = 'csv'): Promise<ApiResponse<Blob>> => {
    try {
      const response = await apiClient.post('/export', { data, format }, {
        responseType: 'blob',
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<Blob>(error);
    }
  },
  getFormattedPreview: async (
    fileId: string, 
    maxRows: number = 100, 
    sheetName?: string
  ): Promise<ApiResponse<PreviewResponse>> => {
    try {
      const response = await apiClient.post('/preview', {
        file_id: fileId,
        max_rows: maxRows,
        sheet_name: sheetName ?? null,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<PreviewResponse>(error);
    }
  },
};

function handleApiError<T>(error: unknown): ApiResponse<T> {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string; detail?: string | RateLimitError }>;
    const responseData = axiosError.response?.data;
    
    // Handle rate limit errors (429)
    if (axiosError.response?.status === 429 && responseData?.detail) {
      const detail = responseData.detail;
      if (typeof detail === 'object' && 'queries_used' in detail) {
        // It's a rate limit error
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
    const errorMessage = responseData?.error || 
      responseData?.message || 
      (typeof responseData?.detail === 'string' ? responseData.detail : null) ||
      axiosError.message || 
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

export default api;
