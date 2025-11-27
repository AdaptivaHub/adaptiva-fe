import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import './ChartView.css';

interface ChartViewProps {
  chartData: Record<string, unknown>;
  explanation?: string;
  generatedCode?: string;
}

export const ChartView: React.FC<ChartViewProps> = ({ chartData, explanation, generatedCode }) => {
  const [showCode, setShowCode] = useState(false);

  if (!chartData) {
    return null;
  }

  const plotData = (chartData.data || []) as Data[];
  const plotLayout = (chartData.layout || {}) as Partial<Layout>;

  return (
    <div className="chart-container">
      <h3>AI-Generated Chart</h3>
      
      {explanation && (
        <div className="chart-explanation">
          <p>{explanation}</p>
        </div>
      )}
      
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
      
      {generatedCode && (
        <div className="chart-code-section">
          <button 
            className="toggle-code-btn"
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? 'Hide Generated Code' : 'Show Generated Code'}
          </button>
          
          {showCode && (
            <pre className="generated-code">
              <code>{generatedCode}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
