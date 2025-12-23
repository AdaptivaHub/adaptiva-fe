/**
 * useCleanData Hook - Handles data cleaning operations
 */

import { useState, useCallback } from 'react';
import { cleaningService } from '@/services';
import type { DataCleaningRequest, DataCleaningResponse } from '@/types';

export interface CleaningOptions {
  sheetName?: string;
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

export function useCleanData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DataCleaningResponse | null>(null);

  const cleanData = useCallback(async (
    fileId: string,
    options: CleaningOptions = {}
  ): Promise<DataCleaningResponse | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: DataCleaningRequest = {
        file_id: fileId,
        sheet_name: options.sheetName,
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

      const response = await cleaningService.clean(request);

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

  const quickClean = useCallback(async (fileId: string): Promise<DataCleaningResponse | null> => {
    return cleanData(fileId, {
      normalizeColumns: true,
      removeEmptyRows: true,
      removeEmptyColumns: true,
      dropDuplicates: true,
      autoDetectTypes: true,
    });
  }, [cleanData]);

  const deepClean = useCallback(async (fileId: string): Promise<DataCleaningResponse | null> => {
    return cleanData(fileId, {
      normalizeColumns: true,
      removeEmptyRows: true,
      removeEmptyColumns: true,
      dropDuplicates: true,
      dropNa: false,
      smartFillMissing: true,
      autoDetectTypes: true,
    });
  }, [cleanData]);

  const clearError = () => setError(null);
  const clearResult = () => setResult(null);

  return {
    loading,
    error,
    result,
    cleanData,
    quickClean,
    deepClean,
    clearError,
    clearResult,
  };
}
