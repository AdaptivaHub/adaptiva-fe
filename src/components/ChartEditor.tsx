import React from 'react';
import type { ChartSettings } from '../types';
import './ChartEditor.css';

interface ChartEditorProps {
  settings: ChartSettings;
  columns: string[];
  onSettingsChange: (settings: ChartSettings) => void;
  onUpdateChart: () => void;
  disabled?: boolean;
}

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'histogram', label: 'Histogram' },
  { value: 'box', label: 'Box Plot' },
  { value: 'pie', label: 'Pie Chart' },
];

const AGGREGATIONS = [
  { value: '', label: 'None' },
  { value: 'sum', label: 'Sum' },
  { value: 'mean', label: 'Mean' },
  { value: 'count', label: 'Count' },
  { value: 'median', label: 'Median' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
];

export const ChartEditor: React.FC<ChartEditorProps> = ({
  settings,
  columns,
  onSettingsChange,
  onUpdateChart,
  disabled = false,
}) => {
  const handleChange = (field: keyof ChartSettings, value: string | null) => {
    onSettingsChange({
      ...settings,
      [field]: value || null,
    });
  };

  const requiresYColumn = !['histogram', 'pie'].includes(settings.chart_type || '');

  return (
    <div className="chart-editor">
      <h4 className="chart-editor-title">Chart Settings</h4>
      
      <div className="chart-editor-grid">
        <div className="chart-editor-field">
          <label htmlFor="chart-type">Chart Type</label>
          <select
            id="chart-type"
            value={settings.chart_type || 'bar'}
            onChange={(e) => handleChange('chart_type', e.target.value)}
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
            value={settings.x_column || ''}
            onChange={(e) => handleChange('x_column', e.target.value)}
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
            {!requiresYColumn && <span className="optional-label"> (optional)</span>}
          </label>
          <select
            id="y-column"
            value={settings.y_column || ''}
            onChange={(e) => handleChange('y_column', e.target.value)}
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
          <label htmlFor="color-column">
            Color By <span className="optional-label">(optional)</span>
          </label>
          <select
            id="color-column"
            value={settings.color_column || ''}
            onChange={(e) => handleChange('color_column', e.target.value)}
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
            value={settings.aggregation || ''}
            onChange={(e) => handleChange('aggregation', e.target.value)}
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
          <label htmlFor="chart-title">Chart Title</label>
          <input
            id="chart-title"
            type="text"
            value={settings.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter chart title..."
            disabled={disabled}
          />
        </div>
      </div>

      <div className="chart-editor-actions">
        <button
          className="update-chart-btn"
          onClick={onUpdateChart}
          disabled={disabled || !settings.x_column}
        >
          Update Chart
        </button>
      </div>
    </div>
  );
};
