import { Edit, Trash2, Maximize2, Copy, MoreVertical, Download } from 'lucide-react';
import { Card } from '@design/components/ui/card';
import { Button } from '@design/components/ui/button';
import { Badge } from '@design/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@design/components/ui/dropdown-menu';
import { ChartPreview } from './ChartPreview';
import type { ChartConfig } from './ChartCreator';
import type { ChartType } from './ChartTypeSelector';
import { format } from 'date-fns';

interface ChartCardProps {
  chart: ChartConfig;
  onEdit: (chart: ChartConfig) => void;
  /** Called when delete is requested - app layer handles confirmation */
  onDelete: (id: string) => void;
  /** Called when export is requested */
  onExport?: (chart: ChartConfig) => void;
  /** Called when duplicate is requested */
  onDuplicate?: (chart: ChartConfig) => void;
  /** Called when fullscreen is requested */
  onFullscreen?: (chart: ChartConfig) => void;
  viewMode?: 'grid' | 'list';
}

export function ChartCard({ 
  chart, 
  onEdit, 
  onDelete, 
  onExport,
  onDuplicate,
  onFullscreen,
  viewMode = 'grid' 
}: ChartCardProps) {

  const handleExport = () => {
    onExport?.(chart);
  };

  const handleDuplicate = () => {
    onDuplicate?.(chart);
  };

  const handleDelete = () => {
    // App layer handles confirmation dialog
    onDelete(chart.id);
  };

  const handleFullscreen = () => {
    onFullscreen?.(chart);
  };

  const getChartTypeBadgeColor = (type: ChartType) => {
    const colors: Record<ChartType, string> = {
      bar: 'bg-blue-100 text-blue-700 border-blue-200',
      line: 'bg-green-100 text-green-700 border-green-200',
      area: 'bg-brand-100 text-brand-700 border-brand-200',
      pie: 'bg-orange-100 text-orange-700 border-orange-200',
      scatter: 'bg-pink-100 text-pink-700 border-pink-200',
      histogram: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      box: 'bg-brand-100 text-brand-700 border-brand-200',
      heatmap: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[type] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (viewMode === 'list') {
    return (
      <Card className="p-4 hover:shadow-md transition-all group">
        <div className="flex items-center gap-4">          <div className="w-48 h-32 flex-shrink-0 bg-slate-50 rounded-lg overflow-hidden">
            <ChartPreview
              type={chart.type}
              xAxis={chart.xAxis}
              yAxis={chart.yAxis}
              data={chart.data.slice(0, 10)}
              colors={chart.colors}
              plotlyJson={chart.plotlyJson}
              height={128}
              compact={true}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{chart.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getChartTypeBadgeColor(chart.type)}>
                    {chart.type}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {format(chart.createdAt, 'MMM d, yyyy')}
                  </span>
                  {chart.prompt && (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                      AI Generated
                    </Badge>
                  )}
                </div>
                {chart.xAxis && chart.yAxis && (
                  <p className="text-sm text-slate-600 mt-2">
                    {chart.yAxis} by {chart.xAxis}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(chart)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleFullscreen}>
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Fullscreen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-all group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{chart.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getChartTypeBadgeColor(chart.type)}>
                {chart.type}
              </Badge>
              {chart.prompt && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  AI
                </Badge>
              )}
            </div>
          </div>          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(chart)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFullscreen}>
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>        {/* Chart Preview */}
        <div className="bg-slate-50 rounded-lg p-4 min-h-[300px]">
          <ChartPreview
            type={chart.type}
            xAxis={chart.xAxis}
            yAxis={chart.yAxis}
            data={chart.data.slice(0, 20)}
            colors={chart.colors}
            plotlyJson={chart.plotlyJson}
            height={280}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-600">
            {chart.xAxis && chart.yAxis && (
              <span>{chart.yAxis} by {chart.xAxis}</span>
            )}
          </div>
          <span className="text-slate-500">
            {format(chart.createdAt, 'MMM d, yyyy')}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(chart)}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex-1"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>
    </Card>
  );
}


