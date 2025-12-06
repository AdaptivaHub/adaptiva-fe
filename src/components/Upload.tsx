import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
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
      // Upload to backend first to get fileId
      const uploadResponse = await api.uploadFile(file);
      let fileId: string | undefined;
      
      if (uploadResponse.success && uploadResponse.data) {
        fileId = uploadResponse.data.file_id;
      } else {
        // If backend upload fails, continue with local parsing only
        console.warn('Backend upload failed, continuing with local parsing only:', uploadResponse.error);
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;

          // Use 'array' type for all files
          const workbook = XLSX.read(data, { type: 'array' });

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length === 0) {
            setError('The file appears to be empty');
            setIsUploading(false);
            return;
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1);

          const formattedData = rows.map((row: unknown[]) => {
            const rowData: Record<string, string | number | null> = {};
            headers.forEach((header, index) => {
              const value = row[index];
              rowData[header] = value === undefined ? null : (value as string | number);
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
          setError('Error parsing file. Please ensure it\'s a valid CSV or XLSX file.');
          console.error('File parsing error:', err);
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setError('Error reading file');
        setIsUploading(false);
      };

      // Use readAsArrayBuffer for all files
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('Error uploading file. Please try again.');
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
