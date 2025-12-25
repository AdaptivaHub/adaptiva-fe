/**
 * useInsights Hook - Handles AI data insights
 */

import { useState, useCallback } from 'react';
import { insightsService, type InsightsResult } from '@/services';
import type { DataRow } from '@/types';

export function useInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InsightsResult | null>(null);

  const getInsights = useCallback(async (data: DataRow[]): Promise<InsightsResult | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await insightsService.analyze(data);

      if (!response.success) {
        setError(response.error || 'Failed to get insights');
        return null;
      }

      if (response.data) {
        setResult(response.data);
        return response.data;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get insights';
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
    getInsights,
    clearError,
    clearResult,
  };
}


