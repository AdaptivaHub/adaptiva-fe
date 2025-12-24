# Predictions Page Refactor Plan

> **Goal**: Align `PredictionsPage` with `PredictionsView` to use the same structured ML model training UI and related components.

---

## Current State Analysis

| Component | Location | Description |
|-----------|----------|-------------|
| **PredictionsView** | `src/design-system/components/predictions/PredictionsView.tsx` | Fully-featured ML model training UI with model cards, stats, and model creation flow |
| **PredictionsPage** | `src/app/routes/PredictionsPage.tsx` | Simple AI text-based prediction with instruction input - **NOT aligned with PredictionsView** |
| **predictionStore** | `src/stores/predictionStore.ts` | Zustand store for managing models, creation state, and training state |
| **usePredict hook** | `src/hooks/api/usePredict.ts` | Legacy hook for simple text-based predictions (calls `/predict`) |
| **ml_service (BE)** | `adaptiva-be/app/services/ml_service.py` | In-progress backend for training Linear Regression and Decision Tree models (endpoint: `/ml/train`) |

### Related Prediction Components

| Component | Purpose |
|-----------|---------|
| `EmptyPredictionsState.tsx` | Empty state with model type info and CTA |
| `ModelCard.tsx` | Displays trained model with metrics and visualization |
| `ModelCreator.tsx` | Form for configuring and training a new model |
| `ModelTypeSelector.tsx` | Selection UI for model type |
| `FeatureSelector.tsx` | Multi-select for feature columns |
| `DataValidationWarning.tsx` | Displays validation issues |
| `ModelVisualization.tsx` | Charts/visualizations for model results |

---

## Gap Analysis

| Issue | Details |
|-------|---------|
| **Different Approach** | `PredictionsPage` uses text-based AI predictions vs `PredictionsView` uses structured ML model training |
| **No Component Reuse** | `PredictionsPage` doesn't use `PredictionsView` or any related components |
| **Missing Hook** | No frontend hook exists for the `/ml/train` endpoint |
| **Duplicate Types** | `TrainedModel` type is defined in both `predictionStore.ts` and `PredictionsView.tsx` |
| **Service Gap** | `predictionService.ts` only has `predict()` method, no `trainModel()` |

---

## Refactoring Plan

### Phase 1: Type Consolidation & Component Barrel Export

**Objective**: Consolidate types in `src/types/` (not design-system) and create barrel exports.

> ⚠️ **Design Principle**: Keep `design-system/` purely for UI components. Types and business logic belong in `src/types/`, `src/hooks/`, and `src/services/`.

| Task | File | Action |
|------|------|--------|
| 1.1 | `src/types/predictions.ts` | **Create** - Shared prediction types (TrainedModel, ModelTrainingRequest, etc.) |
| 1.2 | `src/types/index.ts` | **Modify** - Export from `./predictions` |
| 1.3 | `src/design-system/components/predictions/PredictionsView.tsx` | **Modify** - Import types from `@/types` |
| 1.4 | `src/design-system/components/predictions/ModelCard.tsx` | **Modify** - Import types from `@/types` |
| 1.5 | `src/design-system/components/predictions/ModelCreator.tsx` | **Modify** - Import types from `@/types` |
| 1.6 | `src/stores/predictionStore.ts` | **Modify** - Import types from `@/types` |
| 1.7 | `src/design-system/components/predictions/index.ts` | **Create** - Barrel export for prediction **components only** (no types) |

**Types to consolidate (in `src/types/predictions.ts`):**

```typescript
// src/types/predictions.ts

/** Frontend model type (uses kebab-case) */
export type ModelType = 'linear-regression' | 'decision-tree';

/** Trained model representation (frontend) */
export interface TrainedModel {
  id: string;
  name: string;
  type: ModelType;
  targetVariable: string;
  features: string[];
  metrics: {
    r2?: number;       // Mapped from r2_score
    mae?: number;
    rmse?: number;
    mse?: number;
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

/** Request from UI to train a model */
export interface ModelTrainingRequest {
  name: string;
  type: ModelType;
  targetVariable: string;
  features: string[];
  trainSize: number;        // Percentage (0-100), converted to testSize for API
  maxDepth?: number;        // Decision tree only
  useCrossValidation: boolean;  // Note: Not yet supported by backend
}

/** Raw API response from /ml/train (matches backend MLModelResponse) */
export interface MLTrainResponse {
  model_type: 'linear_regression' | 'decision_tree';
  metrics: {
    mse: number;
    rmse: number;
    mae: number;
    r2_score: number;  // Note: Backend uses r2_score, frontend uses r2
  };
  feature_importance: Record<string, number> | null;
  sample_predictions: Array<{
    actual: number;
    predicted: number;
  }>;
}
```

> ⚠️ **Note**: `useCrossValidation` is defined for future use but not currently supported by the backend. The hook should ignore this field until backend support is added.

