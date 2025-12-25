/**
 * File Store - Zustand store for uploaded file state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uploadService } from '@/services/uploadService';
import type { DataRow, ColumnInfo } from '@/types';

interface FileMetadata {
  fileId: string;
  fileName: string;
  sheets?: string[];
  activeSheet?: string;
  rowCount: number;
  columnCount: number;
}

interface FileState {
  // Persisted metadata
  metadata: FileMetadata | null;
  
  // Non-persisted data (fetched on demand)
  data: DataRow[];
  headers: string[];
  columnInfo: ColumnInfo[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setFile: (metadata: FileMetadata, data: DataRow[], headers: string[], columnInfo?: ColumnInfo[]) => void;
  updateData: (data: DataRow[], headers: string[], columnInfo?: ColumnInfo[]) => void;
  setActiveSheet: (sheetName: string) => Promise<void>;
  clearFile: () => void;
  refreshData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFileStore = create<FileState>()(
  persist(
    (set, get) => ({
      metadata: null,
      data: [],
      headers: [],
      columnInfo: [],
      isLoading: false,
      error: null,

      setFile: (metadata: FileMetadata, data: DataRow[], headers: string[], columnInfo: ColumnInfo[] = []) => {
        set({
          metadata,
          data,
          headers,
          columnInfo,
          isLoading: false,
          error: null,
        });
      },

      updateData: (data: DataRow[], headers: string[], columnInfo: ColumnInfo[] = []) => {
        set({ data, headers, columnInfo });
      },      setActiveSheet: async (sheetName: string) => {
        const { metadata } = get();
        if (!metadata?.fileId) return;

        set({ isLoading: true, error: null });

        try {
          const result = await uploadService.getPreview(
            metadata.fileId,
            100,
            sheetName
          );

          if (result.success && result.data) {
            const formattedData = result.data.data.map((row) =>
              Object.fromEntries(
                result.data!.headers.map((h) => [h, row[h] ?? null])
              )
            );

            set({
              metadata: { ...metadata, activeSheet: sheetName },
              data: formattedData,
              headers: result.data.headers,
              columnInfo: result.data.column_info ?? [],
              isLoading: false,
            });
          } else {
            set({ error: result.error || 'Failed to load sheet', isLoading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load sheet',
            isLoading: false,
          });
        }
      },

      clearFile: () => {
        set({
          metadata: null,
          data: [],
          headers: [],
          columnInfo: [],
          isLoading: false,
          error: null,
        });
      },

      refreshData: async () => {
        const { metadata } = get();
        if (!metadata?.fileId) return;

        set({ isLoading: true, error: null });

        try {
          const result = await uploadService.getPreview(
            metadata.fileId,
            100,
            metadata.activeSheet
          );          if (result.success && result.data) {
            const formattedData = result.data.data.map((row) =>
              Object.fromEntries(
                result.data!.headers.map((h) => [h, row[h] ?? null])
              )
            );

            set({
              data: formattedData,
              headers: result.data.headers,
              columnInfo: result.data.column_info ?? [],
              isLoading: false,
            });
          } else {
            set({ error: result.error || 'Failed to refresh data', isLoading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to refresh data',
            isLoading: false,
          });
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'file-storage',
      // Only persist metadata, not the actual data rows
      partialize: (state) => ({
        metadata: state.metadata,
      }),
    }
  )
);

// Convenience selectors
export const useFileMetadata = () => useFileStore((state) => state.metadata);
export const useFileData = () => useFileStore((state) => ({ data: state.data, headers: state.headers }));
export const useHasFile = () => useFileStore((state) => state.metadata !== null);


