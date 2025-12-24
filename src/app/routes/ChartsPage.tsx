/**
 * Charts Page - Chart generation and gallery
 * 
 * Uses the unified chart architecture:
 * - AI suggests ChartSpec via /api/charts/suggest
 * - ChartSpec is rendered via /api/charts/render
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileStore } from '@/stores';
import { useChart } from '@/hooks/api';
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

  const { 
    spec,
    chartJson,
    explanation,
    confidence,
    loading,
    suggesting,
    error,
    suggest,
    render,
  } = useChart();

  const [instructions, setInstructions] = useState('');

  // Auto-render when spec changes
  useEffect(() => {
    if (spec) {
      render(spec);
    }
  }, [spec, render]);

  const handleGenerateChart = useCallback(async () => {
    if (!metadata?.fileId) return;

    const success = await suggest(
      metadata.fileId,
      instructions || undefined,
      metadata.activeSheet
    );

    if (success) {
      toast.success('Chart generated successfully!');
    } else if (error) {
      toast.error(error);
    }
  }, [metadata, instructions, suggest, error]);

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

  const isProcessing = loading || suggesting;

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
              disabled={isProcessing}
            />
            <p className="text-xs text-slate-500">
              Leave empty for AI to suggest the best visualization
            </p>
          </div>

          <Button
            onClick={handleGenerateChart}
            disabled={isProcessing}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {suggesting ? 'AI Suggesting...' : 'Rendering...'}
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

      {/* AI Explanation */}
      {explanation && (
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-indigo-900">{explanation}</p>
                {confidence > 0 && (
                  <p className="text-xs text-indigo-600">
                    Confidence: {Math.round(confidence * 100)}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}      {/* Chart Result */}
      {chartJson && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Chart</CardTitle>
            {spec && (
              <CardDescription>
                {spec.chart_type.charAt(0).toUpperCase() + spec.chart_type.slice(1)} Chart
                {spec.visual?.title && ` - ${spec.visual.title}`}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ minHeight: '400px' }}>
              <Plot
                data={(chartJson.data || []) as Plotly.Data[]}
                layout={{
                  ...((chartJson.layout || {}) as Partial<Plotly.Layout>),
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
      {!chartJson && !isProcessing && (
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
