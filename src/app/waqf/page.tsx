// app/waqf/page.tsx
'use client';

import { useAuth } from "@/components/auth/AuthProvider";
import { useFetchWaqfData } from "@/hooks/useWaqfData";
import { useWaqfCreatorCheck } from "@/hooks/useWaqfCreatorCheck";
import { EnhancedWaqfDashboard } from "@/components/waqf/EnhancedWaqfDashboard";
import { Button } from "@/components/ui/button";
import { WaqfForm } from "@/components/waqf/WaqfForm";
import { useState, useEffect } from 'react';
import { ReportModal } from '@/components/waqf/reportModal';
import type { Cause } from "@/types/waqfs";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { listActiveCauses } from "@/lib/cause-utils";


export default function Page() {
  const { isLoading: authLoading, error: authError } = useAuth();
  const { isLoading: roleCheckLoading } = useWaqfCreatorCheck();
  const [showReport, setShowReport] = useState(false);
  const { waqf, waqfDoc, waqfs, loading: dataLoading, error: dataError, refresh, createWaqf, updateWaqf } = useFetchWaqfData();
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingWaqf, setEditingWaqf] = useState<typeof waqf | null>(null);
  const [selectedWaqfIndex, setSelectedWaqfIndex] = useState(0);
  
  // Get the first waqf from the list (user's waqf)
  const userWaqf = waqfs && waqfs.length > 0 ? waqfs[selectedWaqfIndex] : waqf;
  const MAX_WAQFS = 5;
  const canCreateMore = (waqfs?.length || 0) < MAX_WAQFS;
  console.log('📋 User Waqf:', userWaqf, 'Total waqfs:', waqfs?.length, 'Can create more:', canCreateMore);
  const [availableCauses, setAvailableCauses] = useState<Cause[]>([]);
  const [causesLoading, setCausesLoading] = useState(true);
  const [causesError, setCausesError] = useState<Error | null>(null);

  // Fetch active causes when auth is complete
  useEffect(() => {
    const fetchCauses = async () => {
      // Don't fetch if still loading auth or if there's an auth error
      if (authLoading || roleCheckLoading || authError) {
        return;
      }
      
      try {
        console.log('🔍 Fetching active causes...');
        setCausesLoading(true);
        setCausesError(null);
        const causes = await listActiveCauses();
        console.log('✅ Fetched causes:', causes.length, causes);
        setAvailableCauses(causes);
      } catch (error) {
        console.error('❌ Error fetching causes:', error);
        setCausesError(error instanceof Error ? error : new Error('Failed to load causes'));
      } finally {
        setCausesLoading(false);
      }
    };
    
    fetchCauses();
  }, [authLoading, roleCheckLoading, authError]);

  // Enhanced loading state with skeletons
  if (authLoading || roleCheckLoading || dataLoading) return (
    <div className="px-4 sm:px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white h-40 rounded-xl shadow-lg animate-pulse border border-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );

  // Enhanced error state
  if (authError || dataError) return (
    <div className="px-4 sm:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-red-200 rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{authError?.message || dataError?.message || 'Unknown error'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => refresh()} 
              variant="outline"
              className="px-6"
              style={{ borderColor: '#9333ea', color: '#9333ea' }}
            >
              🔄 Retry
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="px-6"
              style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)', border: 'none' }}
            >
              ↻ Reload Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-20 sm:pb-8">
      {/* Professional Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm mb-6">
        <div className="px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Waqf Portfolio</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage your perpetual charitable endowments</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button 
                onClick={() => setShowReport(true)}
                variant="outline"
                className="flex-1 sm:flex-none"
                style={{ borderColor: '#9333ea', color: '#9333ea' }}
              >
                📊 View Report
              </Button>
              <Button 
                onClick={() => {
                  if (!canCreateMore) {
                    alert(`Maximum limit reached! You can create up to ${MAX_WAQFS} waqfs.`);
                    return;
                  }
                  setEditMode(false);
                  setEditingWaqf(null);
                  setShowForm(true);
                }}
                className="flex-1 sm:flex-none"
                style={{ 
                  background: canCreateMore ? 'linear-gradient(to right, #2563eb, #9333ea)' : '#d1d5db',
                  border: 'none',
                  cursor: canCreateMore ? 'pointer' : 'not-allowed',
                  opacity: canCreateMore ? 1 : 0.6
                }}
                disabled={!canCreateMore}
              >
                ➕ Create Waqf {waqfs && waqfs.length > 0 ? `(${waqfs.length}/${MAX_WAQFS})` : ''}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {showForm ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editMode ? '✏️ Edit Waqf' : '➕ Create New Waqf'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editMode ? 'Update your existing waqf details' : `Set up a new perpetual charitable endowment (${(waqfs?.length || 0) + 1}/${MAX_WAQFS})`}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowForm(false);
                    setEditMode(false);
                    setEditingWaqf(null);
                  }}
                  variant="outline"
                  className="text-gray-600 hover:text-gray-900"
                >
                  ✕ Cancel
                </Button>
              </div>
              <WaqfForm 
                initialData={editMode ? editingWaqf ?? undefined : undefined}
                onSubmit={async (waqfData) => {
                  try {
                    console.log('💾 Saving Waqf:', waqfData, 'Edit Mode:', editMode, 'Editing Waqf:', editingWaqf);
                    if (editMode && editingWaqf) {
                      // Update existing waqf
                      await updateWaqf(editingWaqf.id, waqfData);
                      console.log('✅ Waqf updated successfully');
                    } else {
                      // Create new waqf
                      if (!canCreateMore) {
                        alert(`Maximum limit reached! You can create up to ${MAX_WAQFS} waqfs.`);
                        return;
                      }
                      const newWaqf = await createWaqf(waqfData);
                      console.log('✅ Waqf created successfully:', newWaqf);
                    }
                    setShowForm(false);
                    setEditMode(false);
                    setEditingWaqf(null);
                    await refresh();
                  } catch (error) {
                    console.error('❌ Error saving Waqf:', error);
                    alert(`Failed to save Waqf: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
                availableCauses={(() => {
                  const mapped = availableCauses.map((c: Cause) => ({ id: c.id, name: c.name }));
                  console.log('📋 Passing causes to WaqfForm:', mapped.length, mapped);
                  return mapped;
                })()}
                isLoadingCauses={causesLoading}
                causesError={causesError}
              />
            </div>
          ) : userWaqf ? (
            <div className="space-y-6">
              {/* Waqf Selector - Only show if user has multiple waqfs */}
              {waqfs && waqfs.length > 1 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Your Waqfs</h3>
                    <span 
                      className="text-xs font-medium px-3 py-1 rounded-full"
                      style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                    >
                      {waqfs.length} of {MAX_WAQFS} created
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {waqfs.map((w, index) => {
                      const isSelected = selectedWaqfIndex === index;
                      return (
                        <button
                          key={w.id}
                          onClick={() => setSelectedWaqfIndex(index)}
                          className="rounded-lg text-sm font-semibold transition-all"
                          style={{
                            padding: '12px 16px',
                            background: isSelected 
                              ? 'linear-gradient(to right, #2563eb, #9333ea)' 
                              : '#f3f4f6',
                            color: isSelected ? '#ffffff' : '#374151',
                            boxShadow: isSelected 
                              ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
                              : 'none',
                            border: 'none',
                            cursor: 'pointer',
                            minWidth: '120px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#e5e7eb';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>🏛️</span>
                          <span style={{ whiteSpace: 'nowrap' }}>Waqf {index + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Edit Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setEditMode(true);
                    setEditingWaqf(userWaqf);
                    setShowForm(true);
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                  style={{ borderColor: '#9333ea', color: '#9333ea' }}
                >
                  ✏️ Edit This Waqf
                </Button>
              </div>
              
              {/* Dashboard */}
              <EnhancedWaqfDashboard 
                profile={userWaqf}
                onAddFunds={() => {
                  console.log('💰 Add funds clicked');
                  // TODO: Implement add funds modal
                  alert('Add funds feature coming soon!');
                }}
                onDistribute={() => {
                  console.log('📤 Distribute clicked');
                  // TODO: Implement distribution modal
                  alert('Distribution feature coming soon!');
                }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #9333ea)' }}>
                  <span className="text-4xl">🏛️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Waqf Profile Yet</h3>
                <p className="text-gray-600 mb-6">Start your journey of perpetual charity by creating your first Waqf endowment</p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="px-8 py-3"
                  style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)', border: 'none' }}
                >
                  ➕ Create Your First Waqf
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ErrorBoundary 
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <h2 className="font-bold">Something went wrong</h2>
            <p>{error.message}</p>
            <Button onClick={resetErrorBoundary} className="mt-2">
              Try again
            </Button>
          </div>
        )}
      >
        <ReportModal
          waqf={waqfDoc}
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          isLoading={dataLoading}
        />
      </ErrorBoundary>
    </div>
  );
}