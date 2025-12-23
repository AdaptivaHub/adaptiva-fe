import { useState } from 'react';
import { Sparkles, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface DataQualityIssue {
  type: 'missing' | 'duplicates' | 'formatting' | 'outliers';
  count: number;
  severity: 'high' | 'medium' | 'low';
}

interface DataQualityBannerProps {
  issues: DataQualityIssue[];
  qualityScore: number;
  onCleanData: () => void;
  onDismiss: () => void;
}

export function DataQualityBanner({
  issues,
  qualityScore,
  onCleanData,
  onDismiss,
}: DataQualityBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-orange-500';
  };

  const totalIssues = issues.reduce((sum, issue) => sum + issue.count, 0);

  return (
    <Card className="p-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Data Quality Check Complete
                </h3>
                <p className="text-sm text-slate-600">
                  We found <span className="font-semibold text-slate-900">{totalIssues} potential issues</span> that could affect AI analysis quality
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600 -mt-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Quality Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Data Quality Score
                </span>
                <span className={`text-2xl font-bold ${getScoreColor(qualityScore)}`}>
                  {qualityScore}%
                </span>
              </div>
              <Progress 
                value={qualityScore} 
                className="h-2"
                indicatorClassName={`bg-gradient-to-r ${getScoreGradient(qualityScore)}`}
              />
            </div>

            {/* Issues List */}
            <div className="flex flex-wrap gap-2 mb-4">
              {issues.map((issue, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-white/80 text-slate-700 border border-slate-200"
                >
                  <AlertTriangle className="w-3 h-3 mr-1 text-yellow-600" />
                  {issue.count} {issue.type}
                </Badge>
              ))}
            </div>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/80">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 mb-1">
                  ✨ Improve AI accuracy by up to 40%
                </p>
                <p className="text-xs text-slate-600">
                  Our AI-powered cleaning handles missing values, removes duplicates, and standardizes formats automatically
                </p>
              </div>
              <Button
                onClick={onCleanData}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md whitespace-nowrap"
              >
                Clean Data Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
