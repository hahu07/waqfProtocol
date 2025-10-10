// src/lib/waqf-utils.ts
import { setDoc, getDoc, listDocs } from '@junobuild/core';
import type { WaqfProfile, Donation, ReturnAllocation } from '@/types/waqfs';
import { logActivity } from './activity-utils';

// Collection Names
export const WAQF_COLLECTION = 'waqfs';
export const DONATIONS_COLLECTION = 'donations';
export const ALLOCATIONS_COLLECTION = 'allocations';

type AllocationGroup = {
  waqfId: string;
  allocations: Array<{ causeId: string; amount: number; rationale: string }>;
  allocatedAt: string;
  totalAmount: number;
  id: string;
};

export const createWaqf = async (waqf: Omit<WaqfProfile, 'id' | 'createdAt' | 'updatedAt'>, userId?: string, userName?: string) => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await setDoc({
    collection: WAQF_COLLECTION,
    doc: {
      key: id,
      data: {
        ...waqf,
        id,
        createdAt: now,
        updatedAt: now,
        status: 'active'
      }
    }
  });
  
  // Log waqf creation activity
  if (userId && userName) {
    try {
      await logActivity(
        'waqf_created',
        userId,
        userName,
        {
          targetId: id,
          targetName: waqf.name,
          amount: waqf.waqfAsset,
          status: 'active'
        }
      );
    } catch (error) {
      console.error('Failed to log waqf creation:', error);
      // Don't throw - logging failure shouldn't prevent waqf creation
    }
  }
  
  return id;
};

export const createWaqfs = async (waqfs: Array<Omit<WaqfProfile, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const results = await Promise.all(
    waqfs.map(w => createWaqf(w))
  );
  return results;
};

export const getWaqf = async (id: string) => {
  try {
    const doc = await getDoc({
      collection: WAQF_COLLECTION,
      key: id
    });
    return doc?.data as WaqfProfile | undefined;
  } catch (error) {
    console.error('Error fetching waqf:', error);
    throw new Error(`Failed to fetch waqf ${id}`);
  }
};

export const updateWaqf = async (id: string, updates: Partial<WaqfProfile>, userId?: string, userName?: string) => {
  // Get the full document with version for optimistic locking
  const docResult = await getDoc({
    collection: WAQF_COLLECTION,
    key: id
  });
  
  if (!docResult) throw new Error('Waqf not found');
  
  const existing = docResult.data as WaqfProfile;
  
  await setDoc({
    collection: WAQF_COLLECTION,
    doc: {
      key: id,
      data: {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString()
      },
      version: docResult.version // Include version for optimistic locking
    }
  });
  
  // Log waqf update activity
  if (userId && userName) {
    try {
      await logActivity(
        'waqf_updated',
        userId,
        userName,
        {
          targetId: id,
          targetName: existing.name,
          status: updates.status || existing.status,
          updatedFields: Object.keys(updates)
        }
      );
    } catch (error) {
      console.error('Failed to log waqf update:', error);
      // Don't throw - logging failure shouldn't prevent waqf update
    }
  }
};

export const listWaqfs = async () => {
  try {
    const { items } = await listDocs<{ data: WaqfProfile }>({ 
      collection: WAQF_COLLECTION 
    });
    return items.map(item => item.data.data);
  } catch (error) {
    console.error('Error listing waqfs:', error);
    throw new Error('Failed to list waqfs');
  }
};

type ListOrderField = 'created_at' | 'updated_at';

export const getPaginatedWaqfs = async (options: {
  limit?: number;
  page?: number;
  sortBy?: ListOrderField;
  sortOrder?: 'asc' | 'desc';
}) => {
  console.log('📊 Fetching paginated waqfs...');
  const { items } = await listDocs<WaqfProfile>({
    collection: WAQF_COLLECTION,
    filter: {
      paginate: {
        limit: options.limit,
        startAfter: options.page && options.limit 
          ? String((options.page - 1) * options.limit) 
          : undefined
      },
      order: options.sortBy ? {
        field: options.sortBy,
        desc: options.sortOrder === 'desc'
      } : undefined
    }
  });
  console.log('✅ Got waqf items:', items.length, items);
  // The items from listDocs are already Doc<T>, so item.data is the WaqfProfile
  const result = items.map(item => item.data as WaqfProfile);
  console.log('📦 Returning waqfs:', result);
  return result;
};

