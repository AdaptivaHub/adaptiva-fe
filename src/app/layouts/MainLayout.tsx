/**
 * Main Layout - Authenticated app layout using DashboardLayout
 */

import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Upload, FileText, ChartBar, Brain } from 'lucide-react';
import { useAuthStore, useFileStore, useQualityStore } from '@/stores';
import { DashboardLayout, type NavigationItem, type FileInfo, type UserInfo } from '@design/components/DashboardLayout';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const metadata = useFileStore((state) => state.metadata);
  const qualityReport = useQualityStore((state) => state.report);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Determine active view from current route
  const getActiveView = (): string => {
    if (location.pathname === '/upload') return 'upload';
    if (location.pathname === '/preview') return 'preview';
    if (location.pathname === '/charts') return 'charts';
    if (location.pathname === '/predictions') return 'predictions';
    if (location.pathname === '/settings') return 'settings';
    return 'upload';
  };

  // Build navigation items based on file state
  const hasFile = metadata !== null;
  const hasQualityWarning = qualityReport && qualityReport.qualityScore < 90;
    const navigationItems: NavigationItem[] = [
    { icon: Upload, label: 'Upload', view: 'upload', disabled: false },
    { icon: FileText, label: 'Preview', view: 'preview', disabled: !hasFile, hasWarning: hasQualityWarning ?? false },
    { icon: ChartBar, label: 'Charts', view: 'charts', disabled: !hasFile },
    { icon: Brain, label: 'Predictions', view: 'predictions', disabled: !hasFile },
  ];

  // Build file info for sidebar
  const fileInfo: FileInfo | null = metadata
    ? {
        fileName: metadata.fileName,
        rowCount: metadata.rowCount,
        qualityScore: qualityReport?.qualityScore,
        qualityLabel: qualityReport ? getQualityLabel(qualityReport.qualityScore) : undefined,
      }
    : null;

  // Build user info for header
  const userInfo: UserInfo | null = user
    ? {
        name: user.full_name || user.email,
        initials: getInitials(user.full_name || user.email),
        plan: 'Free Plan', // TODO: Get from user subscription
      }
    : null;

  // Handle view changes from DashboardLayout navigation
  const handleViewChange = (view: string) => {
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
      case 'settings':
        navigate('/settings');
        break;
    }
  };

  const handleUpgradeClick = () => {
    // TODO: Open upgrade modal or navigate to billing
    console.log('Upgrade clicked');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DashboardLayout
      activeView={getActiveView()}
      onViewChange={handleViewChange}
      navigationItems={navigationItems}
      fileInfo={fileInfo}
      userInfo={userInfo}
      showUpgradeButton={true}
      onUpgradeClick={handleUpgradeClick}
      onProfileClick={() => navigate('/settings')}
      onSettingsClick={() => navigate('/settings')}
      onLogoutClick={handleLogout}
    >
      <Outlet />
    </DashboardLayout>
  );
}

// Helper functions
function getQualityLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  return 'Needs Cleaning';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}


