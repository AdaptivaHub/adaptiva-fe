/**
 * ChartPreview - Preview charts using Plotly.js
 * 
 * Renders either:
 * 1. Pre-rendered Plotly JSON (from backend AI generation)
 * 2. Auto-generated Plotly config from chart settings
 */
import { PlotlyChartRenderer, createPlotlyJson, type PlotlyJson } from './PlotlyChartRenderer';
import type { ChartType } from './ChartTypeSelector';

interface ChartPreviewProps {
  type: ChartType;
  xAxis?: string;
  yAxis?: string | string[];
  data: Record<string, unknown>[];
  title?: string;
  colors?: string[];
  /** Pre-rendered Plotly JSON (takes precedence over auto-generation) */
  plotlyJson?: PlotlyJson | null;
  /** Height in pixels */
  height?: number;
  /** Compact mode for thumbnails */
  compact?: boolean;
}

export function ChartPreview({ 
  type, 
  xAxis, 
  yAxis: yAxisProp, 
  data, 
  title, 
  colors,
  plotlyJson,
  height = 400,
  compact = false,
}: ChartPreviewProps) {
  // Normalize yAxis to single string for charts that don't support multi-y
  const yAxis = Array.isArray(yAxisProp) ? yAxisProp[0] : yAxisProp;
  
  // If we have pre-rendered Plotly JSON, use it directly
  if (plotlyJson) {
    return (
      <PlotlyChartRenderer
        plotlyJson={plotlyJson}
        title={title}
        height={height}
        compact={compact}
      />
    );
  }

  // Validate we have minimum required data
  if (!xAxis || (!yAxis && type !== 'pie' && type !== 'histogram')) {
    return (
      <div 
        className="w-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50"
        style={{ height }}
      >
        <div className="text-center space-y-2">
          <p className="text-slate-600">No preview available</p>
          <p className="text-sm text-slate-500">
            {type === 'pie' || type === 'histogram'
              ? 'Select an X-axis to preview'
              : 'Select X and Y axes to preview'
            }
          </p>
        </div>
      </div>
    );
  }

  // Generate Plotly JSON from config
  const generatedPlotlyJson = createPlotlyJson(type, data, xAxis, yAxis, title, colors);

  return (
    <PlotlyChartRenderer
      plotlyJson={generatedPlotlyJson}
      height={height}
      compact={compact}
    />
  );
}


