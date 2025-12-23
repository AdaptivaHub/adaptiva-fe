/**
 * Upload Page - File upload and data preview
 */

import { useCallback } from 'react';
import { useFileStore } from '@/stores';
import { useFileUpload } from '@/hooks/api';
import { useDragDrop } from '@/hooks/ui';
import { UploadZone } from '@design/components/UploadZone';
import { DataPreview } from '@design/components/DataPreview';
import { DataQualityBanner } from '@design/components/DataQualityBanner';
import { analyzeDataQuality } from '@design/utils/dataQuality';
import type { UploadedFile } from '@design/types';
import { toast } from 'sonner';

export function UploadPage() {
  const metadata = useFileStore((state) => state.metadata);
  const data = useFileStore((state) => state.data);
  const headers = useFileStore((state) => state.headers);
  const setActiveSheet = useFileStore((state) => state.setActiveSheet);
  const clearFile = useFileStore((state) => state.clearFile);

  const { uploadFile, isUploading, error } = useFileUpload({
    onSuccess: () => {
      toast.success('File uploaded successfully!');
    },
  });

  const { isDragActive, dragProps } = useDragDrop({
    onFileDrop: uploadFile,
    disabled: isUploading,
  });

  const handleFileSelect = useCallback((file: File) => {
    uploadFile(file);
  }, [uploadFile]);

  const handleSheetChange = useCallback((sheetName: string) => {
    setActiveSheet(sheetName);
  }, [setActiveSheet]);

  const handleNewUpload = useCallback(() => {
    clearFile();
  }, [clearFile]);

  // Show error toast if upload fails
  if (error) {
    toast.error(error);
  }

  // If no file uploaded, show upload zone
  if (!metadata) {
    return (
      <div className="p-6" {...dragProps}>
        <UploadZone
          onFileSelect={handleFileSelect}
          isLoading={isUploading}
          isDragActive={isDragActive}
        />
      </div>
    );
  }

  // Convert to UploadedFile format for design-system components
  const uploadedFile: UploadedFile = {
    fileName: metadata.fileName,
    rowCount: metadata.rowCount,
    columnCount: metadata.columnCount,
    sheets: metadata.sheets,
    activeSheet: metadata.activeSheet,
  };

  // Analyze data quality
  const qualityReport = data.length > 0
    ? analyzeDataQuality(data, headers)
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* Data Quality Banner */}
      {qualityReport && qualityReport.qualityScore < 100 && (
        <DataQualityBanner
          report={qualityReport}
          onClean={() => {
            // TODO: Implement cleaning flow
            toast.info('Data cleaning coming soon!');
          }}
        />
      )}

      {/* Data Preview */}
      <DataPreview
        file={uploadedFile}
        data={data}
        headers={headers}
        onSheetChange={metadata.sheets ? handleSheetChange : undefined}
        onNewUpload={handleNewUpload}
      />
    </div>
  );
}
