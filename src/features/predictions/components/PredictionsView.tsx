import { Brain, Plus, TrendingUp, GitBranch } from 'lucide-react';
import { Card } from '@design/components/ui/card';
import { Button } from '@design/components/ui/button';
import { ModelCreator } from './ModelCreator';
import { ModelCard } from './ModelCard';
import { EmptyPredictionsState } from './EmptyPredictionsState';
import type { TrainedModel, ModelTrainingRequest } from '@/types';

interface PredictionsViewProps {
  headers: string[];
  data: Record<string, unknown>[];
  /** Models to display (controlled) */
  models?: TrainedModel[];
  /** Whether model creator is shown (controlled) */
  isCreating?: boolean;
  /** Whether training is in progress */
  isTraining?: boolean;
  /** Called when "Create Model" is clicked */
  onCreateClick?: () => void;
  /** Called when training is requested */
  onTrainModel?: (config: ModelTrainingRequest) => void;
  /** Called when model is deleted */
  onDeleteModel?: (modelId: string) => void;
  /** Called when creator is cancelled */
  onCancelCreate?: () => void;
}

export function PredictionsView({ 
  headers, 
  data,
  models = [],
  isCreating = false,
  isTraining = false,
  onCreateClick,
  onTrainModel,
  onDeleteModel,
  onCancelCreate,
}: PredictionsViewProps) {
  if (models.length === 0 && !isCreating) {
    return (
      <div className="space-y-6">
        <EmptyPredictionsState onCreateModel={onCreateClick ?? (() => {})} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Predictive Models</h2>
          <p className="text-sm text-slate-600 mt-1">
            Train machine learning models to predict outcomes from your data
          </p>
        </div>
        {!isCreating && (          <Button
            onClick={onCreateClick}
            className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Model
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      {models.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                <Brain className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Models</p>
                <p className="text-2xl font-bold text-slate-900">{models.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Linear Regression</p>
                <p className="text-2xl font-bold text-slate-900">
                  {models.filter(m => m.type === 'linear-regression').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Decision Trees</p>
                <p className="text-2xl font-bold text-slate-900">
                  {models.filter(m => m.type === 'decision-tree').length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Model Creator */}
      {isCreating && (
        <ModelCreator
          headers={headers}
          data={data}
          onTrainModel={onTrainModel ?? (() => {})}
          isTraining={isTraining}
          onCancel={onCancelCreate ?? (() => {})}
        />
      )}

      {/* Models Grid */}
      {models.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {models.map(model => (
            <ModelCard
              key={model.id}
              model={model}
              data={data}
              onDelete={onDeleteModel ?? (() => {})}
            />
          ))}
        </div>
      )}
    </div>
  );
}


