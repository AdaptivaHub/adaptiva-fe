import React from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useDragDrop } from '../hooks/useDragDrop';
import type { UploadedData } from '../types';
import './Upload.css';

interface UploadProps {
  onDataLoaded: (data: UploadedData) => void;
}

export const Upload: React.FC<UploadProps> = ({ onDataLoaded }) => {
  const {
    fileName,
    error,
    isUploading,
    fileInputRef,
    uploadFile,
    openFilePicker,
  } = useFileUpload({ onSuccess: onDataLoaded });

  const { isDragActive, dragProps } = useDragDrop({
    onFileDrop: uploadFile,
    disabled: isUploading,
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="upload-container">
      <div
        className={`upload-area ${isDragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
        {...dragProps}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        <div className="upload-content">
          {isUploading ? (
            <UploadingState fileName={fileName} />
          ) : (
            <IdleState fileName={fileName} onBrowse={openFilePicker} />
          )}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

// Sub-components for cleaner JSX
const UploadingState: React.FC<{ fileName: string }> = ({ fileName }) => (
  <>
    <div className="upload-spinner"></div>
    <p className="upload-text">Uploading and processing your file...</p>
    {fileName && <p className="file-name">{fileName}</p>}
  </>
);

const IdleState: React.FC<{ fileName: string; onBrowse: () => void }> = ({ fileName, onBrowse }) => (
  <>
    <svg
      className="upload-icon"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
    <p className="upload-text">Drag and drop your CSV or XLSX file here</p>
    <p className="upload-text-secondary">or</p>
    <button type="button" className="upload-button" onClick={onBrowse}>
      Browse Files
    </button>
    {fileName && <p className="file-name">Selected: {fileName}</p>}
  </>
);


