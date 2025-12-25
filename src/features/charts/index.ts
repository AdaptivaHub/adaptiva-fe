/**
 * Charts Feature - Public API
 * 
 * This is the main entry point for the charts feature.
 * Import from '@features/charts' instead of deep imports.
 */

// Hooks
export { useChartActions, type UseChartActionsReturn } from './hooks/useChartActions';

// Components
export { ChartGallery } from './components/ChartGallery';
export { ChartCreator } from './components/ChartCreator';
export { ChartCard } from './components/ChartCard';
export { ChartPreview } from './components/ChartPreview';
export { ChartSuggestions } from './components/ChartSuggestions';
export { ChartTypeSelector } from './components/ChartTypeSelector';
export { PlotlyChartRenderer, createPlotlyJson } from './components/PlotlyChartRenderer';
export { ChartEditor } from './components/ChartEditor';
export { ChartView } from './components/ChartView';

// Types
export type { ChartConfig, ChartCreationConfig, ChartType } from './components/ChartCreator';
export type { PlotlyJson } from './components/PlotlyChartRenderer';
