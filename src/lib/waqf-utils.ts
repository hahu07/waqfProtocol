// src/lib/waqf-utils.ts
import { setDoc, getDoc, listDocs } from '@junobuild/core';
import type { WaqfProfile, Donation, WaqfType, ContributionTranche } from '@/types/waqfs';
import { logActivity } from './activity-utils';
import { randomUUID } from './crypto-polyfill';
import { logger } from './logger';

// Backend data type that Juno accepts (no Date objects, plain serializable data)
type BackendWaqfData = Record<string, unknown>;

// Transform WaqfProfile to match Rust backend expectations (snake_case)
const transformWaqfForBackend = (waqf: WaqfProfile): BackendWaqfData => {
  return {
    id: waqf.id,
    name: waqf.name,
    description: waqf.description,
    waqf_asset: waqf.waqfAsset,
    waqf_type: waqf.waqfType,
    is_hybrid: waqf.isHybrid,
    hybrid_allocations: waqf.hybridAllocations?.map(allocation => ({
      cause_id: allocation.causeId,
      allocations: allocation.allocations
    })),
    consumable_details: waqf.consumableDetails ? {
      spending_schedule: waqf.consumableDetails.spendingSchedule,
      start_date: waqf.consumableDetails.startDate || null,
      end_date: waqf.consumableDetails.endDate || null,
      target_amount: waqf.consumableDetails.targetAmount || null,
      target_beneficiaries: waqf.consumableDetails.targetBeneficiaries || null,
      minimum_monthly_distribution: waqf.consumableDetails.minimumMonthlyDistribution || null,
      milestones: waqf.consumableDetails.milestones || null
    } : undefined,
    revolving_details: (waqf.revolvingDetails &&
                        waqf.revolvingDetails.lockPeriodMonths !== undefined &&
                        waqf.revolvingDetails.maturityDate &&
                        waqf.revolvingDetails.principalReturnMethod) ? {
      lock_period_months: waqf.revolvingDetails.lockPeriodMonths,
      maturity_date: waqf.revolvingDetails.maturityDate,
      principal_return_method: waqf.revolvingDetails.principalReturnMethod,
      installment_schedule: waqf.revolvingDetails.installmentSchedule,
      early_withdrawal_penalty: waqf.revolvingDetails.earlyWithdrawalPenalty,
      early_withdrawal_allowed: waqf.revolvingDetails.earlyWithdrawalAllowed,
      contribution_tranches: waqf.revolvingDetails.contributionTranches?.map(t => ({
        id: t.id,
        amount: t.amount,
        contribution_date: t.contributionDate,
        maturity_date: t.maturityDate,
        is_returned: t.isReturned,
        returned_date: t.returnedDate,
        status: t.status,
        penalty_applied: t.penaltyApplied,
        rollover_origin_id: t.rolloverOriginId,
        rollover_target_id: t.rolloverTargetId,
        installment_payments: t.installmentPayments?.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          due_date: payment.dueDate,
          status: payment.status,
          paid_date: payment.paidDate ?? null
        }))
      })),
      auto_rollover_preference: waqf.revolvingDetails.autoRolloverPreference ?? 'none',
      auto_rollover_target_cause: waqf.revolvingDetails.autoRolloverTargetCause ?? null,
      pending_notifications: waqf.revolvingDetails.pendingNotifications?.length
        ? waqf.revolvingDetails.pendingNotifications
        : null
    } : undefined,
    investment_strategy: waqf.investmentStrategy ? {
      asset_allocation: waqf.investmentStrategy.assetAllocation || 'Balanced Portfolio',
      expected_annual_return: waqf.investmentStrategy.expectedAnnualReturn || 0,
      distribution_frequency: waqf.investmentStrategy.distributionFrequency || 'annually'
    } : undefined,
    deed_document: waqf.deedDocument ? {
      signed_at: waqf.deedDocument.signedAt,
      donor_signature: waqf.deedDocument.donorSignature,
      document_version: waqf.deedDocument.documentVersion
    } : undefined,
    donor: waqf.donor,
    selected_causes: waqf.selectedCauses,
    cause_allocation: waqf.causeAllocation || {},
    waqf_assets: waqf.waqfAssets || [],
    supported_causes: waqf.supportedCauses || [],
    status: waqf.status,
    is_donated: waqf.isDonated,
    notifications: {
      contribution_reminders: waqf.notifications.contributionReminders,
      impact_reports: waqf.notifications.impactReports,
      financial_updates: waqf.notifications.financialUpdates
    },
    reporting_preferences: {
      frequency: waqf.reportingPreferences?.frequency || 'yearly',
      report_types: waqf.reportingPreferences?.reportTypes || ['financial'],
      delivery_method: waqf.reportingPreferences?.deliveryMethod || 'email'
    },
    financial: {
      total_donations: waqf.financial.totalDonations,
      total_distributed: waqf.financial.totalDistributed,
      current_balance: waqf.financial.currentBalance,
      investment_returns: waqf.financial.investmentReturns,
      total_investment_return: waqf.financial.totalInvestmentReturn,
      growth_rate: waqf.financial.growthRate,
      cause_allocations: waqf.financial.causeAllocations || {},
      impact_metrics: waqf.financial.impactMetrics ? {
        beneficiaries_supported: waqf.financial.impactMetrics.beneficiariesSupported,
        projects_completed: waqf.financial.impactMetrics.projectsCompleted,
        completion_rate: waqf.financial.impactMetrics.completionRate
      } : undefined
    },
    created_by: waqf.createdBy,
    created_at: waqf.createdAt,
    updated_at: waqf.updatedAt,
    last_contribution_date: waqf.lastContributionDate,
    next_contribution_date: waqf.nextContributionDate,
    next_report_date: waqf.nextReportDate
  };
};

