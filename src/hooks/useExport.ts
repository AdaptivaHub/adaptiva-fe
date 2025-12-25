import { useState } from 'react';
import { api } from '../utils/api';
import type { DataRow } from '../types';

export const useExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = async (data: DataRow[], format: string = 'csv') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.exportData(data, format);
      if (!response.success) {
        setError(response.error || 'Failed to export data');
        return null;
      }
      
      // Create download link for blob
      if (response.data instanceof Blob) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `export.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { exportData, loading, error };
};


