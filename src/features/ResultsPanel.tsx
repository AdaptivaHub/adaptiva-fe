import React from 'react';
import './ResultsPanel.css';

interface ResultsPanelProps {
  title: string;
  content: string | Record<string, unknown>;
  type?: 'info' | 'success' | 'error';
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ 
  title, 
  content, 
  type = 'info' 
}) => {
  if (!content) {
    return null;
  }

  const renderContent = () => {
    if (typeof content === 'string') {
      return <p className="results-text">{content}</p>;
    }
    
    if (typeof content === 'object') {
      return (
        <pre className="results-json">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
    }
    
    return <p className="results-text">{String(content)}</p>;
  };

  return (
    <div className={`results-panel ${type}`}>
      <h3 className="results-title">{title}</h3>
      <div className="results-content">
        {renderContent()}
      </div>
    </div>
  );
};


