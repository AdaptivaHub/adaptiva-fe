import { useState, useMemo } from 'react';
import { TrendingUp, GitBranch, ArrowRight, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { ModelTypeSelector } from './ModelTypeSelector';
import { FeatureSelector } from './FeatureSelector';
import { DataValidationWarning } from './DataValidationWarning';
import type { TrainedModel } from './PredictionsView';

interface ModelCreatorProps {
  headers: string[];
  data: Record<string, unknown>[];
  onModelCreated: (model: TrainedModel) => void;
  onCancel: () => void;
}

type ModelType = 'linear-regression' | 'decision-tree';

export function ModelCreator({ headers, data, onModelCreated, onCancel }: ModelCreatorProps) {
  const [modelType, setModelType] = useState<ModelType>('linear-regression');
  const [modelName, setModelName] = useState('');
  const [targetVariable, setTargetVariable] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [trainSize, setTrainSize] = useState(80);
  const [maxDepth, setMaxDepth] = useState(5);
  const [useCrossValidation, setUseCrossValidation] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Analyze data types for each column
  const columnTypes = useMemo(() => {
    const types: Record<string, 'numerical' | 'categorical'> = {};
    
    headers.forEach(header => {
      const values = data.slice(0, 100).map(row => row[header]);
      const numericCount = values.filter(v => typeof v === 'number').length;
      types[header] = numericCount > values.length * 0.8 ? 'numerical' : 'categorical';
    });
    
    return types;
  }, [headers, data]);

  // Get valid target variables based on model type
  const validTargets = useMemo(() => {
    if (modelType === 'linear-regression') {
      return headers.filter(h => columnTypes[h] === 'numerical');
    }
    return headers; // Decision trees can handle both
  }, [modelType, headers, columnTypes]);

  // Get valid feature variables (exclude target)
  const validFeatures = useMemo(() => {
    return headers.filter(h => h !== targetVariable);
  }, [headers, targetVariable]);

  // Data validation
  const validationIssues = useMemo(() => {
    const issues: Array<{ type: 'error' | 'warning', message: string }> = [];

    if (!targetVariable) {
      issues.push({ type: 'error', message: 'Please select a target variable to predict' });
    }

    if (selectedFeatures.length === 0) {
      issues.push({ type: 'error', message: 'Please select at least one feature variable' });
    }

    // Check for missing values
    if (targetVariable || selectedFeatures.length > 0) {
      const columnsToCheck = [targetVariable, ...selectedFeatures].filter(Boolean);
      columnsToCheck.forEach(col => {
        const missingCount = data.filter(row => row[col] == null || row[col] === '').length;
        const missingPercent = (missingCount / data.length) * 100;
        
        if (missingPercent > 50) {
          issues.push({ 
            type: 'warning', 
            message: `Column "${col}" has ${missingPercent.toFixed(0)}% missing values` 
          });
        }
      });
    }

    // Check data points
    const cleanRows = data.filter(row => {
      const cols = [targetVariable, ...selectedFeatures].filter(Boolean);
      return cols.every(col => row[col] != null && row[col] !== '');
    }).length;

    if (cleanRows < 10) {
      issues.push({ 
        type: 'error', 
        message: `Insufficient data: Only ${cleanRows} complete rows available (minimum 10 required)` 
      });
    } else if (cleanRows < 30) {
      issues.push({ 
        type: 'warning', 
        message: `Limited data: Only ${cleanRows} complete rows. More data improves accuracy.` 
      });
    }

    // Check for low variance
    selectedFeatures.forEach(feature => {
      const values = data.map(row => row[feature]).filter(v => v != null);
      const uniqueValues = new Set(values);
      if (uniqueValues.size === 1) {
        issues.push({ 
          type: 'warning', 
          message: `Feature "${feature}" has only one unique value (no variance)` 
        });
      }
    });

    return issues;
  }, [targetVariable, selectedFeatures, data]);

  const hasErrors = validationIssues.some(issue => issue.type === 'error');

  const handleTrain = () => {
    if (hasErrors) return;

    setIsTraining(true);

    // Simulate training delay
    setTimeout(() => {
      // Mock model results
      const mockModel: TrainedModel = {
        id: `model_${Date.now()}`,
        name: modelName || `${modelType === 'linear-regression' ? 'Linear Regression' : 'Decision Tree'} - ${targetVariable}`,
        type: modelType,
        targetVariable,
        features: selectedFeatures,
        metrics: modelType === 'linear-regression' ? {
          r2: 0.87,
          mae: 1234.56,
          rmse: 1567.89,
          crossValScores: useCrossValidation ? [0.85, 0.88, 0.86, 0.89, 0.84] : undefined,
        } : {
          accuracy: 0.92,
          crossValScores: useCrossValidation ? [0.90, 0.93, 0.91, 0.92, 0.89] : undefined,
        },
        coefficients: modelType === 'linear-regression' ? 
          selectedFeatures.reduce((acc, f) => ({ ...acc, [f]: Math.random() * 100 - 50 }), {}) : undefined,
        featureImportance: modelType === 'decision-tree' ?
          selectedFeatures.reduce((acc, f) => ({ ...acc, [f]: Math.random() }), {}) : undefined,
        confusionMatrix: modelType === 'decision-tree' && columnTypes[targetVariable] === 'categorical' ? 
          [[45, 5], [3, 47]] : undefined,
        trainedAt: new Date(),
        dataPoints: Math.floor(data.length * 0.9),
        testSize: 100 - trainSize,
      };

      onModelCreated(mockModel);
      setIsTraining(false);
    }, 2000);
  };

  return (
    <Card className="p-6 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/30 to-purple-50/30">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Create Prediction Model</h3>
          <p className="text-sm text-slate-600 mt-1">
            Configure and train a machine learning model on your data
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Model Name */}
        <div>
          <Label htmlFor="model-name">Model Name (Optional)</Label>
          <Input
            id="model-name"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="e.g., Sales Prediction Q4 2024"
            className="mt-1.5"
          />
        </div>

        {/* Model Type Selection */}
        <div>
          <Label>Model Type</Label>
          <ModelTypeSelector
            selectedType={modelType}
            onTypeChange={setModelType}
            className="mt-1.5"
          />
        </div>

        {/* Target Variable */}
        <div>
          <Label htmlFor="target-variable">
            Target Variable
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <p className="text-xs text-slate-500 mt-1 mb-2">
            What do you want to predict?
          </p>
          <select
            id="target-variable"
            value={targetVariable}
            onChange={(e) => setTargetVariable(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select target variable...</option>
            {validTargets.map(header => (
              <option key={header} value={header}>
                {header} ({columnTypes[header]})
              </option>
            ))}
          </select>
          {modelType === 'linear-regression' && (
            <p className="text-xs text-slate-500 mt-1">
              Only numerical columns are shown for linear regression
            </p>
          )}
        </div>

        {/* Feature Selection */}
        {targetVariable && (
          <div>
            <Label>
              Feature Variables
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <p className="text-xs text-slate-500 mt-1 mb-2">
              Select variables that help predict the target ({selectedFeatures.length} selected)
            </p>
            <FeatureSelector
              features={validFeatures}
              selectedFeatures={selectedFeatures}
              onFeaturesChange={setSelectedFeatures}
              columnTypes={columnTypes}
            />
          </div>
        )}

        {/* Validation Warnings */}
        {validationIssues.length > 0 && (
          <DataValidationWarning issues={validationIssues} />
        )}

        {/* Advanced Settings */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Settings
          </button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 bg-white rounded-lg border border-slate-200">
              {/* Train/Test Split */}
              <div>
                <Label htmlFor="train-size">
                  Train/Test Split: {trainSize}% / {100 - trainSize}%
                </Label>
                <Slider
                  id="train-size"
                  value={[trainSize]}
                  onValueChange={(values) => setTrainSize(values[0])}
                  min={60}
                  max={90}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {trainSize}% of data used for training, {100 - trainSize}% for testing
                </p>
              </div>

              {/* Cross Validation */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cross-validation">5-Fold Cross Validation</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    More accurate performance estimate (slower)
                  </p>
                </div>
                <Switch
                  id="cross-validation"
                  checked={useCrossValidation}
                  onCheckedChange={setUseCrossValidation}
                />
              </div>

              {/* Decision Tree Specific */}
              {modelType === 'decision-tree' && (
                <div>
                  <Label htmlFor="max-depth">
                    Maximum Tree Depth: {maxDepth}
                  </Label>
                  <Slider
                    id="max-depth"
                    value={[maxDepth]}
                    onValueChange={(values) => setMaxDepth(values[0])}
                    min={2}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Limits tree complexity (prevents overfitting)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={handleTrain}
            disabled={hasErrors || isTraining}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            {isTraining ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Training Model...
              </>
            ) : (
              <>
                {modelType === 'linear-regression' ? <TrendingUp className="w-4 h-4 mr-2" /> : <GitBranch className="w-4 h-4 mr-2" />}
                Train Model
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isTraining}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
