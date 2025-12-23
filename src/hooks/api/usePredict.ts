/**
 * usePredict Hook - Handles ML predictions
 */

import { useState, useCallback } from 'react';
import { predictionService, type PredictionResult } from '@/services';
import type { DataRow } from '@/types';

export function usePredict() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const predict = useCallback(async (
    data: DataRow[],
    instructions?: string
  ): Promise<PredictionResult | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await predictionService.predict(data, instructions);

      if (!response.success) {
        setError(response.error || 'Failed to generate predictions');
        return null;
      }

      if (response.data) {
        setResult(response.data);
        return response.data;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate predictions';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);
  const clearResult = () => setResult(null);

  return {
    loading,
    error,
    result,
    predict,
    clearError,
    clearResult,
  };
}
