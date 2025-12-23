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
  const getActiveView = (): 'preview' | 'charts' | 'predictions' => {
    if (location.pathname === '/charts') return 'charts';
    if (location.pathname === '/predictions') return 'predictions';
    return 'preview';
  };

  // Handle view changes from DashboardLayout navigation
  const handleViewChange = (view: 'preview' | 'charts' | 'predictions') => {
    switch (view) {
      case 'preview':
        navigate('/upload');
        break;
      case 'charts':
        navigate('/charts');
        break;
      case 'predictions':
        navigate('/predictions');
        break;
    }
  };

  // Handle new upload request
  const handleNewUpload = () => {
    navigate('/upload');
  };

  // TODO: Get quality report from file store or compute it
  const qualityReport: DataQualityReport | null = null;

  return (
    <DashboardLayout
      uploadedFile={uploadedFile}
      onNewUpload={handleNewUpload}
      qualityReport={qualityReport}
      activeView={getActiveView()}
      onViewChange={handleViewChange}
    >
      <Outlet />
    </DashboardLayout>
  );
}
