import { useState } from 'react';
import { api } from '../utils/api';
import type { DataRow } from '../types';

export const useCleanData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanData = async (data: DataRow[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.cleanData(data);
      if (!response.success) {
        setError(response.error || 'Failed to clean data');
        return null;
      }
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clean data';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { cleanData, loading, error };
};
