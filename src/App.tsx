import { useState } from 'react';
import { Upload } from './components/Upload';
import { Preview } from './components/Preview';
import { Controls } from './components/Controls';
import { ChartView } from './components/ChartView';
import { ResultsPanel } from './components/ResultsPanel';
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
import { RateLimitBanner } from './components/RateLimitBanner';
import { useAuth } from './context/AuthContext';
import { useCleanData } from './hooks/useCleanData';
import { useInsights } from './hooks/useInsights';
import { useChart } from './hooks/useChart';
import { usePredict } from './hooks/usePredict';
import { useExport } from './hooks/useExport';
import { api } from './utils/api';
import type { UploadedData } from './types';
import './App.css';

function App() {
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
  const [instructions, setInstructions] = useState('');
  const [insights, setInsights] = useState<string | Record<string, unknown> | null>(null);
  const [predictions, setPredictions] = useState<string | Record<string, unknown> | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const { isAuthenticated } = useAuth();
  const { cleanData, loading: cleanLoading, error: cleanError, result: cleaningResult } = useCleanData();
  const { getInsights, loading: insightsLoading, error: insightsError } = useInsights();
  const { 
    spec,
    chartJson,
    explanation,
    confidence,
    rateLimit,
    loading: chartLoading,
    suggesting: chartSuggesting,
    error: chartError,
    suggest,
    render,
    setSpec,
    reset: resetChart,
  } = useChart();
  const { predict, loading: predictLoading, error: predictError } = usePredict();
  const { exportData, loading: exportLoading, error: exportError } = useExport();

  const isLoading = cleanLoading || insightsLoading || chartLoading || chartSuggesting || predictLoading || exportLoading;

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const handleDataLoaded = (data: UploadedData) => {
    setUploadedData(data);
    resetChart();
    setInsights(null);
    setPredictions(null);
  };

  const handleSheetChange = async (sheetName: string) => {
    if (!uploadedData?.fileId) return;

    try {
      const previewResult = await api.getFormattedPreview(uploadedData.fileId, 100, sheetName);

      if (previewResult.success && previewResult.data) {
        setUploadedData({
          fileId: uploadedData.fileId,
          sheets: uploadedData.sheets,
          activeSheet: sheetName,
          data: previewResult.data.data,
          headers: previewResult.data.headers,
        });

        resetChart();
        setInsights(null);
        setPredictions(null);
      }
    } catch (error) {
      console.error('Error loading sheet:', error);
    }
  };

  const handleCleanData = async () => {
    if (!uploadedData?.fileId) return;

    const result = await cleanData(uploadedData.fileId, {
      sheetName: uploadedData.activeSheet,
    });
    if (result) {
      console.log('Cleaning result:', result.message);
      console.log('Operations performed:', result.operations_log);

      const previewResult = await api.getFormattedPreview(
        uploadedData.fileId,
        100,
        uploadedData.activeSheet
      );

      if (previewResult.success && previewResult.data) {
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

  // AI-powered chart suggestion
  const handleAISuggest = async () => {
    if (!uploadedData?.fileId) return;
    
    const success = await suggest(
      uploadedData.fileId,
      instructions || undefined,
      uploadedData.activeSheet
    );
    
    // If AI suggestion succeeded and we have a spec, auto-render it
    if (success) {
      // The suggest call updates spec in hook state, so we need to get it
      // and render it after the state updates
      // We'll trigger render in a useEffect or just call it after
    }
  };
  
  // Render the current chart spec
  const handleRenderChart = async () => {
    if (!spec) return;
    await render(spec);
  };

  // Called when user clicks "Generate Chart" from Controls
  // This triggers AI suggestion if there's no spec, otherwise renders existing spec
  const handleGenerateChart = async () => {
    if (!uploadedData?.fileId) return;
    
    // Use AI to suggest a chart based on the data and instructions
    await handleAISuggest();
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Data Analysis AI Tool</h1>
            <p>Upload your CSV or XLSX file to get started with AI-powered data analysis</p>
          </div>
          <div className="header-right">
            <UserMenu onLoginClick={() => openAuthModal('login')} />
          </div>
        </div>
      </header>

      <main className="app-main">
        {!isAuthenticated && rateLimit && rateLimit.used > 0 && (
          <RateLimitBanner
            queriesUsed={rateLimit.used}
            queriesLimit={rateLimit.limit}
            onSignUpClick={() => openAuthModal('register')}
          />
        )}

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
                  operations: cleaningResult.operations_log
                    .map(
                      (op) =>
                        `${op.operation}: ${op.details} (${op.affected_count} affected)`
                    )
                    .join('\n'),
                  columnChanges:
                    cleaningResult.column_changes.renamed &&
                    Object.keys(cleaningResult.column_changes.renamed).length > 0
                      ? `Renamed: ${Object.entries(
                          cleaningResult.column_changes.renamed
                        )
                          .map(([old, newName]) => `"${old}" → "${newName}"`)
                          .join(', ')}`
                      : undefined,
                  droppedColumns:
                    cleaningResult.column_changes.dropped.length > 0
                      ? `Dropped: ${cleaningResult.column_changes.dropped.join(
                          ', '
                        )}`
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
            )}
            {(cleanError ||
              insightsError ||
              chartError ||
              predictError ||
              exportError) && (
              <div className="error-message">
                {cleanError ||
                  insightsError ||
                  chartError ||
                  predictError ||
                  exportError}
              </div>
            )}

            {insights && (
              <ResultsPanel title="AI Insights" content={insights} type="info" />
            )}

            {predictions && (
              <ResultsPanel
                title="Predictions"
                content={predictions}
                type="success"
              />
            )}
            
            {/* Chart section - show when we have a spec or chart data */}
            {uploadedData.fileId && (spec || chartJson) && (
              <ChartView
                chartData={chartJson}
                spec={spec}
                columns={uploadedData.headers || []}
                fileId={uploadedData.fileId}
                sheetName={uploadedData.activeSheet}
                onSpecChange={setSpec}
                onRenderChart={handleRenderChart}
                onAISuggest={handleAISuggest}
                isRendering={chartLoading}
                isSuggesting={chartSuggesting}
                explanation={explanation}
                confidence={confidence}
              />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by React, Vite, and AI</p>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}

export default App;
