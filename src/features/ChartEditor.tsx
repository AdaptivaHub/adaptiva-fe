/**
 * ChartEditor - Unified chart configuration editor
 * 
 * Works with ChartSpec for both AI suggestions and manual configuration.
 * AI suggestions auto-fill this editor; users can modify before rendering.
 */
import React, { useCallback } from 'react';
import type { 
  ChartSpec, 
  ChartType, 
  AggregationMethod,
  ColorPalette,
} from '../types';
import { createDefaultChartSpec } from '../types/chartSpec';
import './ChartEditor.css';

interface ChartEditorProps {
  /** Current ChartSpec (from AI or manual editing) */
  spec: ChartSpec | null;
  /** Available columns from the data */
  columns: string[];
  /** File ID for the data source */
  fileId: string;
  /** Sheet name for Excel files */
  sheetName?: string;
  /** Called when spec changes */
  onSpecChange: (spec: ChartSpec) => void;
  /** Called when user wants to render the chart */
  onRenderChart: () => void;
  /** Called when user wants AI suggestion */
  onAISuggest?: () => void;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Whether AI suggestion is loading */
  suggesting?: boolean;
  /** AI explanation (shown after suggestion) */
  explanation?: string;
  /** AI confidence score */
  confidence?: number;
}

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'histogram', label: 'Histogram' },
  { value: 'box', label: 'Box Plot' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'heatmap', label: 'Heatmap' },
];

const AGGREGATIONS: { value: AggregationMethod; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sum', label: 'Sum' },
  { value: 'mean', label: 'Mean' },
  { value: 'count', label: 'Count' },
  { value: 'median', label: 'Median' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
];

const COLOR_PALETTES: { value: ColorPalette; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'monochrome', label: 'Monochrome' },
  { value: 'colorblind_safe', label: 'Colorblind Safe' },
];

