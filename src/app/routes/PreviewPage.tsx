/**
 * Preview Page - Data preview and quality analysis
 */

import { useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useFileStore } from '@/stores';
import { DataPreview } from '@design/components/DataPreview';
import { DataQualityBanner } from '@design/components/DataQualityBanner';
import { analyzeDataQuality } from '@design/utils/dataQuality';
import type { UploadedFile } from '@design/types';
import { toast } from 'sonner';

export function PreviewPage() {
  const metadata = useFileStore((state) => state.metadata);
  const data = useFileStore((state) => state.data);
  const headers = useFileStore((state) => state.headers);
  const setActiveSheet = useFileStore((state) => state.setActiveSheet);
  const clearFile = useFileStore((state) => state.clearFile);

  const handleSheetChange = useCallback((sheetName: string) => {
    setActiveSheet(sheetName);
  }, [setActiveSheet]);

  const handleNewUpload = useCallback(() => {
    clearFile();
  }, [clearFile]);

  // Redirect to upload page if no file is uploaded
  if (!metadata) {
    return <Navigate to="/upload" replace />;
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
    <div className="p-6 space-y-6">      {/* Data Quality Banner */}
      {qualityReport && qualityReport.qualityScore < 100 && (
        <DataQualityBanner
          issues={qualityReport.issues}
          qualityScore={qualityReport.qualityScore}
          onAction={() => {
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