---

### Phase 2: Hook & Service Layer

**Objective**: Create the service and hook to call the `/ml/train` backend endpoint.

| Task | File | Action |
|------|------|--------|
| 2.1 | `src/services/predictionService.ts` | **Modify** - Add `trainModel()` method |
| 2.2 | `src/hooks/api/useTrainModel.ts` | **Create** - Hook for training models |
| 2.3 | `src/hooks/api/index.ts` | **Modify** - Export `useTrainModel` |

**Service addition:**

```typescript
// predictionService.ts - add trainModel method
async trainModel(
  fileId: string,
  config: {
    modelType: 'linear_regression' | 'decision_tree';
    targetColumn: string;
    featureColumns: string[];
    testSize: number;
  }
): Promise<ApiResponse<MLTrainResponse>> {
  try {
    const response = await apiClient.post('/ml/train', {
      file_id: fileId,
      model_type: config.modelType,
      target_column: config.targetColumn,
      feature_columns: config.featureColumns,
      test_size: config.testSize,
    });
    return response.data;
  } catch (error) {
    return handleApiError<MLTrainResponse>(error);
  }
}
```

**Transformation helper (maps API response to frontend model):**

```typescript
// src/utils/predictions.ts or inline in hook
function transformToTrainedModel(
  response: MLTrainResponse,
  config: ModelTrainingRequest,
  dataPointCount: number
): TrainedModel {
  return {
    id: crypto.randomUUID(),
    name: config.name,
    type: config.type,
    targetVariable: config.targetVariable,
    features: config.features,
    metrics: {
      r2: response.metrics.r2_score,      // Map r2_score → r2
      mae: response.metrics.mae,
      rmse: response.metrics.rmse,
      mse: response.metrics.mse,
    },
    featureImportance: response.feature_importance ?? undefined,
    trainedAt: new Date(),
    dataPoints: dataPointCount,
    testSize: 1 - (config.trainSize / 100),
  };
}
```

**Hook structure:**

```typescript
// useTrainModel.ts
import { useState, useCallback } from 'react';
import { predictionService } from '@/services';
import type { ModelTrainingRequest, TrainedModel, MLTrainResponse } from '@/types';

export function useTrainModel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trainModel = useCallback(async (
    fileId: string,
    config: ModelTrainingRequest,
    dataPointCount: number  // Pass row count for metrics
  ): Promise<TrainedModel | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await predictionService.trainModel(fileId, {
        modelType: config.type === 'linear-regression' ? 'linear_regression' : 'decision_tree',
        targetColumn: config.targetVariable,
        featureColumns: config.features,
        testSize: 1 - (config.trainSize / 100),
      });
      
      if (!response.success || !response.data) {
        setError(response.error || 'Training failed');
        return null;
      }
      
      // Transform API response to TrainedModel
      return transformToTrainedModel(response.data, config, dataPointCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Training failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { trainModel, loading, error, clearError: () => setError(null) };
}
```

---

### Phase 3: PredictionsPage Integration

**Objective**: Refactor `PredictionsPage` to use `PredictionsView` as its main content.

| Task | File | Action |
|------|------|--------|
| 3.1 | `src/app/routes/PredictionsPage.tsx` | **Rewrite** - Use `PredictionsView` component |

**Target Implementation:**

```tsx
// PredictionsPage.tsx
import { useNavigate } from 'react-router-dom';
import { useFileStore, usePredictionStore } from '@/stores';
import { useTrainModel } from '@/hooks/api';
import { PredictionsView } from '@design/components/predictions';
import { EmptyState } from '@design/components/EmptyState';
import { Button } from '@design/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { ModelTrainingRequest } from '@/types'; // Types from src/types, not design-system

export function PredictionsPage() {
  const navigate = useNavigate();
  
  // File state - note: headers is at root level, not inside metadata
  const metadata = useFileStore((state) => state.metadata);
  const data = useFileStore((state) => state.data);
  const headers = useFileStore((state) => state.headers);  // ✅ Correct: headers at root
  const hasFile = metadata !== null;
  
  // Prediction state from store
  const models = usePredictionStore((state) => state.models);
  const isCreating = usePredictionStore((state) => state.isCreating);
  const isTraining = usePredictionStore((state) => state.isTraining);
  const addModel = usePredictionStore((state) => state.addModel);
  const deleteModel = usePredictionStore((state) => state.deleteModel);
  const setCreating = usePredictionStore((state) => state.setCreating);
  const setTraining = usePredictionStore((state) => state.setTraining);
  
  // Train model hook
  const { trainModel, error: trainError } = useTrainModel();
  
  // Handle training request
  const handleTrainModel = async (config: ModelTrainingRequest) => {
    if (!metadata?.fileId) {
      toast.error('No file loaded');
      return;
    }
    
    setTraining(true);
    const result = await trainModel(metadata.fileId, config, data.length);
    
    if (result) {
      addModel(result);
      toast.success(`Model "${config.name}" trained successfully!`);
    } else if (trainError) {
      toast.error(trainError);
    }
    
    setTraining(false);
  };
  
  // No file uploaded - show empty state
  if (!hasFile) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Upload className="w-12 h-12" />}
          title="No Data Available"
          description="Upload a file first to train ML models."
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
    <div className="p-6">
      <PredictionsView
        headers={headers}
        data={data}
        models={models}
        isCreating={isCreating}
        isTraining={isTraining}
        onCreateClick={() => setCreating(true)}
        onTrainModel={handleTrainModel}
        onDeleteModel={deleteModel}
        onCancelCreate={() => setCreating(false)}
      />
    </div>
  );
}
```

