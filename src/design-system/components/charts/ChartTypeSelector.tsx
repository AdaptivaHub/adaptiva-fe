import { BarChart3, LineChart, PieChart, ScatterChart, AreaChart, TrendingUp } from 'lucide-react';
import { cn } from '../ui/utils';

interface ChartTypeSelectorProps {
  value: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'composed';
  onChange: (type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'composed') => void;
}

const chartTypes = [
  { type: 'bar' as const, label: 'Bar', icon: BarChart3 },
  { type: 'line' as const, label: 'Line', icon: LineChart },
  { type: 'area' as const, label: 'Area', icon: AreaChart },
  { type: 'pie' as const, label: 'Pie', icon: PieChart },
  { type: 'scatter' as const, label: 'Scatter', icon: ScatterChart },
  { type: 'composed' as const, label: 'Combo', icon: TrendingUp },
];

export function ChartTypeSelector({ value, onChange }: ChartTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {chartTypes.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-indigo-300 hover:bg-indigo-50',
            value === type
              ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm'
              : 'border-slate-200 bg-white'
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5',
              value === type ? 'text-indigo-600' : 'text-slate-600'
            )}
          />
          <span
            className={cn(
              'text-xs font-medium',
              value === type ? 'text-indigo-700' : 'text-slate-700'
            )}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
