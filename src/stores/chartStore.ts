/**
 * Chart Store - Zustand store for chart state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChartConfig } from '@design/components/charts/ChartCreator';

// Re-export for convenience
export type { ChartConfig } from '@design/components/charts/ChartCreator';

interface ChartState {
  charts: ChartConfig[];
  isCreating: boolean;
  editingChart: ChartConfig | null;
  viewMode: 'grid' | 'list';

  // Actions
  addChart: (chart: ChartConfig) => void;
  updateChart: (chart: ChartConfig) => void;
  deleteChart: (id: string) => void;
  setEditing: (chart: ChartConfig | null) => void;
  setCreating: (creating: boolean) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  clearCharts: () => void;
}

export const useChartStore = create<ChartState>()(
  persist(
    (set) => ({
      charts: [],
      isCreating: false,
      editingChart: null,
      viewMode: 'grid',

      addChart: (chart) =>
        set((state) => ({
          charts: [...state.charts, chart],
          isCreating: false,
        })),

      updateChart: (chart) =>
        set((state) => ({
          charts: state.charts.map((c) => (c.id === chart.id ? chart : c)),
          editingChart: null,
        })),

      deleteChart: (id) =>
        set((state) => ({
          charts: state.charts.filter((c) => c.id !== id),
        })),

      setEditing: (chart) =>
        set({ editingChart: chart, isCreating: !!chart }),

      setCreating: (creating) =>
        set({ isCreating: creating, editingChart: null }),

      setViewMode: (mode) =>
        set({ viewMode: mode }),

      clearCharts: () =>
        set({ charts: [], isCreating: false, editingChart: null }),
    }),
    {
      name: 'chart-storage',
      partialize: (state) => ({
        charts: state.charts,
        viewMode: state.viewMode,
      }),
    }
  )
);

// Selector hooks for common patterns
export const useCharts = () => useChartStore((state) => state.charts);
export const useChartViewMode = () => useChartStore((state) => state.viewMode);
export const useIsCreatingChart = () => useChartStore((state) => state.isCreating);
export const useEditingChart = () => useChartStore((state) => state.editingChart);


