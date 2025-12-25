/**
 * Main App Component with React Router
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layouts
import { MainLayout, AuthLayout } from './layouts';

// Routes
import {
  DashboardPage,
  UploadPage,
  PreviewPage,
  ChartsPage,
  PredictionsPage,
  SettingsPage,
  LoginPage,
  RegisterPage,
} from './routes';

// Stores
import { useAuthStore, useFileStore } from '@/stores';

export function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const refreshData = useFileStore((state) => state.refreshData);
  const metadata = useFileStore((state) => state.metadata);

  // Initialize auth on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Refresh file data if we have metadata but no data (persisted state)
  useEffect(() => {
    if (metadata?.fileId) {
      refreshData();
    }
  }, [metadata?.fileId, refreshData]);

  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />

      <Routes>
        {/* Auth routes (public) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>        {/* Protected routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/predictions" element={<PredictionsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


