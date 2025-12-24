/**
 * PlotlyChartRenderer - Renders charts using Plotly.js
 * 
 * Supports two modes:
 * 1. Pre-rendered JSON: Directly renders Plotly JSON from backend
 * 2. Config-based: Generates Plotly config from ChartConfig
 */
import Plot from 'react-plotly.js';
import type { Data, Layout, Config } from 'plotly.js';

export interface PlotlyJson {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
}

export interface PlotlyChartRendererProps {
  /** Pre-rendered Plotly JSON (from backend) */
  plotlyJson?: PlotlyJson | null;
  /** Chart title */
  title?: string;
  /** Chart height in pixels */
  height?: number;
  /** Whether to show in compact mode (for thumbnails) */
  compact?: boolean;
  /** Additional class names */
  className?: string;
}

const DEFAULT_LAYOUT: Partial<Layout> = {
  autosize: true,
  margin: { t: 40, r: 20, b: 40, l: 50 },
  font: { family: 'Inter, system-ui, sans-serif' },
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
};

const DEFAULT_CONFIG: Partial<Config> = {
  responsive: true,
  displayModeBar: 'hover',
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
};

const COMPACT_LAYOUT: Partial<Layout> = {
  ...DEFAULT_LAYOUT,
  margin: { t: 10, r: 10, b: 30, l: 40 },
  showlegend: false,
};

const COMPACT_CONFIG: Partial<Config> = {
  ...DEFAULT_CONFIG,
  displayModeBar: false,
  staticPlot: true,
};

export function PlotlyChartRenderer({
  plotlyJson,
  title,
  height = 400,
  compact = false,
  className = '',
}: PlotlyChartRendererProps) {
  // No data to render
  if (!plotlyJson || !plotlyJson.data || plotlyJson.data.length === 0) {
    return (
      <div 
        className={`w-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 ${className}`}
        style={{ height }}
      >
        <div className="text-center space-y-2">
          <p className="text-slate-600">No chart data available</p>
          <p className="text-sm text-slate-500">Generate a chart to see preview</p>
        </div>
      </div>
    );
  }
  const baseLayout = compact ? COMPACT_LAYOUT : DEFAULT_LAYOUT;
  const baseConfig = compact ? COMPACT_CONFIG : DEFAULT_CONFIG;

  // Handle title - Plotly expects { text: string } for title
  const titleConfig = title 
    ? { text: title } 
    : (typeof plotlyJson.layout?.title === 'string' 
        ? { text: plotlyJson.layout.title } 
        : plotlyJson.layout?.title);

  const mergedLayout: Partial<Layout> = {
    ...baseLayout,
    ...(plotlyJson.layout || {}),
    title: titleConfig,
    autosize: true,
  };

  const mergedConfig: Partial<Config> = {
    ...baseConfig,
    ...(plotlyJson.config || {}),
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Plot
        data={plotlyJson.data}
        layout={mergedLayout}
        config={mergedConfig}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
}

/**
 * Helper function to create a basic Plotly JSON from simple config
 * Used when manually creating charts without backend rendering
 */
export function createPlotlyJson(
  type: 'bar' | 'line' | 'scatter' | 'pie' | 'area' | 'histogram' | 'box' | 'heatmap',
  data: Record<string, unknown>[],
  xAxis?: string,
  yAxis?: string,
  title?: string,
  colors?: string[]
): PlotlyJson {
  const defaultColors = colors || ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  
  if (!xAxis || data.length === 0) {
    return { data: [], layout: {} };
  }

  const xValues = data.map(row => row[xAxis]);
  const yValues = yAxis ? data.map(row => row[yAxis]) : [];

  let plotlyData: Data[] = [];
  let layout: Partial<Layout> = {
    title: { text: title || `${yAxis || ''} by ${xAxis}` },
    xaxis: { title: { text: xAxis } },
    yaxis: yAxis ? { title: { text: yAxis } } : undefined,
  };

  switch (type) {
    case 'bar':
      plotlyData = [{
        type: 'bar',
        x: xValues,
        y: yValues,
        marker: { color: defaultColors[0] },
      } as Data];
      break;

    case 'line':
      plotlyData = [{
        type: 'scatter',
        mode: 'lines+markers',
        x: xValues,
        y: yValues,
        line: { color: defaultColors[0], width: 2 },
        marker: { color: defaultColors[0], size: 6 },
      } as Data];
      break;

    case 'area':
      plotlyData = [{
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        x: xValues,
        y: yValues,
        line: { color: defaultColors[0] },
        fillcolor: `${defaultColors[0]}33`,
      } as Data];
      break;

    case 'scatter':
      plotlyData = [{
        type: 'scatter',
        mode: 'markers',
        x: xValues,
        y: yValues,
        marker: { color: defaultColors[0], size: 8 },
      } as Data];
      break;

    case 'pie':
      plotlyData = [{
        type: 'pie',
        labels: xValues,
        values: yValues.length > 0 ? yValues : xValues.map(() => 1),
        marker: { colors: defaultColors },
      } as Data];
      layout = { title: { text: title || xAxis } };
      break;

    case 'histogram':
      plotlyData = [{
        type: 'histogram',
        x: xValues,
        marker: { color: defaultColors[0] },
      } as Data];
      layout = { 
        title: { text: title || `Distribution of ${xAxis}` }, 
        xaxis: { title: { text: xAxis } } 
      };
      break;

    case 'box':
      plotlyData = [{
        type: 'box',
        y: yValues.length > 0 ? yValues : xValues,
        name: yAxis || xAxis,
        marker: { color: defaultColors[0] },
      } as Data];
      break;

    case 'heatmap':
      // Heatmap needs 2D data, simplified version
      plotlyData = [{
        type: 'heatmap',
        z: [yValues],
        x: xValues,
        colorscale: 'Viridis',
      } as Data];
      break;

    default:
      plotlyData = [{
        type: 'bar',
        x: xValues,
        y: yValues,
        marker: { color: defaultColors[0] },
      } as Data];
  }

  return { data: plotlyData, layout };
}
