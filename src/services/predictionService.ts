/**
 * Prediction Service - ML prediction API calls
 */

import { apiClient, handleApiError, type ApiResponse } from './api';
import type { DataRow } from '@/types';

export type PredictionResult = string | Record<string, unknown>;

export const predictionService = {
  /**
   * Generate ML predictions based on data and instructions
   */
  async predict(
    data: DataRow[],
    instructions?: string
  ): Promise<ApiResponse<PredictionResult>> {
    try {
      const response = await apiClient.post('/predict', { data, instructions });
      return response.data;
    } catch (error) {
      return handleApiError<PredictionResult>(error);
    }
  },
};
