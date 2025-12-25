/**
 * useTrainModel Hook - Train ML models via the /ml/train endpoint
 */

import { useState, useCallback } from 'react';
import { predictionService } from '@/services';
import type { ModelTrainingRequest, TrainedModel, MLTrainResponse } from '@/types';

/**
 * Transform API response to frontend TrainedModel format
 */
function transformToTrainedModel(
  response: MLTrainResponse,
  config: ModelTrainingRequest,
  dataPointCount: number
): TrainedModel {
  return {
    id: crypto.randomUUID(),
    name: config.name,
    type: config.type,
    targetVariable: config.targetVariable,
    features: config.features,
    metrics: {
      r2: response.metrics.r2_score,      // Map r2_score → r2
      mae: response.metrics.mae,
      rmse: response.metrics.rmse,
      mse: response.metrics.mse,
    },
    featureImportance: response.feature_importance ?? undefined,
    trainedAt: new Date(),
    dataPoints: dataPointCount,
    testSize: 1 - (config.trainSize / 100),
  };
}

export function useTrainModel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trainModel = useCallback(async (
    fileId: string,
    config: ModelTrainingRequest,
    dataPointCount: number
  ): Promise<TrainedModel | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await predictionService.trainModel(fileId, {
        modelType: config.type === 'linear-regression' ? 'linear_regression' : 'decision_tree',
        targetColumn: config.targetVariable,
        featureColumns: config.features,
        testSize: 1 - (config.trainSize / 100),
      });
      
      if (!response.success || !response.data) {
        const errorMessage = response.error || 'Training failed';
        setError(errorMessage);
        return null;
      }
      
      // Transform API response to TrainedModel
      return transformToTrainedModel(response.data, config, dataPointCount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Training failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { 
    trainModel, 
    loading, 
    error, 
    clearError,
  };
}


