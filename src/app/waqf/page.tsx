// app/waqf/page.tsx
'use client';

import { useAuth } from "@/components/auth/AuthProvider";
import { useFetchWaqfData } from "@/hooks/useWaqfData";
import { useWaqfCreatorCheck } from "@/hooks/useWaqfCreatorCheck";
import { PortfolioWaqfDashboard } from "@/components/waqf/PortfolioWaqfDashboard";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ReportModal } from '@/components/waqf/reportModal';
import { WaqfDeedViewer } from '@/components/waqf/WaqfDeedViewer';
import type { Cause } from "@/types/waqfs";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { listActiveCauses } from "@/lib/cause-utils";
import { logger } from '@/lib/logger';
import { canAcceptContribution, getCompletionStatus } from '@/lib/consumable-contribution-handler';
import { returnTranche } from '@/lib/api/tranche-operations';
import { AddFundsModal } from '@/components/waqf/AddFundsModal';
import { TranchesDisplay } from '@/components/waqf/TranchesDisplay';


export default function Page() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const { isLoading: roleCheckLoading } = useWaqfCreatorCheck();
  const [showReport, setShowReport] = useState(false);
  const [showDeedViewer, setShowDeedViewer] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [hasFixedAllocations, setHasFixedAllocations] = useState(false);
  const { waqf, waqfDoc, waqfs, loading: dataLoading, error: dataError, refresh, createWaqf, updateWaqf, recordDonation } = useFetchWaqfData();
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingWaqf, setEditingWaqf] = useState<typeof waqf | null>(null);
  const [selectedWaqfIndex, setSelectedWaqfIndex] = useState(0);
  const [availableCauses, setAvailableCauses] = useState<Cause[]>([]);
  const [causesLoading, setCausesLoading] = useState(true);
  const [causesError, setCausesError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get the first waqf from the list (user's waqf)
  const selectedWaqf = waqfs && waqfs.length > 0 ? waqfs[selectedWaqfIndex] : waqf;
  const MAX_WAQFS = 5;
  const canCreateMore = (waqfs?.length || 0) < MAX_WAQFS;
  
  // Enrich waqf with actual cause details
  const userWaqf = useMemo(() => {
    if (!selectedWaqf) return null;
    
    // If supportedCauses is already populated, return as-is
    if (selectedWaqf.supportedCauses && selectedWaqf.supportedCauses.length > 0) {
      return selectedWaqf;
    }
    
    // Otherwise, populate from availableCauses based on selectedCauses
    const supportedCauses = selectedWaqf.selectedCauses
      ?.map(causeId => availableCauses.find(c => c.id === causeId))
      .filter((c): c is Cause => c !== undefined) || [];
    
    logger.debug('Enriching waqf with causes', {
      selectedCauses: selectedWaqf.selectedCauses,
      foundCauses: supportedCauses.length,
      supportedCausesCount: supportedCauses.length
    });
    
    return {
      ...selectedWaqf,
      supportedCauses
    };
  }, [selectedWaqf, availableCauses]);
  
  logger.debug('User waqf state', { 
    hasWaqf: !!userWaqf, 
    totalWaqfs: waqfs?.length, 
    canCreateMore 
  });

  // Fetch active causes when auth is complete
  useEffect(() => {
    const fetchCauses = async () => {
      // Don't fetch if still loading auth or if there's an auth error
      if (authLoading || roleCheckLoading || authError) {
        return;
      }
      
      try {
        logger.debug('Fetching active causes');
        setCausesLoading(true);
        setCausesError(null);
        const causes = await listActiveCauses();
        logger.info('Fetched active causes', { count: causes.length });
        setAvailableCauses(causes);
      } catch (error) {
        logger.error('Error fetching causes', { error });
        setCausesError(error instanceof Error ? error : new Error('Failed to load causes'));
      } finally {
        setCausesLoading(false);
      }
    };
    
    fetchCauses();
  }, [authLoading, roleCheckLoading, authError]);

  // Helper function to refresh with loading indicator
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      // Keep indicator visible for at least 500ms for better UX
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [refresh]);

  // Disabled: Too aggressive auto-refresh
  // Users can manually refresh if needed using the refresh button
  // Auto-refresh only happens every 5 minutes now (see below)

  // Periodic refresh every 5 minutes for updates (reduced from 30s)
  useEffect(() => {
    if (authLoading || roleCheckLoading || authError) return;

    const intervalId = setInterval(async () => {
      logger.debug('Periodic refresh: updating waqf data');
      await handleRefresh();
    }, 300000); // 5 minutes (300000ms)

    return () => clearInterval(intervalId);
  }, [handleRefresh, authLoading, roleCheckLoading, authError]);

  // Auto-fix null hybridAllocations
  useEffect(() => {
    const fixNullHybridAllocations = async () => {
      if (!userWaqf || !userWaqf.isHybrid || hasFixedAllocations) return;
      
      // Check if hybridAllocations has null values
      const hasNullValues = userWaqf.hybridAllocations?.some(alloc => {
        const allocsAny = alloc.allocations as any;
        return allocsAny?.permanent === null || 
               allocsAny?.temporary_consumable === null ||
               allocsAny?.Permanent === null || 
               allocsAny?.TemporaryConsumable === null;
      });
      
      if (!hasNullValues) return;
      
      logger.warn('Detected null hybridAllocations, fixing...');
      
      // Reconstruct hybridAllocations with default 100% consumable for each cause
      const fixedHybridAllocations = userWaqf.supportedCauses?.map(cause => ({
        causeId: cause.id,
        allocations: {
          Permanent: 0,
          TemporaryConsumable: 100,  // Default to consumable
          TemporaryRevolving: 0
        }
      }));
      
      if (fixedHybridAllocations) {
        try {
          setHasFixedAllocations(true); // Set before updating to prevent loops
          await updateWaqf(userWaqf.id, { hybridAllocations: fixedHybridAllocations });
          logger.info('Fixed null hybridAllocations, page will refresh shortly');
          // Delay refresh to prevent rapid updates
          setTimeout(() => refresh(), 1000);
        } catch (error) {
          logger.error('Failed to fix hybridAllocations', { error });
          setHasFixedAllocations(false); // Reset on error
        }
      }
    };
    
    fixNullHybridAllocations();
  }, [userWaqf, hasFixedAllocations, updateWaqf, refresh]);

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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Waqf Portfolio</h1>
                {isRefreshing && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm sm:text-base">Manage your perpetual charitable endowments</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="flex-1 sm:flex-none"
                style={{ borderColor: '#6b7280', color: '#6b7280' }}
                title="Refresh data"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Refreshing...
                  </span>
                ) : (
                  '🔄 Refresh'
                )}
              </Button>
              <Button 
                onClick={() => router.push('/waqf/reports')}
                variant="outline"
                className="flex-1 sm:flex-none"
                style={{ borderColor: '#2563eb', color: '#2563eb' }}
              >
                📊 Reports
              </Button>
              <Button 
                onClick={() => router.push('/waqf/impact')}
                variant="outline"
                className="flex-1 sm:flex-none"
                style={{ borderColor: '#10b981', color: '#10b981' }}
              >
                🌍 Impact
              </Button>
              <Button 
                onClick={() => router.push('/waqf/build-portfolio')}
                className="flex-1 sm:flex-none"
                style={{ 
                  background: canCreateMore ? 'linear-gradient(to right, #2563eb, #9333ea)' : '#d1d5db',
                  border: 'none',
                  cursor: canCreateMore ? 'pointer' : 'not-allowed',
                  opacity: canCreateMore ? 1 : 0.6
                }}
                disabled={!canCreateMore}
              >
                ➕ Build Portfolio {waqfs && waqfs.length > 0 ? `(${waqfs.length}/${MAX_WAQFS})` : ''}
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
                userId={user?.key || ''}
                onSubmit={async (waqfData) => {
                  try {
                    logger.info('Saving waqf', { editMode, hasExistingWaqf: !!editingWaqf });
                    
                    if (editMode && editingWaqf) {
                      // Update existing waqf
                      await updateWaqf(editingWaqf.id, waqfData);
                      logger.info('Waqf updated successfully', { waqfId: editingWaqf.id });
                      alert('✅ Waqf updated successfully!');
                    } else {
                      // Create new waqf
                      if (!canCreateMore) {
                        alert(`⚠️ Maximum limit reached! You can create up to ${MAX_WAQFS} waqfs.`);
                        return;
                      }
                      const newWaqfId = await createWaqf(waqfData);
                      logger.info('Waqf created successfully', { waqfId: newWaqfId });
                      alert('✅ Waqf created successfully! Your perpetual charitable endowment is now active.');
                    }
                    
                    setShowForm(false);
                    setEditMode(false);
                    setEditingWaqf(null);
                    await refresh();
                  } catch (error) {
                    logger.error('Error saving waqf', { error, editMode });
                    
                    // Parse and display user-friendly error messages
                    let errorMessage = 'Failed to save Waqf';
                    
                    if (error instanceof Error) {
                      const msg = error.message;
                      
                      // Extract specific validation errors from backend
                      if (msg.includes('missing field')) {
                        const fieldMatch = msg.match(/missing field `([^`]+)`/);
                        const field = fieldMatch ? fieldMatch[1] : 'required field';
                        errorMessage = `Missing required field: ${field}. Please ensure all required information is provided.`;
                      } else if (msg.includes('Invalid waqf data structure')) {
                        errorMessage = 'Invalid waqf data. Please check all fields and try again.';
                      } else if (msg.includes('Waqf asset must be')) {
                        errorMessage = 'Please enter a valid waqf asset amount (must be greater than 0).';
                      } else if (msg.includes('email')) {
                        errorMessage = 'Please enter a valid email address.';
                      } else if (msg.includes('Permission denied')) {
                        errorMessage = 'You do not have permission to create/edit waqfs. Please contact support.';
                      } else if (msg.includes('Failed to fetch') || msg.includes('Network')) {
                        errorMessage = 'Network error. Please check your internet connection and try again.';
                      } else if (msg.includes('timeout')) {
                        errorMessage = 'Request timed out. Please try again.';
                      } else if (msg.includes('authentication') || msg.includes('login')) {
                        errorMessage = 'Authentication error. Please log in again.';
                      } else {
                        errorMessage = msg;
                      }
                    }
                    
                    alert(`❌ ${errorMessage}`);
                  }
                }}
                availableCauses={availableCauses}
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
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                {userWaqf.deedDocument && (
                  <Button
                    onClick={() => setShowDeedViewer(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                    style={{ borderColor: '#2563eb', color: '#2563eb' }}
                  >
                    📜 View Waqf Deed
                  </Button>
                )}
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
              <PortfolioWaqfDashboard 
                profile={userWaqf}
                onAddFunds={() => {
                  logger.debug('Add funds clicked', { waqfId: userWaqf.id, waqfType: userWaqf.waqfType });
                  setShowAddFundsModal(true);
                }}
                onViewDetails={() => setShowDeedViewer(true)}
              />
              
              {/* Tranches Display for Revolving Waqfs */}
              {((typeof userWaqf.waqfType === 'string' && (userWaqf.waqfType === 'TemporaryRevolving' || userWaqf.waqfType === 'temporary_revolving')) || 
                (userWaqf.isHybrid && userWaqf.revolvingDetails?.contributionTranches && userWaqf.revolvingDetails.contributionTranches.length > 0)) && (
                <div className="mt-6">
                  <TranchesDisplay 
                    waqf={userWaqf}
                    onReturnTranche={async (trancheId) => {
                      try {
                        const result = await returnTranche(userWaqf.id, trancheId);
                        if (result.success) {
                          alert('✅ Tranche returned successfully!');
                          await handleRefresh();
                        } else {
                          alert(`❌ Failed to return tranche: ${result.error}`);
                        }
                      } catch (error) {
                        logger.error('Error returning tranche', { error });
                        alert('❌ An error occurred while returning the tranche');
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #9333ea)' }}>
                  <span className="text-4xl">🏛️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Waqf Portfolio Yet</h3>
                <p className="text-gray-600 mb-6">Start your journey of perpetual charity by building your first diverse Waqf portfolio</p>
                <Button 
                  onClick={() => router.push('/waqf/build-portfolio')}
                  className="px-8 py-3"
                  style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)', border: 'none' }}
                >
                  🎯 Build Your First Portfolio
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
        
        {userWaqf && (
          <>
            <WaqfDeedViewer
              waqf={userWaqf}
              isOpen={showDeedViewer}
              onClose={() => setShowDeedViewer(false)}
            />
            
              <AddFundsModal
              isOpen={showAddFundsModal}
              onClose={() => setShowAddFundsModal(false)}
              waqf={userWaqf}
              onSubmit={async (amount: number, customAllocations?: { [causeId: string]: number }, lockPeriodMonths?: number) => {
                logger.debug('Processing add funds', { waqfId: userWaqf.id, amount, customAllocations });
                
                try {
                  // For consumable waqfs, check if they can accept contributions
                  if (userWaqf.waqfType === 'temporary_consumable') {
                    const contributionResult = canAcceptContribution(userWaqf, amount);
                    
                    if (!contributionResult.accepted) {
                      alert(`❌ Cannot add funds: ${contributionResult.reason}`);
                      logger.info('Contribution rejected', { 
                        waqfId: userWaqf.id, 
                        amount, 
                        reason: contributionResult.reason 
                      });
                      throw new Error(contributionResult.reason);
                    }
                  }
                  
                  // Calculate how funds are allocated to each cause
                  // Use custom allocations if provided, otherwise use existing portfolio allocation
                  const allocatedCauses: { [causeId: string]: number } = {};
                  const updatedCauseAllocations = { ...userWaqf.financial.causeAllocations };
                  
                  userWaqf.selectedCauses.forEach(causeId => {
                    const percentage = customAllocations 
                      ? (customAllocations[causeId] || 0)
                      : (userWaqf.causeAllocation[causeId] || 0);
                    const causeAmount = (amount * percentage) / 100;
                    
                    if (causeAmount > 0) {
                      allocatedCauses[causeId] = causeAmount;
                      // Add to existing cause allocation
                      updatedCauseAllocations[causeId] = (updatedCauseAllocations[causeId] || 0) + causeAmount;
                    }
                  });
                  
                  logger.info('Calculated cause allocations', { allocatedCauses, updatedCauseAllocations });
                  
                  // Record the donation with cause allocations
                  await recordDonation({
                    waqfId: userWaqf.id,
                    amount: amount,
                    currency: 'USD',
                    date: new Date().toISOString(),
                    status: 'completed',
                    donorName: userWaqf.donor.name,
                    allocatedCauses,
                    lockPeriodMonths,
                  });
                  
                  logger.info('Donation recorded, now updating waqf financial metrics');
                  
                  // Update the waqf's financial metrics including cause allocations
                  // Note: waqfAsset (principal) is immutable and cannot be updated
                  const newBalance = userWaqf.financial.currentBalance + amount;
                  const updatedFinancial = {
                    ...userWaqf.financial,
                    totalDonations: userWaqf.financial.totalDonations + amount,
                    currentBalance: newBalance,
                    causeAllocations: updatedCauseAllocations
                  };
                  
                  // Recalculate causeAllocation percentages based on new total
                  const updatedCauseAllocation: { [causeId: string]: number } = {};
                  userWaqf.selectedCauses.forEach(causeId => {
                    const causeAmount = updatedCauseAllocations[causeId] || 0;
                    updatedCauseAllocation[causeId] = newBalance > 0 ? (causeAmount / newBalance) * 100 : 0;
                  });
                  
                  logger.info('Recalculated cause allocation percentages', { updatedCauseAllocation, newBalance });
                  
                  // Ensure hybridAllocations are maintained (if not set, keep existing or initialize)
                  const updatedHybridAllocations = userWaqf.isHybrid && userWaqf.hybridAllocations 
                    ? userWaqf.hybridAllocations 
                    : undefined;
                  
                  await updateWaqf(userWaqf.id, {
                    financial: updatedFinancial,
                    causeAllocation: updatedCauseAllocation,
                    ...(updatedHybridAllocations && { hybridAllocations: updatedHybridAllocations })
                  });
                  
                  const causesCount = Object.keys(allocatedCauses).length;
                  const allocationMode = customAllocations ? 'custom' : 'portfolio';
                  
                  const formatNGN = (amt: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amt);
                  alert(`✅ Successfully added ${formatNGN(amount)} to your portfolio!\n\nNew Balance: ${formatNGN(newBalance)}\nDistributed across ${causesCount} cause${causesCount > 1 ? 's' : ''}${customAllocations ? ' (custom allocation)' : ''}`);
                  logger.info('Funds added successfully', {
                    waqfId: userWaqf.id, 
                    amount, 
                    newBalance,
                    allocatedCauses,
                    allocationMode
                  });
                  
                  // Refresh the waqf data
                  await refresh();
                } catch (error) {
                  logger.error('Error recording donation', { 
                    error,
                    errorMessage: error instanceof Error ? error.message : String(error)
                  });
                  const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
                  alert(`❌ Failed to add funds: ${errorMsg}\n\nPlease try again.`);
                  throw error;
                }
              }}
            />
          </>
        )}
      </ErrorBoundary>
    </div>
  );
}