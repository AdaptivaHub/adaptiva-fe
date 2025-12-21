import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { ChartEditor } from './ChartEditor';
import type { ChartSettings } from '../types';
import './ChartView.css';

interface ChartViewProps {
  chartData: Record<string, unknown>;
  explanation?: string;
  generatedCode?: string;
  chartSettings?: ChartSettings | null;
  columns: string[];
  onUpdateChart: (settings: ChartSettings) => void;
  isUpdating?: boolean;
}

export const ChartView: React.FC<ChartViewProps> = ({ 
  chartData, 
  explanation, 
  generatedCode,
  chartSettings,
  columns,
  onUpdateChart,
  isUpdating = false,
}) => {
  const [showCode, setShowCode] = useState(false);
  const [localSettings, setLocalSettings] = useState<ChartSettings>(
    chartSettings || {}
  );

  // Update local settings when chartSettings prop changes
  React.useEffect(() => {
    if (chartSettings) {
      setLocalSettings(chartSettings);
    }
  }, [chartSettings]);

  if (!chartData) {
    return null;
  }

  const plotData = (chartData.data || []) as Data[];
  const plotLayout = (chartData.layout || {}) as Partial<Layout>;

  const handleUpdateChart = () => {
    onUpdateChart(localSettings);
  };

  return (
    <div className="chart-container">
      <h3>AI-Generated Chart</h3>
      
      {explanation && (
        <div className="chart-explanation">
          <p>{explanation}</p>
        </div>
      )}

      <ChartEditor
        settings={localSettings}
        columns={columns}
        onSettingsChange={setLocalSettings}
        onUpdateChart={handleUpdateChart}
        disabled={isUpdating}
      />
      
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
