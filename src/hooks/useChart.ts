/**
 * useChart Hook - Unified Chart Generation
 * 
 * Provides chart suggestion (AI) and rendering functionality
 * using the new unified chart architecture.
 */
import { useState, useCallback } from 'react';
import { chartService } from '../services/chartService';
import type { 
  ChartSpec, 
  RateLimitInfo,
} from '../types';

export interface UseChartState {
  // Current chart spec (from AI or manual editing)
  spec: ChartSpec | null;
  
  // Rendered chart data
  chartJson: Record<string, unknown> | null;
  
  // AI suggestion metadata
  explanation: string;
  confidence: number;
  alternatives: { chart_type: string; reason: string }[];
  
  // Rate limiting
  rateLimit: RateLimitInfo | null;
  
  // Loading/error states
  loading: boolean;
  suggesting: boolean;
  error: string | null;
}

export interface UseChartActions {
  // Get AI suggestion (populates spec)
  suggest: (fileId: string, userInstructions?: string, sheetName?: string) => Promise<boolean>;
  
  // Render current spec
  render: (spec: ChartSpec) => Promise<boolean>;
  
  // Update spec manually
  updateSpec: (updates: Partial<ChartSpec>) => void;
  
  // Set full spec (e.g., from AI suggestion)
  setSpec: (spec: ChartSpec) => void;
  
  // Clear state
  reset: () => void;
  
  // Clear error
  clearError: () => void;
}

export type UseChartReturn = UseChartState & UseChartActions;

const initialState: UseChartState = {
  spec: null,
  chartJson: null,
  explanation: '',
  confidence: 0,
  alternatives: [],
  rateLimit: null,
  loading: false,
  suggesting: false,
  error: null,
};

export const useChart = (): UseChartReturn => {
  const [state, setState] = useState<UseChartState>(initialState);

  const suggest = useCallback(async (
    fileId: string,
    userInstructions?: string,
    sheetName?: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, suggesting: true, error: null }));
    
    try {
      const result = await chartService.suggest(fileId, userInstructions, sheetName);
      
      if (!result.success || !result.data) {
        setState(prev => ({
          ...prev,
          suggesting: false,
          error: result.error || 'Failed to get AI suggestion',
          rateLimit: result.data?.rateLimit ?? prev.rateLimit,
        }));
        return false;
      }
      
      const { response, rateLimit } = result.data;
      
      setState(prev => ({
        ...prev,
        spec: response.suggested_spec,
        explanation: response.explanation,
        confidence: response.confidence,
        alternatives: response.alternatives,
        rateLimit,
        suggesting: false,
        error: null,
      }));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI suggestion';
      setState(prev => ({ ...prev, suggesting: false, error: errorMessage }));
      return false;
    }
  }, []);

  const render = useCallback(async (spec: ChartSpec): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await chartService.render(spec);
      
      if (!result.success || !result.data) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to render chart',
        }));
        return false;
      }
      
      setState(prev => ({
        ...prev,
        chartJson: result.data!.chart_json,
        loading: false,
        error: null,
      }));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to render chart';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return false;
    }
  }, []);

  const updateSpec = useCallback((updates: Partial<ChartSpec>) => {
    setState(prev => {
      if (!prev.spec) return prev;
      return {
        ...prev,
        spec: { ...prev.spec, ...updates },
      };
    });
  }, []);

  const setSpec = useCallback((spec: ChartSpec) => {
    setState(prev => ({ ...prev, spec }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    suggest,
    render,
    updateSpec,
    setSpec,
    reset,
    clearError,
  };
};


