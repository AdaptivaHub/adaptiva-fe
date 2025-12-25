import React from 'react';
import './Controls.css';

interface ControlsProps {
  onCleanData: () => void;
  onGetInsights: () => void;
  onGenerateChart: () => void;
  onPredict: () => void;
  onExport: () => void;
  disabled: boolean;
  chartDisabled?: boolean;
  instructions: string;
  onInstructionsChange: (instructions: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  onCleanData,
  onGetInsights,
  onGenerateChart,
  onPredict,
  onExport,
  disabled,
  chartDisabled = false,
  instructions,
  onInstructionsChange,
}) => {
  return (
    <div className="controls-container">
      <div className="instructions-section">
        <label htmlFor="instructions" className="instructions-label">
          Instructions
        </label>
        <textarea
          id="instructions"
          className="instructions-textarea"
          placeholder="Enter specific instructions for data analysis, predictions, or chart generation..."
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          rows={3}
          disabled={disabled}
        />
      </div>
      
      <div className="buttons-section">
        <button
          className="control-button clean"
          onClick={onCleanData}
          disabled={disabled}
          title="Clean and preprocess the data"
        >
          <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clean Data
        </button>

        <button
          className="control-button insights"
          onClick={onGetInsights}
          disabled={disabled}
          title="Get AI-powered insights from the data"
        >
          <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Insights
        </button>

        <button
          className="control-button chart"
          onClick={onGenerateChart}
          disabled={disabled || chartDisabled}
          title={chartDisabled ? "Backend connection required for AI chart generation" : "Generate AI-powered visualizations from the data"}
        >
          <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Chart
        </button>

        <button
          className="control-button predict"
          onClick={onPredict}
          disabled={disabled}
          title="Make predictions based on the data"
        >
          <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Predict
        </button>

        <button
          className="control-button export"
          onClick={onExport}
          disabled={disabled}
          title="Export processed data"
        >
          <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>
    </div>
  );
};


