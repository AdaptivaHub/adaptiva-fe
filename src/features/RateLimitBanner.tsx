import { useAuth } from '../context/AuthContext';
import './RateLimitBanner.css';

interface RateLimitBannerProps {
  queriesUsed: number;
  queriesLimit: number;
  resetAt?: string;
  onSignUpClick: () => void;
}

export function RateLimitBanner({ 
  queriesUsed, 
  queriesLimit, 
  resetAt, 
  onSignUpClick 
}: RateLimitBannerProps) {
  const { isAuthenticated } = useAuth();
  
  // Don't show for authenticated users
  if (isAuthenticated) return null;
  
  const remaining = queriesLimit - queriesUsed;
  const isExhausted = remaining <= 0;
  
  // Format reset time
  const formatResetTime = () => {
    if (!resetAt) return 'soon';
    try {
      const reset = new Date(resetAt);
      const now = new Date();
      const hours = Math.ceil((reset.getTime() - now.getTime()) / (1000 * 60 * 60));
      if (hours <= 1) return 'in less than an hour';
      if (hours < 24) return `in ${hours} hours`;
      return 'tomorrow';
    } catch {
      return 'soon';
    }
  };

  if (isExhausted) {
    return (
      <div className="rate-limit-banner exhausted">
        <div className="rate-limit-content">
          <div className="rate-limit-icon">🚫</div>
          <div className="rate-limit-text">
            <strong>Daily AI limit reached</strong>
            <p>You've used all {queriesLimit} free AI queries. Limit resets {formatResetTime()}.</p>
          </div>
        </div>
        <button className="rate-limit-cta" onClick={onSignUpClick}>
          Sign up for unlimited access
        </button>
      </div>
    );
  }

  if (remaining === 1) {
    return (
      <div className="rate-limit-banner warning">
        <div className="rate-limit-content">
          <div className="rate-limit-icon">⚠️</div>
          <div className="rate-limit-text">
            <strong>Last free AI query!</strong>
            <p>Sign up now to keep using AI features without limits.</p>
          </div>
        </div>
        <button className="rate-limit-cta" onClick={onSignUpClick}>
          Create free account
        </button>
      </div>
    );
  }

  // Show subtle indicator for remaining queries
  if (queriesUsed > 0) {
    return (
      <div className="rate-limit-banner info">
        <div className="rate-limit-content">
          <div className="rate-limit-progress">
            <div 
              className="rate-limit-progress-bar" 
              style={{ width: `${(queriesUsed / queriesLimit) * 100}%` }}
            />
          </div>
          <span className="rate-limit-count">
            {remaining} of {queriesLimit} free AI queries remaining
          </span>
        </div>
        <button className="rate-limit-link" onClick={onSignUpClick}>
          Get unlimited →
        </button>
      </div>
    );
  }

  return null;
}
