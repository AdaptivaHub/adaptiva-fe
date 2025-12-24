export * from './chartSpec';
export * from './predictions';

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

export interface ChartSettings {
  chart_type?: string | null;
  x_column?: string | null;
  y_column?: string | null;
  color_column?: string | null;
  group_by?: string | null;
  title?: string | null;
  aggregation?: string | null;
}

export interface AIChartResponse {
  chart_json: Record<string, unknown>;
  generated_code: string;
  explanation: string;
  message: string;
  chart_settings?: ChartSettings | null;
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
  header_row: number | null; // Detected header row index (0-based)
  header_confidence: number | null; // Confidence score for header detection (0.0-1.0)
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

// Enhanced Data Cleaning Types
export interface CleaningOperation {
  operation: string;
  details: string;
  affected_count: number;
}

export interface ColumnChanges {
  renamed: Record<string, string>;
  dropped: string[];
  type_converted: Record<string, string>;
}

export interface MissingValuesSummary {
  before: Record<string, number>;
  after: Record<string, number>;
}

/**
 * Unified Data Cleaning Request
 * 
 * Supports all cleaning operations including Excel Copilot-like features.
 * Uses composite key (file_id:sheet_name) for Excel files.
 */
export interface DataCleaningRequest {
  file_id: string;
  sheet_name?: string; // Sheet name for Excel files (uses composite key)
  normalize_columns?: boolean;
  remove_empty_rows?: boolean;
  remove_empty_columns?: boolean;
  drop_duplicates?: boolean;
  drop_na?: boolean;
  smart_fill_missing?: boolean;
  auto_detect_types?: boolean;
  fill_na?: Record<string, unknown>;
  columns_to_drop?: string[];
}

/**
 * Unified Data Cleaning Response
 * 
 * Returns comprehensive information about all cleaning operations performed.
 */
export interface DataCleaningResponse {
  file_id: string;
  sheet_name?: string; // Sheet name that was cleaned
  rows_before: number;
  rows_after: number;
  columns_before: number;
  columns_after: number;
  operations_log: CleaningOperation[];
  column_changes: ColumnChanges;
  missing_values_summary: MissingValuesSummary;
  message: string;
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// =============================================================================
// Authentication Types
// =============================================================================

export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface RateLimitError {
  detail: string;
  queries_used: number;
  queries_limit: number;
  reset_at: string;
  message: string;
}

// =============================================================================
// Chart Types (for design system)
// =============================================================================

export interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'composed';
  xAxis?: string;
  yAxis?: string | string[];
  data: Record<string, unknown>[];
  colors?: string[];
  prompt?: string;
  createdAt: Date;
}

// Note: ML/Prediction types are now in src/types/predictions.ts
// They are re-exported via `export * from './predictions'` at the top of this file

// =============================================================================
// Data Quality Types (for design system)
// =============================================================================

export interface DataQualityIssue {
  type: 'missing' | 'duplicates' | 'formatting' | 'outliers';
  count: number;
  severity: 'high' | 'medium' | 'low';
}

export interface ColumnIssue {
  column: string;
  issues: {
    type: 'missing' | 'duplicates' | 'formatting' | 'outliers';
    count: number;
    percentage: number;
  }[];
}

export interface DataQualityReport {
  qualityScore: number;
  totalRows: number;
  cleanRows: number;
  issues: DataQualityIssue[];
  columnIssues: ColumnIssue[];
}

// =============================================================================
// File Types (for design system - generic)
// =============================================================================

export interface UploadedFile {
  fileName: string;
  rowCount: number;
  columnCount?: number;
  sheets?: string[];
  activeSheet?: string;
  headers?: string[];
  data?: Record<string, unknown>[];
}

