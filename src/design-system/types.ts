// Types that design system components expect
// These bridge the design system with the main app types

// Re-export data quality types from the canonical source
export type { DataQualityIssue, ColumnIssue, DataQualityReport } from './utils/dataQuality';

// Re-export chart types from the canonical sources
export type { ChartConfig, PlotlyJson } from './components/charts/ChartCreator';
export type { ChartType } from './components/charts/ChartTypeSelector';

/**
 * File info for layout/navigation components (minimal)
 */
export interface UploadedFile {
  fileName: string;
  rowCount: number;
  columnCount?: number;
  sheets?: string[];
  activeSheet?: string;
  // These are optional - components that need them will have them passed separately
  headers?: string[];
  data?: Record<string, unknown>[];
}

export interface TrainedModel {
  id: string;
  name: string;
  type: 'linear-regression' | 'decision-tree';
  targetVariable: string;
  features: string[];
  metrics: {
    r2?: number;
    mae?: number;
    rmse?: number;
    accuracy?: number;
    crossValScores?: number[];
  };
  coefficients?: Record<string, number>;
  featureImportance?: Record<string, number>;
  trainedAt: Date;
  dataPoints: number;
  testSize: number;
}
