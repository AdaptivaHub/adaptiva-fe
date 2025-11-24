import { useState } from 'react';
import { api } from '../utils/api';
import type { DataRow } from '../types';

export const useInsights = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInsights = async (data: DataRow[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getInsights(data);
      if (!response.success) {
        setError(response.error || 'Failed to get insights');
        return null;
      }
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get insights';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getInsights, loading, error };
};
