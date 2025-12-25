import type { ReactNode } from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { BrandLogo } from './BrandLogo';

// Generic issue type for design system (no domain-specific semantics)
export interface BannerIssue {
  type: string;
  count: number;
  severity?: 'high' | 'medium' | 'low';
}

export interface DataQualityBannerProps {
  /** List of issues to display */
  issues: BannerIssue[];
  /** Quality score (0-100) */
  qualityScore: number;
  /** Whether the banner is visible (controlled) */
  isVisible?: boolean;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: ReactNode;
  /** Custom icon */
  icon?: ReactNode;
  /** Primary action label */
  actionLabel?: string;
  /** Benefit text shown above CTA */
  benefitText?: string;
  /** Benefit description shown below benefit text */
  benefitDescription?: string;
  /** Callback when primary action is clicked */
  onAction?: () => void;
  /** Callback when dismiss is clicked */
  onDismiss?: () => void;
  /** @deprecated Use onAction instead */
  onCleanData?: () => void;
  /** @deprecated Use onAction instead */
  onClean?: () => void;
}

export function DataQualityBanner({
  issues,
  qualityScore,
  isVisible = true,
  title = 'Data Quality Check Complete',
  description,
  icon,
  actionLabel = 'Clean Data Now',
  benefitText = '✨ Improve AI accuracy by up to 40%',
  benefitDescription = 'Our AI-powered cleaning handles missing values, removes duplicates, and standardizes formats automatically',
  onAction,
  onDismiss,
  onCleanData,
  onClean,
}: DataQualityBannerProps) {
  // Support deprecated props
  const handleAction = onAction ?? onCleanData ?? onClean;

  if (!isVisible) return null;

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
    <Card className="p-5 bg-gradient-to-r from-brand-50 via-brand-50 to-brand-100 border-brand-200 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-200/30 to-brand-300/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-start gap-4">          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
              {icon ?? <BrandLogo className="w-6 h-6 text-white" />}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  {title}
                </h3>
                <p className="text-sm text-slate-600">
                  {description ?? (
                    <>We found <span className="font-semibold text-slate-900">{totalIssues} potential issues</span> that could affect AI analysis quality</>
                  )}
                </p>
              </div>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="text-slate-400 hover:text-slate-600 -mt-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
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
            </div>            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/80">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 mb-1">
                  {benefitText}
                </p>
                <p className="text-xs text-slate-600">
                  {benefitDescription}
                </p>
              </div>              <Button
                onClick={handleAction}
                className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-md whitespace-nowrap"
              >
                {actionLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}


