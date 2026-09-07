import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../AuthContext';

export const DashboardLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0d1117]">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-background)] text-gray-900 dark:text-white font-sans selection:bg-[var(--color-primary)]/30">
      <Sidebar />
      <div className="flex-1 ml-64 bg-white dark:bg-[#0d1117] min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};
