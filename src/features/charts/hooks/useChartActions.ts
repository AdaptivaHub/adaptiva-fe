/**
 * useChartActions - Centralized chart operations hook
 * 
 * Extracts all chart-related logic from ChartsPage into a reusable hook.
 * Handles CRUD operations, AI generation, and exports.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useFileStore, useChartStore } from '@/stores';
import { useChart } from '@/hooks/api';
import type { ChartCreationConfig, ChartConfig } from '../components/ChartCreator';
import type { PlotlyJson } from '../components/PlotlyChartRenderer';
import { toast } from 'sonner';

export interface UseChartActionsReturn {
  // Data
  headers: string[];
  data: Record<string, unknown>[];
  charts: ChartConfig[];
  hasFile: boolean;
  fileId: string | undefined;
  
  // UI State
  viewMode: 'grid' | 'list';
  isCreating: boolean;
  editingChart: ChartConfig | null;
  isGenerating: boolean;
  
  // View Mode
  onViewModeChange: (mode: 'grid' | 'list') => void;
  
  // Creator Controls
  onCreateClick: () => void;
  onCloseCreator: () => void;
  
  // Chart CRUD
  onChartCreated: (config: ChartCreationConfig, data: Record<string, unknown>[]) => void;
  onDeleteChart: (id: string) => void;
  onEditChart: (chart: ChartConfig) => void;
  onDuplicateChart: (chart: ChartConfig) => void;
  
  // AI Generation
  onAIGenerate: (prompt: string, config: ChartCreationConfig) => Promise<void>;
  
  // Export
  onExportChart: (chart: ChartConfig) => void;
  onExportAll: () => void;
  
  // Fullscreen
  onFullscreenChart: (chart: ChartConfig) => void;
}

export function useChartActions(): UseChartActionsReturn {
  // File store
  const metadata = useFileStore((state) => state.metadata);
  const fileData = useFileStore((state) => state.data);
  const headers = useFileStore((state) => state.headers);
  const hasFile = metadata !== null;

  // Chart store
  const charts = useChartStore((state) => state.charts);
  const viewMode = useChartStore((state) => state.viewMode);
  const isCreating = useChartStore((state) => state.isCreating);
  const editingChart = useChartStore((state) => state.editingChart);
  const addChart = useChartStore((state) => state.addChart);
  const deleteChart = useChartStore((state) => state.deleteChart);
  const setCreating = useChartStore((state) => state.setCreating);
  const setEditing = useChartStore((state) => state.setEditing);
  const setViewMode = useChartStore((state) => state.setViewMode);

  // AI chart hook
  const { 
    spec,
    chartJson,
    suggesting,
    loading,
    error,
    suggest,
    render,
    reset,
  } = useChart();

  const isGenerating = suggesting || loading;
  
  // Track the current AI prompt for chart creation
  const pendingPromptRef = useRef<string | null>(null);

  // Auto-render when spec changes (from AI suggestion)
  useEffect(() => {
    if (spec) {
      render(spec);
    }
  }, [spec, render]);

  // When chartJson is ready from AI, create the chart
  useEffect(() => {
    if (chartJson && pendingPromptRef.current !== null && !suggesting && !loading) {
      const prompt = pendingPromptRef.current;
      pendingPromptRef.current = null;
      
      // Safely convert chartJson to PlotlyJson
      const plotlyJson: PlotlyJson = {
        data: ((chartJson as { data?: unknown[] }).data || []) as PlotlyJson['data'],
        layout: (chartJson as { layout?: Record<string, unknown> }).layout,
        config: (chartJson as { config?: Record<string, unknown> }).config,
      };
      
      const newChart: ChartConfig = {
        id: crypto.randomUUID(),
        title: prompt.slice(0, 50) || 'AI Generated Chart',
        type: spec?.chart_type || 'bar',
        xAxis: spec?.x_axis?.column,
        yAxis: spec?.y_axis?.columns?.[0],
        data: fileData,
        prompt: prompt,
        createdAt: new Date(),
        plotlyJson: plotlyJson,
      };
      
      addChart(newChart);
      setCreating(false);
      reset();
      toast.success('AI chart generated successfully!');
    }
  }, [chartJson, suggesting, loading, spec, fileData, addChart, setCreating, reset]);

  // Handle manual chart creation
  const onChartCreated = useCallback((config: ChartCreationConfig, data: Record<string, unknown>[]) => {
    const newChart: ChartConfig = {
      id: crypto.randomUUID(),
      title: config.title,
      type: config.type,
      xAxis: config.xAxis,
      yAxis: config.yAxis,
      data: data,
      prompt: config.prompt,
      createdAt: new Date(),
      plotlyJson: null,
    };
    
    addChart(newChart);
    setCreating(false);
    toast.success('Chart created successfully!');
  }, [addChart, setCreating]);

  // Handle AI chart generation
  const onAIGenerate = useCallback(async (prompt: string, _config: ChartCreationConfig) => {
    if (!metadata?.fileId) {
      toast.error('No file loaded');
      return;
    }

    // Store the prompt for when the chart is ready
    pendingPromptRef.current = prompt;

    // Call AI suggest
    const suggestSuccess = await suggest(
      metadata.fileId,
      prompt,
      metadata.activeSheet
    );

    if (!suggestSuccess) {
      pendingPromptRef.current = null;
      toast.error(error || 'Failed to generate chart suggestion');
    }
  }, [metadata, suggest, error]);

  // Handle delete with confirmation
  const onDeleteChart = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this chart?')) {
      deleteChart(id);
      toast.success('Chart deleted');
    }
  }, [deleteChart]);

  // Handle edit
  const onEditChart = useCallback((chart: ChartConfig) => {
    setEditing(chart);
  }, [setEditing]);

  // Handle duplicate
  const onDuplicateChart = useCallback((chart: ChartConfig) => {
    const duplicated: ChartConfig = {
      ...chart,
      id: crypto.randomUUID(),
      title: `${chart.title} (Copy)`,
      createdAt: new Date(),
    };
    addChart(duplicated);
    toast.success('Chart duplicated');
  }, [addChart]);

  // Handle export single chart
  const onExportChart = useCallback((chart: ChartConfig) => {
    const blob = new Blob([JSON.stringify(chart, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chart.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chart exported');
  }, []);

  // Handle export all charts
  const onExportAll = useCallback(() => {
    const blob = new Blob([JSON.stringify(charts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_charts.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('All charts exported');
  }, [charts]);

  // Handle fullscreen
  const onFullscreenChart = useCallback((chart: ChartConfig) => {
    // TODO: Implement fullscreen modal
    toast.info(`Fullscreen view for "${chart.title}" - coming soon!`);
  }, []);

  // View mode change
  const onViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, [setViewMode]);

  // Creator controls
  const onCreateClick = useCallback(() => {
    setCreating(true);
  }, [setCreating]);

  const onCloseCreator = useCallback(() => {
    setCreating(false);
    setEditing(null);
  }, [setCreating, setEditing]);

  return {
    // Data
    headers,
    data: fileData,
    charts,
    hasFile,
    fileId: metadata?.fileId,
    
    // UI State
    viewMode,
    isCreating,
    editingChart,
    isGenerating,
    
    // Actions
    onViewModeChange,
    onCreateClick,
    onCloseCreator,
    onChartCreated,
    onDeleteChart,
    onEditChart,
    onDuplicateChart,
    onAIGenerate,
    onExportChart,
    onExportAll,
    onFullscreenChart,
  };
}
