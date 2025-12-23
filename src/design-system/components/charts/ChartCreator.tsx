import { useState } from 'react';
import { Sparkles, Plus, Wand2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ChartTypeSelector } from './ChartTypeSelector';
import { ChartPreview } from './ChartPreview';
import { ChartSuggestions } from './ChartSuggestions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'composed';
  xAxis?: string;
  yAxis?: string | string[];
  data: Record<string, unknown>[];
  colors?: string[];
  prompt?: string;
  createdAt: Date;
}

// Configuration for creating a new chart (without id/createdAt)
export interface ChartCreationConfig {
  title: string;
  type: ChartConfig['type'];
  xAxis?: string;
  yAxis?: string;
  prompt?: string;
}

interface ChartCreatorProps {
  headers: string[];
  data: Record<string, unknown>[];
  /** Called when chart is created manually */
  onChartCreated: (config: ChartCreationConfig, data: Record<string, unknown>[]) => void;
  /** Called when AI generation is requested (app layer handles API call) */
  onAIGenerate?: (prompt: string, config: ChartCreationConfig) => void;
  /** Whether AI generation is in progress */
  isGenerating?: boolean;
  onClose?: () => void;
  /** Default colors for charts */
  defaultColors?: string[];
}

export function ChartCreator({ 
  headers, 
  data, 
  onChartCreated, 
  onAIGenerate,
  isGenerating = false,
}: ChartCreatorProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [chartType, setChartType] = useState<ChartConfig['type']>('bar');
  const [xAxis, setXAxis] = useState<string>(headers[0] || '');
  const [yAxis, setYAxis] = useState<string>(headers[1] || '');
  const [chartTitle, setChartTitle] = useState('');

  const handleAIGenerate = () => {
    if (!aiPrompt.trim() || !onAIGenerate) return;
    
    const config: ChartCreationConfig = {
      title: chartTitle || aiPrompt.slice(0, 50),
      type: chartType,
      xAxis,
      yAxis,
      prompt: aiPrompt,
    };
    
    onAIGenerate(aiPrompt, config);
  };

  const handleManualCreate = () => {
    if (!xAxis || (!yAxis && chartType !== 'pie')) return;
    
    const config: ChartCreationConfig = {
      title: chartTitle || `${yAxis} by ${xAxis}`,
      type: chartType,
      xAxis,
      yAxis,
    };
    
    onChartCreated(config, data);
  };

  const handleSuggestionClick = (suggestion: { prompt: string; type: ChartConfig['type'] }) => {
    setAiPrompt(suggestion.prompt);
    setChartType(suggestion.type);
  };

  return (
    <div className="space-y-6">
      {/* AI Suggestions */}
      <ChartSuggestions 
        headers={headers}
        data={data}
        onSuggestionClick={handleSuggestionClick}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Create Chart
            </h3>
            <p className="text-sm text-slate-600">
              Describe your visualization or configure it manually
            </p>
          </div>

          {/* AI Prompt */}
          <div className="space-y-2">
            <Label htmlFor="ai-prompt" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              AI Assistant
            </Label>
            <div className="flex gap-2">
              <Input
                id="ai-prompt"
                placeholder="e.g., Show sales trends over time as a line chart"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                className="flex-1"
              />
              <Button 
                onClick={handleAIGenerate}
                disabled={!aiPrompt.trim() || isGenerating}
                className="bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </div>
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Or configure your chart manually below
            </p>
          </div>

          <div className="border-t pt-6 space-y-4">
            {/* Chart Title */}
            <div className="space-y-2">
              <Label htmlFor="chart-title">Chart Title</Label>
              <Input
                id="chart-title"
                placeholder="Enter chart title"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
              />
            </div>

            {/* Chart Type */}
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <ChartTypeSelector
                value={chartType}
                onChange={setChartType}
              />
            </div>

            {/* X Axis */}
            <div className="space-y-2">
              <Label htmlFor="x-axis">X-Axis</Label>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger id="x-axis">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Y Axis */}
            {chartType !== 'pie' && (
              <div className="space-y-2">
                <Label htmlFor="y-axis">Y-Axis</Label>
                <Select value={yAxis} onValueChange={setYAxis}>
                  <SelectTrigger id="y-axis">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Create Button */}
            <Button
              onClick={handleManualCreate}
              disabled={!xAxis || (!yAxis && chartType !== 'pie')}
              className="w-full"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Chart
            </Button>
          </div>
        </Card>

        {/* Right: Live Preview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <ChartPreview
            type={chartType}
            xAxis={xAxis}
            yAxis={yAxis}
            data={data.slice(0, 20)} // Limit preview data
            title={chartTitle}
          />
        </Card>
      </div>
    </div>
  );
}
