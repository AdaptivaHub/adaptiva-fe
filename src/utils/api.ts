import axios, { AxiosError } from 'axios';
import type { 
  ApiResponse, 
  DataRow, 
  AIChartResponse, 
  FileUploadResponse, 
  PreviewResponse,
  DataCleaningRequest,
  DataCleaningResponse
} from '../types';

// Use environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  },
  generateAIChart: async (fileId: string, userInstructions?: string, sheetName?: string): Promise<ApiResponse<AIChartResponse>> => {
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
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    return {
      success: false,
      error: axiosError.response?.data?.error || axiosError.response?.data?.message || axiosError.message || 'An error occurred',
    };
  }
  return {
    success: false,
    error: error instanceof Error ? error.message : 'An unknown error occurred',
  };
}

export default api;
