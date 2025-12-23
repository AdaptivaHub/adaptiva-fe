/**
 * Main Layout - Authenticated app layout using DashboardLayout
 */

import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useFileStore } from '@/stores';
import { DashboardLayout } from '@design/components/DashboardLayout';
import type { UploadedFile, DataQualityReport } from '@design/types';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const metadata = useFileStore((state) => state.metadata);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Convert file metadata to UploadedFile format for DashboardLayout
  const uploadedFile: UploadedFile | null = metadata
    ? {
        fileName: metadata.fileName,
        rowCount: metadata.rowCount,
        columnCount: metadata.columnCount,
        sheets: metadata.sheets,
        activeSheet: metadata.activeSheet,
      }
    : null;

  // Determine active view from current route
  const getActiveView = (): 'upload' | 'preview' | 'charts' | 'predictions' => {
    if (location.pathname === '/upload') return 'upload';
    if (location.pathname === '/preview') return 'preview';
    if (location.pathname === '/charts') return 'charts';
    if (location.pathname === '/predictions') return 'predictions';
    return 'upload';
  };

  // Handle view changes from DashboardLayout navigation
  const handleViewChange = (view: 'upload' | 'preview' | 'charts' | 'predictions') => {
    switch (view) {
      case 'upload':
        navigate('/upload');
        break;
      case 'preview':
        navigate('/preview');
        break;
      case 'charts':
        navigate('/charts');
        break;
      case 'predictions':
        navigate('/predictions');
        break;
    }
  };

  // TODO: Get quality report from file store or compute it
  const qualityReport: DataQualityReport | null = null;

  return (
    <DashboardLayout
      uploadedFile={uploadedFile}
      qualityReport={qualityReport}
      activeView={getActiveView()}
      onViewChange={handleViewChange}
    >
      <Outlet />
    </DashboardLayout>
  );
}
