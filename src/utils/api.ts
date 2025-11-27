import axios, { AxiosError } from 'axios';
import type { ApiResponse, DataRow, AIChartResponse, FileUploadResponse } from '../types';

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

  cleanData: async (data: DataRow[]): Promise<ApiResponse<DataRow[]>> => {
    try {
      const response = await apiClient.post('/clean', { data });
      return response.data;
    } catch (error) {
      return handleApiError<DataRow[]>(error);
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

  generateAIChart: async (fileId: string, userInstructions?: string): Promise<ApiResponse<AIChartResponse>> => {
    try {
      const response = await apiClient.post('/charts/ai', {
        file_id: fileId,
        user_instructions: userInstructions || null,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<AIChartResponse>(error);
    }
  },

  // Keep the old method for backwards compatibility
  generateChart: async (data: DataRow[], chartType?: string): Promise<ApiResponse<Record<string, unknown>>> => {
    try {
      const response = await apiClient.post('/chart', { data, chartType });
      return response.data;
    } catch (error) {
      return handleApiError<Record<string, unknown>>(error);
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
