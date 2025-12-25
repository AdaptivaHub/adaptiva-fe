import { Lightbulb, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { Card } from '@design/components/ui/card';
import { Badge } from '@design/components/ui/badge';
import type { ChartType } from './ChartTypeSelector';

interface ChartSuggestionsProps {
  headers: string[];
  data: Record<string, unknown>[];
  onSuggestionClick: (suggestion: { prompt: string; type: ChartType }) => void;
}

export function ChartSuggestions({ headers, data, onSuggestionClick }: ChartSuggestionsProps) {
  // Generate smart suggestions based on data
  const suggestions = generateSuggestions(headers, data);

  if (suggestions.length === 0) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500 rounded-lg">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-amber-900 mb-2">Smart Suggestions</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => {
              const Icon = getSuggestionIcon(suggestion.type);
              return (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-amber-200 hover:border-amber-400 hover:shadow-sm transition-all text-sm group"
                >
                  <Icon className="w-4 h-4 text-amber-600 group-hover:text-amber-700" />
                  <span className="text-slate-700">{suggestion.prompt}</span>
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                    {suggestion.type}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

function generateSuggestions(headers: string[], data: Record<string, unknown>[]) {
  const suggestions: Array<{ prompt: string; type: ChartType }> = [];

  // Analyze column types
  const numericColumns = headers.filter(header => 
    data.length > 0 && typeof data[0][header] === 'number'
  );
  const textColumns = headers.filter(header => 
    data.length > 0 && typeof data[0][header] === 'string'
  );
  const dateColumns = headers.filter(header => 
    header.toLowerCase().includes('date') || header.toLowerCase().includes('time')
  );

  // Time series suggestion
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    suggestions.push({
      prompt: `Show ${numericColumns[0]} over ${dateColumns[0]}`,
      type: 'line',
    });
  }

  // Category comparison
  if (textColumns.length > 0 && numericColumns.length > 0) {
    suggestions.push({
      prompt: `Compare ${numericColumns[0]} by ${textColumns[0]}`,
      type: 'bar',
    });
  }

  // Distribution/composition
  if (textColumns.length > 0 && numericColumns.length > 0) {
    suggestions.push({
      prompt: `${textColumns[0]} distribution`,
      type: 'pie',
    });
  }

  // Distribution histogram for numeric columns
  if (numericColumns.length > 0) {
    suggestions.push({
      prompt: `Distribution of ${numericColumns[0]}`,
      type: 'histogram',
    });
  }

  // Correlation
  if (numericColumns.length >= 2) {
    suggestions.push({
      prompt: `${numericColumns[0]} vs ${numericColumns[1]} correlation`,
      type: 'scatter',
    });
  }

  return suggestions.slice(0, 4); // Limit to 4 suggestions
}

function getSuggestionIcon(type: string) {
  switch (type) {
    case 'line':
      return TrendingUp;
    case 'pie':
      return PieChart;
    case 'bar':
      return BarChart3;
    default:
      return TrendingUp;
  }
}


