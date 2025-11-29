'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Portfolio, AllocationMode, PortfolioAllocation } from '@/types/portfolio';
import { WaqfType } from '@/types/waqfs';
import type { TrancheExpirationPreference } from '@/types/waqfs';

export default function DesignAllocationPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [allocationMode, setAllocationMode] = useState<AllocationMode>('balanced');
  const [globalAllocation, setGlobalAllocation] = useState<PortfolioAllocation>({
    permanent: 40,
    temporary_consumable: 30,
    temporary_revolving: 30,
  });
  const [simpleWaqfType, setSimpleWaqfType] = useState<'permanent' | 'temporary_consumable' | 'temporary_revolving'>('permanent');
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [defaultExpirationPreference, setDefaultExpirationPreference] = useState<TrancheExpirationPreference>({
    action: 'refund',
  });
  const [lockPeriodMonths, setLockPeriodMonths] = useState<number>(12);

  // Helper function to normalize allocation to exactly 100%
  const normalizeAllocation = useCallback((allocation: PortfolioAllocation): PortfolioAllocation => {
    const total = allocation.permanent + allocation.temporary_consumable + allocation.temporary_revolving;
    
    if (Math.abs(total - 100) < 0.01) {
      return allocation;
    }
    
    // Normalize proportionally
    if (total > 0) {
      return {
        permanent: (allocation.permanent / total) * 100,
        temporary_consumable: (allocation.temporary_consumable / total) * 100,
        temporary_revolving: (allocation.temporary_revolving / total) * 100,
      };
    }
    
    // If all zeros, default to equal split
    return {
      permanent: 33.33,
      temporary_consumable: 33.33,
      temporary_revolving: 33.34,
    };
  }, []);

  // Helper function to calculate allocation for a specific cause based on supported types
  const calculateAllocationForCause = useCallback((globalAlloc: PortfolioAllocation, supportedTypes: WaqfType[]): PortfolioAllocation => {
    const allocation: PortfolioAllocation = {
      permanent: supportedTypes.includes(WaqfType.PERMANENT) ? globalAlloc.permanent : 0,
      temporary_consumable: supportedTypes.includes(WaqfType.TEMPORARY_CONSUMABLE) ? globalAlloc.temporary_consumable : 0,
      temporary_revolving: supportedTypes.includes(WaqfType.TEMPORARY_REVOLVING) ? globalAlloc.temporary_revolving : 0,
    };

    // Normalize to 100% so cause receives funds in its supported type(s)
    return normalizeAllocation(allocation);
  }, [normalizeAllocation]);

  // Calculate validation status
  const validationStatus = useMemo(() => {
    if (!portfolio) return { isValid: false, errors: [] };

    const errors: string[] = [];

    if (allocationMode === 'simple') {
      // Check if any causes support the selected type
      const supportingCauses = portfolio.items.filter(item =>
        item.cause.supportedWaqfTypes?.includes(
          simpleWaqfType === 'permanent' ? WaqfType.PERMANENT :
          simpleWaqfType === 'temporary_consumable' ? WaqfType.TEMPORARY_CONSUMABLE :
          WaqfType.TEMPORARY_REVOLVING
        )
      );
      
      if (supportingCauses.length === 0) {
        errors.push(`None of your causes support ${simpleWaqfType.replace('temporary_', '')} waqf`);
      } else if (supportingCauses.length < portfolio.items.length) {
        errors.push(`${portfolio.items.length - supportingCauses.length} cause(s) don't support ${simpleWaqfType.replace('temporary_', '')} waqf`);
      }
    } else if (allocationMode === 'balanced') {
      const total = Math.round(globalAllocation.permanent + globalAllocation.temporary_consumable + globalAllocation.temporary_revolving);
      if (total !== 100) {
        errors.push(`Total allocation must equal 100% (currently ${total}%)`);
      }
    } else if (allocationMode === 'advanced') {
      // Check portfolio percentages sum to 100%
      const portfolioTotal = Math.round(
        portfolio.items.reduce((sum, item) => sum + (item.portfolioPercentage || 0), 0)
      );
      if (portfolioTotal !== 100) {
        errors.push(`Portfolio allocation must equal 100% across all causes (currently ${portfolioTotal}%)`);
      }
      
      // Check each cause's waqf type allocation sums to 100%
      portfolio.items.forEach((item, index) => {
        const total = Math.round(item.allocation.permanent + item.allocation.temporary_consumable + item.allocation.temporary_revolving);
        if (total !== 100) {
          errors.push(`${item.cause.name}: waqf type allocation must equal 100% (currently ${total}%)`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [portfolio, allocationMode, simpleWaqfType, globalAllocation]);

  // Load portfolio from session storage with error handling
  useEffect(() => {
    try {
      const savedPortfolio = sessionStorage.getItem('portfolio');
      if (savedPortfolio) {
        const parsed = JSON.parse(savedPortfolio) as Portfolio;
        
        // Deduplicate portfolio items by cause.id
        const seenIds = new Set<string>();
        const deduplicatedItems = parsed.items.filter(item => {
          if (seenIds.has(item.cause.id)) {
            console.warn('Duplicate cause detected and removed:', item.cause.id, item.cause.name);
            return false;
          }
          seenIds.add(item.cause.id);
          return true;
        });
        
        // Clean up allocations to ensure unsupported types are at 0
        const cleanedPortfolio = {
          ...parsed,
          items: deduplicatedItems.map(item => {
            const supportedTypes = item.cause.supportedWaqfTypes || [];
            
            // Keep allocation values but zero out unsupported types
            return {
              ...item,
              allocation: {
                permanent: supportedTypes.includes(WaqfType.PERMANENT) ? item.allocation.permanent : 0,
                temporary_consumable: supportedTypes.includes(WaqfType.TEMPORARY_CONSUMABLE) ? item.allocation.temporary_consumable : 0,
                temporary_revolving: supportedTypes.includes(WaqfType.TEMPORARY_REVOLVING) ? item.allocation.temporary_revolving : 0,
              },
            };
          }),
        };
        
        setPortfolio(cleanedPortfolio);
        setAllocationMode(parsed.allocationMode || 'balanced');
        if (parsed.globalAllocation) {
          setGlobalAllocation(parsed.globalAllocation);
        }
        // Pre-fill default expiration preference if exists
        if ((parsed as any).defaultExpirationPreference) {
          setDefaultExpirationPreference((parsed as any).defaultExpirationPreference);
        }
        // Pre-fill lock period if exists
        if ((parsed as any).lockPeriodMonths) {
          setLockPeriodMonths((parsed as any).lockPeriodMonths);
        }
        setLoadError(null);
      } else {
        // No portfolio found, redirect back
        setLoadError('No portfolio found');
        setTimeout(() => router.push('/waqf/build-portfolio'), 2000);
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setLoadError('Failed to load portfolio. Please try again.');
      setTimeout(() => router.push('/waqf/build-portfolio'), 2000);
    }
  }, [router]);

  // Auto-save portfolio state to session storage (debounced)
  useEffect(() => {
    if (!portfolio) return;

    const timeoutId = setTimeout(() => {
      try {
        const updatedPortfolio = {
          ...portfolio,
          allocationMode,
          globalAllocation: allocationMode === 'balanced' ? globalAllocation : undefined,
          defaultExpirationPreference,
          lockPeriodMonths,
        };
        sessionStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [portfolio, allocationMode, globalAllocation, defaultExpirationPreference, lockPeriodMonths]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (portfolio && !isNavigating) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [portfolio, isNavigating]);

  const handleModeChange = useCallback((mode: AllocationMode) => {
    setAllocationMode(mode);
    
    // When switching to Advanced mode, set equal portfolio split and waqf type split
    if (mode === 'advanced' && portfolio) {
      setPortfolio(prev => {
        if (!prev) return prev;
        
        const numCauses = prev.items.length;
        const equalPortfolioShare = numCauses > 0 ? 100 / numCauses : 0;
        
        return {
          ...prev,
          items: prev.items.map(item => {
            const supportedTypes = item.cause.supportedWaqfTypes || [];
            
            // Set allocation to equal split for supported types only
            const numSupportedTypes = supportedTypes.length;
            const equalWaqfShare = numSupportedTypes > 0 ? 100 / numSupportedTypes : 0;
            
            return {
              ...item,
              // Add portfolioPercentage field for Option B
              portfolioPercentage: equalPortfolioShare,
              allocation: {
                permanent: supportedTypes.includes(WaqfType.PERMANENT) ? equalWaqfShare : 0,
                temporary_consumable: supportedTypes.includes(WaqfType.TEMPORARY_CONSUMABLE) ? equalWaqfShare : 0,
                temporary_revolving: supportedTypes.includes(WaqfType.TEMPORARY_REVOLVING) ? equalWaqfShare : 0,
              },
            };
          }),
        };
      });
    }
  }, [portfolio]);

  const handleGlobalAllocationChange = useCallback((type: keyof PortfolioAllocation, value: number) => {
    setGlobalAllocation(prev => {
      const newAllocation = { ...prev, [type]: Math.max(0, Math.min(100, value)) };
      
      // Auto-adjust other values to maintain 100% total
      const total = newAllocation.permanent + newAllocation.temporary_consumable + newAllocation.temporary_revolving;
      
      if (Math.abs(total - 100) > 0.01) {
        // Distribute the difference proportionally to other types
        const diff = 100 - total;
        const otherTypes = (Object.keys(newAllocation) as Array<keyof PortfolioAllocation>).filter(t => t !== type);
        
        if (otherTypes.length > 0) {
          const adjustment = diff / otherTypes.length;
          otherTypes.forEach(t => {
            newAllocation[t] = Math.max(0, Math.min(100, newAllocation[t] + adjustment));
          });
          
          // Force exact 100% by adjusting the largest non-changed value
          const finalTotal = newAllocation.permanent + newAllocation.temporary_consumable + newAllocation.temporary_revolving;
          if (Math.abs(finalTotal - 100) > 0.01) {
            const largestOther = otherTypes.reduce((a, b) => 
              newAllocation[a] > newAllocation[b] ? a : b
            );
            newAllocation[largestOther] += (100 - finalTotal);
          }
        }
      }
      
      return newAllocation;
    });
  }, []);

  // Handler for advanced mode per-cause allocation
  const handleItemAllocationChange = useCallback((index: number, type: keyof PortfolioAllocation, value: number) => {
    setPortfolio(prev => {
      if (!prev) return prev;
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        allocation: {
          ...newItems[index].allocation,
          [type]: Math.max(0, Math.min(100, value)),
        },
      };
      return { ...prev, items: newItems };
    });
  }, []);

  // Handler for advanced mode portfolio percentage
  const handlePortfolioPercentageChange = useCallback((index: number, value: number) => {
    setPortfolio(prev => {
      if (!prev) return prev;
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        portfolioPercentage: Math.max(0, Math.min(100, value)),
      };
      return { ...prev, items: newItems };
    });
  }, []);

  const handleContinue = useCallback(async () => {
    if (!portfolio || !validationStatus.isValid) return;

    setIsNavigating(true);

    try {
      let updatedPortfolio: Portfolio;

      if (allocationMode === 'simple') {
        // Simple mode: 100% to selected type for all causes that support it
        // Only causes that support the selected type get funds
        const waqfTypeEnum = simpleWaqfType === 'permanent' ? WaqfType.PERMANENT :
                           simpleWaqfType === 'temporary_consumable' ? WaqfType.TEMPORARY_CONSUMABLE :
                           WaqfType.TEMPORARY_REVOLVING;
        
        // Count causes that support the selected type
        const supportingCauses = portfolio.items.filter(item => 
          (item.cause.supportedWaqfTypes || []).includes(waqfTypeEnum)
        );
        const amountPerSupportingCause = supportingCauses.length > 0 
          ? portfolio.totalAmount / supportingCauses.length 
          : 0;

        updatedPortfolio = {
          ...portfolio,
          allocationMode,
          // Persist revolving configuration into the portfolio snapshot
          defaultExpirationPreference,
          lockPeriodMonths,
          items: portfolio.items.map(item => {
            const supportedTypes = item.cause.supportedWaqfTypes || [];
            const { portfolioPercentage, ...itemWithoutPortfolioPercentage } = item;
            
            // If cause supports the selected type, give it equal share
            if (supportedTypes.includes(waqfTypeEnum)) {
              return {
                ...itemWithoutPortfolioPercentage,
                totalAmount: amountPerSupportingCause,
                allocation: {
                  permanent: simpleWaqfType === 'permanent' ? 100 : 0,
                  temporary_consumable: simpleWaqfType === 'temporary_consumable' ? 100 : 0,
                  temporary_revolving: simpleWaqfType === 'temporary_revolving' ? 100 : 0,
                },
              };
            } else {
              // Cause doesn't support this type, gets $0
              return {
                ...itemWithoutPortfolioPercentage,
                totalAmount: 0,
                allocation: calculateAllocationForCause(
                  { permanent: 33.33, temporary_consumable: 33.33, temporary_revolving: 33.34 },
                  supportedTypes
                ),
              };
            }
          }),
        };
      } else if (allocationMode === 'balanced') {
        // Balanced mode: Apply global allocation respecting each cause's supported types
        // Weight distribution based on which types each cause supports
        
        // Calculate weight BEFORE normalization - sum of global percentages for supported types
        let totalWeight = 0;
        const causeWeights = portfolio.items.map(item => {
          const supportedTypes = item.cause.supportedWaqfTypes || [];
          
          // Weight = sum of global allocation % for types this cause supports
          const weight = 
            (supportedTypes.includes(WaqfType.PERMANENT) ? globalAllocation.permanent : 0) +
            (supportedTypes.includes(WaqfType.TEMPORARY_CONSUMABLE) ? globalAllocation.temporary_consumable : 0) +
            (supportedTypes.includes(WaqfType.TEMPORARY_REVOLVING) ? globalAllocation.temporary_revolving : 0);
          
          totalWeight += weight;
          
          // Allocation shows how funds should be split within this cause (normalized to 100%)
          const allocation = calculateAllocationForCause(globalAllocation, supportedTypes);
          
          return { weight, allocation };
        });
        
        updatedPortfolio = {
          ...portfolio,
          allocationMode,
          globalAllocation,
          // Persist revolving configuration into the portfolio snapshot
          defaultExpirationPreference,
          lockPeriodMonths,
          items: portfolio.items.map((item, index) => {
            const { portfolioPercentage, ...itemWithoutPortfolioPercentage } = item;
            const causeAmount = totalWeight > 0 
              ? (portfolio.totalAmount * causeWeights[index].weight) / totalWeight 
              : portfolio.totalAmount / portfolio.items.length;
            
            return {
              ...itemWithoutPortfolioPercentage,
              totalAmount: causeAmount,
              allocation: causeWeights[index].allocation,
            };
          }),
        };
      } else {
        // Advanced mode: keep existing allocations but ensure unsupported types are at 0
        // Use portfolioPercentage for custom distribution, or equal if not set
        updatedPortfolio = {
          ...portfolio,
          allocationMode,
          // Persist revolving configuration into the portfolio snapshot
          defaultExpirationPreference,
          lockPeriodMonths,
          items: portfolio.items.map(item => {
            const supportedTypes = item.cause.supportedWaqfTypes || [];
            const causePercentage = item.portfolioPercentage || (100 / portfolio.items.length);
            const causeAmount = (portfolio.totalAmount * causePercentage) / 100;
            
            return {
              ...item,
              totalAmount: causeAmount,
              allocation: {
                permanent: supportedTypes.includes(WaqfType.PERMANENT) ? item.allocation.permanent : 0,
                temporary_consumable: supportedTypes.includes(WaqfType.TEMPORARY_CONSUMABLE) ? item.allocation.temporary_consumable : 0,
                temporary_revolving: supportedTypes.includes(WaqfType.TEMPORARY_REVOLVING) ? item.allocation.temporary_revolving : 0,
              },
            };
          }),
        };
      }

      // Save to session storage
      sessionStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));

      // Navigate to preview
      router.push('/waqf/preview-impact');
    } catch (error) {
      console.error('Failed to save and continue:', error);
      setIsNavigating(false);
      alert('Failed to save your allocation. Please try again.');
    }
  }, [portfolio, validationStatus, allocationMode, simpleWaqfType, globalAllocation, calculateAllocationForCause, router]);

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {loadError ? (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-gray-900 font-semibold text-lg mb-2">{loadError}</p>
              <p className="text-gray-600 text-sm">Redirecting you back to portfolio builder...</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-600">Loading portfolio...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
                🎨
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                  Design Allocation
                </h1>
                <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">2</span>
                  Set your waqf type strategy
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/waqf/build-portfolio')}
              variant="outline"
              className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
            >
              ← Back
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 lg:py-10">
        {/* Mode Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Allocation Strategy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Simple Mode */}
            <button
              onClick={() => handleModeChange('simple')}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                allocationMode === 'simple'
                  ? 'border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-100'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl">
                  🎯
                </div>
                <h3 className="text-lg font-bold text-gray-900">Simple</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Choose one waqf type for your entire portfolio. Perfect for beginners.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Easiest to understand
              </div>
            </button>

            {/* Balanced Mode */}
            <button
              onClick={() => handleModeChange('balanced')}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                allocationMode === 'balanced'
                  ? 'border-purple-500 bg-purple-50 shadow-lg ring-4 ring-purple-100'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-2xl">
                  ⚖️
                </div>
                <h3 className="text-lg font-bold text-gray-900">Balanced</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Set a global allocation mix applied to all causes. Recommended for most donors.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Best balance of control & simplicity
              </div>
            </button>

            {/* Advanced Mode */}
            <button
              onClick={() => handleModeChange('advanced')}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                allocationMode === 'advanced'
                  ? 'border-orange-500 bg-orange-50 shadow-lg ring-4 ring-orange-100'
                  : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl">
                  🎛️
                </div>
                <h3 className="text-lg font-bold text-gray-900">Advanced</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Customize allocation for each cause individually. Maximum control.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Full customization
              </div>
            </button>
          </div>
        </div>

        {/* Revolving Waqf Expiration Preference */}
        {(globalAllocation.temporary_revolving > 0 || 
          simpleWaqfType === 'temporary_revolving' || 
          (allocationMode === 'advanced' && portfolio.items.some(item => item.allocation.temporary_revolving > 0))) && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 border-b border-purple-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">🔄 Revolving Waqf Maturity Preferences</h2>
              <p className="text-sm text-gray-600">
                Choose what happens by default when your revolving waqf contributions mature
              </p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span>💡</span> About Revolving Waqf
                </h4>
                <p className="text-sm text-blue-800">
                  Revolving waqfs are time-bound. Set how long funds stay locked, and what happens when that period ends. 
                  You can customize these settings later for each contribution if needed.
                </p>
              </div>

              {/* Lock Period Configuration */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🔒</span> Initial Lock Period
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  How long should contributions be locked before they mature?
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label htmlFor="lockPeriodMonths" className="block text-sm font-semibold text-gray-700 mb-2">
                      Lock Period (months)
                    </label>
                    <input
                      type="number"
                      id="lockPeriodMonths"
                      min="1"
                      max="240"
                      value={lockPeriodMonths}
                      onChange={(e) => setLockPeriodMonths(parseInt(e.target.value) || 12)}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900 font-semibold"
                    />
                  </div>
                  <div className="bg-white border-2 border-purple-200 rounded-xl p-4 min-w-[200px]">
                    <div className="text-xs text-gray-500 mb-1">Maturity Timeline</div>
                    <div className="text-2xl font-black text-purple-600">
                      {lockPeriodMonths} {lockPeriodMonths === 1 ? 'month' : 'months'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ≈ {Math.floor(lockPeriodMonths / 12)} {Math.floor(lockPeriodMonths / 12) === 1 ? 'year' : 'years'} {lockPeriodMonths % 12 > 0 ? `${lockPeriodMonths % 12}mo` : ''}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLockPeriodMonths(6)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border-2 border-purple-200 hover:border-purple-400 transition-colors"
                  >
                    6 months
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockPeriodMonths(12)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border-2 border-purple-200 hover:border-purple-400 transition-colors"
                  >
                    1 year
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockPeriodMonths(24)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border-2 border-purple-200 hover:border-purple-400 transition-colors"
                  >
                    2 years
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockPeriodMonths(36)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border-2 border-purple-200 hover:border-purple-400 transition-colors"
                  >
                    3 years
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockPeriodMonths(60)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border-2 border-purple-200 hover:border-purple-400 transition-colors"
                  >
                    5 years
                  </button>
                </div>
                <p className="text-xs text-purple-700 mt-3">
                  💡 Tip: Longer lock periods allow for larger projects, while shorter periods provide more flexibility
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  What should happen when the lock period ends?
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Refund Option */}
                  <button
                    type="button"
                    onClick={() => setDefaultExpirationPreference({ action: 'refund' })}
                    className={`border-2 rounded-xl p-4 text-left transition-all ${
                      defaultExpirationPreference.action === 'refund'
                        ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl">
                        💰
                      </div>
                      <span className="font-bold text-gray-900">Refund</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Return the principal back to you when the lock period ends
                    </p>
                  </button>

                  {/* Rollover Option */}
                  <button
                    type="button"
                    onClick={() => setDefaultExpirationPreference({ 
                      action: 'rollover',
                      rolloverMonths: 12
                    })}
                    className={`border-2 rounded-xl p-4 text-left transition-all ${
                      defaultExpirationPreference.action === 'rollover'
                        ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-100 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-xl">
                        🔄
                      </div>
                      <span className="font-bold text-gray-900">Rollover</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Automatically extend for another lock period
                    </p>
                  </button>

                  {/* Convert to Permanent Option */}
                  <button
                    type="button"
                    onClick={() => setDefaultExpirationPreference({ action: 'convert_permanent' })}
                    className={`border-2 rounded-xl p-4 text-left transition-all ${
                      defaultExpirationPreference.action === 'convert_permanent'
                        ? 'border-green-500 bg-green-50 ring-4 ring-green-100 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-xl">
                        🏛️
                      </div>
                      <span className="font-bold text-gray-900">Convert to Permanent</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Transform into a perpetual endowment that lasts forever
                    </p>
                  </button>

                  {/* Convert to Consumable Option */}
                  <button
                    type="button"
                    onClick={() => setDefaultExpirationPreference({ 
                      action: 'convert_consumable',
                      consumableSchedule: 'phased',
                      consumableDuration: 12
                    })}
                    className={`border-2 rounded-xl p-4 text-left transition-all ${
                      defaultExpirationPreference.action === 'convert_consumable'
                        ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xl">
                        ⚡
                      </div>
                      <span className="font-bold text-gray-900">Convert to Consumable</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Spend the principal over time for immediate impact
                    </p>
                  </button>
                </div>
              </div>

              {/* Additional configuration for rollover */}
              {defaultExpirationPreference.action === 'rollover' && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <label htmlFor="rolloverMonths" className="block text-sm font-semibold text-gray-900 mb-2">
                    Default Rollover Period (months)
                  </label>
                  <input
                    type="number"
                    id="rolloverMonths"
                    min="1"
                    max="240"
                    value={defaultExpirationPreference.rolloverMonths || 12}
                    onChange={(e) => setDefaultExpirationPreference({
                      ...defaultExpirationPreference,
                      rolloverMonths: parseInt(e.target.value) || 12
                    })}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900"
                  />
                  <p className="text-xs text-purple-700 mt-1">
                    The principal will be locked for this many months after rollover
                  </p>
                </div>
              )}

              {/* Additional configuration for consumable */}
              {defaultExpirationPreference.action === 'convert_consumable' && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 space-y-4">
                  <div>
                    <label htmlFor="consumableSchedule" className="block text-sm font-semibold text-gray-900 mb-2">
                      Spending Schedule
                    </label>
                    <select
                      id="consumableSchedule"
                      value={defaultExpirationPreference.consumableSchedule || 'phased'}
                      onChange={(e) => setDefaultExpirationPreference({
                        ...defaultExpirationPreference,
                        consumableSchedule: e.target.value as any
                      })}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-900"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="phased">Phased</option>
                      <option value="milestone-based">Milestone-Based</option>
                      <option value="ongoing">Ongoing</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="consumableDuration" className="block text-sm font-semibold text-gray-900 mb-2">
                      Duration (months)
                    </label>
                    <input
                      type="number"
                      id="consumableDuration"
                      min="1"
                      max="60"
                      value={defaultExpirationPreference.consumableDuration || 12}
                      onChange={(e) => setDefaultExpirationPreference({
                        ...defaultExpirationPreference,
                        consumableDuration: parseInt(e.target.value) || 12
                      })}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-900"
                    />
                    <p className="text-xs text-orange-700 mt-1">
                      How many months to spend the principal over
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-800">
                  ℹ️ <strong>Note:</strong> This is your default preference for all revolving waqf contributions. 
                  You can override this choice for individual contributions later.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Allocation Interface */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {allocationMode === 'simple' && 'Select Waqf Type'}
              {allocationMode === 'balanced' && 'Set Global Allocation'}
              {allocationMode === 'advanced' && 'Customize Per Cause'}
            </h2>
            <p className="text-sm text-gray-600">
              {allocationMode === 'simple' && 'This type will be applied to all causes in your portfolio'}
              {allocationMode === 'balanced' && 'This allocation mix will be applied to all causes equally'}
              {allocationMode === 'advanced' && 'Set unique allocation for each cause'}
            </p>
          </div>

          <div className="p-8">
            {/* Simple Mode Content */}
            {allocationMode === 'simple' && (
              <div className="space-y-6">
                {/* Educational info about Simple Mode */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>💡</span> How Simple Mode Works
                  </h4>
                  <p className="text-sm text-blue-800">
                    The waqf type you choose will be applied to all causes that support it. 
                    Some causes may only accept specific types based on their purpose (e.g., emergency relief needs consumable funds).
                  </p>
                </div>

                {/* Warning if some causes don't support selected type */}
                {validationStatus.errors.length > 0 && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-1">Compatibility Notice</h4>
                        {validationStatus.errors.map((error, idx) => (
                          <p key={idx} className="text-sm text-yellow-800 mb-1">{error}</p>
                        ))}
                        <p className="text-xs text-yellow-700 mt-2">
                          💡 Tip: Choose a different waqf type or use <strong>Advanced Mode</strong> for per-cause control.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-center text-gray-600 mb-8">
                  Select one waqf type to apply to your portfolio
                </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Permanent Option */}
                      <button
                        onClick={() => setSimpleWaqfType('permanent')}
                        className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                          simpleWaqfType === 'permanent'
                            ? 'border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-100'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-4xl shadow-lg">
                      🏛️
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Permanent</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Principal preserved forever. Only investment returns are distributed to causes.
                    </p>
                    <div className="space-y-2 text-xs text-left">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Perpetual impact</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Generational legacy</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Stable annual returns</span>
                      </div>
                    </div>
                      </button>

                      {/* Consumable Option */}
                      <button
                        onClick={() => setSimpleWaqfType('temporary_consumable')}
                        className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                          simpleWaqfType === 'temporary_consumable'
                            ? 'border-green-500 bg-green-50 shadow-lg ring-4 ring-green-100'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                        }`}
                      >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-4xl shadow-lg">
                      🎁
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Consumable</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Entire amount spent over time for maximum immediate impact on urgent needs.
                    </p>
                    <div className="space-y-2 text-xs text-left">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Immediate impact</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Emergency relief</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Full deployment</span>
                      </div>
                    </div>
                      </button>

                      {/* Revolving Option */}
                      <button
                        onClick={() => setSimpleWaqfType('temporary_revolving')}
                        className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                          simpleWaqfType === 'temporary_revolving'
                            ? 'border-purple-500 bg-purple-50 shadow-lg ring-4 ring-purple-100'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                        }`}
                      >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg">
                      🔄
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Revolving</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Funds lent and recovered, then redistributed cyclically for sustainable impact.
                    </p>
                    <div className="space-y-2 text-xs text-left">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Cyclical impact</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Microfinance support</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Self-sustaining</span>
                      </div>
                    </div>
                      </button>
                    </div>

                {/* Selected Type Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 mt-8">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Selected Strategy
                  </h4>
                  <p className="text-sm text-gray-700">
                    <strong className="capitalize">{simpleWaqfType.replace('temporary_', '')}</strong> waqf type will be applied to causes that support it.
                  </p>
                </div>
              </div>
            )}

            {/* Balanced Mode Content */}
            {allocationMode === 'balanced' && (
              <div className="space-y-8">
                {/* Educational info about Balanced Mode */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>💡</span> How Balanced Mode Works
                  </h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Set your preferred allocation mix. The system automatically adjusts how much each cause receives to match your desired portfolio percentages.
                  </p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>• If you select <strong>40% permanent, 30% consumable, 30% revolving</strong></div>
                    <div>• Causes supporting permanent waqf get more funds (40% of portfolio)</div>
                    <div>• Causes supporting consumable/revolving get proportionally less (30% each)</div>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    💡 Each cause receives 100% in its supported type(s), but amounts are weighted to achieve your portfolio mix.
                  </p>
                </div>
                {/* Permanent Waqf */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl">
                        🏛️
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Permanent Waqf</h3>
                        <p className="text-xs text-gray-600">Principal preserved forever, only returns distributed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                        {Math.round(globalAllocation.permanent)}%
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={globalAllocation.permanent}
                    onChange={(e) => handleGlobalAllocationChange('permanent', Number(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${globalAllocation.permanent}%, #e5e7eb ${globalAllocation.permanent}%, #e5e7eb 100%)`
                    }}
                  />
                </div>

                {/* Temporary Consumable */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl">
                        🎁
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Temporary Consumable</h3>
                        <p className="text-xs text-gray-600">Entire amount spent over time for immediate impact</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                        {Math.round(globalAllocation.temporary_consumable)}%
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={globalAllocation.temporary_consumable}
                    onChange={(e) => handleGlobalAllocationChange('temporary_consumable', Number(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${globalAllocation.temporary_consumable}%, #e5e7eb ${globalAllocation.temporary_consumable}%, #e5e7eb 100%)`
                    }}
                  />
                </div>

                {/* Temporary Revolving */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-xl">
                        🔄
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Temporary Revolving</h3>
                        <p className="text-xs text-gray-600">Lent and recovered, then redistributed cyclically</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                        {Math.round(globalAllocation.temporary_revolving)}%
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={globalAllocation.temporary_revolving}
                    onChange={(e) => handleGlobalAllocationChange('temporary_revolving', Number(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${globalAllocation.temporary_revolving}%, #e5e7eb ${globalAllocation.temporary_revolving}%, #e5e7eb 100%)`
                    }}
                  />
                </div>

                {/* Total Validation */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">Total Allocation:</span>
                    <span className={`text-2xl font-black ${
                      Math.round(globalAllocation.permanent + globalAllocation.temporary_consumable + globalAllocation.temporary_revolving) === 100
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {Math.round(globalAllocation.permanent + globalAllocation.temporary_consumable + globalAllocation.temporary_revolving)}%
                    </span>
                  </div>
                  {Math.round(globalAllocation.permanent + globalAllocation.temporary_consumable + globalAllocation.temporary_revolving) !== 100 && (
                    <p className="text-xs text-red-600 mt-2">⚠️ Total must equal 100%</p>
                  )}
                </div>

                {/* Per-Cause Preview */}
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    How This Applies to Each Cause
                  </h4>
                  <div className="space-y-3">
                    {portfolio.items.map(item => {
                      const supportedTypes = item.cause.supportedWaqfTypes || [];
                      const allocation = calculateAllocationForCause(globalAllocation, supportedTypes);
                      
                      return (
                        <div key={item.cause.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{item.cause.icon}</div>
                            <div>
                              <div className="font-medium text-gray-900">{item.cause.name}</div>
                              <div className="text-xs text-gray-500">
                                Supports: {supportedTypes.map(type => {
                                  if (type === WaqfType.PERMANENT) return '🏛️';
                                  if (type === WaqfType.TEMPORARY_CONSUMABLE) return '🎁';
                                  if (type === WaqfType.TEMPORARY_REVOLVING) return '🔄';
                                  return '';
                                }).join(' ')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm font-semibold">
                            {supportedTypes.includes(WaqfType.PERMANENT) && (
                              <span className="text-blue-600">{Math.round(allocation.permanent)}%</span>
                            )}
                            {supportedTypes.includes(WaqfType.TEMPORARY_CONSUMABLE) && (
                              <span className="text-green-600">{Math.round(allocation.temporary_consumable)}%</span>
                            )}
                            {supportedTypes.includes(WaqfType.TEMPORARY_REVOLVING) && (
                              <span className="text-purple-600">{Math.round(allocation.temporary_revolving)}%</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Mode Content */}
            {allocationMode === 'advanced' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🎛️</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Advanced Customization - Two Levels</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Level 1:</strong> Allocate % of your portfolio to each cause (must sum to 100%)
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Level 2:</strong> For each cause, allocate % across waqf types (each must sum to 100%)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Level 1: Portfolio Allocation */}
                <div className="bg-white rounded-xl border-2 border-orange-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-bold">1</span>
                    Portfolio Allocation Across Causes
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">What % of your total portfolio goes to each cause?</p>
                  
                  <div className="space-y-4">
                    {portfolio.items.map((item, index) => (
                      <div key={item.cause.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{item.cause.icon}</div>
                            <div>
                              <div className="font-semibold text-gray-900">{item.cause.name}</div>
                              <div className="text-xs text-gray-500">Portfolio share</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-orange-600">
                              {Math.round(item.portfolioPercentage || 0)}%
                            </div>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.portfolioPercentage || 0}
                          onChange={(e) => handlePortfolioPercentageChange(index, Number(e.target.value))}
                          className="w-full h-3 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #f97316 0%, #f97316 ${item.portfolioPercentage || 0}%, #e5e7eb ${item.portfolioPercentage || 0}%, #e5e7eb 100%)`
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Portfolio Total */}
                  <div className="mt-4 bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700">Total Portfolio Allocation:</span>
                      <span className={`text-2xl font-black ${
                        Math.round(portfolio.items.reduce((sum, item) => sum + (item.portfolioPercentage || 0), 0)) === 100
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {Math.round(portfolio.items.reduce((sum, item) => sum + (item.portfolioPercentage || 0), 0))}%
                      </span>
                    </div>
                    {Math.round(portfolio.items.reduce((sum, item) => sum + (item.portfolioPercentage || 0), 0)) !== 100 && (
                      <p className="text-xs text-red-600 mt-2">⚠️ Total must equal 100%</p>
                    )}
                  </div>
                </div>

                {/* Level 2: Waqf Type Allocation Per Cause */}
                <div className="bg-white rounded-xl border-2 border-purple-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">2</span>
                    Waqf Type Allocation Per Cause
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">For each cause, how should funds be split across waqf types?</p>
                  
                  <div className="space-y-6">

                    {portfolio.items.map((item, index) => (
                      <div key={item.cause.id} className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl">
                            {item.cause.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{item.cause.name}</h3>
                            <p className="text-xs text-gray-600 mb-1">
                              Portfolio share: <strong className="text-orange-600">{Math.round(item.portfolioPercentage || 0)}%</strong>
                            </p>
                            <p className="text-xs text-gray-600">
                              Supports: {item.cause.supportedWaqfTypes?.map(type => {
                                if (type === WaqfType.PERMANENT) return '🏛️ Permanent';
                                if (type === WaqfType.TEMPORARY_CONSUMABLE) return '🎁 Consumable';
                                if (type === WaqfType.TEMPORARY_REVOLVING) return '🔄 Revolving';
                                return type;
                              }).join(', ') || 'All types'}
                            </p>
                          </div>
                        </div>

                    <div className="space-y-4">
                      {/* Permanent */}
                      {item.cause.supportedWaqfTypes?.includes(WaqfType.PERMANENT) && (
                        <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <span className="text-lg">🏛️</span>
                            Permanent
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {Math.round(item.allocation.permanent)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.allocation.permanent}
                          onChange={(e) => handleItemAllocationChange(index, 'permanent', Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${item.allocation.permanent}%, #e5e7eb ${item.allocation.permanent}%, #e5e7eb 100%)`
                          }}
                          aria-label="Permanent waqf allocation percentage"
                          aria-valuenow={item.allocation.permanent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                        </div>
                      )}

                      {/* Consumable */}
                      {item.cause.supportedWaqfTypes?.includes(WaqfType.TEMPORARY_CONSUMABLE) && (
                        <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <span className="text-lg">🎁</span>
                            Consumable
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {Math.round(item.allocation.temporary_consumable)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.allocation.temporary_consumable}
                          onChange={(e) => handleItemAllocationChange(index, 'temporary_consumable', Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #10b981 0%, #10b981 ${item.allocation.temporary_consumable}%, #e5e7eb ${item.allocation.temporary_consumable}%, #e5e7eb 100%)`
                          }}
                        />
                        </div>
                      )}

                      {/* Revolving */}
                      {item.cause.supportedWaqfTypes?.includes(WaqfType.TEMPORARY_REVOLVING) && (
                        <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <span className="text-lg">🔄</span>
                            Revolving
                          </span>
                          <span className="text-lg font-bold text-purple-600">
                            {Math.round(item.allocation.temporary_revolving)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.allocation.temporary_revolving}
                          onChange={(e) => handleItemAllocationChange(index, 'temporary_revolving', Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${item.allocation.temporary_revolving}%, #e5e7eb ${item.allocation.temporary_revolving}%, #e5e7eb 100%)`
                          }}
                        />
                        </div>
                      )}

                      {/* Total */}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-700">Total:</span>
                          <span className={`text-xl font-black ${
                            Math.round(item.allocation.permanent + item.allocation.temporary_consumable + item.allocation.temporary_revolving) === 100
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {Math.round(item.allocation.permanent + item.allocation.temporary_consumable + item.allocation.temporary_revolving)}%
                          </span>
                        </div>
                      </div>
                    </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation Banner */}
        {!validationStatus.isValid && (
          <div className="sticky bottom-4 mx-auto max-w-2xl bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-red-700 font-semibold mb-2">
                  Please fix the following issues before continuing:
                </p>
                <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
                  {validationStatus.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            onClick={() => router.push('/waqf/build-portfolio')}
            variant="outline"
            className="border-2 border-gray-300 hover:border-gray-400"
            disabled={isNavigating}
          >
            ← Back to Portfolio
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!validationStatus.isValid || isNavigating}
            className={`font-bold py-3 px-8 shadow-lg transition-all ${
              !validationStatus.isValid || isNavigating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40'
            }`}
          >
            {isNavigating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Continue to Preview →'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

