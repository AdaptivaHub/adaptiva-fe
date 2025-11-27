export interface DataRow {
  [key: string]: string | number | null;
}

export interface UploadedData {
  data: DataRow[];
  headers: string[];
  fileId?: string; // Backend file ID for API calls
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
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

