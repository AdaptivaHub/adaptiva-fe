/**
 * Stores Index - Re-export all stores
 */

export { useAuthStore, useAuth } from './authStore';
export { useFileStore, useFileMetadata, useFileData, useHasFile } from './fileStore';
export { 
  useChartStore, 
  useCharts, 
  useChartViewMode, 
  useIsCreatingChart, 
  useEditingChart,
  type ChartConfig 
} from './chartStore';
export { 
  usePredictionStore, 
  useModels, 
  useIsCreatingModel, 
  useIsTrainingModel,
} from './predictionStore';
export { 
  useQualityStore, 
  useQualityReport, 
  useIsAnalyzingQuality, 
  useQualityDismissed,
  type DataQualityReport,
  type DataQualityIssue,
  type ColumnIssue 
} from './qualityStore';


