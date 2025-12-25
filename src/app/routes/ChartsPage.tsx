/**
 * Charts Page - Chart generation and gallery
 * 
 * Thin composition layer that uses useChartActions for all logic.
 * See features/charts/hooks/useChartActions.ts for implementation.
 */

import { useNavigate } from 'react-router-dom';
import { useChartActions, ChartGallery } from '@features/charts';
import { Button } from '@design/components/ui/button';
import { EmptyState } from '@design/components/EmptyState';
import { Upload } from 'lucide-react';

export function ChartsPage() {
  const navigate = useNavigate();
  const {
    hasFile,
    headers,
    data,
    charts,
    viewMode,
    isCreating,
    editingChart,
    isGenerating,
    onViewModeChange,
    onCreateClick,
    onCloseCreator,
    onChartCreated,
    onAIGenerate,
    onDeleteChart,
    onEditChart,
    onDuplicateChart,
    onExportChart,
    onExportAll,
    onFullscreenChart,
  } = useChartActions();

  if (!hasFile) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Upload className="w-12 h-12" />}
          title="No Data Available"
          description="Upload a file first to create charts and visualizations."
          action={
            <Button
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <ChartGallery
        headers={headers}
        data={data}
        charts={charts}
        viewMode={viewMode}
        showCreator={isCreating}
        editingChart={editingChart}
        isGenerating={isGenerating}
        onViewModeChange={onViewModeChange}
        onCreateClick={onCreateClick}
        onChartCreated={onChartCreated}
        onAIGenerate={onAIGenerate}
        onDeleteChart={onDeleteChart}
        onEditChart={onEditChart}
        onExportChart={onExportChart}
        onDuplicateChart={onDuplicateChart}
        onFullscreenChart={onFullscreenChart}
        onCloseCreator={onCloseCreator}
        onExportAll={onExportAll}
      />
    </div>
  );
}


