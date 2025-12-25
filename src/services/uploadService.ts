/**
 * Upload Service - File upload and preview API calls
 */

import { apiClient, handleApiError, type ApiResponse } from './api';
import type { FileUploadResponse, PreviewResponse } from '@/types';

export const uploadService = {
  /**
   * Upload a file (CSV/XLSX) to the backend
   */
  async upload(file: File): Promise<ApiResponse<FileUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<FileUploadResponse>(error);
    }
  },

  /**
   * Get formatted preview of uploaded file data
   */
  async getPreview(
    fileId: string,
    maxRows: number = 100,
    sheetName?: string
  ): Promise<ApiResponse<PreviewResponse>> {
    try {
      const response = await apiClient.post('/preview', {
        file_id: fileId,
        max_rows: maxRows,
        sheet_name: sheetName ?? null,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<PreviewResponse>(error);
    }
  },
};


