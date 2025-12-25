import { useState } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@design/components/ui/card';
import { TrendingUp, BarChart3, GitBranch } from 'lucide-react';
import type { TrainedModel } from '@/types';

interface ModelVisualizationProps {
  model: TrainedModel;
  data: Record<string, unknown>[];
}

export function ModelVisualization({ model, data: _data }: ModelVisualizationProps) {
  const [activeTab, setActiveTab] = useState<'visualizations' | 'metrics' | 'explainability'>('visualizations');

  // Generate mock predicted vs actual data for visualization
  const generateScatterData = () => {
    return Array.from({ length: 50 }, (_) => {
      const actual = 1000 + Math.random() * 9000;
      const predicted = actual + (Math.random() - 0.5) * 2000;
      return {
        actual: Math.round(actual),
        predicted: Math.round(predicted),
        residual: Math.round(actual - predicted),
      };
    });
  };

  // Generate feature importance data
  const generateFeatureImportance = () => {
    if (model.type === 'linear-regression' && model.coefficients) {
      return Object.entries(model.coefficients).map(([feature, coef]) => ({
        feature,
        value: Math.abs(coef),
        coefficient: coef,
        impact: coef > 0 ? 'positive' : 'negative',
      })).sort((a, b) => b.value - a.value);
    } else if (model.type === 'decision-tree' && model.featureImportance) {
      return Object.entries(model.featureImportance).map(([feature, importance]) => ({
        feature,
        value: importance * 100,
        percentage: importance,
      })).sort((a, b) => b.value - a.value);
    }
    return [];
  };

  // Generate confusion matrix display
  const renderConfusionMatrix = () => {
    if (!model.confusionMatrix) return null;

    const matrix = model.confusionMatrix;
    const total = matrix.flat().reduce((a, b) => a + b, 0);

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-slate-900 text-sm">Confusion Matrix</h4>
        <div className="inline-grid grid-cols-3 gap-2">
          <div />
          <div className="text-center text-xs font-medium text-slate-600 p-2">Predicted 0</div>
          <div className="text-center text-xs font-medium text-slate-600 p-2">Predicted 1</div>
          
          <div className="text-xs font-medium text-slate-600 flex items-center pr-2">Actual 0</div>
          <div className="bg-green-100 border border-green-300 rounded p-3 text-center">
            <p className="text-2xl font-bold text-green-900">{matrix[0][0]}</p>
            <p className="text-xs text-green-700">{((matrix[0][0] / total) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-red-100 border border-red-300 rounded p-3 text-center">
            <p className="text-2xl font-bold text-red-900">{matrix[0][1]}</p>
            <p className="text-xs text-red-700">{((matrix[0][1] / total) * 100).toFixed(1)}%</p>
          </div>

          <div className="text-xs font-medium text-slate-600 flex items-center pr-2">Actual 1</div>
          <div className="bg-red-100 border border-red-300 rounded p-3 text-center">
            <p className="text-2xl font-bold text-red-900">{matrix[1][0]}</p>
            <p className="text-xs text-red-700">{((matrix[1][0] / total) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-green-100 border border-green-300 rounded p-3 text-center">
            <p className="text-2xl font-bold text-green-900">{matrix[1][1]}</p>
            <p className="text-xs text-green-700">{((matrix[1][1] / total) * 100).toFixed(1)}%</p>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Green: Correct predictions • Red: Incorrect predictions
        </p>
      </div>
    );
  };

  const scatterData = generateScatterData();
  const featureImportance = generateFeatureImportance();

  const tabs = [
    { id: 'visualizations', label: 'Visualizations', icon: BarChart3 },
    { id: 'metrics', label: 'Metrics', icon: TrendingUp },
    { id: 'explainability', label: 'Explainability', icon: GitBranch },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Visualizations Tab */}
        {activeTab === 'visualizations' && (
          <>
            {model.type === 'linear-regression' && (
              <Card className="p-4">
                <h4 className="font-semibold text-slate-900 mb-4">Predicted vs Actual Values</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="actual" 
                      name="Actual" 
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Actual Values', position: 'insideBottom', offset: -5, style: { fontSize: 12 } }}
                    />
                    <YAxis 
                      dataKey="predicted" 
                      name="Predicted"
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Predicted Values', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Scatter name="Predictions" data={scatterData} fill="#6366f1" />
                    <Line 
                      type="linear" 
                      dataKey="predicted" 
                      data={scatterData.map(d => ({ actual: d.actual, predicted: d.actual }))}
                      stroke="#94a3b8" 
                      strokeDasharray="5 5"
                      dot={false}
                      name="Perfect Fit"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-500 mt-2">
                  Points closer to the dashed line indicate better predictions
                </p>
              </Card>
            )}

            {model.type === 'decision-tree' && (
              <Card className="p-4">
                <h4 className="font-semibold text-slate-900 mb-4">Decision Tree Structure</h4>
                <div className="bg-slate-50 rounded-lg p-8 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    {/* Simple tree visualization */}
                    <div className="inline-block">                      <div className="bg-brand-100 border-2 border-brand-500 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-brand-900">Root Node</p>
                        <p className="text-xs text-brand-700">{model.features[0]} &lt; threshold</p>
                      </div>
                      <div className="flex gap-8 justify-center">
                        <div className="space-y-2">
                          <div className="w-px h-8 bg-slate-300 mx-auto" />
                          <div className="bg-green-100 border border-green-500 rounded-lg p-2">
                            <p className="text-xs font-medium text-green-900">Yes</p>
                            <p className="text-xs text-green-700">Class A</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-px h-8 bg-slate-300 mx-auto" />
                          <div className="bg-brand-100 border border-brand-500 rounded-lg p-2">
                            <p className="text-xs font-medium text-brand-900">No</p>
                            <p className="text-xs text-brand-700">More splits...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 max-w-md">
                      Simplified tree structure. Full tree visualization would show all decision paths.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {model.confusionMatrix && renderConfusionMatrix()}
          </>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold text-slate-900 mb-4">Model Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {model.type === 'linear-regression' && (
                  <>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-700 mb-1">R² Score</p>
                      <p className="text-3xl font-bold text-slate-900">{model.metrics.r2?.toFixed(4)}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {((model.metrics.r2 || 0) * 100).toFixed(1)}% of variance explained
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-700 mb-1">Mean Absolute Error</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {model.metrics.mae?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Average prediction error</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-700 mb-1">Root Mean Squared Error</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {model.metrics.rmse?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Penalizes larger errors more</p>
                    </div>
                  </>
                )}
                {model.type === 'decision-tree' && (
                  <div className="p-4 bg-slate-50 rounded-lg col-span-2">
                    <p className="text-sm font-medium text-slate-700 mb-1">Model Accuracy</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {((model.metrics.accuracy || 0) * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Percentage of correct predictions</p>
                  </div>
                )}
              </div>
            </Card>

            {model.metrics.crossValScores && (
              <Card className="p-4">
                <h4 className="font-semibold text-slate-900 mb-4">Cross-Validation Results (5-Fold)</h4>
                <div className="space-y-2">
                  {model.metrics.crossValScores.map((score, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-600 w-12">Fold {i + 1}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">                        <div 
                          className="bg-gradient-to-r from-brand-600 to-brand-500 h-full rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${score * 100}%` }}
                        >
                          <span className="text-xs font-medium text-white">
                            {(score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t mt-3">
                    <p className="text-sm text-slate-600">
                      Average: <span className="font-semibold text-slate-900">
                        {(model.metrics.crossValScores.reduce((a, b) => a + b, 0) / model.metrics.crossValScores.length * 100).toFixed(2)}%
                      </span>
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Explainability Tab */}
        {activeTab === 'explainability' && (
          <Card className="p-4">
            <h4 className="font-semibold text-slate-900 mb-4">
              {model.type === 'linear-regression' ? 'Feature Coefficients' : 'Feature Importance'}
            </h4>
            
            {featureImportance.length > 0 && (
              <>
                <ResponsiveContainer width="100%" height={Math.max(200, featureImportance.length * 40)}>
                  <BarChart 
                    data={featureImportance} 
                    layout="vertical"
                    margin={{ left: 80, right: 20, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      type="number" 
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="feature" 
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {featureImportance.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={model.type === 'linear-regression' && 'impact' in entry && entry.impact === 'negative' ? '#ef4444' : '#6366f1'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  {model.type === 'linear-regression' && (
                    <div className="text-xs text-slate-600 space-y-1">
                      <p>• <span className="inline-block w-3 h-3 bg-brand-500 rounded mr-1" /> Positive coefficient: Increases target value</p>
                      <p>• <span className="inline-block w-3 h-3 bg-red-500 rounded mr-1" /> Negative coefficient: Decreases target value</p>
                    </div>
                  )}
                  {model.type === 'decision-tree' && (
                    <p className="text-xs text-slate-600">
                      Higher importance indicates features that contribute more to prediction accuracy
                    </p>
                  )}
                </div>
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}


