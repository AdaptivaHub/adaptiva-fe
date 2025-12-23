import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
}

interface DataValidationWarningProps {
  issues: ValidationIssue[];
}

export function DataValidationWarning({ issues }: DataValidationWarningProps) {
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');

  return (
    <div className="space-y-2">
      {/* Errors */}
      {errors.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-red-900 text-sm mb-2">
                Cannot Train Model
              </h4>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-yellow-900 text-sm mb-2">
                Data Quality Warnings
              </h4>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>{warning.message}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-yellow-600 mt-2">
                You can still train the model, but results may be less accurate
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
