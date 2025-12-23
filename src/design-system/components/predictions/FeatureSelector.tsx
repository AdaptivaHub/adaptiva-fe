import { Hash, Type, Check } from 'lucide-react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';

interface FeatureSelectorProps {
  features: string[];
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
  columnTypes: Record<string, 'numerical' | 'categorical'>;
}

export function FeatureSelector({ 
  features, 
  selectedFeatures, 
  onFeaturesChange,
  columnTypes 
}: FeatureSelectorProps) {
  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      onFeaturesChange(selectedFeatures.filter(f => f !== feature));
    } else {
      onFeaturesChange([...selectedFeatures, feature]);
    }
  };

  const selectAll = () => {
    onFeaturesChange(features);
  };

  const clearAll = () => {
    onFeaturesChange([]);
  };

  return (
    <div className="space-y-3">
      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={selectAll}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Select All
        </button>
        <span className="text-xs text-slate-400">•</span>
        <button
          onClick={clearAll}
          className="text-xs text-slate-600 hover:text-slate-700 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
        {features.map((feature) => {
          const isSelected = selectedFeatures.includes(feature);
          const type = columnTypes[feature];
          const Icon = type === 'numerical' ? Hash : Type;

          return (
            <button
              key={feature}
              onClick={() => toggleFeature(feature)}
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg border text-left transition-all',
                'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500',
                isSelected
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  'w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0',
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-slate-300 bg-white'
                )}
              >
                {isSelected && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>

              {/* Feature Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-medium truncate',
                    isSelected ? 'text-indigo-900' : 'text-slate-700'
                  )}>
                    {feature}
                  </span>
                </div>
              </div>

              {/* Type Badge */}
              <Badge
                variant="secondary"
                className={cn(
                  'flex items-center gap-1 text-xs flex-shrink-0',
                  isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                )}
              >
                <Icon className="w-3 h-3" />
                {type}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      {selectedFeatures.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="flex-1">
            <p className="text-sm font-medium text-indigo-900">
              {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-xs text-indigo-600 mt-0.5">
              {selectedFeatures.join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
