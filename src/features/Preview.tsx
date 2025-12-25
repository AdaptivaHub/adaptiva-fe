import React from 'react';
import type { DataRow } from '../types';
import './Preview.css';

interface PreviewProps {
  data: DataRow[];
  headers: string[];
  sheets?: string[];
  activeSheet?: string;
  onSheetChange?: (sheetName: string) => void;
}

export const Preview: React.FC<PreviewProps> = ({ data, headers, sheets, activeSheet, onSheetChange }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Show first 100 rows for performance
  const displayData = data.slice(0, 100);
  return (
    <div className="preview-container">
      <div className="preview-header">
        <h3>Data Preview</h3>
        <span className="row-count">
          Showing {displayData.length} of {data.length} rows
        </span>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, colIndex) => (
                  <td key={colIndex}>{String(row[header] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sheets && sheets.length > 1 && (
        <div className="sheet-selector">
          <span className="sheet-label">Sheets:</span>
          <div className="sheet-buttons">
            {sheets.map((sheet) => (
              <button
                key={sheet}
                className={`sheet-button ${sheet === activeSheet ? 'active' : ''}`}
                onClick={() => onSheetChange?.(sheet)}
                disabled={!onSheetChange}
              >
                {sheet}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


