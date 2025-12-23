import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '../ui/chart';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart as RechartsPieChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';

interface ChartPreviewProps {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'composed';
  xAxis?: string;
  yAxis?: string | string[];
  data: Record<string, unknown>[];
  title?: string;
  colors?: string[];
}

const DEFAULT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function ChartPreview({ type, xAxis, yAxis: yAxisProp, data, title, colors = DEFAULT_COLORS }: ChartPreviewProps) {
  // Normalize yAxis to single string for charts that don't support multi-y
  const yAxis = Array.isArray(yAxisProp) ? yAxisProp[0] : yAxisProp;
  
  if (!xAxis || (!yAxis && type !== 'pie')) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
        <div className="text-center space-y-2">
          <p className="text-slate-600">No preview available</p>
          <p className="text-sm text-slate-500">
            {type === 'pie' 
              ? 'Select an X-axis to preview'
              : 'Select X and Y axes to preview'
            }
          </p>
        </div>
      </div>
    );
  }

  const chartConfig = {
    [yAxis || xAxis]: {
      label: yAxis || xAxis,
      color: colors[0],
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ChartContainer config={chartConfig}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey={yAxis} fill={colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        );

      case 'line':
        return (
          <ChartContainer config={chartConfig}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line 
                type="monotone" 
                dataKey={yAxis} 
                stroke={colors[0]} 
                strokeWidth={2}
                dot={{ fill: colors[0], r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        );

      case 'area':
        return (
          <ChartContainer config={chartConfig}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area 
                type="monotone" 
                dataKey={yAxis!} 
                stroke={colors[0]} 
                fill={colors[0]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ChartContainer>
        );

      case 'pie':
        return (
          <ChartContainer config={chartConfig}>
            <RechartsPieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={data}
                dataKey={yAxis || 'value'}
                nameKey={xAxis}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </RechartsPieChart>
          </ChartContainer>
        );

      case 'scatter':
        return (
          <ChartContainer config={chartConfig}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis dataKey={yAxis} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Scatter name={yAxis} fill={colors[0]} />
            </ScatterChart>
          </ChartContainer>
        );

      case 'composed':
        return (
          <ChartContainer config={chartConfig}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey={yAxis} fill={colors[0]} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey={yAxis} stroke={colors[1]} strokeWidth={2} />
            </BarChart>
          </ChartContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {title && (
        <h4 className="font-medium text-slate-900">{title}</h4>
      )}
      <div className="w-full h-[400px]">
        {renderChart()}
      </div>
    </div>
  );
}
