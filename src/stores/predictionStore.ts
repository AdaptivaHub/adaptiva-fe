/**
 * Prediction Store - Zustand store for ML model state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrainedModel } from '@/types';

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


