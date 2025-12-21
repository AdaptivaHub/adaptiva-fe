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

export interface EnhancedCleaningRequest {
  file_id: string;
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

export interface EnhancedCleaningResponse {
  file_id: string;
  rows_before: number;
  rows_after: number;
  columns_before: number;
  columns_after: number;
  operations_log: CleaningOperation[];
  column_changes: ColumnChanges;
  missing_values_summary: MissingValuesSummary;
  message: string;
}

export interface BasicCleaningRequest {
  file_id: string;
  drop_duplicates?: boolean;
  drop_na?: boolean;
  fill_na?: Record<string, unknown>;
  columns_to_drop?: string[];
}

export interface BasicCleaningResponse {
  file_id: string;
  rows_before: number;
  rows_after: number;
  columns_before: number;
  columns_after: number;
  message: string;
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

