import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, CircleAlert, CircleCheck, X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { cn } from './ui/utils';

// Generic sample dataset definition (no business logic)
export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
}

export interface UploadZoneProps {
  /** Called when a file is selected (app layer handles upload) */
  onFileSelect?: (file: File) => void;
  /** External loading/uploading state */
  isLoading?: boolean;
  /** Upload progress (0-100) */
  uploadProgress?: number;
  /** Current file name being uploaded */
  uploadingFileName?: string;
  /** Error message to display */
  error?: string | null;
  /** Called when error is dismissed */
  onErrorDismiss?: () => void;
  /** External drag active state */
  isDragActive?: boolean;
  /** Sample datasets to show (optional) */
  sampleDatasets?: SampleDataset[];
  /** Called when a sample dataset is selected */
  onSampleSelect?: (dataset: SampleDataset) => void;
  /** Accepted file types */
  acceptedTypes?: string;
  /** Max file size in bytes */
  maxFileSize?: number;
  /** Max file size display text */
  maxFileSizeText?: string;
}

const colorSchemes = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  purple: { bg: 'bg-brand-100', text: 'text-brand-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
};

export function UploadZone({ 
  onFileSelect, 
  isLoading = false,
  uploadProgress = 0,
  uploadingFileName,
  error,
  onErrorDismiss,
  isDragActive: externalDragActive,
  sampleDatasets = [],
  onSampleSelect,
  acceptedTypes = '.csv,.xlsx,.xls',
  maxFileSizeText = 'Max file size: 10MB',
}: UploadZoneProps) {  // Internal drag state (can be overridden by external)
  const [isDragging, setIsDragging] = useState(false);
  const isDragActiveState = externalDragActive ?? isDragging;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && onFileSelect) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && onFileSelect) {
        onFileSelect(files[0]);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [onFileSelect]
  );

  const isComplete = uploadProgress === 100;

  return (
    <div className="space-y-4" id="upload-zone">
      {/* Upload Card */}
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-200 upload-pulse',
          isDragActiveState && 'ring-2 ring-brand-500 ring-offset-2',
          isLoading && 'pointer-events-none'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-12">
          {!isLoading ? (            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Drop your file here
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                or click to browse from your computer
              </p>              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept={acceptedTypes}
                onChange={handleFileSelect}
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Choose File
              </label>

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
                <p className="text-xs text-slate-400 mt-2">{maxFileSizeText}</p>
              </div>
            </div>
          ) : (            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center mb-4">
                {isComplete ? (
                  <CircleCheck className="w-8 h-8 text-green-600" />
                ) : (
                  <Upload className="w-8 h-8 text-brand-600 animate-pulse" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {isComplete ? 'Upload Complete!' : 'Uploading...'}
              </h3>
              {uploadingFileName && (
                <p className="text-sm text-slate-500 mb-6">{uploadingFileName}</p>
              )}
              <div className="max-w-md mx-auto">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-slate-500 mt-2">{uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Drag overlay */}        {isDragActiveState && (
          <div className="absolute inset-0 bg-brand-50/80 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-brand-400">
            <div className="text-center">
              <Upload className="w-12 h-12 text-brand-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-brand-600">Drop file to upload</p>
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
            {onErrorDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onErrorDismiss}
                className="text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Sample Datasets */}
      {sampleDatasets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleDatasets.map((dataset) => {
            const colors = colorSchemes[dataset.colorScheme] || colorSchemes.blue;
            return (
              <Card 
                key={dataset.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer border-dashed"
                onClick={() => onSampleSelect?.(dataset)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.bg)}>
                    <FileSpreadsheet className={cn('w-5 h-5', colors.text)} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">{dataset.name}</p>
                    <p className="text-xs text-slate-500">{dataset.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


