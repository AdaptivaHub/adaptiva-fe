import { useState, useCallback } from 'react';
import { api } from '../utils/api';
import type {
  ForecastableColumnsResponse,
  ForecastResponse,
  MarketingStrategyResponse,
  ContentGenerationResponse,
  AgentPipelineResponse,
  UsageStatsResponse,
} from '../types';

interface UseAgentsReturn {
  // Forecast
  forecastableColumns: ForecastableColumnsResponse | null;
  forecast: ForecastResponse | null;
  getForecastableColumns: (fileId: string) => Promise<ForecastableColumnsResponse | null>;
  generateForecast: (
    fileId: string,
    dateColumn?: string,
    targetColumn?: string,
    periods?: number
  ) => Promise<ForecastResponse | null>;

  // Marketing
  marketingStrategy: MarketingStrategyResponse | null;
  generateMarketingStrategy: (
    fileId: string,
    options?: {
      businessName?: string;
      businessType?: string;
      targetAudience?: string;
      forecastTrend?: string;
    }
  ) => Promise<MarketingStrategyResponse | null>;

  // Content
  adContent: ContentGenerationResponse | null;
  generateAdContent: (
    campaignName: string,
    campaignTheme: string,
    targetAudience: string,
    tactics: string[],
    options?: {
      platform?: string;
      tone?: string;
      includeImage?: boolean;
    }
  ) => Promise<ContentGenerationResponse | null>;

  // Pipeline
  pipelineResult: AgentPipelineResponse | null;
  runPipeline: (
    fileId: string,
    options?: {
      businessName?: string;
      businessType?: string;
      targetAudience?: string;
      runForecast?: boolean;
      runMarketing?: boolean;
      runContent?: boolean;
      forecastPeriods?: number;
    }
  ) => Promise<AgentPipelineResponse | null>;

  // Usage Stats
  usageStats: UsageStatsResponse | null;
  getUsageStats: () => Promise<UsageStatsResponse | null>;

  // State
  loading: boolean;
  error: string | null;
  clearError: () => void;
  clearResults: () => void;
}

export function useAgents(): UseAgentsReturn {
  const [forecastableColumns, setForecastableColumns] = useState<ForecastableColumnsResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [marketingStrategy, setMarketingStrategy] = useState<MarketingStrategyResponse | null>(null);
  const [adContent, setAdContent] = useState<ContentGenerationResponse | null>(null);
  const [pipelineResult, setPipelineResult] = useState<AgentPipelineResponse | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  
  const clearResults = useCallback(() => {
    setForecastableColumns(null);
    setForecast(null);
    setMarketingStrategy(null);
    setAdContent(null);
    setPipelineResult(null);
    setUsageStats(null);
    setError(null);
  }, []);

  const getForecastableColumns = useCallback(async (fileId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getForecastableColumns(fileId);
      if (result.success && result.data) {
        setForecastableColumns(result.data);
        return result.data;
      } else {
        setError(result.error || 'Failed to get forecastable columns');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateForecast = useCallback(async (
    fileId: string,
    dateColumn?: string,
    targetColumn?: string,
    periods: number = 30
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.generateForecast(fileId, dateColumn, targetColumn, periods);
      if (result.success && result.data) {
        setForecast(result.data);
        return result.data;
      } else {
        setError(result.error || 'Failed to generate forecast');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateMarketingStrategy = useCallback(async (
    fileId: string,
    options?: {
      businessName?: string;
      businessType?: string;
      targetAudience?: string;
      forecastTrend?: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.generateMarketingStrategy(fileId, options);
      if (result.success && result.data) {
        setMarketingStrategy(result.data);
        return result.data;
      } else {
        setError(result.error || 'Failed to generate marketing strategy');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateAdContent = useCallback(async (
    campaignName: string,
    campaignTheme: string,
    targetAudience: string,
    tactics: string[],
    options?: {
      platform?: string;
      tone?: string;
      includeImage?: boolean;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.generateAdContent(
        campaignName,
        campaignTheme,
        targetAudience,
        tactics,
        options
      );
      if (result.success && result.data) {
        setAdContent(result.data);
        return result.data;
      } else {
        setError(result.error || 'Failed to generate ad content');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const runPipeline = useCallback(async (
    fileId: string,
    options?: {
      businessName?: string;
      businessType?: string;
      targetAudience?: string;
      runForecast?: boolean;
      runMarketing?: boolean;
      runContent?: boolean;
      forecastPeriods?: number;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.runAgentPipeline(fileId, options);
      if (result.success && result.data) {
        setPipelineResult(result.data);
        return result.data;
      } else {
        setError(result.error || 'Failed to run agent pipeline');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsageStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getUsageStats();
      if (result.success && result.data) {
        setUsageStats(result.data);
        return result.data;
      } else {
        setError(result.error || 'Failed to get usage stats');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    forecastableColumns,
    forecast,
    marketingStrategy,
    adContent,
    pipelineResult,
    usageStats,
    getForecastableColumns,
    generateForecast,
    generateMarketingStrategy,
    generateAdContent,
    runPipeline,
    getUsageStats,
    loading,
    error,
    clearError,
    clearResults,
  };
}
