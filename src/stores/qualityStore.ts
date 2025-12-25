/**
 * Quality Store - Zustand store for data quality state management
 */

import { create } from 'zustand';

export interface DataQualityIssue {
  type: 'missing' | 'duplicates' | 'formatting' | 'outliers';
  count: number;
  severity: 'high' | 'medium' | 'low';
}

export interface ColumnIssue {
  column: string;
  issues: {
    type: 'missing' | 'duplicates' | 'formatting' | 'outliers';
    count: number;
    percentage: number;
  }[];
}

export interface DataQualityReport {
  qualityScore: number;
  totalRows: number;
  cleanRows: number;
  issues: DataQualityIssue[];
  columnIssues: ColumnIssue[];
}

interface QualityState {
  report: DataQualityReport | null;
  isAnalyzing: boolean;
  isDismissed: boolean;
  error: string | null;

  // Actions
  setReport: (report: DataQualityReport | null) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setDismissed: (dismissed: boolean) => void;
  setError: (error: string | null) => void;
  clearReport: () => void;
}

export const useQualityStore = create<QualityState>((set) => ({
  report: null,
  isAnalyzing: false,
  isDismissed: false,
  error: null,

  setReport: (report) =>
    set({ report, isAnalyzing: false, isDismissed: false }),

  setAnalyzing: (analyzing) =>
    set({ isAnalyzing: analyzing, error: null }),

  setDismissed: (dismissed) =>
    set({ isDismissed: dismissed }),

  setError: (error) =>
    set({ error, isAnalyzing: false }),

  clearReport: () =>
    set({ report: null, isAnalyzing: false, isDismissed: false, error: null }),
}));

// Selector hooks
export const useQualityReport = () => useQualityStore((state) => state.report);
export const useIsAnalyzingQuality = () => useQualityStore((state) => state.isAnalyzing);
export const useQualityDismissed = () => useQualityStore((state) => state.isDismissed);


