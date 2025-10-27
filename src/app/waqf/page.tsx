// app/waqf/page.tsx
'use client';

import { useAuth } from "@/components/auth/AuthProvider";
import { useFetchWaqfData } from "@/hooks/useWaqfData";
import { useWaqfCreatorCheck } from "@/hooks/useWaqfCreatorCheck";
import { EnhancedWaqfDashboard } from "@/components/waqf/EnhancedWaqfDashboard";
import { Button } from "@/components/ui/button";
import { WaqfForm } from "@/components/waqf/WaqfForm";
import { useState, useEffect, useMemo } from 'react';
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


export default function Page() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const { isLoading: roleCheckLoading } = useWaqfCreatorCheck();
  const [showReport, setShowReport] = useState(false);
  const [showDeedViewer, setShowDeedViewer] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const { waqf, waqfDoc, waqfs, loading: dataLoading, error: dataError, refresh, createWaqf, updateWaqf, recordDonation } = useFetchWaqfData();
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingWaqf, setEditingWaqf] = useState<typeof waqf | null>(null);
  const [selectedWaqfIndex, setSelectedWaqfIndex] = useState(0);
  const [availableCauses, setAvailableCauses] = useState<Cause[]>([]);
  const [causesLoading, setCausesLoading] = useState(true);
  const [causesError, setCausesError] = useState<Error | null>(null);
  
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
            <div className="flex flex-wrap gap-2 sm:gap-3">
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
              <EnhancedWaqfDashboard 
                profile={userWaqf}
                onAddFunds={() => {
                  logger.debug('Add funds clicked', { waqfId: userWaqf.id, waqfType: userWaqf.waqfType });
                  setShowAddFundsModal(true);
                }}
                onDistribute={() => {
                  logger.debug('Distribute clicked');
                  // TODO: Implement distribution modal
                  alert('Distribution feature coming soon!');
                }}
                onReturnTranche={async (trancheId: string) => {
                  logger.debug('Return tranche clicked', { waqfId: userWaqf.id, trancheId });
                  
                  const confirm = window.confirm(
                    '🔄 Return Matured Funds?\n\n' +
                    'This will return the matured tranche amount to you. ' +
                    'The funds will be removed from your waqf balance.\n\n' +
                    'Proceed with return?'
                  );
                  
                  if (!confirm) {
                    logger.debug('Tranche return cancelled by user');
                    return;
                  }
                  
                  try {
                    const result = await returnTranche(userWaqf.id, trancheId);
                    
                    if (result.success) {
                      alert('✅ Tranche returned successfully!\n\nThe funds have been removed from your waqf balance.');
                      logger.info('Tranche returned successfully', { waqfId: userWaqf.id, trancheId });
                      
                      // Refresh data to show updated state
                      await refresh();
                    } else {
                      throw new Error(result.error || 'Failed to return tranche');
                    }
                  } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                    logger.error('Failed to return tranche', { error: errorMsg });
                    alert(`❌ Failed to return tranche: ${errorMsg}`);
                  }
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
              onSubmit={async (amount: number, customLockPeriod?: number) => {
                logger.debug('Processing add funds', { waqfId: userWaqf.id, amount, customLockPeriod });
                
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
                  
                  // Record the donation
                  await recordDonation({
                    waqfId: userWaqf.id,
                    amount: amount,
                    currency: 'USD',
                    date: new Date().toISOString(),
                    status: 'completed',
                    donorName: userWaqf.donor.name
                  });
                  
                  logger.info('Donation recorded, now updating waqf financial metrics');
                  
                  // Update the waqf's financial metrics
                  const updatedFinancial = {
                    ...userWaqf.financial,
                    totalDonations: userWaqf.financial.totalDonations + amount,
                    currentBalance: userWaqf.financial.currentBalance + amount
                  };
                  
                  await updateWaqf(userWaqf.id, {
                    financial: updatedFinancial
                  });
                  
                  const newBalance = updatedFinancial.currentBalance;
                  
                  alert(`✅ Successfully added $${amount} to your waqf!\n\nNew Balance: $${newBalance.toFixed(2)}`);
                  logger.info('Funds added successfully', { 
                    waqfId: userWaqf.id, 
                    amount, 
                    newBalance 
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