export const recordDonation = async (donation: Omit<Donation, 'id'>, userId?: string, userName?: string) => {
  const id = crypto.randomUUID();
  await setDoc({
    collection: DONATIONS_COLLECTION,
    doc: {
      key: id,
      data: {
        ...donation,
        id,
        status: 'completed',
        date: donation.date || new Date().toISOString()
      }
    }
  });
  
  // Log donation activity
  if (userId && userName) {
    try {
      await logActivity(
        'donation_received',
        userId,
        userName,
        {
          targetId: donation.waqfId,
          targetName: `Donation to Waqf`,
          amount: donation.amount,
          donorName: donation.donorName || 'Anonymous'
        }
      );
    } catch (error) {
      console.error('Failed to log donation:', error);
      // Don't throw - logging failure shouldn't prevent donation recording
    }
  }
  
  return id;
};

export const getWaqfDonations = async (waqfId: string) => {
  try {
    const { items } = await listDocs<{ data: Donation }>({ 
      collection: DONATIONS_COLLECTION
    });
    return items
      .filter(item => item.data.data.waqfId === waqfId)
      .map(item => ({ ...item.data.data, id: item.key }));
  } catch (error) {
    console.error('Error fetching waqf donations:', error);
    throw new Error(`Failed to fetch donations for waqf ${waqfId}`);
  }
};

export const recordDonations = async (donations: Array<Omit<Donation, 'id'>>) => {
  const results = await Promise.all(
    donations.map(d => recordDonation(d))
  );
  return results;
};

export const recordAllocation = async (allocation: { causeId: string; amount: number; rationale: string; waqfId: string }, userId?: string, userName?: string) => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await setDoc({
    collection: ALLOCATIONS_COLLECTION,
    doc: {
      key: id,
      data: {
        ...allocation,
        id,
        allocatedAt: now
      }
    }
  });
  
  // Log allocation activity
  if (userId && userName) {
    try {
      await logActivity(
        'allocation_created',
        userId,
        userName,
        {
          targetId: allocation.causeId,
          targetName: `Allocation to Cause`,
          amount: allocation.amount
        }
      );
    } catch (error) {
      console.error('Failed to log allocation:', error);
      // Don't throw - logging failure shouldn't prevent allocation recording
    }
  }
  
  return id;
};

export const allocateReturns = async (waqfId: string, allocations: Array<{causeId: string, amount: number, rationale: string}>, userId?: string, userName?: string) => {
  const id = crypto.randomUUID();
  const totalAmount = allocations.reduce((sum, a) => sum + a.amount, 0);
  await setDoc({
    collection: ALLOCATIONS_COLLECTION,
    doc: {
      key: id,
      data: {
        waqfId,
        allocations,
        allocatedAt: new Date().toISOString(),
        totalAmount
      }
    }
  });
  
  // Log bulk allocation activity
  if (userId && userName) {
    try {
      await logActivity(
        'allocation_created',
        userId,
        userName,
        {
          targetId: waqfId,
          targetName: `Bulk Allocation (${allocations.length} causes)`,
          amount: totalAmount
        }
      );
    } catch (error) {
      console.error('Failed to log bulk allocation:', error);
      // Don't throw - logging failure shouldn't prevent allocation
    }
  }
  
  return id;
};

export const getWaqfAllocations = async (waqfId: string) => {
  try {
    const { items } = await listDocs<{ data: AllocationGroup }>({
      collection: ALLOCATIONS_COLLECTION
    });
    return items
      .filter(item => item.data.data.waqfId === waqfId)
      .map(item => ({
        ...item.data.data,
        id: item.key
      }));
  } catch (error) {
    console.error('Error fetching waqf allocations:', error);
    throw new Error(`Failed to fetch allocations for waqf ${waqfId}`);
  }
};

export const activateWaqf = async (waqfId: string, userId?: string, userName?: string) => {
  const existing = await getWaqf(waqfId);
  if (!existing) throw new Error('Waqf not found');
  const previousStatus = existing.status;
  await setDoc({
    collection: WAQF_COLLECTION,
    doc: {
      key: waqfId,
      data: {
        ...existing,
        status: 'active',
        updatedAt: new Date().toISOString()
      }
    }
  });
  
  // Log waqf activation
  if (userId && userName) {
    try {
      await logActivity(
        'waqf_updated',
        userId,
        userName,
        {
          targetId: waqfId,
          targetName: existing.name,
          status: 'active'
        }
      );
    } catch (error) {
      console.error('Failed to log waqf activation:', error);
    }
  }
};

