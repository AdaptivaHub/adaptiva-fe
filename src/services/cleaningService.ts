/**
 * Cleaning Service - Data cleaning API calls
 */

import { apiClient, handleApiError, type ApiResponse } from './api';
import type { DataCleaningRequest, DataCleaningResponse } from '@/types';

export const cleaningService = {
  /**
   * Clean and transform data
   */
  async clean(request: DataCleaningRequest): Promise<ApiResponse<DataCleaningResponse>> {
    try {
      const response = await apiClient.post('/cleaning', request);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<DataCleaningResponse>(error);
    }
  },
};


