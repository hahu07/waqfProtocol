// src/app/admin/page.tsx
'use client';

import { AdminDashboard } from '@/components/admin/adminDashboard';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function AdminPage() {
  const { isLoading, isAdmin } = useAdminCheck();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)]">
        <LoadingState />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)] p-4">
        <div className="text-center max-w-md">
          <p className="text-red-500 dark:text-red-400 text-lg font-medium mb-2">
            Admin Access Required
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You don&apos;t have permission to view this page. Please contact your administrator.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)] p-4">
        <div className="text-center max-w-md">
          <p className="text-red-500 dark:text-red-400 text-lg font-medium mb-2">
            Failed to Load Dashboard
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    }>
      <AdminDashboard />
    </ErrorBoundary>
  );
}