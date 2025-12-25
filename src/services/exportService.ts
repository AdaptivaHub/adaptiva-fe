/**
 * Export Service - Data export API calls
 */

import { apiClient, handleApiError, type ApiResponse } from './api';
import type { DataRow } from '@/types';

export const exportService = {
  /**
   * Export data to a file format (CSV, XLSX)
   */
  async export(
    data: DataRow[],
    format: 'csv' | 'xlsx' = 'csv'
  ): Promise<ApiResponse<Blob>> {
    try {
      const response = await apiClient.post(
        '/export',
        { data, format },
        { responseType: 'blob' }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<Blob>(error);
    }
  },
};