export const ChartEditor: React.FC<ChartEditorProps> = ({
  spec,
  columns,
  fileId,
  sheetName,
  onSpecChange,
  onRenderChart,
  onAISuggest,
  disabled = false,
  suggesting = false,
  explanation,
  confidence,
}) => {
  // Ensure we always have a spec to work with
  const currentSpec = spec ?? createDefaultChartSpec(fileId, sheetName);

  const updateSpec = useCallback((updates: Partial<ChartSpec>) => {
    onSpecChange({ ...currentSpec, ...updates });
  }, [currentSpec, onSpecChange]);

  const handleChartTypeChange = useCallback((chartType: ChartType) => {
    updateSpec({ chart_type: chartType });
  }, [updateSpec]);

  const handleXAxisChange = useCallback((column: string) => {
    updateSpec({ 
      x_axis: { ...currentSpec.x_axis, column } 
    });
  }, [currentSpec.x_axis, updateSpec]);

  const handleYAxisChange = useCallback((column: string) => {
    if (column) {
      updateSpec({ 
        y_axis: { columns: [column], label: currentSpec.y_axis?.label } 
      });
    } else {
      updateSpec({ y_axis: undefined });
    }
  }, [currentSpec.y_axis?.label, updateSpec]);

  const handleGroupColumnChange = useCallback((column: string) => {
    if (column) {
      updateSpec({ 
        series: { ...currentSpec.series, group_column: column } 
      });
    } else {
      updateSpec({ series: undefined });
    }
  }, [currentSpec.series, updateSpec]);

  const handleAggregationChange = useCallback((method: AggregationMethod) => {
    updateSpec({ 
      aggregation: { method, group_by: currentSpec.aggregation?.group_by } 
    });
  }, [currentSpec.aggregation?.group_by, updateSpec]);

  const handleTitleChange = useCallback((title: string) => {
    updateSpec({ 
      visual: { ...currentSpec.visual, title, stacking: currentSpec.visual?.stacking ?? 'grouped', secondary_y_axis: currentSpec.visual?.secondary_y_axis ?? false } 
    });
  }, [currentSpec.visual, updateSpec]);

  const handleColorPaletteChange = useCallback((color_palette: ColorPalette) => {
    updateSpec({ 
      styling: { ...currentSpec.styling, color_palette, theme: currentSpec.styling?.theme ?? 'light', show_data_labels: currentSpec.styling?.show_data_labels ?? false } 
    });
  }, [currentSpec.styling, updateSpec]);

  // Check if Y-axis is required for current chart type
  const requiresYAxis = !['histogram', 'pie', 'box'].includes(currentSpec.chart_type);
  const canRender = currentSpec.x_axis.column && (!requiresYAxis || currentSpec.y_axis?.columns?.length);

  return (
    <div className="chart-editor">
      <div className="chart-editor-header">
        <h4 className="chart-editor-title">Chart Settings</h4>
        {onAISuggest && (
          <button
            className="ai-suggest-btn"
            onClick={onAISuggest}
            disabled={disabled || suggesting}
          >
            {suggesting ? '✨ Analyzing...' : '✨ AI Suggest'}
          </button>
        )}
      </div>

      {/* AI Explanation Banner */}
      {explanation && (
        <div className="ai-explanation-banner">
          <div className="ai-explanation-icon">💡</div>
          <div className="ai-explanation-content">
            <p>{explanation}</p>
            {confidence !== undefined && (
              <span className="ai-confidence">
                Confidence: {Math.round(confidence * 100)}%
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="chart-editor-grid">
        <div className="chart-editor-field">
          <label htmlFor="chart-type">Chart Type</label>
          <select
            id="chart-type"
            value={currentSpec.chart_type}
            onChange={(e) => handleChartTypeChange(e.target.value as ChartType)}
            disabled={disabled}
          >
            {CHART_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="chart-editor-field">
          <label htmlFor="x-column">X-Axis Column</label>
          <select
            id="x-column"
            value={currentSpec.x_axis.column}
            onChange={(e) => handleXAxisChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">Select column...</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        <div className="chart-editor-field">
          <label htmlFor="y-column">
            Y-Axis Column
            {!requiresYAxis && <span className="optional-label"> (optional)</span>}
          </label>
          <select
            id="y-column"
            value={currentSpec.y_axis?.columns?.[0] ?? ''}
            onChange={(e) => handleYAxisChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">Select column...</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        <div className="chart-editor-field">
          <label htmlFor="group-column">
            Group By <span className="optional-label">(optional)</span>
          </label>
          <select
            id="group-column"
            value={currentSpec.series?.group_column ?? ''}
            onChange={(e) => handleGroupColumnChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">None</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        <div className="chart-editor-field">
          <label htmlFor="aggregation">
            Aggregation <span className="optional-label">(optional)</span>
          </label>
          <select
            id="aggregation"
            value={currentSpec.aggregation?.method ?? 'none'}
            onChange={(e) => handleAggregationChange(e.target.value as AggregationMethod)}
            disabled={disabled}
          >
            {AGGREGATIONS.map((agg) => (
              <option key={agg.value} value={agg.value}>
                {agg.label}
              </option>
            ))}
          </select>
        </div>

        <div className="chart-editor-field">
          <label htmlFor="color-palette">Color Palette</label>
          <select
            id="color-palette"
            value={currentSpec.styling?.color_palette ?? 'default'}
            onChange={(e) => handleColorPaletteChange(e.target.value as ColorPalette)}
            disabled={disabled}
          >
            {COLOR_PALETTES.map((palette) => (
              <option key={palette.value} value={palette.value}>
                {palette.label}
              </option>
            ))}
          </select>
        </div>

        <div className="chart-editor-field chart-editor-field-full">
          <label htmlFor="chart-title">Chart Title</label>
          <input
            id="chart-title"
            type="text"
            value={currentSpec.visual?.title ?? ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter chart title..."
            disabled={disabled}
          />
        </div>
      </div>

      <div className="chart-editor-actions">
        <button
          className="render-chart-btn"
          onClick={onRenderChart}
          disabled={disabled || !canRender}
        >
          {disabled ? 'Rendering...' : 'Render Chart'}
        </button>
      </div>
    </div>
  );
};
