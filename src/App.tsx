import { useState } from 'react';
import { Upload } from './components/Upload';
import { Preview } from './components/Preview';
import { Controls } from './components/Controls';
import { ChartView } from './components/ChartView';
import { ResultsPanel } from './components/ResultsPanel';
import { AgentPanel } from './components/AgentPanel';
import { useCleanData } from './hooks/useCleanData';
import { useInsights } from './hooks/useInsights';
import { useChart, type ChartResult } from './hooks/useChart';
import { usePredict } from './hooks/usePredict';
import { useExport } from './hooks/useExport';
import type { UploadedData } from './types';
import './App.css';

function App() {
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
  const [instructions, setInstructions] = useState('');
  const [chartResult, setChartResult] = useState<ChartResult | null>(null);
  const [insights, setInsights] = useState<string | Record<string, unknown> | null>(null);
  const [predictions, setPredictions] = useState<string | Record<string, unknown> | null>(null);

  const { cleanData, loading: cleanLoading, error: cleanError } = useCleanData();
  const { getInsights, loading: insightsLoading, error: insightsError } = useInsights();
  const { generateChart, loading: chartLoading, error: chartError } = useChart();
  const { predict, loading: predictLoading, error: predictError } = usePredict();
  const { exportData, loading: exportLoading, error: exportError } = useExport();

  const isLoading = cleanLoading || insightsLoading || chartLoading || predictLoading || exportLoading;

  const handleDataLoaded = (data: UploadedData) => {
    setUploadedData(data);
    setChartResult(null);
    setInsights(null);
    setPredictions(null);
  };

  const handleCleanData = async () => {
    if (!uploadedData) return;
    
    const result = await cleanData(uploadedData.data);
    if (result) {
      setUploadedData({
        data: result,
        headers: uploadedData.headers,
      });
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
    
    const result = await generateChart(uploadedData.fileId, instructions);
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Data Analysis AI Tool</h1>
        <p>Upload your CSV or XLSX file to get started with AI-powered data analysis</p>
      </header>

      <main className="app-main">
        <Upload onDataLoaded={handleDataLoaded} />

        {uploadedData && (
          <>
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

            {(cleanError || insightsError || chartError || predictError || exportError) && (
              <div className="error-message">
                {cleanError || insightsError || chartError || predictError || exportError}
              </div>
            )}

            {insights && (
              <ResultsPanel title="AI Insights" content={insights} type="info" />
            )}

            {predictions && (
              <ResultsPanel title="Predictions" content={predictions} type="success" />
            )}

            {chartResult && (
              <ChartView 
                chartData={chartResult.chartJson} 
                explanation={chartResult.explanation}
                generatedCode={chartResult.generatedCode}
              />
            )}

            <AgentPanel fileId={uploadedData.fileId} />

            <Preview data={uploadedData.data} headers={uploadedData.headers} />
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
