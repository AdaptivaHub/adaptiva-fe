/**
 * Chart Service - Chart generation API calls
 */

import { apiClient, handleApiError, type ApiResponse } from './api';
import type { AIChartResponse, ChartSettings } from '@/types';

export interface ManualChartResponse {
  chart_json: Record<string, unknown>;
  message: string;
}

export const chartService = {
  /**
   * Generate a chart using AI based on user instructions
   */
  async generateAI(
    fileId: string,
    userInstructions?: string,
    sheetName?: string
  ): Promise<ApiResponse<AIChartResponse>> {
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

  /**
   * Generate a chart with manual configuration
   */
  async generateManual(
    fileId: string,
    settings: ChartSettings,
    sheetName?: string
  ): Promise<ApiResponse<ManualChartResponse>> {
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
      return handleApiError<ManualChartResponse>(error);
    }
  },
};
