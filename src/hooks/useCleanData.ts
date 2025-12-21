import { useState, useCallback } from 'react';
import { api } from '../utils/api';
import type { EnhancedCleaningRequest, EnhancedCleaningResponse } from '../types';

export interface CleaningOptions {
  normalizeColumns?: boolean;
  removeEmptyRows?: boolean;
  removeEmptyColumns?: boolean;
  dropDuplicates?: boolean;
  dropNa?: boolean;
  smartFillMissing?: boolean;
  autoDetectTypes?: boolean;
  fillNa?: Record<string, unknown>;
  columnsToDrop?: string[];
}

export const useCleanData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnhancedCleaningResponse | null>(null);

  // Enhanced cleaning using file_id - this is the main method
  const cleanData = useCallback(async (
    fileId: string,
    options: CleaningOptions = {}
  ): Promise<EnhancedCleaningResponse | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: EnhancedCleaningRequest = {
        file_id: fileId,
        normalize_columns: options.normalizeColumns ?? true,
        remove_empty_rows: options.removeEmptyRows ?? true,
        remove_empty_columns: options.removeEmptyColumns ?? true,
        drop_duplicates: options.dropDuplicates ?? true,
        drop_na: options.dropNa ?? false,
        smart_fill_missing: options.smartFillMissing ?? false,
        auto_detect_types: options.autoDetectTypes ?? true,
        fill_na: options.fillNa,
        columns_to_drop: options.columnsToDrop,
      };

      const response = await api.enhancedClean(request);

      if (!response.success || !response.data) {
        setError(response.error || 'Failed to clean data');
        return null;
      }

      setResult(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clean data';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Quick clean with sensible defaults
  const quickClean = useCallback(async (fileId: string): Promise<EnhancedCleaningResponse | null> => {
    return cleanData(fileId, {
      normalizeColumns: true,
      removeEmptyRows: true,
      removeEmptyColumns: true,
      dropDuplicates: true,
      autoDetectTypes: true,
    });
  }, [cleanData]);

  // Deep clean with all options enabled
  const deepClean = useCallback(async (fileId: string): Promise<EnhancedCleaningResponse | null> => {
    return cleanData(fileId, {
      normalizeColumns: true,
      removeEmptyRows: true,
      removeEmptyColumns: true,
      dropDuplicates: true,
      smartFillMissing: true,
      autoDetectTypes: true,
    });
  }, [cleanData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return { cleanData, quickClean, deepClean, loading, error, result, clearError, clearResult };
};
