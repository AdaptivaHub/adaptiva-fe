/**
 * Preview Page - Data preview and quality analysis
 */

import { useCallback, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useFileStore } from '@/stores';
import { useCleanData } from '@/hooks/api/useCleanData';
import { DataPreview } from '@design/components/DataPreview';
import { DataQualityBanner } from '@design/components/DataQualityBanner';
import { analyzeDataQuality } from '@design/utils/dataQuality';
import type { UploadedFile } from '@design/types';
import { toast } from 'sonner';

export function PreviewPage() {
  const metadata = useFileStore((state) => state.metadata);
  const data = useFileStore((state) => state.data);
  const headers = useFileStore((state) => state.headers);
  const columnInfo = useFileStore((state) => state.columnInfo);
  const setActiveSheet = useFileStore((state) => state.setActiveSheet);
  const clearFile = useFileStore((state) => state.clearFile);
  const refreshData = useFileStore((state) => state.refreshData);

  const { loading: isCleaning, quickClean, error: cleaningError } = useCleanData();
  const [isQualityBannerDismissed, setIsQualityBannerDismissed] = useState(false);

  const handleSheetChange = useCallback((sheetName: string) => {
    setActiveSheet(sheetName);
  }, [setActiveSheet]);

  const handleNewUpload = useCallback(() => {
    clearFile();
  }, [clearFile]);  const handleCleanData = useCallback(async () => {
    if (!metadata?.fileId) return;

    const result = await quickClean(metadata.fileId, metadata.activeSheet);
    
    if (result) {
      // Refresh the data after cleaning
      await refreshData();
      
      const operationsCount = result.operations_log.length;
      const rowsRemoved = result.rows_before - result.rows_after;
      
      if (operationsCount > 0) {
        toast.success(
          `Cleaned data: ${operationsCount} operations performed${rowsRemoved > 0 ? `, ${rowsRemoved} rows removed` : ''}`
        );
      } else {
        toast.info('No cleaning operations were necessary');
      }
      
      // Note: Don't dismiss the banner here - let the quality check re-run
      // after data refresh and the banner will hide if qualityScore === 100
    } else if (cleaningError) {
      toast.error(`Cleaning failed: ${cleaningError}`);
    }
  }, [metadata?.fileId, metadata?.activeSheet, quickClean, refreshData, cleaningError]);

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
      {qualityReport && qualityReport.qualityScore < 100 && !isQualityBannerDismissed && (
        <DataQualityBanner
          issues={qualityReport.issues}
          qualityScore={qualityReport.qualityScore}
          actionLabel={isCleaning ? 'Cleaning...' : 'Clean Data Now'}
          onAction={handleCleanData}
          onDismiss={() => setIsQualityBannerDismissed(true)}
        />
      )}      {/* Data Preview */}
      <DataPreview
        file={uploadedFile}
        data={data}
        headers={headers}
        columnInfo={columnInfo}
        onSheetChange={metadata.sheets ? handleSheetChange : undefined}
        onNewUpload={handleNewUpload}
      />
    </div>
  );
}


