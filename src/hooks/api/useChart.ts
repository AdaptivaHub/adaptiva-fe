/**
 * useChart Hook - Handles chart generation (AI and manual)
 */

import { useState } from 'react';
import { chartService } from '@/services';
import type { AIChartResponse, ChartSettings } from '@/types';

export interface ChartResult {
  chartJson: Record<string, unknown>;
  generatedCode: string;
  explanation: string;
  chartSettings?: ChartSettings | null;
}

export function useChart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChart = async (
    fileId: string,
    userInstructions?: string,
    sheetName?: string
  ): Promise<ChartResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chartService.generateAI(fileId, userInstructions, sheetName);
      
      if (!response.success || !response.data) {
        setError(response.error || 'Failed to generate chart');
        return null;
      }

      const aiResponse = response.data as AIChartResponse;
      return {
        chartJson: aiResponse.chart_json,
        generatedCode: aiResponse.generated_code,
        explanation: aiResponse.explanation,
        chartSettings: aiResponse.chart_settings,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate chart';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateManualChart = async (
    fileId: string,
    settings: ChartSettings,
    sheetName?: string
  ): Promise<ChartResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chartService.generateManual(fileId, settings, sheetName);
      
      if (!response.success || !response.data) {
        setError(response.error || 'Failed to generate chart');
        return null;
      }

      return {
        chartJson: response.data.chart_json,
        generatedCode: '',
        explanation: response.data.message,
        chartSettings: settings,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate chart';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,
    generateChart,
    generateManualChart,
    clearError,
  };
}