// Transform backend data (snake_case) to frontend format (camelCase)
const transformWaqfFromBackend = (data: unknown): WaqfProfile => {
  // Type guard to safely access properties
  const d = data as Record<string, unknown>;
  const getNestedProp = (obj: unknown, ...keys: string[]): unknown => {
    if (!obj || typeof obj !== 'object') return undefined;
    const o = obj as Record<string, unknown>;
    return keys.reduce((acc: unknown, key) => {
      if (!acc || typeof acc !== 'object') return undefined;
      return (acc as Record<string, unknown>)[key];
    }, o);
  };
  
  const hybridAllocations = (d.hybrid_allocations || d.hybridAllocations) as unknown;
  const transformedHybridAllocations = hybridAllocations && Array.isArray(hybridAllocations)
    ? (hybridAllocations as Array<Record<string, unknown>>).map(alloc => ({
        causeId: (alloc.cause_id || alloc.causeId) as string,
        allocations: alloc.allocations as WaqfProfile['hybridAllocations'][0]['allocations']
      }))
    : undefined;

  const deedDoc = (d.deed_document || d.deedDocument) as unknown;
  const transformedDeedDoc = deedDoc && typeof deedDoc === 'object'
    ? {
        signedAt: (getNestedProp(deedDoc, 'signed_at') || getNestedProp(deedDoc, 'signedAt')) as string,
        donorSignature: (getNestedProp(deedDoc, 'donor_signature') || getNestedProp(deedDoc, 'donorSignature')) as string,
        documentVersion: (getNestedProp(deedDoc, 'document_version') || getNestedProp(deedDoc, 'documentVersion')) as string
      }
    : undefined;

  const transformedWaqf = {
    id: (d.id || '') as string,
    name: (d.name || '') as string,
    description: (d.description || '') as string,
    waqfAsset: (d.waqf_asset || d.waqfAsset || 0) as number,
    waqfType: ((d.waqf_type || d.waqfType || 'permanent') as string) as WaqfType,
    isHybrid: (d.is_hybrid ?? d.isHybrid ?? false) as boolean,
    hybridAllocations: transformedHybridAllocations,
    consumableDetails: (() => {
      const details = d.consumable_details || d.consumableDetails;
      if (!details || typeof details !== 'object') return undefined;
      const cd = details as Record<string, unknown>;
      return {
        spendingSchedule: (cd.spending_schedule || cd.spendingSchedule) as string,
        startDate: (cd.start_date || cd.startDate) as string | undefined,
        endDate: (cd.end_date || cd.endDate) as string | undefined,
        targetAmount: (cd.target_amount ?? cd.targetAmount) as number | undefined,
        targetBeneficiaries: (cd.target_beneficiaries ?? cd.targetBeneficiaries) as number | undefined,
        minimumMonthlyDistribution: (cd.minimum_monthly_distribution ?? cd.minimumMonthlyDistribution) as number | undefined,
        milestones: (cd.milestones) as WaqfProfile['consumableDetails']['milestones']
      } as WaqfProfile['consumableDetails'];
    })(),
    revolvingDetails: (() => {
      const details = d.revolving_details || d.revolvingDetails;
      if (!details || typeof details !== 'object') return undefined;
      const rd = details as Record<string, unknown>;
      // Only return if required fields exist
      if (rd.lock_period_months === undefined && rd.lockPeriodMonths === undefined) return undefined;
      
      // Transform contribution tranches
      const tranches = rd.contribution_tranches || rd.contributionTranches;
      const transformedTranches = tranches && Array.isArray(tranches)
        ? (tranches as Array<Record<string, unknown>>).map(t => {
            const payments = t.installment_payments || t.installmentPayments;
            const installmentPayments = payments && Array.isArray(payments)
              ? (payments as Array<Record<string, unknown>>).map(payment => ({
                  id: payment.id as string,
                  amount: (payment.amount ?? 0) as number,
                  dueDate: (payment.due_date || payment.dueDate) as string,
                  status: (payment.status || 'scheduled') as 'scheduled' | 'paid' | 'missed',
                  paidDate: (payment.paid_date || payment.paidDate) as string | undefined
                }))
              : undefined;
            return {
              id: t.id as string,
              amount: (t.amount ?? 0) as number,
              contributionDate: (t.contribution_date || t.contributionDate) as string,
              maturityDate: (t.maturity_date || t.maturityDate) as string,
              isReturned: (t.is_returned ?? t.isReturned ?? false) as boolean,
              returnedDate: (t.returned_date || t.returnedDate) as string | undefined,
              status: (t.status || t.tranche_status) as ContributionTranche['status'],
              penaltyApplied: (t.penalty_applied ?? t.penaltyApplied) as number | undefined,
              rolloverOriginId: (t.rollover_origin_id || t.rolloverOriginId) as string | undefined,
              rolloverTargetId: (t.rollover_target_id || t.rolloverTargetId) as string | undefined,
              installmentPayments
            };
          })
        : []; // Default to empty array instead of undefined
      
      console.log('🔄 Transform revolvingDetails:', {
        hasTranches: !!tranches,
        isArray: Array.isArray(tranches),
        rawTranches: tranches,
        transformedLength: transformedTranches.length
      });
      
      return {
        lockPeriodMonths: (rd.lock_period_months ?? rd.lockPeriodMonths) as number,
        maturityDate: (rd.maturity_date || rd.maturityDate) as string,
        principalReturnMethod: (rd.principal_return_method || rd.principalReturnMethod) as 'lump_sum' | 'installments',
        installmentSchedule: (rd.installment_schedule || rd.installmentSchedule) as WaqfProfile['revolvingDetails']['installmentSchedule'],
        earlyWithdrawalPenalty: (rd.early_withdrawal_penalty ?? rd.earlyWithdrawalPenalty) as number | undefined,
        earlyWithdrawalAllowed: (rd.early_withdrawal_allowed ?? rd.earlyWithdrawalAllowed) as boolean,
        contributionTranches: transformedTranches,
        autoRolloverPreference: (rd.auto_rollover_preference || rd.autoRolloverPreference || 'none') as NonNullable<WaqfProfile['revolvingDetails']>['autoRolloverPreference'],
        autoRolloverTargetCause: (rd.auto_rollover_target_cause || rd.autoRolloverTargetCause) as string | undefined,
        pendingNotifications: (() => {
          const notifications = rd.pending_notifications || rd.pendingNotifications;
          if (!notifications || !Array.isArray(notifications)) {
            return [];
          }
          return (notifications as unknown[]).filter((note): note is string => typeof note === 'string');
        })()
      } as WaqfProfile['revolvingDetails'];
    })(),
    investmentStrategy: (() => {
      const strategy = d.investment_strategy || d.investmentStrategy;
      if (!strategy || typeof strategy !== 'object') return undefined;
      const s = strategy as Record<string, unknown>;
      return {
        assetAllocation: (s.asset_allocation || s.assetAllocation || 'Balanced Portfolio') as string,
        expectedAnnualReturn: (s.expected_annual_return ?? s.expectedAnnualReturn ?? 0) as number,
        distributionFrequency: (s.distribution_frequency || s.distributionFrequency || 'annually') as 'monthly' | 'quarterly' | 'annually'
      };
    })(),
    deedDocument: transformedDeedDoc,
    donor: d.donor as WaqfProfile['donor'],
    selectedCauses: (d.selected_causes || d.selectedCauses || []) as string[],
    causeAllocation: (d.cause_allocation || d.causeAllocation || {}) as Record<string, number>,
    waqfAssets: (d.waqf_assets || d.waqfAssets || []) as WaqfProfile['waqfAssets'],
    supportedCauses: (d.supported_causes || d.supportedCauses || []) as WaqfProfile['supportedCauses'],
    status: (d.status || 'active') as WaqfProfile['status'],
    isDonated: (d.is_donated ?? d.isDonated) as boolean | undefined,
    notifications: {
      contributionReminders: (getNestedProp(d.notifications, 'contribution_reminders') ?? getNestedProp(d.notifications, 'contributionReminders') ?? true) as boolean,
      impactReports: (getNestedProp(d.notifications, 'impact_reports') ?? getNestedProp(d.notifications, 'impactReports') ?? true) as boolean,
      financialUpdates: (getNestedProp(d.notifications, 'financial_updates') ?? getNestedProp(d.notifications, 'financialUpdates') ?? true) as boolean
    },
    reportingPreferences: {
      frequency: (getNestedProp(d.reporting_preferences || d.reportingPreferences, 'frequency') || 'yearly') as 'quarterly' | 'semiannually' | 'yearly',
      reportTypes: (getNestedProp(d.reporting_preferences || d.reportingPreferences, 'report_types') || getNestedProp(d.reporting_preferences || d.reportingPreferences, 'reportTypes') || ['financial']) as ('financial' | 'impact')[],
      deliveryMethod: (getNestedProp(d.reporting_preferences || d.reportingPreferences, 'delivery_method') || getNestedProp(d.reporting_preferences || d.reportingPreferences, 'deliveryMethod') || 'email') as 'email' | 'platform' | 'both'
    },
    financial: (() => {
      const fin = d.financial as Record<string, unknown> | undefined;
      
      if (!fin) {
        return {
          totalDonations: 0,
          totalDistributed: 0,
          currentBalance: 0,
          investmentReturns: [],
          totalInvestmentReturn: 0,
          growthRate: 0,
          causeAllocations: {},
          impactMetrics: undefined
        };
      }
      
      const impactMetrics = fin.impact_metrics || fin.impactMetrics;
      
      const transformed = {
        totalDonations: (fin.total_donations ?? fin.totalDonations ?? 0) as number,
        totalDistributed: (fin.total_distributed ?? fin.totalDistributed ?? 0) as number,
        currentBalance: (fin.current_balance ?? fin.currentBalance ?? 0) as number,
        investmentReturns: (fin.investment_returns || fin.investmentReturns || []) as number[],
        totalInvestmentReturn: (fin.total_investment_return ?? fin.totalInvestmentReturn ?? 0) as number,
        growthRate: (fin.growth_rate ?? fin.growthRate ?? 0) as number,
        causeAllocations: (fin.cause_allocations || fin.causeAllocations || {}) as Record<string, number>,
        impactMetrics: impactMetrics ? {
          beneficiariesSupported: ((impactMetrics as Record<string, unknown>).beneficiaries_supported ?? (impactMetrics as Record<string, unknown>).beneficiariesSupported ?? 0) as number,
          projectsCompleted: ((impactMetrics as Record<string, unknown>).projects_completed ?? (impactMetrics as Record<string, unknown>).projectsCompleted ?? 0) as number,
          completionRate: ((impactMetrics as Record<string, unknown>).completion_rate ?? (impactMetrics as Record<string, unknown>).completionRate) as number | undefined
        } : undefined
      };
      
      return transformed;
    })(),
    createdBy: (d.created_by || d.createdBy || '') as string,
    createdAt: (d.created_at || d.createdAt || new Date().toISOString()) as string,
    updatedAt: (d.updated_at || d.updatedAt) as string | undefined,
    lastContributionDate: (d.last_contribution_date || d.lastContributionDate) as string | undefined,
    nextContributionDate: (d.next_contribution_date || d.nextContributionDate) as string | undefined,
    nextReportDate: (d.next_report_date || d.nextReportDate) as string | undefined
  };
  
  return transformedWaqf;
};

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
  const id = randomUUID();
  const now = new Date().toISOString();
  
  const waqfData: WaqfProfile = {
    ...waqf,
    id,
    createdAt: now,
    updatedAt: now,
    status: 'active'
  } as WaqfProfile;
  
  // Transform to backend format
  const backendData = transformWaqfForBackend(waqfData);
  
  await setDoc({
    collection: WAQF_COLLECTION,
    doc: {
      key: id,
      data: backendData as Record<string, unknown>
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
      logger.error('Failed to log waqf creation', { error, waqfId: id });
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
    if (!doc?.data) return undefined;
    return transformWaqfFromBackend(doc.data);
  } catch (error) {
    logger.error('Error fetching waqf', { error, id });
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
  
  // Transform existing data from backend format
  const existing = transformWaqfFromBackend(docResult.data);
  
  const updatedWaqf: WaqfProfile = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
    // Preserve immutable fields - never allow modification
    createdAt: existing.createdAt,
    createdBy: existing.createdBy,
    id: existing.id
  };
  
  // Transform to backend format
  const backendData = transformWaqfForBackend(updatedWaqf);
  
  await setDoc({
    collection: WAQF_COLLECTION,
    doc: {
      key: id,
      data: backendData as Record<string, unknown>,
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
      logger.error('Failed to log waqf update', { error, waqfId: id });
      // Don't throw - logging failure shouldn't prevent waqf update
    }
  }
};

export const listWaqfs = async () => {
  try {
    const { items } = await listDocs({
      collection: WAQF_COLLECTION 
    });
    return items.map(item => transformWaqfFromBackend(item.data));
  } catch (error) {
    logger.error('Error listing waqfs', { error });
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
  logger.debug('Fetching paginated waqfs', { options });
  const { items } = await listDocs({
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
  logger.debug('Got waqf items', { count: items.length });
  // Transform items from backend format to frontend format
  const result = items.map(item => transformWaqfFromBackend(item.data));
  logger.debug('Returning waqfs', { count: result.length });
  return result;
};

export const recordDonation = async (donation: Omit<Donation, 'id'>, userId?: string, userName?: string) => {
  const id = randomUUID();
  await setDoc({
    collection: DONATIONS_COLLECTION,
    doc: {
      key: id,
      data: {
        id,
        waqf_id: donation.waqfId,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status || 'completed',
        date: donation.date || new Date().toISOString(),
        transaction_id: donation.transactionId,
        donor_name: donation.donorName,
        // Optional per-contribution lock period for revolving waqf
        lock_period_months: donation.lockPeriodMonths
      } as Record<string, unknown>
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
      logger.error('Failed to log donation', { error, waqfId: donation.waqfId });
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
    logger.error('Error fetching waqf donations', { error, waqfId });
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
  const id = randomUUID();
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
      logger.error('Failed to log allocation', { error, causeId: allocation.causeId });
      // Don't throw - logging failure shouldn't prevent allocation recording
    }
  }
  
  return id;
};

export const allocateReturns = async (waqfId: string, allocations: Array<{causeId: string, amount: number, rationale: string}>, userId?: string, userName?: string) => {
  const id = randomUUID();
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
      } as Record<string, unknown>
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
      logger.error('Failed to log bulk allocation', { error, waqfId, allocationCount: allocations.length });
      // Don't throw - logging failure shouldn't prevent allocation
    }
  }
  
  return id;
};

export const getWaqfAllocations = async (waqfId: string) => {
  try {
    const { items } = await listDocs({
      collection: ALLOCATIONS_COLLECTION
    });
    return items
      .filter(item => {
        const data = item.data as { data?: AllocationGroup };
        return data.data?.waqfId === waqfId;
      })
      .map(item => {
        const data = item.data as { data: AllocationGroup };
        return {
          ...data.data,
          id: item.key
        };
      });
  } catch (error) {
    logger.error('Error fetching waqf allocations', { error, waqfId });
    throw new Error(`Failed to fetch allocations for waqf ${waqfId}`);
  }
};

export const activateWaqf = async (waqfId: string, userId?: string, userName?: string) => {
  const existing = await getWaqf(waqfId);
  if (!existing) throw new Error('Waqf not found');
  const backendData = transformWaqfForBackend({
    ...existing,
    status: 'active',
    updatedAt: new Date().toISOString()
  });
  
  await setDoc({
    collection: WAQF_COLLECTION,
    doc: {
      key: waqfId,
      data: backendData as Record<string, unknown>
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
      logger.error('Failed to log waqf activation', { error, waqfId });
    }
  }
};

export const deactivateWaqf = async (waqfId: string, userId?: string, userName?: string) => {
  const existing = await getWaqf(waqfId);
  if (!existing) throw new Error('Waqf not found');
  const backendData = transformWaqfForBackend({
    ...existing,
    status: 'paused',
    updatedAt: new Date().toISOString()
  });
  
  await setDoc({
    collection: WAQF_COLLECTION,
    doc: {
      key: waqfId,
      data: backendData as Record<string, unknown>
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
      logger.error('Failed to log waqf deactivation', { error, waqfId });
    }
  }
};

export const archiveWaqf = async (waqfId: string, userId?: string, userName?: string) => {
  const existing = await getWaqf(waqfId);
  if (!existing) throw new Error('Waqf not found');
  const backendData = transformWaqfForBackend({
    ...existing,
    status: 'terminated',
    updatedAt: new Date().toISOString()
  });
  
  await setDoc({
    collection: WAQF_COLLECTION,
    doc: {
      key: waqfId,
      data: backendData as Record<string, unknown>
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
      logger.error('Failed to log waqf archival', { error, waqfId });
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
