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

