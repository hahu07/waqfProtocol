// components/admin/AdminLayout.tsx
'use client';

import { AdminNav } from './adminNav';
import { AdminSidebar } from './adminSidebar';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <AdminNav />
      <div className="flex flex-col sm:flex-row pb-16 sm:pb-0">
        <AdminSidebar className="hidden sm:block" />
        <main className="flex-1 p-2 sm:p-6 bg-white dark:bg-gray-800 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        
        {/* Mobile bottom navigation */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 z-40">
          <div className="flex justify-around py-2">
            <button 
              onClick={() => {/* TODO: Implement mobile navigation */}}
              className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-300"
            >
              <span>📊</span>
              <span className="text-xs">Dashboard</span>
            </button>
            <button 
              onClick={() => {/* TODO: Implement mobile navigation */}}
              className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-300"
            >
              <span>🎯</span>
              <span className="text-xs">Causes</span>
            </button>
            <button 
              onClick={() => {/* TODO: Implement mobile navigation */}}
              className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-300"
            >
              <span>👥</span>
              <span className="text-xs">Users</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}