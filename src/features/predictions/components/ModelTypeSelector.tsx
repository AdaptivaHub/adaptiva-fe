import { TrendingUp, GitBranch } from 'lucide-react';
import { cn } from '@design/components/ui/utils';
import type { ModelType } from '@/types';

interface ModelTypeSelectorProps {
  selectedType: ModelType;
  onTypeChange: (type: ModelType) => void;
  className?: string;
}

export function ModelTypeSelector({ selectedType, onTypeChange, className }: ModelTypeSelectorProps) {
  const modelTypes = [
    {
      id: 'linear-regression' as const,
      name: 'Linear Regression',
      icon: TrendingUp,
      description: 'Predict continuous numerical values',
      example: 'Sales, revenue, prices',
      color: 'indigo',
    },
    {
      id: 'decision-tree' as const,
      name: 'Decision Tree',
      icon: GitBranch,
      description: 'Classification or regression with rules',
      example: 'Categories, segments, values',
      color: 'green',
    },
  ];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {modelTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType === type.id;
        
        return (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={cn(
              'relative p-4 rounded-lg border-2 text-left transition-all duration-200',
              'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2',
              isSelected
                ? `border-${type.color}-500 bg-${type.color}-50 focus:ring-${type.color}-500`
                : 'border-slate-200 bg-white hover:border-slate-300 focus:ring-slate-400'
            )}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-full bg-${type.color}-500 flex items-center justify-center`}>
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                isSelected ? `bg-${type.color}-100` : 'bg-slate-100'
              )}>
                <Icon className={cn(
                  'w-5 h-5',
                  isSelected ? `text-${type.color}-600` : 'text-slate-600'
                )} />
              </div>
              
              <div className="flex-1">
                <h4 className={cn(
                  'font-semibold mb-1',
                  isSelected ? `text-${type.color}-900` : 'text-slate-900'
                )}>
                  {type.name}
                </h4>
                <p className="text-xs text-slate-600 mb-2">
                  {type.description}
                </p>
                <p className="text-xs text-slate-500">
                  <span className="font-medium">Best for:</span> {type.example}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}


