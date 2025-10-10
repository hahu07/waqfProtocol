// app/admin/layout.tsx
'use client';

import { AdminNav } from '@/components/admin/adminNav';
import { DevRoleSwitcher } from '@/components/dev/DevRoleSwitcher';
// AuthProvider now handled by main layout
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen relative overflow-hidden">
        {/* Modern gradient background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-200/20 to-blue-200/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <AdminNav />
          <DevRoleSwitcher />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
