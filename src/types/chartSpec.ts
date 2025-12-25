/**
 * ChartSpec Types - Frontend types matching backend ChartSpec schema
 * 
 * This is the canonical representation of chart configuration used across:
 * - AI suggestions (returned from /api/charts/suggest)
 * - Manual chart editor state
 * - Render requests (sent to /api/charts/render)
 */

// =============================================================================
// Enums
// =============================================================================

export type ChartType = 
  | 'bar' 
  | 'line' 
  | 'scatter' 
  | 'histogram' 
  | 'box' 
  | 'pie' 
  | 'area' 
  | 'heatmap';

export type AggregationMethod = 
  | 'none' 
  | 'sum' 
  | 'mean' 
  | 'count' 
  | 'median' 
  | 'min' 
  | 'max';

export type LegendPosition = 'top' | 'bottom' | 'left' | 'right' | 'none';

export type StackingMode = 'grouped' | 'stacked' | 'percent';

export type ModebarDisplay = 'always' | 'hover' | 'hidden';

export type TooltipDetail = 'summary' | 'detailed';

export type Theme = 'light' | 'dark';

export type ColorPalette = 
  | 'default' 
  | 'vibrant' 
  | 'pastel' 
  | 'monochrome' 
  | 'colorblind_safe';

export type ExportFormat = 'png' | 'svg' | 'jpeg' | 'webp';

export type FilterOperator = 
  | 'eq' 
  | 'ne' 
  | 'gt' 
  | 'gte' 
  | 'lt' 
  | 'lte' 
  | 'in' 
  | 'not_in' 
  | 'between' 
  | 'contains';

// =============================================================================
// Sub-configs
// =============================================================================

export interface AxisConfig {
  column: string;
  label?: string;
}

export interface YAxisConfig {
  columns: string[];
  label?: string;
}

export interface FilterCondition {
  column: string;
  operator: FilterOperator;
  value: string | number | (string | number)[] | null;
  value_end?: string | number; // For "between" operator
}

export interface FiltersConfig {
  conditions: FilterCondition[];
  logic: 'and' | 'or';
}

export interface SeriesConfig {
  group_column?: string;
  size_column?: string; // For scatter plots (bubble size)
}

export interface AggregationConfig {
  method: AggregationMethod;
  group_by?: string[];
}

export interface LegendConfig {
  visible: boolean;
  position: LegendPosition;
}

export interface VisualStructureConfig {
  title?: string;
  stacking: StackingMode;
  secondary_y_axis: boolean;
}

export interface InteractionConfig {
  zoom_scroll: boolean;
  responsive: boolean;
  modebar: ModebarDisplay;
  export_formats: ExportFormat[];
  tooltip_detail: TooltipDetail;
}

export interface StylingConfig {
  color_palette: ColorPalette;
  theme: Theme;
  show_data_labels: boolean;
}

// =============================================================================
// Main ChartSpec
// =============================================================================

/**
 * ChartSpec - Canonical chart configuration schema
 * 
 * This is the single source of truth for all chart configurations.
 * Used for both AI suggestions and manual chart creation.
 */
export interface ChartSpec {
  // === Data Source ===
  file_id: string;
  sheet_name?: string;
  
  // === 1. Data & Mapping ===
  chart_type: ChartType;
  x_axis: AxisConfig;
  y_axis?: YAxisConfig;
  series?: SeriesConfig;
  aggregation?: AggregationConfig;
  filters?: FiltersConfig;
  
  // === 2. Visual Structure & Readability ===
  visual?: VisualStructureConfig;
  legend?: LegendConfig;
  
  // === 3. Interaction & Behavior ===
  interaction?: InteractionConfig;
  
  // === 4. Styling Presets ===
  styling?: StylingConfig;
  
  // === Metadata ===
  version?: string;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface ChartRenderRequest {
  spec: ChartSpec;
}

export interface ChartRenderResponse {
  chart_json: Record<string, unknown>;
  rendered_at: string;
  spec_version: string;
}

export interface ChartValidateRequest {
  spec: ChartSpec;
}

export interface ValidationIssue {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

export interface ChartValidateResponse {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface AISuggestRequest {
  file_id: string;
  sheet_name?: string;
  user_instructions?: string;
}

export interface ChartAlternative {
  chart_type: string;
  reason: string;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens?: number;
  model: string;
}

export interface AISuggestResponse {
  suggested_spec: ChartSpec;
  explanation: string;
  confidence: number;
  alternatives: ChartAlternative[];
  usage: TokenUsage;
}

// =============================================================================
// Rate Limit Types
// =============================================================================

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  used: number;
}

export interface RateLimitError {
  detail: string;
  code: string;
  queries_used: number;
  queries_limit: number;
  reset_at: string;
  message: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create a minimal valid ChartSpec with defaults
 */
export function createDefaultChartSpec(fileId: string, sheetName?: string): ChartSpec {
  return {
    file_id: fileId,
    sheet_name: sheetName,
    chart_type: 'bar',
    x_axis: { column: '' },
    aggregation: { method: 'none' },
    visual: { 
      title: '', 
      stacking: 'grouped', 
      secondary_y_axis: false 
    },
    legend: { 
      visible: true, 
      position: 'right' 
    },
    styling: { 
      color_palette: 'default', 
      theme: 'light', 
      show_data_labels: false 
    },
    version: '1.0',
  };
}

/**
 * Check if a chart type requires y_axis
 */
export function chartTypeRequiresYAxis(chartType: ChartType): boolean {
  return !['histogram', 'pie', 'box'].includes(chartType);
}


