/**
 * Dashboard Page - Overview/landing page after login
 */

import { useNavigate } from 'react-router-dom';
import { useFileStore, useAuthStore } from '@/stores';
import { EmptyState } from '@design/components/EmptyState';
import { Button } from '@design/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@design/components/ui/card';
import { Upload, ChartBar, Brain } from 'lucide-react';
import { BrandLogo } from '@design/components/BrandLogo';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const metadata = useFileStore((state) => state.metadata);
  const hasFile = metadata !== null;

  // If no file uploaded, show welcome/upload prompt
  if (!hasFile) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Upload className="w-12 h-12" />}
          title="Welcome to Adaptiva"
          description="Upload your CSV or Excel file to start analyzing and visualizing your data with AI."
          action={            <Button
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          }
        />
      </div>
    );
  }

  // Show dashboard with file summary and quick actions
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{user?.full_name ? `, ${user.full_name}` : ''}!
        </h1>
        <p className="text-slate-500">
          Your data is ready. Choose what you'd like to do next.
        </p>
      </div>

      {/* Current File Card */}
      <Card>
        <CardHeader>        <CardTitle className="flex items-center gap-2">
            <BrandLogo className="w-5 h-5 text-brand-600" />
            Current File
          </CardTitle>
          <CardDescription>
            Your uploaded data file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">{metadata.fileName}</p>
              <p className="text-sm text-slate-500">
                {metadata.rowCount.toLocaleString()} rows × {metadata.columnCount} columns
                {metadata.sheets && metadata.sheets.length > 1 && (
                  <span className="ml-2">• {metadata.sheets.length} sheets</span>
                )}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/upload')}>
              View Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/upload')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="w-5 h-5 text-blue-600" />
              Data Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              View, clean, and prepare your data for analysis
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/charts')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ChartBar className="w-5 h-5 text-green-600" />
              Create Charts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Generate AI-powered visualizations from your data
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/predictions')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-brand-600" />
              ML Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Train models and make predictions on your data
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


