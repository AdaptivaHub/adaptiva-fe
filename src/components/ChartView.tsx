import React from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import './ChartView.css';

interface ChartViewProps {
  chartData: Record<string, unknown>;
}

export const ChartView: React.FC<ChartViewProps> = ({ chartData }) => {
  if (!chartData) {
    return null;
  }

  const plotData = (chartData.data || []) as Data[];
  const plotLayout = (chartData.layout || {}) as Partial<Layout>;

  return (
    <div className="chart-container">
      <h3>Chart Visualization</h3>
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
    </div>
  );
};
