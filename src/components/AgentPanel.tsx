import { useState } from 'react';
import { useAgents } from '../hooks/useAgents';
import type { ForecastResponse, MarketingStrategyResponse, ContentGenerationResponse, AgentPipelineResponse } from '../types';
import './AgentPanel.css';

interface AgentPanelProps {
  fileId: string | undefined;
}

export function AgentPanel({ fileId }: AgentPanelProps) {
  const {
    forecast,
    marketingStrategy,
    adContent,
    pipelineResult,
    generateForecast,
    generateMarketingStrategy,
    generateAdContent,
    runPipeline,
    loading,
    error,
    clearResults,
  } = useAgents();

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [forecastPeriods, setForecastPeriods] = useState(30);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'forecast' | 'marketing' | 'content'>('pipeline');

  if (!fileId) {
    return (
      <div className="agent-panel">
        <div className="agent-panel-empty">
          <p>Upload a file to use AI agents</p>
        </div>
      </div>
    );
  }

  const handleRunPipeline = async () => {
    await runPipeline(fileId, {
      businessName: businessName || undefined,
      businessType: businessType || undefined,
      targetAudience: targetAudience || undefined,
      forecastPeriods,
    });
  };

  const handleGenerateForecast = async () => {
    await generateForecast(fileId, undefined, undefined, forecastPeriods);
  };

  const handleGenerateMarketing = async () => {
    await generateMarketingStrategy(fileId, {
      businessName: businessName || undefined,
      businessType: businessType || undefined,
      targetAudience: targetAudience || undefined,
      forecastTrend: forecast?.trend,
    });
  };

  const handleGenerateContent = async () => {
    if (!marketingStrategy?.campaigns?.[0]) {
      return;
    }
    const campaign = marketingStrategy.campaigns[0];
    await generateAdContent(
      campaign.campaign_name,
      campaign.theme,
      campaign.target_audience,
      campaign.tactics
    );
  };

  return (
    <div className="agent-panel">
      <div className="agent-panel-header">
        <h2>🤖 AI Agents</h2>
        <button className="clear-btn" onClick={clearResults} disabled={loading}>
          Clear Results
        </button>
      </div>

      {/* Business Context Inputs */}
      <div className="agent-context-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Business Type (e.g., retail, e-commerce)"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            placeholder="Target Audience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            disabled={loading}
          />
          <input
            type="number"
            placeholder="Forecast Days"
            value={forecastPeriods}
            min={1}
            max={365}
            onChange={(e) => setForecastPeriods(Number(e.target.value))}
            disabled={loading}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="agent-tabs">
        <button
          className={activeTab === 'pipeline' ? 'active' : ''}
          onClick={() => setActiveTab('pipeline')}
        >
          🚀 Full Pipeline
        </button>
        <button
          className={activeTab === 'forecast' ? 'active' : ''}
          onClick={() => setActiveTab('forecast')}
        >
          📈 Forecast
        </button>
        <button
          className={activeTab === 'marketing' ? 'active' : ''}
          onClick={() => setActiveTab('marketing')}
        >
          🎯 Marketing
        </button>
        <button
          className={activeTab === 'content' ? 'active' : ''}
          onClick={() => setActiveTab('content')}
        >
          🎨 Content
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="agent-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Tab Content */}
      <div className="agent-tab-content">
        {activeTab === 'pipeline' && (
          <div className="agent-section">
            <p className="section-description">
              Run the complete AI pipeline: Insights → Forecast → Marketing → Content
            </p>
            <button
              className="agent-action-btn primary"
              onClick={handleRunPipeline}
              disabled={loading}
            >
              {loading ? 'Running Pipeline...' : '🚀 Run Full Pipeline'}
            </button>
            {pipelineResult && <PipelineResults result={pipelineResult} />}
          </div>
        )}

        {activeTab === 'forecast' && (
          <div className="agent-section">
            <p className="section-description">
              Generate time-series predictions using Prophet
            </p>
            <button
              className="agent-action-btn"
              onClick={handleGenerateForecast}
              disabled={loading}
            >
              {loading ? 'Generating...' : '📈 Generate Forecast'}
            </button>
            {forecast && <ForecastResults result={forecast} />}
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="agent-section">
            <p className="section-description">
              AI-powered marketing strategy based on your data
            </p>
            <button
              className="agent-action-btn"
              onClick={handleGenerateMarketing}
              disabled={loading}
            >
              {loading ? 'Generating...' : '🎯 Generate Strategy'}
            </button>
            {marketingStrategy && <MarketingResults result={marketingStrategy} />}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="agent-section">
            <p className="section-description">
              Generate ad content with AI (requires marketing strategy first)
            </p>
            <button
              className="agent-action-btn"
              onClick={handleGenerateContent}
              disabled={loading || !marketingStrategy?.campaigns?.[0]}
            >
              {loading ? 'Generating...' : '🎨 Generate Ad Content'}
            </button>
            {!marketingStrategy?.campaigns?.[0] && (
              <p className="hint">Generate a marketing strategy first</p>
            )}
            {adContent && <ContentResults result={adContent} />}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components for displaying results

function PipelineResults({ result }: { result: AgentPipelineResponse }) {
  return (
    <div className="agent-results">
      <h4>Pipeline Complete</h4>
      <p className="steps-completed">
        Steps: {result.steps_completed.join(' → ')}
      </p>
      
      {result.insights_summary && (
        <div className="result-section">
          <h5>📊 Insights</h5>
          <p>{result.insights_summary}</p>
        </div>
      )}

      {result.forecast_summary && (
        <div className="result-section">
          <h5>📈 Forecast</h5>
          <p>
            <strong>Target:</strong> {result.forecast_summary.target_column}<br />
            <strong>Trend:</strong> {result.forecast_summary.trend}<br />
            <strong>Avg Prediction:</strong> {result.forecast_summary.average_prediction?.toFixed(2)}
          </p>
        </div>
      )}

      {result.marketing_strategy && (
        <div className="result-section">
          <h5>🎯 Marketing</h5>
          <p>{result.marketing_strategy.strategy_summary}</p>
          {result.marketing_strategy.campaigns?.map((c, i) => (
            <div key={i} className="campaign-card">
              <strong>{c.campaign_name}</strong>
              <p>{c.theme}</p>
            </div>
          ))}
        </div>
      )}

      {result.ad_content && (
        <div className="result-section">
          <h5>🎨 Ad Content</h5>
          <p><strong>{result.ad_content.content.headline}</strong></p>
          <p>{result.ad_content.content.main_caption}</p>
          {result.ad_content.content.image_url && (
            <img 
              src={result.ad_content.content.image_url} 
              alt="Generated ad" 
              className="generated-image"
            />
          )}
        </div>
      )}
    </div>
  );
}

function ForecastResults({ result }: { result: ForecastResponse }) {
  return (
    <div className="agent-results">
      <h4>Forecast Results</h4>
      <div className="forecast-summary">
        <p><strong>Column:</strong> {result.target_column}</p>
        <p><strong>Periods:</strong> {result.periods} days</p>
        <p><strong>Trend:</strong> <span className={`trend-${result.trend}`}>{result.trend}</span></p>
        <p><strong>Avg Prediction:</strong> {result.average_prediction.toFixed(2)}</p>
        <p><strong>Training Points:</strong> {result.training_data_points}</p>
      </div>
      <div className="forecast-table">
        <h5>Predictions (first 10)</h5>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Predicted</th>
              <th>Lower</th>
              <th>Upper</th>
            </tr>
          </thead>
          <tbody>
            {result.predictions.slice(0, 10).map((p, i) => (
              <tr key={i}>
                <td>{p.date}</td>
                <td>{p.predicted_value.toFixed(2)}</td>
                <td>{p.lower_bound.toFixed(2)}</td>
                <td>{p.upper_bound.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarketingResults({ result }: { result: MarketingStrategyResponse }) {
  return (
    <div className="agent-results">
      <h4>Marketing Strategy</h4>
      <p className="strategy-summary">{result.strategy_summary}</p>
      
      {result.key_insights?.length > 0 && (
        <div className="insights-list">
          <h5>Key Insights</h5>
          <ul>
            {result.key_insights.map((insight, i) => (
              <li key={i}>{insight}</li>
            ))}
          </ul>
        </div>
      )}

      <h5>Campaigns</h5>
      {result.campaigns.map((campaign, i) => (
        <div key={i} className="campaign-card">
          <h6>{campaign.campaign_name}</h6>
          <p><strong>Theme:</strong> {campaign.theme}</p>
          <p><strong>Timing:</strong> {campaign.timing}</p>
          <p><strong>Audience:</strong> {campaign.target_audience}</p>
          <p><strong>Tactics:</strong></p>
          <ul>
            {campaign.tactics.map((t, j) => (
              <li key={j}>{t}</li>
            ))}
          </ul>
          <p><strong>Expected Outcome:</strong> {campaign.expected_outcome}</p>
        </div>
      ))}
    </div>
  );
}

function ContentResults({ result }: { result: ContentGenerationResponse }) {
  return (
    <div className="agent-results">
      <h4>Generated Ad Content</h4>
      <p className="platform-badge">{result.platform}</p>
      
      <div className="ad-preview">
        <h5>{result.content.headline}</h5>
        <p className="caption">{result.content.main_caption}</p>
        <p className="description">{result.content.long_description}</p>
        
        <div className="hashtags">
          {result.content.hashtags.map((tag, i) => (
            <span key={i} className="hashtag">{tag}</span>
          ))}
        </div>
        
        <button className="cta-preview">{result.content.call_to_action}</button>
        
        {result.content.image_url && (
          <div className="image-preview">
            <h6>Generated Image</h6>
            <img 
              src={result.content.image_url} 
              alt="AI generated ad visual" 
              className="generated-image"
            />
            <p className="image-prompt">{result.content.image_prompt}</p>
          </div>
        )}
      </div>
    </div>
  );
}
