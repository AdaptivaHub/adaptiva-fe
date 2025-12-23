import type { ReactNode } from 'react';
import { useState } from 'react';
import { Menu, Upload, ChartBar, Sparkles, FileText, Settings, User, LogOut, ChevronLeft, ChevronRight, Brain, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import type { UploadedFile, DataQualityReport } from '../types';

interface DashboardLayoutProps {
  children: ReactNode;
  uploadedFile: UploadedFile | null;
  qualityReport?: DataQualityReport | null;
  activeView?: 'upload' | 'preview' | 'charts' | 'predictions';
  onViewChange?: (view: 'upload' | 'preview' | 'charts' | 'predictions') => void;
}

export function DashboardLayout({ 
  children, 
  uploadedFile, 
  qualityReport,
  activeView = 'upload',
  onViewChange,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const navigationItems = [
    { icon: Upload, label: 'Upload', view: 'upload' as const, active: activeView === 'upload', disabled: false },
    { icon: FileText, label: 'Preview', view: 'preview' as const, active: activeView === 'preview', disabled: !uploadedFile, hasWarning: qualityReport && qualityReport.qualityScore < 90 },
    { icon: ChartBar, label: 'Charts', view: 'charts' as const, active: activeView === 'charts', disabled: !uploadedFile },
    { icon: Brain, label: 'Predictions', view: 'predictions' as const, active: activeView === 'predictions', disabled: !uploadedFile },
  ];

  const getQualityBadge = () => {
    if (!qualityReport) return null;
    
    const { qualityScore } = qualityReport;
    
    if (qualityScore >= 90) {
      return <Badge className="bg-green-500 text-white">Excellent</Badge>;
    } else if (qualityScore >= 70) {
      return <Badge className="bg-yellow-500 text-white">Good</Badge>;
    } else {
      return <Badge className="bg-red-500 text-white">Needs Cleaning</Badge>;
    }
  };

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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Adaptiva
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            
            return (
              <button
                key={index}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left relative',
                  item.active && !item.disabled
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100',
                  item.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent !text-slate-400 !bg-transparent',
                  item.hasWarning && !item.disabled && 'ring-2 ring-yellow-400 ring-offset-2'
                )}                onClick={() => {
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
                      <Badge className="bg-yellow-500 text-white text-xs">
                        !
                      </Badge>
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
        {uploadedFile && !sidebarCollapsed && (
          <div className="p-3 border-t border-slate-200">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Current File</p>
              <p className="font-medium text-sm text-slate-900 truncate">
                {uploadedFile.fileName}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {uploadedFile.rowCount.toLocaleString()} rows
              </p>
              {qualityReport && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Quality</span>
                    {getQualityBadge()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="p-3 border-t border-slate-200">
          <button
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
              <h1 className="text-xl font-bold text-slate-900">
                {uploadedFile ? 'Data Analysis' : 'Get Started'}
              </h1>
              <p className="text-sm text-slate-500">
                {uploadedFile
                  ? 'Analyze and visualize your data with AI'
                  : 'Upload your CSV or Excel file to begin'}
              </p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Button 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md"
              onClick={() => setUpgradeModalOpen(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-slate-500">Free Plan</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Upgrade to Pro Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-center">
              Upgrade to Adaptiva Pro
            </DialogTitle>
            <DialogDescription className="text-center">
              Unlock unlimited analysis power and advanced AI features
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 px-6 pb-6">
            {/* Free Plan */}
            <div className="border-2 border-slate-200 rounded-xl p-6 bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Free Plan</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-slate-900">$0</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <Badge className="mt-2 bg-slate-200 text-slate-700">Current Plan</Badge>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">Up to 10,000 rows per file</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">Basic data cleaning</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">5 charts per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">Basic predictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-400">Advanced AI insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-400">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-400">Export to multiple formats</span>
                </li>
              </ul>

              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-purple-500 rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Pro Plan</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-slate-900">$29</span>
                  <span className="text-slate-600">/month</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Billed monthly, cancel anytime</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-900 font-medium">Unlimited file size & rows</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-900 font-medium">Advanced data cleaning & validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-900 font-medium">Unlimited charts & visualizations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-900 font-medium">Advanced ML predictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-900 font-medium">AI-powered insights & recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-900 font-medium">Priority 24/7 support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-900 font-medium">Export to PDF, Excel, CSV, JSON</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-900 font-medium">API access</span>
                </li>
              </ul>

              <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>

              <p className="text-xs text-center text-slate-500 mt-3">
                30-day money-back guarantee
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}