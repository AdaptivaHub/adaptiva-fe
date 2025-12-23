/**
 * Upload Page - File upload zone
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileStore } from '@/stores';
import { useFileUpload } from '@/hooks/api';
import { useDragDrop } from '@/hooks/ui';
import { UploadZone } from '@design/components/UploadZone';
import { toast } from 'sonner';

export function UploadPage() {
  const navigate = useNavigate();
  const metadata = useFileStore((state) => state.metadata);
  const clearFile = useFileStore((state) => state.clearFile);

  const { uploadFile, isUploading, error } = useFileUpload({
    onSuccess: () => {
      toast.success('File uploaded successfully!');
      navigate('/preview');
    },
  });

  const { isDragActive, dragProps } = useDragDrop({
    onFileDrop: uploadFile,
    disabled: isUploading,
  });

  const handleFileSelect = useCallback((file: File) => {
    // Clear existing file before uploading new one (replace behavior)
    if (metadata) {
      clearFile();
    }
    uploadFile(file);
  }, [uploadFile, metadata, clearFile]);

  // Show error toast if upload fails
  if (error) {
    toast.error(error);
  }

  return (
    <div className="p-6" {...dragProps}>
      <UploadZone
        onFileSelect={handleFileSelect}
        isLoading={isUploading}
        isDragActive={isDragActive}
      />
      {metadata && (
        <div className="mt-4 text-center text-sm text-slate-500">
          <p>Current file: <span className="font-medium text-slate-700">{metadata.fileName}</span></p>
          <p className="text-xs mt-1">Uploading a new file will replace the current one.</p>
        </div>
      )}
    </div>
  );
}
