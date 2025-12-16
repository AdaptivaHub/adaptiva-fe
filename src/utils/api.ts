import axios, { AxiosError } from 'axios';
import type { ApiResponse, DataRow, AIChartResponse, FileUploadResponse, PreviewResponse, ForecastableColumnsResponse, ForecastResponse, MarketingStrategyResponse, ContentGenerationResponse, AgentPipelineResponse, UsageStatsResponse } from '../types';

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

  // ============================================================================
  // AGENT ENDPOINTS
  // ============================================================================

  getForecastableColumns: async (fileId: string): Promise<ApiResponse<ForecastableColumnsResponse>> => {
    try {
      const response = await apiClient.get(`/agents/forecast/columns/${fileId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<ForecastableColumnsResponse>(error);
    }
  },

  generateForecast: async (
    fileId: string,
    dateColumn?: string,
    targetColumn?: string,
    periods: number = 30
  ): Promise<ApiResponse<ForecastResponse>> => {
    try {
      const response = await apiClient.post('/agents/forecast', {
        file_id: fileId,
        date_column: dateColumn ?? null,
        target_column: targetColumn ?? null,
        periods,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<ForecastResponse>(error);
    }
  },

  generateMarketingStrategy: async (
    fileId: string,
    options?: {
      businessName?: string;
      businessType?: string;
      targetAudience?: string;
      forecastTrend?: string;
      additionalContext?: string;
    }
  ): Promise<ApiResponse<MarketingStrategyResponse>> => {
    try {
      const response = await apiClient.post('/agents/marketing/strategy', {
        file_id: fileId,
        business_name: options?.businessName ?? null,
        business_type: options?.businessType ?? null,
        target_audience: options?.targetAudience ?? null,
        forecast_trend: options?.forecastTrend ?? null,
        additional_context: options?.additionalContext ?? null,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<MarketingStrategyResponse>(error);
    }
  },

  generateAdContent: async (
    campaignName: string,
    campaignTheme: string,
    targetAudience: string,
    tactics: string[],
    options?: {
      platform?: string;
      tone?: string;
      includeImage?: boolean;
    }
  ): Promise<ApiResponse<ContentGenerationResponse>> => {
    try {
      const response = await apiClient.post('/agents/content/generate', {
        campaign_name: campaignName,
        campaign_theme: campaignTheme,
        target_audience: targetAudience,
        tactics,
        platform: options?.platform ?? 'social_media',
        tone: options?.tone ?? 'professional',
        include_image: options?.includeImage ?? true,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<ContentGenerationResponse>(error);
    }
  },

  runAgentPipeline: async (
    fileId: string,
    options?: {
      businessName?: string;
      businessType?: string;
      targetAudience?: string;
      runForecast?: boolean;
      runMarketing?: boolean;
      runContent?: boolean;
      forecastPeriods?: number;
    }
  ): Promise<ApiResponse<AgentPipelineResponse>> => {
    try {
      const response = await apiClient.post('/agents/pipeline', {
        file_id: fileId,
        business_name: options?.businessName ?? null,
        business_type: options?.businessType ?? null,
        target_audience: options?.targetAudience ?? null,
        run_forecast: options?.runForecast ?? true,
        run_marketing: options?.runMarketing ?? true,
        run_content: options?.runContent ?? true,
        forecast_periods: options?.forecastPeriods ?? 30,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<AgentPipelineResponse>(error);
    }
  },

  // Usage statistics
  getUsageStats: async (): Promise<ApiResponse<UsageStatsResponse>> => {
    try {
      const response = await apiClient.get('/agents/usage');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<UsageStatsResponse>(error);
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
