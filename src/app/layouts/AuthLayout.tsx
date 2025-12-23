/**
 * Auth Layout - Simple layout for login/register pages
 */

import { Sparkles } from 'lucide-react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';

export function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Adaptiva
          </span>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
