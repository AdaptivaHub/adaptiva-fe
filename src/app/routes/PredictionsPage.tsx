/**
 * Predictions Page - ML predictions and model training
 * Uses PredictionsView component with store integration
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileStore, usePredictionStore } from '@/stores';
import { useTrainModel } from '@/hooks/api';
import { PredictionsView } from '@design/components/predictions';
import { Button } from '@design/components/ui/button';
import { EmptyState } from '@design/components/EmptyState';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { ModelTrainingRequest } from '@/types';

export function PredictionsPage() {
  const navigate = useNavigate();
  
  // File store state
  const metadata = useFileStore((state) => state.metadata);
  const data = useFileStore((state) => state.data);
  const headers = useFileStore((state) => state.headers);
  const hasFile = metadata !== null;
  
  // Prediction store state & actions
  const models = usePredictionStore((state) => state.models);
  const isCreating = usePredictionStore((state) => state.isCreating);
  const isTraining = usePredictionStore((state) => state.isTraining);
  const addModel = usePredictionStore((state) => state.addModel);
  const deleteModel = usePredictionStore((state) => state.deleteModel);
  const setCreating = usePredictionStore((state) => state.setCreating);
  const setTraining = usePredictionStore((state) => state.setTraining);
  
  // Training hook
  const { trainModel, error: trainError } = useTrainModel();

  // Handlers
  const handleCreateClick = useCallback(() => {
    setCreating(true);
  }, [setCreating]);

  const handleCancelCreate = useCallback(() => {
    setCreating(false);
  }, [setCreating]);

  const handleTrainModel = useCallback(async (config: ModelTrainingRequest) => {
    if (!metadata?.fileId) {
      toast.error('No file loaded');
      return;
    }
    
    setTraining(true);
    
    const trainedModel = await trainModel(metadata.fileId, config, data.length);
    
    if (trainedModel) {
      addModel(trainedModel);
      toast.success(`Model "${config.name}" trained successfully!`);
    } else {
      toast.error(trainError || 'Training failed');
    }
    
    setTraining(false);
  }, [metadata?.fileId, data.length, trainModel, trainError, addModel, setTraining]);

  const handleDeleteModel = useCallback((modelId: string) => {
    deleteModel(modelId);
    toast.success('Model deleted');
  }, [deleteModel]);

  // No file uploaded - show empty state
  if (!hasFile) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Upload className="w-12 h-12" />}
          title="No Data Available"
          description="Upload a file first to train ML prediction models."
          action={            <Button
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
      <PredictionsView
        headers={headers}
        data={data}
        models={models}
        isCreating={isCreating}
        isTraining={isTraining}
        onCreateClick={handleCreateClick}
        onTrainModel={handleTrainModel}
        onDeleteModel={handleDeleteModel}
        onCancelCreate={handleCancelCreate}
      />
    </div>
  );
}


