import { useState } from 'react';
import { api } from '../utils/api';
import type { DataRow } from '../types';

export const usePredict = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = async (data: DataRow[], instructions?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.predict(data, instructions);
      if (!response.success) {
        setError(response.error || 'Failed to predict');
        return null;
      }
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { predict, loading, error };
};
