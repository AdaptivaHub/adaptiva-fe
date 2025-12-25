/**
 * Insights Service - AI data insights API calls
 */

import { apiClient, handleApiError, type ApiResponse } from './api';
import type { DataRow } from '@/types';

export type InsightsResult = string | Record<string, unknown>;

export const insightsService = {
  /**
   * Get AI-generated insights from data
   */
  async analyze(data: DataRow[]): Promise<ApiResponse<InsightsResult>> {
    try {
      const response = await apiClient.post('/insights', { data });
      return response.data;
    } catch (error) {
      return handleApiError<InsightsResult>(error);
    }
  },
};


