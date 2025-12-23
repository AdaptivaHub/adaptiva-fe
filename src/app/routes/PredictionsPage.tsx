/**
 * Predictions Page - ML predictions and model training
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileStore } from '@/stores';
import { usePredict } from '@/hooks/api';
import { Button } from '@design/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@design/components/ui/card';
import { Input } from '@design/components/ui/input';
import { Label } from '@design/components/ui/label';
import { EmptyState } from '@design/components/EmptyState';
import { Brain, Sparkles, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function PredictionsPage() {
  const navigate = useNavigate();
  const metadata = useFileStore((state) => state.metadata);
  const data = useFileStore((state) => state.data);
  const hasFile = metadata !== null;

  const { predict, loading, result, error } = usePredict();

  const [instructions, setInstructions] = useState('');

  const handlePredict = useCallback(async () => {
    if (!data.length) {
      toast.error('No data available for predictions');
      return;
    }

    const predictionResult = await predict(data, instructions || undefined);

    if (predictionResult) {
      toast.success('Predictions generated successfully!');
    } else if (error) {
      toast.error(error);
    }
  }, [data, instructions, predict, error]);

  // No file uploaded
  if (!hasFile) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Upload className="w-12 h-12" />}
          title="No Data Available"
          description="Upload a file first to generate ML predictions."
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
      {/* Prediction Generator Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Predictions
          </CardTitle>
          <CardDescription>
            Describe what you want to predict and let AI analyze your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instructions">Prediction Instructions</Label>
            <Input
              id="instructions"
              placeholder="e.g., Predict sales for next quarter based on historical trends..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-slate-500">
              Describe what you want to predict or analyze
            </p>
          </div>

          <Button
            onClick={handlePredict}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Predictions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Prediction Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-slate-50 rounded-lg">
              {typeof result === 'string' ? (
                <p className="whitespace-pre-wrap">{result}</p>
              ) : (
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state for predictions */}
      {!result && !loading && (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={<Brain className="w-12 h-12" />}
              title="No Predictions Yet"
              description="Generate your first prediction using the AI-powered prediction engine above."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
