import { useState, useRef, useCallback } from 'react';
import { api } from '../utils/api';
import type { UploadedData } from '../types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_EXTENSIONS = /\.(csv|xlsx|xls)$/i;
const VALID_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

interface UseFileUploadOptions {
  onSuccess: (data: UploadedData) => void;
  maxRows?: number;
}

export function useFileUpload({ onSuccess, maxRows = 1000 }: UseFileUploadOptions) {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const uploadResponse = await api.uploadFile(file);
      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error(uploadResponse.error || 'Failed to upload file');
      }

      const { file_id, sheets, active_sheet } = uploadResponse.data;

      // Step 2: Get formatted preview from backend
      const previewResponse = await api.getFormattedPreview(file_id, maxRows);
      if (!previewResponse.success || !previewResponse.data) {
        throw new Error(previewResponse.error || 'Failed to process file');
      }

      const { headers, data, available_sheets, sheet_name } = previewResponse.data;

      // Convert to DataRow format
      const formattedData = data.map(row =>
        Object.fromEntries(headers.map(h => [h, row[h] ?? null]))
      );

      onSuccess({
        data: formattedData,
        headers,
        fileId: file_id,
        sheets: sheets ?? available_sheets ?? undefined,
        activeSheet: active_sheet ?? sheet_name ?? undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Error uploading file: ${message}`);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, onSuccess, maxRows]);

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


