/**
 * Charts Page - Chart generation and gallery
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileStore } from '@/stores';
import { useChart, type ChartResult } from '@/hooks/api';
import { Button } from '@design/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@design/components/ui/card';
import { Input } from '@design/components/ui/input';
import { Label } from '@design/components/ui/label';
import { EmptyState } from '@design/components/EmptyState';
import { ChartBar, Sparkles, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Plot from 'react-plotly.js';

export function ChartsPage() {
  const navigate = useNavigate();
  const metadata = useFileStore((state) => state.metadata);
  const hasFile = metadata !== null;

  const { generateChart, loading, error } = useChart();

  const [instructions, setInstructions] = useState('');
  const [chartResult, setChartResult] = useState<ChartResult | null>(null);

  const handleGenerateChart = useCallback(async () => {
    if (!metadata?.fileId) return;

    const result = await generateChart(
      metadata.fileId,
      instructions || undefined,
      metadata.activeSheet
    );

    if (result) {
      setChartResult(result);
      toast.success('Chart generated successfully!');
    } else if (error) {
      toast.error(error);
    }
  }, [metadata, instructions, generateChart, error]);

  // No file uploaded
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
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
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
    <div className="p-6 space-y-6">
      {/* Chart Generation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Chart Generator
          </CardTitle>
          <CardDescription>
            Describe the chart you want and let AI create it for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions (optional)</Label>
            <Input
              id="instructions"
              placeholder="e.g., Create a bar chart showing sales by region..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-slate-500">
              Leave empty for AI to suggest the best visualization
            </p>
          </div>

          <Button
            onClick={handleGenerateChart}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ChartBar className="w-4 h-4 mr-2" />
                Generate Chart
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Chart Result */}
      {chartResult && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Chart</CardTitle>
            {chartResult.explanation && (
              <CardDescription>{chartResult.explanation}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ minHeight: '400px' }}>
              <Plot
                data={chartResult.chartJson.data as Plotly.Data[]}
                layout={{
                  ...(chartResult.chartJson.layout as Partial<Plotly.Layout>),
                  autosize: true,
                }}
                config={{ responsive: true }}
                style={{ width: '100%', height: '400px' }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state for charts */}
      {!chartResult && !loading && (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={<ChartBar className="w-12 h-12" />}
              title="No Charts Yet"
              description="Generate your first chart using the AI-powered chart generator above."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
