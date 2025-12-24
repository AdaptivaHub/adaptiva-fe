/**
 * Prediction Service - ML prediction API calls
 */

import { apiClient, handleApiError, type ApiResponse } from './api';
import type { DataRow, MLTrainResponse } from '@/types';

export type PredictionResult = string | Record<string, unknown>;

export const predictionService = {
  /**
   * Generate ML predictions based on data and instructions (legacy)
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

  /**
   * Train an ML model on the uploaded file
   */
  async trainModel(
    fileId: string,
    config: {
      modelType: 'linear_regression' | 'decision_tree';
      targetColumn: string;
      featureColumns: string[];
      testSize: number;
    }
  ): Promise<ApiResponse<MLTrainResponse>> {
    try {
      const response = await apiClient.post('/ml/train', {
        file_id: fileId,
        model_type: config.modelType,
        target_column: config.targetColumn,
        feature_columns: config.featureColumns,
        test_size: config.testSize,
      });
      return response.data;
    } catch (error) {
      return handleApiError<MLTrainResponse>(error);
    }
  },
};
