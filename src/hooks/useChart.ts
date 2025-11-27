import { useState } from 'react';
import { api } from '../utils/api';
import type { AIChartResponse } from '../types';

export interface ChartResult {
  chartJson: Record<string, unknown>;
  generatedCode: string;
  explanation: string;
}

export const useChart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChart = async (fileId: string, userInstructions?: string): Promise<ChartResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateAIChart(fileId, userInstructions);
      if (!response.success || !response.data) {
        setError(response.error || 'Failed to generate chart');
        return null;
      }
      
      const aiResponse = response.data as AIChartResponse;
      return {
        chartJson: aiResponse.chart_json,
        generatedCode: aiResponse.generated_code,
        explanation: aiResponse.explanation,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate chart';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateChart, loading, error };
};
