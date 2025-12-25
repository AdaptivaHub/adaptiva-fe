/**
 * Predictions Feature - Public API
 * 
 * This is the main entry point for the predictions feature.
 * Import from '@features/predictions' instead of deep imports.
 */

// Components
export { PredictionsView } from './components/PredictionsView';
export { ModelCard } from './components/ModelCard';
export { ModelCreator } from './components/ModelCreator';
export { ModelTypeSelector } from './components/ModelTypeSelector';
export { FeatureSelector } from './components/FeatureSelector';
export { DataValidationWarning } from './components/DataValidationWarning';
export { ModelVisualization } from './components/ModelVisualization';
export { EmptyPredictionsState } from './components/EmptyPredictionsState';

// Types are exported from @/types (ModelType, TrainedModel, ModelTrainingRequest)
