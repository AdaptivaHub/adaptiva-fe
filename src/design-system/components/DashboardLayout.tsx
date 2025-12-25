import type { ReactNode } from 'react';
import { useState } from 'react';
import { Menu, Upload, ChartBar, FileText, Settings, User, LogOut, ChevronLeft, ChevronRight, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { BrandLogo } from './BrandLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';

// Generic types for the design system
export interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  view: string;
  disabled?: boolean;
  hasWarning?: boolean;
}

export interface UserInfo {
  name: string;
  initials: string;
  plan?: string;
}

export interface FileInfo {
  fileName: string;
  rowCount: number;
  qualityScore?: number;
  qualityLabel?: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  /** Current active view identifier */
  activeView?: string;
  /** Called when navigation item is clicked */
  onViewChange?: (view: string) => void;
  /** Navigation items (defaults to standard items if not provided) */
  navigationItems?: NavigationItem[];
  /** File info to show in sidebar */
  fileInfo?: FileInfo | null;
  /** User info for the user menu */
  userInfo?: UserInfo | null;
  /** Whether to show the upgrade button */
  showUpgradeButton?: boolean;
  /** Called when upgrade button is clicked */
  onUpgradeClick?: () => void;
  /** Called when profile is clicked */
  onProfileClick?: () => void;
  /** Called when settings is clicked */
  onSettingsClick?: () => void;
  /** Called when logout is clicked */
  onLogoutClick?: () => void;
  /** Header title */
  headerTitle?: string;
  /** Header subtitle */
  headerSubtitle?: string;
  /** Custom header right content */
  headerRight?: ReactNode;
  /** Whether sidebar is collapsed (controlled) */
  sidebarCollapsed?: boolean;
  /** Called when sidebar collapse state changes */
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
}

// Default navigation items for backwards compatibility
const defaultNavigationItems: NavigationItem[] = [
  { icon: Upload, label: 'Upload', view: 'upload', disabled: false },
  { icon: FileText, label: 'Preview', view: 'preview', disabled: true },
  { icon: ChartBar, label: 'Charts', view: 'charts', disabled: true },
  { icon: Brain, label: 'Predictions', view: 'predictions', disabled: true },
];

export function DashboardLayout({ 
  children, 
  activeView = 'upload',
  onViewChange,
  navigationItems,
  fileInfo,
  userInfo,
  showUpgradeButton = true,
  onUpgradeClick,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
  headerTitle,
  headerSubtitle,
  headerRight,
  sidebarCollapsed: externalCollapsed,
  onSidebarCollapsedChange,
}: DashboardLayoutProps) {
  // Internal state for sidebar if not controlled
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const sidebarCollapsed = externalCollapsed ?? internalCollapsed;
  
  const handleCollapseChange = (collapsed: boolean) => {
    if (onSidebarCollapsedChange) {
      onSidebarCollapsedChange(collapsed);
    } else {
      setInternalCollapsed(collapsed);
    }
  };

  // Use provided navigation items or defaults
  const navItems = navigationItems ?? defaultNavigationItems;

  const getQualityBadge = (score?: number, label?: string) => {
    if (score === undefined) return null;
    
    if (score >= 90) {
      return <Badge className="bg-green-500 text-white">{label ?? 'Excellent'}</Badge>;
    } else if (score >= 70) {
      return <Badge className="bg-yellow-500 text-white">{label ?? 'Good'}</Badge>;
    } else {
      return <Badge className="bg-red-500 text-white">{label ?? 'Needs Cleaning'}</Badge>;
    }
  };

  // Dynamic header content
  const title = headerTitle ?? (fileInfo ? 'Data Analysis' : 'Get Started');
  const subtitle = headerSubtitle ?? (fileInfo 
    ? 'Analyze and visualize your data with AI' 
    : 'Upload your CSV or Excel file to begin');

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white border-r border-slate-200 transition-all duration-300 flex flex-col',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo & Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <BrandLogo className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-brand-600 to-brand-600 bg-clip-text text-transparent">
                Adaptiva
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCollapseChange(!sidebarCollapsed)}
            className="ml-auto"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            
            return (
              <button
                key={index}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left relative',
                  isActive && !item.disabled
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100',
                  item.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent !text-slate-400 !bg-transparent',
                  item.hasWarning && !item.disabled && 'ring-2 ring-yellow-400 ring-offset-2'
                )}
                onClick={() => {
                  if (!item.disabled) {
                    onViewChange?.(item.view);
                  }
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium flex-1">{item.label}</span>
                    {item.hasWarning && (
                      <Badge className="bg-yellow-500 text-white text-xs">!</Badge>
                    )}
                  </>
                )}
                {item.hasWarning && sidebarCollapsed && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* File Info (when file is uploaded) */}
        {fileInfo && !sidebarCollapsed && (
          <div className="p-3 border-t border-slate-200">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Current File</p>
              <p className="font-medium text-sm text-slate-900 truncate">
                {fileInfo.fileName}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {fileInfo.rowCount.toLocaleString()} rows
              </p>
              {fileInfo.qualityScore !== undefined && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Quality</span>
                    {getQualityBadge(fileInfo.qualityScore, fileInfo.qualityLabel)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={onSettingsClick}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-left'
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>

          {/* Header Right */}
          <div className="flex items-center gap-3">
            {headerRight}
            
            {showUpgradeButton && (
              <Button 
                className="bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-md"
                onClick={onUpgradeClick}
              >
                <BrandLogo className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}

            {userInfo && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                        {userInfo.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium">{userInfo.name}</p>
                      {userInfo.plan && <p className="text-xs text-slate-500">{userInfo.plan}</p>}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onProfileClick}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSettingsClick}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogoutClick} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


