/**
 * useExport Hook - Handles data export
 */

import { useState, useCallback } from 'react';
import { exportService } from '@/services';
import type { DataRow } from '@/types';

export function useExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async (
    data: DataRow[],
    format: 'csv' | 'xlsx' = 'csv',
    fileName?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await exportService.export(data, format);

      if (!response.success || !response.data) {
        setError(response.error || 'Failed to export data');
        return false;
      }

      // Create download link
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  return {
    loading,
    error,
    exportData,
    clearError,
  };
}


