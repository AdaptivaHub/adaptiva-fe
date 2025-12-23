import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, CircleAlert, CircleCheck, X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { cn } from './ui/utils';
import type { UploadedFile } from '../types';

interface UploadZoneProps {
  onFileUpload: (file: UploadedFile) => void;
}

export function UploadZone({ onFileUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);
      setUploadedFileName(file.name);

      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
        setError('Invalid file type. Please upload a CSV or Excel file.');
        setIsUploading(false);
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        setIsUploading(false);
        return;
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        // TODO: Replace with actual API call to your backend
        // const formData = new FormData();
        // formData.append('file', file);
        // const response = await fetch('/api/upload', {
        //   method: 'POST',
        //   body: formData,
        // });
        // const data = await response.json();

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock data for demo with intentional quality issues
        const mockHeaders = ['ID', 'Name', 'Email', 'Sales', 'Region', 'Date'];
        const mockData = Array.from({ length: 150 }, (_, i) => ({
          ID: i + 1,
          Name: i % 10 === 0 ? null : `Customer ${i + 1}`, // 10% missing names
          Email: i % 15 === 0 ? '' : `customer${i + 1}@example.com`, // Some missing emails
          Sales: i % 8 === 0 ? null : Math.floor(Math.random() * 10000) + 1000, // Some missing sales
          Region: ['North', 'South', 'East', 'West', null][Math.floor(Math.random() * 5)], // Some null regions
          Date: i % 12 === 0 ? null : new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        }));

        clearInterval(progressInterval);
        setUploadProgress(100);

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const uploadedFile: UploadedFile = {
          fileId: `file_${Date.now()}`,
          fileName: file.name,
          sheets: file.name.endsWith('.xlsx') ? ['Sheet1', 'Sales Data', 'Summary'] : [],
          activeSheet: file.name.endsWith('.xlsx') ? 'Sheet1' : undefined,
          headers: mockHeaders,
          data: mockData,
          rowCount: mockData.length,
          uploadedAt: new Date(),
        };

        onFileUpload(uploadedFile);
      } catch (err) {
        clearInterval(progressInterval);
        setError(err instanceof Error ? err.message : 'Failed to upload file');
        setIsUploading(false);
      }
    },
    [onFileUpload]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleClearError = () => {
    setError(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadedFileName(null);
  };

  return (
    <div className="space-y-4" id="upload-zone">
      {/* Upload Card */}
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-200 upload-pulse',
          isDragging && 'ring-2 ring-indigo-500 ring-offset-2',
          isUploading && 'pointer-events-none'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-12">
          {!isUploading ? (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Drop your file here
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                or click to browse from your computer
              </p>

              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
              />
              <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </label>
              </Button>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Supported formats</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FileSpreadsheet className="w-4 h-4" />
                    XLSX
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Max file size: 10MB</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
                {uploadProgress === 100 ? (
                  <CircleCheck className="w-8 h-8 text-green-600" />
                ) : (
                  <Upload className="w-8 h-8 text-indigo-600 animate-pulse" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {uploadProgress === 100 ? 'Upload Complete!' : 'Uploading...'}
              </h3>
              <p className="text-sm text-slate-500 mb-6">{uploadedFileName}</p>
              <div className="max-w-md mx-auto">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-slate-500 mt-2">{uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-indigo-50/80 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-indigo-400">
            <div className="text-center">
              <Upload className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-indigo-600">Drop file to upload</p>
            </div>
          </div>
        )}
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <CircleAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 text-sm">Upload Failed</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearError}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Sample Datasets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-dashed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-slate-900">Sales Data</p>
              <p className="text-xs text-slate-500">Sample dataset</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-dashed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-slate-900">Customer List</p>
              <p className="text-xs text-slate-500">Sample dataset</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-dashed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-slate-900">Inventory</p>
              <p className="text-xs text-slate-500">Sample dataset</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}