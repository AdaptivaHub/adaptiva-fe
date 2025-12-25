/**
 * Prediction Types - Shared types for ML model training
 */

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


