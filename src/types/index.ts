export interface DataRow {
  [key: string]: string | number | null;
}

export interface UploadedData {
  data: DataRow[];
  headers: string[];
  fileId?: string; // Backend file ID for API calls
  sheets?: string[]; // Available sheets (Excel only)
  activeSheet?: string; // Currently active sheet (Excel only)
}

export interface ChartData {
  type: string;
  data: Record<string, unknown>[];
  layout?: Record<string, unknown>;
}

export interface AIChartResponse {
  chart_json: Record<string, unknown>;
  generated_code: string;
  explanation: string;
  message: string;
}

export interface FileUploadResponse {
  file_id: string;
  filename: string;
  rows: number;
  columns: number;
  column_names: string[];
  message: string;
  sheets: string[] | null; // Available sheets (Excel only)
  active_sheet: string | null; // Sheet used for initial metadata (Excel only)
}

export interface PreviewResponse {
  file_id: string;
  headers: string[];
  data: Record<string, string>[];
  total_rows: number;
  preview_rows: number;
  formatted: boolean;
  message: string;
  sheet_name: string | null; // Current sheet being previewed (Excel only)
  available_sheets: string[] | null; // All available sheets (Excel only)
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================================================
// AGENT TYPES
// ============================================================================

export interface ForecastPrediction {
  date: string;
  predicted_value: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ForecastableColumn {
  date_column: string;
  target_column: string;
  target_dtype: string;
  unique_values: number;
}

export interface ForecastableColumnsResponse {
  file_id: string;
  forecastable_columns: ForecastableColumn[];
  message: string;
}

export interface ForecastResponse {
  file_id: string;
  date_column: string;
  target_column: string;
  periods: number;
  predictions: ForecastPrediction[];
  average_prediction: number;
  trend: 'increasing' | 'decreasing';
  training_data_points: number;
  message: string;
}

export interface MarketingCampaign {
  campaign_name: string;
  theme: string;
  timing: string;
  tactics: string[];
  target_audience: string;
  expected_outcome: string;
  budget_recommendation?: string;
}

export interface MarketingStrategyResponse {
  file_id: string;
  strategy_summary: string;
  campaigns: MarketingCampaign[];
  key_insights: string[];
  message: string;
}

export interface AdContent {
  headline: string;
  main_caption: string;
  long_description: string;
  hashtags: string[];
  call_to_action: string;
  image_prompt?: string;
  image_url?: string;
}

export interface ContentGenerationResponse {
  campaign_name: string;
  platform: string;
  content: AdContent;
  generated_at: string;
  message: string;
}

export interface AgentPipelineResponse {
  file_id: string;
  steps_completed: string[];
  insights_summary?: string;
  forecast_summary?: {
    date_column: string;
    target_column: string;
    periods: number;
    trend: string;
    average_prediction: number;
    training_data_points: number;
  };
  marketing_strategy?: {
    strategy_summary: string;
    campaigns: MarketingCampaign[];
    key_insights: string[];
  };
  ad_content?: {
    campaign_name: string;
    platform: string;
    content: AdContent;
    generated_at: string;
  };
  message: string;
}

// ============================================================================
// RATE LIMITING TYPES
// ============================================================================

export interface UsageStatsResponse {
  ip: string;
  date: string;
  cost_cents: number;
  requests: number;
  limit_cents: number;
  remaining_cents: number;
  message: string;
}

export interface RateLimitError {
  error: string;
  message: string;
  daily_limit_cents: number;
  used_cents: number;
  remaining_cents: number;
  reset: string;
}