export const deactivateWaqf = async (waqfId: string, userId?: string, userName?: string) => {
  const existing = await getWaqf(waqfId);
  if (!existing) throw new Error('Waqf not found');
  const previousStatus = existing.status;
  await setDoc({
    collection: WAQF_COLLECTION,
    doc: {
      key: waqfId,
      data: {
        ...existing,
        status: 'inactive',
        updatedAt: new Date().toISOString()
      }
    }
  });
  
  // Log waqf deactivation
  if (userId && userName) {
    try {
      await logActivity(
        'waqf_updated',
        userId,
        userName,
        {
          targetId: waqfId,
          targetName: existing.name,
          status: 'inactive'
        }
      );
    } catch (error) {
      console.error('Failed to log waqf deactivation:', error);
    }
  }
};

export const archiveWaqf = async (waqfId: string, userId?: string, userName?: string) => {
  const existing = await getWaqf(waqfId);
  if (!existing) throw new Error('Waqf not found');
  const previousStatus = existing.status;
  await setDoc({
    collection: WAQF_COLLECTION,
    doc: {
      key: waqfId,
      data: {
        ...existing,
        status: 'archived',
        updatedAt: new Date().toISOString()
      }
    }
  });
  
  // Log waqf archival
  if (userId && userName) {
    try {
      await logActivity(
        'waqf_updated',
        userId,
        userName,
        {
          targetId: waqfId,
          targetName: existing.name,
          status: 'archived'
        }
      );
    } catch (error) {
      console.error('Failed to log waqf archival:', error);
    }
  }
};

export const getWaqfPerformance = async (waqfId: string) => {
  const [donations, allocations] = await Promise.all([
    getWaqfDonations(waqfId),
    getWaqfAllocations(waqfId)
  ]) as [Donation[], AllocationGroup[]];

  const totalDonations = donations.reduce((sum: number, d: Donation) => sum + d.amount, 0);
  const totalAllocations = allocations.reduce(
    (sum: number, a: AllocationGroup) => sum + a.allocations.reduce(
      (innerSum: number, alloc: { causeId: string; amount: number; rationale: string }) => innerSum + alloc.amount, 
      0
    ),
    0
  );

  return {
    totalDonations,
    totalAllocations,
    netGrowth: totalDonations - totalAllocations,
    donationCount: donations.length,
    allocationCount: allocations.length
  };
};

export const getWaqfAnalytics = async (waqfId: string, period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') => {
  const donations = await getWaqfDonations(waqfId);
  const allocations = await getWaqfAllocations(waqfId) as AllocationGroup[];

  // Group by period
  const groupBy = <T>(items: T[], getKey: (item: T) => string) => {
    return items.reduce((acc: Record<string, T[]>, item: T) => {
      const key = getKey(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  };

  const getPeriodKey = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === 'yearly') return String(date.getFullYear());
    if (period === 'quarterly') return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const donationGroups = groupBy(donations, (d: Donation) => getPeriodKey(d.date));
  const allocationGroups = groupBy(allocations, (a: AllocationGroup) => getPeriodKey(a.allocatedAt));

  return {
    donations: donationGroups,
    allocations: allocationGroups
  };
};

export const calculateDonationGrowthRate = async (waqfId: string, period: 'monthly' | 'quarterly' | 'yearly') => {
  const analytics = await getWaqfAnalytics(waqfId, period);
  const periods = Object.keys(analytics.donations).sort();
  
  if (periods.length < 2) return 0;
  
  const current = analytics.donations[periods[periods.length - 1]]
    .reduce((sum, d) => sum + d.amount, 0);
  const previous = analytics.donations[periods[periods.length - 2]]
    .reduce((sum, d) => sum + d.amount, 0);
  
  return previous > 0 ? ((current - previous) / previous) * 100 : 100;
};

export const calculateGrowth = async (waqfId: string) => {
  const performance = await getWaqfPerformance(waqfId);
  return {
    absoluteGrowth: performance.netGrowth,
    relativeGrowth: performance.totalAllocations > 0 
      ? (performance.netGrowth / performance.totalAllocations) * 100 
      : 100
  };
};