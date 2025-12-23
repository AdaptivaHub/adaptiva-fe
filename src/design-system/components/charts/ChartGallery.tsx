import { useState } from 'react';
import { Plus, Download, Grid3x3, LayoutGrid } from 'lucide-react';
import { Button } from '../ui/button';
import { ChartCard } from './ChartCard';
import { ChartCreator, type ChartConfig } from './ChartCreator';
import { Card } from '../ui/card';

interface ChartGalleryProps {
  headers: string[];
  data: Record<string, unknown>[];
}

export function ChartGallery({ headers, data }: ChartGalleryProps) {
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleChartCreated = (chart: ChartConfig) => {
    if (editingChart) {
      setCharts(charts.map(c => c.id === editingChart.id ? chart : c));
      setEditingChart(null);
    } else {
      setCharts([...charts, chart]);
    }
    setShowCreator(false);
  };

  const handleDeleteChart = (id: string) => {
    setCharts(charts.filter(c => c.id !== id));
  };

  const handleEditChart = (chart: ChartConfig) => {
    setEditingChart(chart);
    setShowCreator(true);
  };

  const handleExportAll = () => {
    // TODO: Implement export all charts
    console.log('Export all charts:', charts);
    alert('Export functionality will export all charts as PNG/SVG');
  };

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
            onClick={() => {
              setShowCreator(false);
              setEditingChart(null);
            }}
          >
            Back to Gallery
          </Button>
        </div>
        <ChartCreator
          headers={headers}
          data={data}
          onChartCreated={handleChartCreated}
          onClose={() => {
            setShowCreator(false);
            setEditingChart(null);
          }}
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
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
              </div>
              <Button variant="outline" onClick={handleExportAll}>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </>
          )}
          <Button
            onClick={() => setShowCreator(true)}
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
                onClick={() => setShowCreator(true)}
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
              onEdit={handleEditChart}
              onDelete={handleDeleteChart}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
