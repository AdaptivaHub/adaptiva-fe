/**
 * ChartView - Displays a rendered chart with the ChartEditor
 * 
 * Uses the unified chart architecture:
 * - ChartSpec is the canonical configuration
 * - AI suggestions populate the ChartEditor
 * - Rendering is done via /api/charts/render
 */
import React from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { ChartEditor } from './ChartEditor';
import type { ChartSpec } from '../types';
import './ChartView.css';

interface ChartViewProps {
  /** Plotly chart data (from render endpoint) */
  chartData: Record<string, unknown> | null;
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
  /** Called when user wants to render */
  onRenderChart: () => void;
  /** Called when user wants AI suggestion */
  onAISuggest?: () => void;
  /** Whether chart is being rendered */
  isRendering?: boolean;
  /** Whether AI suggestion is loading */
  isSuggesting?: boolean;
  /** AI explanation (shown after suggestion) */
  explanation?: string;
  /** AI confidence score */
  confidence?: number;
}

export const ChartView: React.FC<ChartViewProps> = ({ 
  chartData, 
  spec,
  columns,
  fileId,
  sheetName,
  onSpecChange,
  onRenderChart,
  onAISuggest,
  isRendering = false,
  isSuggesting = false,
  explanation,
  confidence,
}) => {
  const plotData = chartData ? (chartData.data || []) as Data[] : [];
  const plotLayout = chartData ? (chartData.layout || {}) as Partial<Layout> : {};

  return (
    <div className="chart-container">
      <h3>Chart Visualization</h3>
      
      <ChartEditor
        spec={spec}
        columns={columns}
        fileId={fileId}
        sheetName={sheetName}
        onSpecChange={onSpecChange}
        onRenderChart={onRenderChart}
        onAISuggest={onAISuggest}
        disabled={isRendering}
        suggesting={isSuggesting}
        explanation={explanation}
        confidence={confidence}
      />
      
      {chartData ? (
        <div className="chart-wrapper">
          <Plot
            data={plotData}
            layout={{
              ...plotLayout,
              autosize: true,
              margin: { l: 50, r: 50, t: 50, b: 50 },
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
            }}
          />
        </div>
      ) : (
        <div className="chart-placeholder">
          <div className="chart-placeholder-content">
            <span className="chart-placeholder-icon">📊</span>
            <p>Configure your chart settings above and click <strong>Render Chart</strong></p>
            {onAISuggest && (
              <p className="chart-placeholder-hint">
                Or try <strong>✨ AI Suggest</strong> to get an automatic recommendation
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


