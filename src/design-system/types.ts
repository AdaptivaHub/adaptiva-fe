// Types that design system components expect
// These bridge the design system with the main app types

// Re-export data quality types from the canonical source
export type { DataQualityIssue, ColumnIssue, DataQualityReport } from './utils/dataQuality';

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

export interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar';
  xAxis: string;
  yAxis?: string;
  color?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  createdAt: Date;
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
