import { useState } from 'react';
import { Upload } from './components/Upload';
import { Preview } from './components/Preview';
import { Controls } from './components/Controls';
import { ChartView } from './components/ChartView';
import { ResultsPanel } from './components/ResultsPanel';
import { useCleanData } from './hooks/useCleanData';
import { useInsights } from './hooks/useInsights';
import { useChart, type ChartResult } from './hooks/useChart';
import { usePredict } from './hooks/usePredict';
import { useExport } from './hooks/useExport';
import { api } from './utils/api';
import type { UploadedData, ChartSettings } from './types';
import './App.css';

function App() {
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
  const [instructions, setInstructions] = useState('');
  const [chartResult, setChartResult] = useState<ChartResult | null>(null);
  const [insights, setInsights] = useState<string | Record<string, unknown> | null>(null);
  const [predictions, setPredictions] = useState<string | Record<string, unknown> | null>(null);
  const { cleanData, loading: cleanLoading, error: cleanError, result: cleaningResult } = useCleanData();
  const { getInsights, loading: insightsLoading, error: insightsError } = useInsights();
  const { generateChart, generateManualChart, loading: chartLoading, error: chartError } = useChart();
  const { predict, loading: predictLoading, error: predictError } = usePredict();
  const { exportData, loading: exportLoading, error: exportError } = useExport();

  const isLoading = cleanLoading || insightsLoading || chartLoading || predictLoading || exportLoading;
  const handleDataLoaded = (data: UploadedData) => {
    setUploadedData(data);
    setChartResult(null);
    setInsights(null);
    setPredictions(null);
  };

  const handleSheetChange = async (sheetName: string) => {
    if (!uploadedData?.fileId) return;

    try {
      // Fetch preview data for the selected sheet
      const previewResult = await api.getFormattedPreview(uploadedData.fileId, 100, sheetName);
      
      if (previewResult.success && previewResult.data) {
        // Update the uploaded data with the new sheet's data
        setUploadedData({
          fileId: uploadedData.fileId,
          sheets: uploadedData.sheets,
          activeSheet: sheetName,
          data: previewResult.data.data,
          headers: previewResult.data.headers,
        });
        
        // Clear previous analysis results when switching sheets
        setChartResult(null);
        setInsights(null);
        setPredictions(null);
      }
    } catch (error) {
      console.error('Error loading sheet:', error);
    }
  };
  const handleCleanData = async () => {
    if (!uploadedData?.fileId) return;
    
    // Pass sheet_name for Excel files to ensure correct sheet is cleaned
    const result = await cleanData(uploadedData.fileId, { 
      sheetName: uploadedData.activeSheet 
    });
    if (result) {
      // Data was cleaned on the server, show summary
      console.log('Cleaning result:', result.message);
      console.log('Operations performed:', result.operations_log);
      
      // Fetch the updated preview data to reflect cleaning changes
      const previewResult = await api.getFormattedPreview(
        uploadedData.fileId, 
        100, 
        uploadedData.activeSheet
      );
      
      if (previewResult.success && previewResult.data) {
        // Update both data AND headers from the preview response
        setUploadedData({
          fileId: uploadedData.fileId,
          sheets: uploadedData.sheets,
          activeSheet: uploadedData.activeSheet,
          data: previewResult.data.data,
          headers: previewResult.data.headers,
        });
        
        console.log('Updated headers:', previewResult.data.headers);
        console.log('Updated data preview:', previewResult.data.data.slice(0, 2));
      }
    }
  };

  const handleGetInsights = async () => {
    if (!uploadedData) return;
    
    const result = await getInsights(uploadedData.data);
    if (result) {
      setInsights(result);
    }
  };
  const handleGenerateChart = async () => {
    if (!uploadedData || !uploadedData.fileId) {
      return;
    }
    
    // Pass sheet_name for Excel files to ensure correct sheet is used
    const result = await generateChart(
      uploadedData.fileId, 
      instructions,
      uploadedData.activeSheet
    );
    if (result) {
      setChartResult(result);
    }
  };

  const handlePredict = async () => {
    if (!uploadedData) return;
    
    const result = await predict(uploadedData.data, instructions);
    if (result) {
      setPredictions(result);
    }
  };
  const handleExport = async () => {
    if (!uploadedData) return;
    
    await exportData(uploadedData.data, 'csv');
  };

  const handleUpdateChartSettings = async (settings: ChartSettings) => {
    if (!uploadedData?.fileId) return;
    
    const result = await generateManualChart(
      uploadedData.fileId,
      settings,
      uploadedData.activeSheet
    );
    
    if (result) {
      setChartResult(result);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Data Analysis AI Tool</h1>
        <p>Upload your CSV or XLSX file to get started with AI-powered data analysis</p>
      </header>      <main className="app-main">
        <Upload onDataLoaded={handleDataLoaded} />

        {uploadedData && (
          <>
            <Preview 
              data={uploadedData.data} 
              headers={uploadedData.headers}
              sheets={uploadedData.sheets}
              activeSheet={uploadedData.activeSheet}
              onSheetChange={handleSheetChange}
            />

            {cleaningResult && (
              <ResultsPanel 
                title="Data Cleaning Results" 
                content={{
                  message: cleaningResult.message,
                  summary: `${cleaningResult.rows_before} → ${cleaningResult.rows_after} rows, ${cleaningResult.columns_before} → ${cleaningResult.columns_after} columns`,
                  operations: cleaningResult.operations_log.map(op => 
                    `${op.operation}: ${op.details} (${op.affected_count} affected)`
                  ).join('\n'),
                  columnChanges: cleaningResult.column_changes.renamed && Object.keys(cleaningResult.column_changes.renamed).length > 0
                    ? `Renamed: ${Object.entries(cleaningResult.column_changes.renamed).map(([old, newName]) => `"${old}" → "${newName}"`).join(', ')}`
                    : undefined,
                  droppedColumns: cleaningResult.column_changes.dropped.length > 0
                    ? `Dropped: ${cleaningResult.column_changes.dropped.join(', ')}`
                    : undefined,
                }}
                type="success" 
              />
            )}

            <Controls
              onCleanData={handleCleanData}
              onGetInsights={handleGetInsights}
              onGenerateChart={handleGenerateChart}
              onPredict={handlePredict}
              onExport={handleExport}
              disabled={isLoading || !uploadedData}
              chartDisabled={!uploadedData?.fileId}
              instructions={instructions}
              onInstructionsChange={setInstructions}
            />

            {isLoading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Processing your request...</p>
              </div>
            )}            {(cleanError || insightsError || chartError || predictError || exportError) && (
              <div className="error-message">
                {cleanError || insightsError || chartError || predictError || exportError}
              </div>
            )}

            {insights && (
              <ResultsPanel title="AI Insights" content={insights} type="info" />
            )}

            {predictions && (
              <ResultsPanel title="Predictions" content={predictions} type="success" />
            )}            {chartResult && (
              <ChartView 
                chartData={chartResult.chartJson} 
                explanation={chartResult.explanation}
                generatedCode={chartResult.generatedCode}
                chartSettings={chartResult.chartSettings}
                columns={uploadedData?.headers || []}
                onUpdateChart={handleUpdateChartSettings}
                isUpdating={chartLoading}
              />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by React, Vite, and AI</p>
      </footer>
    </div>
  );
}

export default App;
