"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Navbar } from "@/components/waqf/Navbar";
import { Suspense } from "react";
import { LoadingState } from "@/components/ui/loading-state";
// AuthProvider now handled by main layout

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div role="alert" className="bg-white border border-red-200 rounded-xl shadow-lg p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <button 
        onClick={resetErrorBoundary || (() => window.location.reload())}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
      >
        🔄 Try again
      </button>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
        {/* Modern gradient background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/30 to-green-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-green-200/20 to-emerald-200/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <Navbar />
          
          <main className="" role="main">
            <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <div className="max-w-4xl mx-auto px-4 py-8">
                <ErrorFallback 
                  error={error} 
                  resetErrorBoundary={resetErrorBoundary || (() => window.location.reload())}
                />
              </div>
            )}
            onReset={() => window.location.reload()}
          >
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingState />
              </div>
            }>
              {children}
            </Suspense>
          </ErrorBoundary>
          </main>
        </div>
      </div>
  );
}
