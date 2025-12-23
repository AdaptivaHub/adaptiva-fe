/**
 * Prediction Store - Zustand store for ML model state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TrainedModel {
  id: string;
  name: string;
  type: 'linear-regression' | 'decision-tree';
  targetVariable: string;
  features: string[];
  metrics: {
    r2?: number;
    mae?: number;
    rmse?: number;
    accuracy?: number;
    crossValScores?: number[];
  };
  coefficients?: Record<string, number>;
  featureImportance?: Record<string, number>;
  confusionMatrix?: number[][];
  trainedAt: Date;
  dataPoints: number;
  testSize: number;
}

export interface ModelTrainingConfig {
  name?: string;
  type: 'linear-regression' | 'decision-tree';
  targetVariable: string;
  features: string[];
  trainSize: number;
  maxDepth?: number;
  useCrossValidation: boolean;
}

interface PredictionState {
  models: TrainedModel[];
  isCreating: boolean;
  isTraining: boolean;

  // Actions
  addModel: (model: TrainedModel) => void;
  deleteModel: (id: string) => void;
  setCreating: (creating: boolean) => void;
  setTraining: (training: boolean) => void;
  clearModels: () => void;
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set) => ({
      models: [],
      isCreating: false,
      isTraining: false,

      addModel: (model) =>
        set((state) => ({
          models: [...state.models, model],
          isCreating: false,
          isTraining: false,
        })),

      deleteModel: (id) =>
        set((state) => ({
          models: state.models.filter((m) => m.id !== id),
        })),

      setCreating: (creating) =>
        set({ isCreating: creating }),

      setTraining: (training) =>
        set({ isTraining: training }),

      clearModels: () =>
        set({ models: [], isCreating: false, isTraining: false }),
    }),
    {
      name: 'prediction-storage',
      partialize: (state) => ({
        models: state.models,
      }),
    }
  )
);

// Selector hooks
export const useModels = () => usePredictionStore((state) => state.models);
export const useIsCreatingModel = () => usePredictionStore((state) => state.isCreating);
export const useIsTrainingModel = () => usePredictionStore((state) => state.isTraining);
