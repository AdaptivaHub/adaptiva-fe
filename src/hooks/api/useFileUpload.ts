/**
 * useFileUpload Hook - Handles file upload with validation
 */

import { useState, useRef, useCallback } from 'react';
import { uploadService } from '@/services';
import { useFileStore } from '@/stores';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_EXTENSIONS = /\.(csv|xlsx|xls)$/i;
const VALID_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

interface UseFileUploadOptions {
  onSuccess?: () => void;
  maxRows?: number;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { onSuccess, maxRows = 1000 } = options;
  
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const setFile = useFileStore((state) => state.setFile);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit';
    }
    if (!VALID_MIME_TYPES.includes(file.type) && !file.name.match(VALID_EXTENSIONS)) {
      return 'Please upload a CSV or XLSX file';
    }
    return null;
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setError('');
    setFileName(file.name);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Upload file to backend
      const uploadResponse = await uploadService.upload(file);
      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error(uploadResponse.error || 'Failed to upload file');
      }

      const { file_id, sheets, active_sheet, rows, columns } = uploadResponse.data;

      // Step 2: Get formatted preview from backend
      const previewResponse = await uploadService.getPreview(file_id, maxRows);
      if (!previewResponse.success || !previewResponse.data) {
        throw new Error(previewResponse.error || 'Failed to process file');
      }

      const { headers, data, available_sheets, sheet_name } = previewResponse.data;

      // Convert to DataRow format
      const formattedData = data.map(row =>
        Object.fromEntries(headers.map(h => [h, row[h] ?? null]))
      );

      // Store in global file store
      setFile(
        {
          fileId: file_id,
          fileName: file.name,
          sheets: sheets ?? available_sheets ?? undefined,
          activeSheet: active_sheet ?? sheet_name ?? undefined,
          rowCount: rows,
          columnCount: columns,
        },
        formattedData,
        headers
      );

      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Error uploading file: ${message}`);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, maxRows, setFile, onSuccess]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const reset = useCallback(() => {
    setFileName('');
    setError('');
    setIsUploading(false);
  }, []);

  return {
    fileName,
    error,
    isUploading,
    fileInputRef,
    uploadFile,
    openFilePicker,
    reset,
  };
}
