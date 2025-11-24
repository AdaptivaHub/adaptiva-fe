import { useState } from 'react';
import { api } from '../utils/api';
import type { DataRow } from '../types';

export const useChart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChart = async (data: DataRow[], chartType?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateChart(data, chartType);
      if (!response.success) {
        setError(response.error || 'Failed to generate chart');
        return null;
      }
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate chart';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateChart, loading, error };
};
