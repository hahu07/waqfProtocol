import { Doc } from '@junobuild/core';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useWaqf } from '@/providers/WaqfProvider';
import type { WaqfProfile, Cause, Donation, ReturnAllocation } from '@/types/waqfs';
import { useDebouncedCallback } from '@/lib/debounce';
// Juno initialization now handled by AuthProvider
import { listCauses } from '@/lib/cause-utils';
import { randomUUID } from '@/lib/crypto-polyfill';
import { logger } from '@/lib/logger';

type WaqfData = {
  waqf: Doc<WaqfProfile> | null;
  causes: Cause[];
  assets: Donation[];
  allocations: ReturnAllocation[];
  waqfs: Doc<WaqfProfile>[];
};

type WaqfStatistics = {
  totalWaqfs: number;
  activeCauses: number;
  totalDonations: number;
  beneficiaries: number;
  annualGivingGoal?: number;
} | null;

type ApiAllocationResponse = {
  id: string;
  waqfId: string;
  allocations: {
    causeId: string;
    amount: number;
    rationale: string;
  }[];
  allocatedAt: string;
  totalAmount: number;
};

const transformAllocations = (apiAllocations: ApiAllocationResponse[]): ReturnAllocation[] => {
  return apiAllocations.map(a => ({
    id: a.id,
    waqfId: a.waqfId,
    period: 'monthly', // Default value
    totalReturns: a.totalAmount, // Map totalAmount to totalReturns
    allocatedBy: 'system', // Default value
    allocatedAt: a.allocatedAt,
    allocations: a.allocations
  }));
};

export function useFetchWaqfData(waqfId?: string) {
  // Juno initialization is now handled by AuthProvider
  const { 
    getWaqf,
    getWaqfDonations,
    getWaqfAllocations,
    getPaginatedWaqfs,
    createWaqf,
    updateWaqf,
    recordDonation,
    allocateReturns,
    getWaqfPerformance,
    loading,
    error: waqfError,
    setError: setWaqfError
  } = useWaqf();
  
  const [data, setData] = useState<WaqfData>({
    waqf: null,
    causes: [],
    assets: [],
    allocations: [],
    waqfs: []
  });

  const fetchData = async (retryCount = 0, lastError?: Error) => {
    try {
      // Juno initialization is handled by AuthProvider

      // Network awareness
      if (typeof window !== 'undefined' && !navigator.onLine) {
        throw new Error('network_offline');
      }

      logger.debug('🔍 Fetching waqf data...', { waqfId });
      
      const [waqf, waqfs, assets, apiAllocations, causes] = await Promise.all([
        waqfId ? getWaqf(waqfId).then(w => w ? { key: waqfId, data: w } : null) : Promise.resolve(null),
        getPaginatedWaqfs({ limit: 100 }),
        waqfId ? getWaqfDonations(waqfId) : Promise.resolve([]),
        waqfId ? getWaqfAllocations(waqfId) : Promise.resolve([]),
        listCauses().catch(err => {
          logger.warn('⚠️ Failed to fetch causes:', err);
          return [];
        })
      ]);
      
      logger.debug('✅ Fetched waqf data:', { 
        waqf, 
        waqfsCount: waqfs.length, 
        waqfs,
        assets,
        allocations: apiAllocations,
        causesCount: causes.length,
        causes
      });

      setData({
        waqf: waqf,
        causes: causes,
        assets,
        allocations: transformAllocations(apiAllocations),
        waqfs: waqfs.map(w => ({ key: randomUUID(), data: w }))
      });
      setWaqfError(null);
      
    } catch (error) {
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 1000 * (retryCount + 1);
      
      // Special handling for different error types
      if (error instanceof Error) {
        if (error.message === 'network_offline' && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          return fetchData(retryCount + 1, error);
        }
        
        if (error.message.includes('Failed to fetch') && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          return fetchData(retryCount + 1, error);
        }
      }

      // Final error handling
      const userError = new Error(
        retryCount >= MAX_RETRIES 
          ? 'Network issues persist - please check your connection'
          : 'Network error occurred - retrying...'
      );
      
      setWaqfError(userError);
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        return fetchData(retryCount + 1, error instanceof Error ? error : undefined);
      }
      throw error instanceof Error ? error : userError;
    }
  };

  useEffect(() => {
    fetchData().catch(setWaqfError);
  }, [waqfId, getWaqf, getPaginatedWaqfs, getWaqfDonations, getWaqfAllocations]);

  const statistics = useMemo<WaqfStatistics>(() => {
    if (loading) return null;
    
    return {
      totalWaqfs: data.waqfs.length,
      activeCauses: data.causes.filter(c => c.isActive).length,
      totalDonations: data.assets
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + a.amount, 0),
      beneficiaries: data.allocations
        .reduce((sum, a) => sum + a.allocations.length, 0),
      annualGivingGoal: 10000 // Preserved from original
    };
  }, [data, loading]);

  // Add debouncing to refresh
  const debouncedRefresh = useDebouncedCallback(() => fetchData(), 500);

  return { 
    waqfDoc: data.waqf,
    waqf: data.waqf?.data ?? null,
    causes: data.causes,
    assets: data.assets,
    allocations: data.allocations,
    waqfs: data.waqfs.map(w => w.data),
    statistics,
    loading,
    error: waqfError,
    refresh: debouncedRefresh,
    recommendedCauses: data.causes
      .filter(c => c.isActive && c.status === 'approved')
      .sort((a, b) => (b.followers || 0) - (a.followers || 0))
      .slice(0, 6),
    
    // Expose all Waqf operations
    createWaqf,
    updateWaqf,
    recordDonation,
    allocateReturns,
    getWaqfPerformance
  };
}
