import { useState } from 'react';
import { TrendingUp, GitBranch, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@design/components/ui/card';
import { Button } from '@design/components/ui/button';
import { Badge } from '@design/components/ui/badge';
import { Progress } from '@design/components/ui/progress';
import { ModelVisualization } from './ModelVisualization';
import type { TrainedModel } from '@/types';

interface ModelCardProps {
  model: TrainedModel;
  data: Record<string, unknown>[];
  onDelete: (modelId: string) => void;
}

export function ModelCard({ model, data, onDelete }: ModelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const Icon = model.type === 'linear-regression' ? TrendingUp : GitBranch;
  const color = model.type === 'linear-regression' ? 'indigo' : 'green';
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r from-${color}-50 to-${color}-100 border-b`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">
                {model.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Predicting: <span className="font-medium text-slate-700">{model.targetVariable}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Trained {formatDate(model.trainedAt)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(model.id)}
            className={`text-${color}-600 hover:text-${color}-700 hover:bg-${color}-100`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="p-4 space-y-4">
        {/* Primary Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {model.type === 'linear-regression' ? (
            <>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">R² Score</p>
                <p className="text-2xl font-bold text-slate-900">{model.metrics.r2?.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">MAE</p>
                <p className="text-2xl font-bold text-slate-900">
                  {model.metrics.mae?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">RMSE</p>
                <p className="text-2xl font-bold text-slate-900">
                  {model.metrics.rmse?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center p-3 bg-slate-50 rounded-lg col-span-3">
                <p className="text-xs text-slate-600 mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-slate-900">
                  {((model.metrics.accuracy || 0) * 100).toFixed(1)}%
                </p>
                <Progress 
                  value={(model.metrics.accuracy || 0) * 100} 
                  className="h-1.5 mt-2"
                  indicatorClassName="bg-green-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Features */}
        <div>
          <p className="text-xs font-medium text-slate-700 mb-2">
            Features ({model.features.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {model.features.map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Data Info */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t">
          <span>{model.dataPoints} training samples</span>
          <span>{model.testSize}% held for testing</span>
        </div>

        {/* Expand Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              View Details & Visualizations
            </>
          )}
        </Button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t bg-slate-50">
          <ModelVisualization model={model} data={data} />
        </div>
      )}
    </Card>
  );
}


