import { useCallback, useState } from 'react';
import * as waqfUtils from '@/lib/waqf-utils';
import { calculateGrowthRate } from '@/utils/growthUtils';
import type { WaqfProfile, Donation, ReturnAllocation } from '@/types/waqfs';
// Juno initialization now handled by AuthProvider

type WaqfPerformance = {
  totalDonations: number;
  totalAllocated: number;
  donationCount: number;
  allocationCount: number;
  avgDonation?: number;
  lastDonationDate?: string;
  lastAllocationDate?: string;
};

type WaqfAnalytics = WaqfPerformance & {
  waqfId: string;
  waqfName: string;
  growthRate?: number;
  period?: 'monthly' | 'quarterly' | 'yearly';
};

type PaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: ListOrderField;
  sortOrder?: 'asc' | 'desc';
};

type WaqfFilterOptions = {
  name?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

type WaqfSortOptions = {
  field: string;
  order: 'asc' | 'desc';
};

type WaqfDonationSummary = {
  totalDonations: number;
  totalAmount: number;
  avgDonation: number;
};

type WaqfAllocationSummary = {
  totalAllocations: number;
  totalAmount: number;
  avgAllocation: number;
};

type ListOrderField = 'created_at' | 'updated_at';

export const useWaqfStorage = () => {
  // Juno initialization is now handled by AuthProvider
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createWaqf = useCallback(async (waqf: Omit<WaqfProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.createWaqf(waqf);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createWaqfs = useCallback(async (waqfs: Array<Omit<WaqfProfile, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.createWaqfs(waqfs);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordDonation = useCallback(async (donation: Omit<Donation, 'id'>) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.recordDonation(donation);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordAllocation = useCallback(async (allocation: { causeId: string; amount: number; rationale: string; waqfId: string }) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.recordAllocation(allocation);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWaqf = useCallback(async (id: string) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.getWaqf(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWaqf = useCallback(async (id: string, updates: Partial<WaqfProfile>) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.updateWaqf(id, updates);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateWaqf = useCallback(async (waqfId: string) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.activateWaqf(waqfId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateWaqf = useCallback(async (waqfId: string) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.deactivateWaqf(waqfId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveWaqf = useCallback(async (waqfId: string) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.archiveWaqf(waqfId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWaqfDonations = useCallback(async (waqfId: string) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.getWaqfDonations(waqfId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const allocateReturns = useCallback(async (waqfId: string, allocations: Array<{causeId: string, amount: number, rationale: string}>) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.allocateReturns(waqfId, allocations);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWaqfAllocations = useCallback(async (waqfId: string) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.getWaqfAllocations(waqfId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshWaqfs = useCallback(async () => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.listWaqfs();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordDonations = useCallback(async (donations: Array<{
    waqfId: string,
    amount: number,
    currency: string,
    donorId?: string,
    date: string,
    status?: 'pending' | 'completed' | 'failed'
  }>) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.recordDonations(donations.map(d => ({
        ...d,
        status: d.status || 'completed',
        date: d.date || new Date().toISOString()
      })));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWaqfPerformance = useCallback(async (waqfId: string) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.getWaqfPerformance(waqfId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWaqfAnalytics = useCallback(async (waqfId: string, period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.getWaqfAnalytics(waqfId, period);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateDonationGrowthRate = useCallback(async (waqfId: string, period: 'monthly' | 'quarterly' | 'yearly') => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.calculateDonationGrowthRate(waqfId, period);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateGrowth = useCallback(async (waqfId: string) => {
    if (!navigator.onLine) {
      const offlineError = new Error('You appear to be offline - please check your Internet connection');
      setError(offlineError);
      throw offlineError;
    }
    setLoading(true);
    try {
      return await waqfUtils.calculateGrowth(waqfId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaginatedWaqfs = useCallback(async (options: PaginationOptions) => {
    // Enhanced network check
    if (typeof window !== 'undefined' && !navigator.onLine) {
      const offlineError = new Error('Network offline - please check your connection');
      setError(offlineError);
      throw offlineError;
    }

    setLoading(true);
    try {
      return await waqfUtils.getPaginatedWaqfs(options);
    } catch (err) {
      let displayError: Error;
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          displayError = new Error('Network unavailable - connect to internet and try again');
        } else if (err.message.includes('timeout') || err.message.includes('Network request failed')) {
          displayError = new Error('Slow network detected - please check your connection');
        } else {
          displayError = err;
        }
      } else {
        displayError = new Error('Failed to fetch waqf data');
      }
      
      setError(displayError);
      throw displayError;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createWaqf,
    createWaqfs,
    recordDonation,
    recordAllocation,
    getWaqf,
    updateWaqf,
    activateWaqf,
    deactivateWaqf,
    archiveWaqf,
    getWaqfDonations,
    allocateReturns,
    getWaqfAllocations,
    refreshWaqfs,
    recordDonations,
    getWaqfPerformance,
    calculateDonationGrowthRate,
    getWaqfAnalytics,
    getPaginatedWaqfs,
    calculateGrowth,
    loading,
    error,
    setError,
  };
};