---

## Files Summary

### Files to Create

| File | Purpose |
|------|---------|
| `src/types/predictions.ts` | Shared types for prediction module (TrainedModel, ModelTrainingRequest, etc.) |
| `src/design-system/components/predictions/index.ts` | Barrel export for **components only** |
| `src/hooks/api/useTrainModel.ts` | Hook for ML training API |

### Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `export * from './predictions'` |
| `src/design-system/components/predictions/PredictionsView.tsx` | Import types from `@/types` |
| `src/design-system/components/predictions/ModelCard.tsx` | Import types from `@/types` |
| `src/design-system/components/predictions/ModelCreator.tsx` | Import types from `@/types` |
| `src/stores/predictionStore.ts` | Import types from `@/types` instead of defining locally |
| `src/services/predictionService.ts` | Add `trainModel()` method |
| `src/hooks/api/index.ts` | Export `useTrainModel` |
| `src/app/routes/PredictionsPage.tsx` | Complete rewrite |

---

## Architecture Notes

### Separation of Concerns

```
src/
├── types/
│   └── predictions.ts      ← Types live here (shared across app)
├── design-system/
│   └── components/
│       └── predictions/
│           ├── index.ts    ← Barrel export (components only)
│           ├── PredictionsView.tsx
│           ├── ModelCard.tsx
│           └── ...         ← Pure UI components (no business logic)
├── hooks/
│   └── api/
│       └── useTrainModel.ts  ← API interaction hooks
├── services/
│   └── predictionService.ts  ← API client methods
├── stores/
│   └── predictionStore.ts    ← State management
└── app/
    └── routes/
        └── PredictionsPage.tsx  ← Page wires everything together
```

This keeps:
- **design-system/** = Pure UI components (presentational)
- **types/** = Shared TypeScript interfaces
- **hooks/** = React hooks for data fetching
- **services/** = API clients
- **stores/** = Zustand state
- **app/routes/** = Page containers that compose everything

---

## Considerations

### ⚠️ ml_service is In Progress

The backend ML service is still being developed. The hook/service layer should be designed to:
- Use flexible types that can accommodate API changes
- Have robust error handling
- Be easy to update when the API changes

### 🔗 Type Safety

Ensure types match the backend `/ml/train` endpoint:

**Backend expects (MLModelRequest):**
```python
file_id: str
model_type: "linear_regression" | "decision_tree"
target_column: str
feature_columns: list[str]
test_size: float  # 0.1 to 0.5
```

**Backend returns (MLModelResponse):**
```python
model_type: str
metrics: dict  # mse, rmse, mae, r2_score
feature_importance: dict | None
sample_predictions: list[dict]
```

---

## Known Gaps & Future Work

| Gap | Status | Notes |
|-----|--------|-------|
| Cross-validation | ❌ Not in backend | `useCrossValidation` field exists in frontend but backend doesn't support it yet |
| `max_depth` parameter | ⚠️ Hardcoded in backend | Backend uses `max_depth=5` but doesn't accept it as parameter |
| Coefficients for linear regression | ❌ Not returned | Backend doesn't return model coefficients |
| Confusion matrix for classification | ❌ Not returned | Backend only does regression, not classification |
| Model persistence | ❌ Frontend only | Models stored in localStorage, not persisted to backend |

These should be addressed as the `ml_service` backend evolves.

---

## Implementation Order

1. **Phase 1** - Type consolidation (low risk, foundation work)
2. **Phase 2** - Service/hook layer (can be tested independently)
3. **Phase 3** - Page integration (ties everything together)

---

## Testing Checklist

- [ ] Types compile correctly across all files
- [ ] `useTrainModel` hook calls backend successfully
- [ ] `PredictionsPage` renders `PredictionsView` correctly
- [ ] Empty state shows when no file is loaded
- [ ] Model creation flow works end-to-end
- [ ] Models persist in store after training
- [ ] Model deletion works
- [ ] Error states display correctly

---

*Created: December 24, 2025*
*Updated: December 24, 2025 - Added type mapping details, fixed FileStore usage, documented known gaps*
