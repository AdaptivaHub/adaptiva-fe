import { Plus, Download, Grid3x3, LayoutGrid } from 'lucide-react';
import { Button } from '../ui/button';
import { ChartCard } from './ChartCard';
import { ChartCreator, type ChartConfig, type ChartCreationConfig } from './ChartCreator';
import { Card } from '../ui/card';

interface ChartGalleryProps {
  headers: string[];
  data: Record<string, unknown>[];
  /** Charts to display (controlled) */
  charts: ChartConfig[];
  /** Current view mode (controlled) */
  viewMode?: 'grid' | 'list';
  /** Whether the creator is shown (controlled) */
  showCreator?: boolean;
  /** Chart being edited (controlled) */
  editingChart?: ChartConfig | null;
  /** Whether AI generation is in progress */
  isGenerating?: boolean;
  /** Called when view mode changes */
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  /** Called when "Create Chart" is clicked */
  onCreateClick?: () => void;
  /** Called when chart is created */
  onChartCreated?: (config: ChartCreationConfig, data: Record<string, unknown>[]) => void;
  /** Called when AI generation is requested */
  onAIGenerate?: (prompt: string, config: ChartCreationConfig) => void;
  /** Called when chart is deleted */
  onDeleteChart?: (id: string) => void;
  /** Called when edit is requested */
  onEditChart?: (chart: ChartConfig) => void;
  /** Called when export chart is requested */
  onExportChart?: (chart: ChartConfig) => void;
  /** Called when duplicate chart is requested */
  onDuplicateChart?: (chart: ChartConfig) => void;
  /** Called when fullscreen is requested */
  onFullscreenChart?: (chart: ChartConfig) => void;
  /** Called to close creator */
  onCloseCreator?: () => void;
  /** Called when export all is clicked */
  onExportAll?: () => void;
}

export function ChartGallery({ 
  headers, 
  data,
  charts = [],
  viewMode = 'grid',
  showCreator = false,
  editingChart = null,
  isGenerating = false,
  onViewModeChange,
  onCreateClick,
  onChartCreated,
  onAIGenerate,
  onDeleteChart,
  onEditChart,
  onExportChart,
  onDuplicateChart,
  onFullscreenChart,
  onCloseCreator,
  onExportAll,
}: ChartGalleryProps) {

  if (showCreator) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {editingChart ? 'Edit Chart' : 'Create Chart'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {editingChart ? 'Modify your visualization' : 'Create stunning visualizations with AI assistance'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onCloseCreator}
          >
            Back to Gallery
          </Button>
        </div>
        <ChartCreator
          headers={headers}
          data={data}
          onChartCreated={(config, chartData) => onChartCreated?.(config, chartData)}
          onAIGenerate={onAIGenerate}
          isGenerating={isGenerating}
          onClose={onCloseCreator}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Chart Gallery
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {charts.length === 0 
              ? 'Create your first visualization'
              : `${charts.length} chart${charts.length === 1 ? '' : 's'} created`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {charts.length > 0 && (
            <>
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange?.('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewModeChange?.('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
              </div>
              <Button variant="outline" onClick={onExportAll}>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </>
          )}
          <Button
            onClick={onCreateClick}
            className="bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Chart
          </Button>
        </div>
      </div>

      {/* Charts Grid/List */}
      {charts.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
              <LayoutGrid className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No charts yet
              </h3>
              <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                Create your first visualization using AI or manual controls. Get insights from your data instantly!
              </p>
              <Button
                onClick={onCreateClick}
                className="bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Chart
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
            : 'space-y-4'
        }>
          {charts.map((chart) => (
            <ChartCard
              key={chart.id}
              chart={chart}
              onEdit={(c) => onEditChart?.(c)}
              onDelete={(id) => onDeleteChart?.(id)}
              onExport={onExportChart}
              onDuplicate={onDuplicateChart}
              onFullscreen={onFullscreenChart}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
