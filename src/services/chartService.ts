/**
 * Chart Service - Unified Chart Generation API
 * 
 * Uses the new unified chart architecture:
 * - POST /api/charts/suggest - AI generates ChartSpec (rate-limited)
 * - POST /api/charts/render - Render ChartSpec → Plotly JSON (free)
 * - POST /api/charts/validate - Pre-flight validation (free)
 */

import { apiClient, handleApiError, type ApiResponse } from './api';
import type { 
  ChartSpec,
  ChartRenderResponse, 
  ChartValidateResponse,
  AISuggestResponse,
  RateLimitInfo,
} from '@/types';

/**
 * Extract rate limit info from response headers
 */
function extractRateLimitInfo(headers: unknown): RateLimitInfo | null {
  const h = headers as Record<string, string | undefined>;
  const limit = h['x-ratelimit-limit'];
  const remaining = h['x-ratelimit-remaining'];
  const reset = h['x-ratelimit-reset'];
  const used = h['x-ratelimit-used'];
  
  if (limit && remaining && reset && used) {
    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10),
      used: parseInt(used, 10),
    };
  }
  return null;
}

export interface SuggestResult {
  response: AISuggestResponse;
  rateLimit: RateLimitInfo | null;
}

export const chartService = {
  /**
   * Get AI-powered chart suggestion
   * 
   * Rate-limited for anonymous users (3/day).
   * Returns a ChartSpec that can be edited and rendered.
   */
  async suggest(
    fileId: string,
    userInstructions?: string,
    sheetName?: string
  ): Promise<ApiResponse<SuggestResult>> {
    try {
      const response = await apiClient.post('/charts/suggest', {
        file_id: fileId,
        sheet_name: sheetName ?? null,
        user_instructions: userInstructions || null,
      });
      
      const rateLimit = extractRateLimitInfo(response.headers);
      
      return { 
        success: true, 
        data: {
          response: response.data,
          rateLimit,
        }
      };
    } catch (error) {
      return handleApiError<SuggestResult>(error);
    }
  },

  /**
   * Render a ChartSpec to Plotly JSON
   * 
   * No rate limiting - free to call.
   * This is the single render path for all charts.
   */
  async render(spec: ChartSpec): Promise<ApiResponse<ChartRenderResponse>> {
    try {
      const response = await apiClient.post('/charts/render', { spec });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<ChartRenderResponse>(error);
    }
  },

  /**
   * Validate a ChartSpec before rendering
   * 
   * No rate limiting - free to call.
   * Returns errors and warnings.
   */
  async validate(spec: ChartSpec): Promise<ApiResponse<ChartValidateResponse>> {
    try {
      const response = await apiClient.post('/charts/validate', { spec });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError<ChartValidateResponse>(error);
    }
  },
};


