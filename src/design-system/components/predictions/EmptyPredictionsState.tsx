import { Brain, TrendingUp, GitBranch } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface EmptyPredictionsStateProps {
  onCreateModel: () => void;
}

export function EmptyPredictionsState({ onCreateModel }: EmptyPredictionsStateProps) {
  const models = [
    {
      icon: TrendingUp,
      name: 'Linear Regression',
      description: 'Predict continuous numerical values',
      examples: 'Sales forecasting, price prediction, demand estimation',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: GitBranch,
      name: 'Decision Tree',
      description: 'Classification and regression with interpretable rules',
      examples: 'Customer segmentation, risk classification, value prediction',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="text-center max-w-5xl mx-auto py-12">
      {/* Header */}
      <div className="mb-12">        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 mb-6 shadow-lg shadow-brand-500/50">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Predictive Analytics
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Build machine learning models to predict future outcomes and discover patterns in your data
        </p>
      </div>

      {/* Model Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {models.map((model, index) => {
          const Icon = model.icon;
          return (
            <Card
              key={index}
              className="p-6 text-left hover:shadow-lg transition-all duration-200 border-slate-200"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg ${model.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${model.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {model.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {model.description}
                  </p>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-slate-700 mb-1">Use Cases:</p>
                    <p className="text-xs text-slate-600">{model.examples}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Features List */}
      <Card className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div>          <div className="flex items-center gap-2 mb-2">
              <BrandLogo className="w-4 h-4 text-brand-600" />
              <h4 className="font-semibold text-slate-900">Multiple Features</h4>
            </div>
            <p className="text-sm text-slate-600">
              Select multiple input variables to improve prediction accuracy
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BrandLogo className="w-4 h-4 text-brand-500" />
              <h4 className="font-semibold text-slate-900">Auto Validation</h4>
            </div>
            <p className="text-sm text-slate-600">
              Automatic data cleaning, encoding, and quality checks
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BrandLogo className="w-4 h-4 text-brand-400" />
              <h4 className="font-semibold text-slate-900">Visual Insights</h4>
            </div>
            <p className="text-sm text-slate-600">
              Interactive charts, feature importance, and model metrics
            </p>
          </div>
        </div>
      </Card>

      {/* CTA */}      <Button
        onClick={onCreateModel}
        size="lg"
        className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-lg text-base px-8"
      >
        <Brain className="w-5 h-5 mr-2" />
        Create Your First Model
      </Button>
    </div>
  );
}


