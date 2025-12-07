import React, { useRef, useState } from 'react';
import { api } from '../utils/api';
import type { UploadedData } from '../types';
import './Upload.css';

interface UploadProps {
  onDataLoaded: (data: UploadedData) => void;
}

export const Upload: React.FC<UploadProps> = ({ onDataLoaded }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError('');
    setFileName(file.name);
    setIsUploading(true);

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit');
      setIsUploading(false);
      return;
    }

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      setError('Please upload a CSV or XLSX file');
      setIsUploading(false);
      return;
    }

    try {
      // Step 1: Upload file to backend
      const uploadResponse = await api.uploadFile(file);
      
      if (!uploadResponse.success || !uploadResponse.data) {
        setError(uploadResponse.error || 'Failed to upload file. Please try again.');
        setIsUploading(false);
        return;
      }

      const fileId = uploadResponse.data.file_id;

      // Step 2: Get formatted preview from backend
      const previewResponse = await api.getFormattedPreview(fileId, 1000);
      
      if (!previewResponse.success || !previewResponse.data) {
        setError(previewResponse.error || 'Failed to process file. Please try again.');
        setIsUploading(false);
        return;
      }

      const { headers, data } = previewResponse.data;
      
      // Convert string values to DataRow format
      const formattedData = data.map(row => {
        const rowData: Record<string, string | number | null> = {};
        headers.forEach(header => {
          rowData[header] = row[header] ?? null;
        });
        return rowData;
      });

      onDataLoaded({
        data: formattedData,
        headers: headers,
        fileId: fileId,
      });
      
      setIsUploading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Error uploading file: ${errorMessage}`);
      console.error('Upload error:', err);
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-container">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        <div className="upload-content">
          {isUploading ? (
            <>
              <div className="upload-spinner"></div>
              <p className="upload-text">Uploading and processing your file...</p>
              {fileName && <p className="file-name">{fileName}</p>}
            </>
          ) : (
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
              <button type="button" className="upload-button" onClick={handleButtonClick}>
                Browse Files
              </button>
              {fileName && <p className="file-name">Selected: {fileName}</p>}
            </>
          )}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};
