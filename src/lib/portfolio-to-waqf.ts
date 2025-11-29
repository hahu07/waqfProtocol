// Portfolio to Waqf Profile Transformation

import type { Portfolio } from '@/types/portfolio';
import type { WaqfProfile, WaqfType } from '@/types/waqfs';
import { randomUUID } from '@/lib/crypto-polyfill';

/**
 * Map TypeScript waqf type to Rust backend format (Pascal case)
 */
function mapWaqfTypeToBackend(waqfType: WaqfType | 'hybrid'): string {
  const typeMap: Record<string, string> = {
    'permanent': 'Permanent',
    'temporary_consumable': 'TemporaryConsumable',
    'temporary_revolving': 'TemporaryRevolving',
    'hybrid': 'Hybrid',
  };
  
  return typeMap[waqfType as string] || 'Permanent';
}

/**
 * Determine the primary waqf type from portfolio allocation
 */
function determinePrimaryWaqfType(portfolio: Portfolio): WaqfType | 'hybrid' {
  const stats = {
    permanent: 0,
    consumable: 0,
    revolving: 0,
  };
  
  // Calculate total amounts per type
  portfolio.items.forEach(item => {
    const itemAmount = item.totalAmount;
    stats.permanent += (itemAmount * item.allocation.permanent) / 100;
    stats.consumable += (itemAmount * item.allocation.temporary_consumable) / 100;
    stats.revolving += (itemAmount * item.allocation.temporary_revolving) / 100;
  });
  
  // Count how many types have non-zero allocations
  const activeTypes = [
    stats.permanent > 0,
    stats.consumable > 0,
    stats.revolving > 0,
  ].filter(Boolean).length;
  
  // If multiple types, it's hybrid
  if (activeTypes > 1) {
    return 'hybrid';
  }
  
  // Otherwise return the primary type
  if (stats.permanent > 0) return 'permanent';
  if (stats.consumable > 0) return 'temporary_consumable';
  if (stats.revolving > 0) return 'temporary_revolving';
  
  // Default to permanent
  return 'permanent';
}

/**
 * Transform Portfolio to WaqfProfile format
 */
export function portfolioToWaqfProfile(
  portfolio: Portfolio,
  userId: string
): Omit<WaqfProfile, 'id'> {
  const donorDetails = (portfolio as any).donorDetails;
  const deedReference = (portfolio as any).deedReference;
  const signedAt = (portfolio as any).signedAt;
  const signedBy = (portfolio as any).signedBy;
  const defaultExpirationPreference = (portfolio as any).defaultExpirationPreference;
  const lockPeriodMonths = (portfolio as any).lockPeriodMonths || 12; // Default to 12 if not set
  
  const waqfType = determinePrimaryWaqfType(portfolio);
  const isHybrid = waqfType === 'hybrid';
  
  // Calculate total amounts per waqf type
  const stats = {
    permanent: 0,
    consumable: 0,
    revolving: 0,
  };
  
  portfolio.items.forEach(item => {
    const itemAmount = item.totalAmount;
    stats.permanent += (itemAmount * item.allocation.permanent) / 100;
    stats.consumable += (itemAmount * item.allocation.temporary_consumable) / 100;
    stats.revolving += (itemAmount * item.allocation.temporary_revolving) / 100;
  });
  
  // Calculate cause allocations (percentage of total portfolio per cause)
  const causeAllocation: { [causeId: string]: number } = {};
  const initialCauseAllocations: { [causeId: string]: number } = {};
  
  portfolio.items.forEach(item => {
    causeAllocation[item.cause.id] = (item.totalAmount / portfolio.totalAmount) * 100;
    initialCauseAllocations[item.cause.id] = item.totalAmount; // Store actual dollar amounts
  });
  
  // Build hybrid allocations if hybrid type (map to Rust format)
  const hybridAllocations = isHybrid ? portfolio.items.map(item => {
    // Calculate sum to normalize to 100%
    const sum = item.allocation.permanent + 
                item.allocation.temporary_consumable + 
                item.allocation.temporary_revolving;
    
    // If sum is 0, default to 100% permanent to avoid backend validation error
    const allocations: any = {};
    
    if (sum === 0) {
      // Default to permanent if no allocations set
      allocations.Permanent = 100;
    } else {
      // Normalize to ensure sum is exactly 100%
      const permanent = (item.allocation.permanent / sum) * 100;
      const consumable = (item.allocation.temporary_consumable / sum) * 100;
      const revolving = (item.allocation.temporary_revolving / sum) * 100;
      
      // Only include non-zero allocations
      if (permanent > 0) {
        allocations.Permanent = permanent;
      }
      if (consumable > 0) {
        allocations.TemporaryConsumable = consumable;
      }
      if (revolving > 0) {
        allocations.TemporaryRevolving = revolving;
      }
    }
    
    return {
      causeId: item.cause.id,
      allocations,
    };
  }) : undefined;
  
  // Create WaqfProfile with Rust-compatible types
  const waqfProfile: Omit<WaqfProfile, 'id'> = {
    name: portfolio.name || `Waqf Portfolio - ${deedReference || 'Untitled'}`,
    description: portfolio.description || `Multi-cause waqf endowment supporting ${portfolio.items.length} charitable causes`,
    waqfAsset: portfolio.totalAmount,
    // Map to Rust backend format (Pascal case)
    waqfType: mapWaqfTypeToBackend(waqfType) as any,
    isHybrid,
    hybridAllocations,
    
    // Donor information
    donor: {
      name: donorDetails?.fullName || 'Anonymous Donor',
      email: donorDetails?.email || '',
      phone: donorDetails?.phone || '',
      address: donorDetails?.address 
        ? `${donorDetails.address}, ${donorDetails.city}, ${donorDetails.state} ${donorDetails.postalCode}, ${donorDetails.country}`
        : '',
    },
    
    // Cause selection
    selectedCauses: portfolio.items.map(item => item.cause.id),
    causeAllocation,
    
    // Financial metrics
    financial: {
      totalDonations: portfolio.totalAmount,
      currentBalance: portfolio.totalAmount,
      totalDistributed: 0,
      investmentReturns: [],  // Empty array for initial state
      totalInvestmentReturn: 0,
      growthRate: 0,
      causeAllocations: initialCauseAllocations,  // Initialize with actual amounts from portfolio
    },
    
    // Empty arrays for initial state
    waqfAssets: [],
    supportedCauses: portfolio.items.map(item => item.cause),
    
    // Revolving waqf details (if applicable)
    revolvingDetails: waqfType === 'temporary_revolving' || (isHybrid && stats.revolving > 0) ? {
      lockPeriodMonths: lockPeriodMonths,
      maturityDate: new Date(Date.now() + lockPeriodMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
      principalReturnMethod: 'lump_sum',
      earlyWithdrawalAllowed: true, // Allowed with proper notice
      contributionTranches: [], // Empty initially, created on first donation
      autoRolloverPreference: 'none',
      defaultExpirationPreference: defaultExpirationPreference || { action: 'refund' },
    } as any : undefined,
    
    // Reporting preferences
    reportingPreferences: {
      frequency: 'quarterly',
      reportTypes: ['financial', 'impact'],
      deliveryMethod: 'both',
    },
    
    // Status and notifications
    status: 'active',
    notifications: {
      contributionReminders: true,
      impactReports: true,
      financialUpdates: true,
    },
    
    // Deed document reference
    deedDocument: signedAt ? {
      signedAt,
      donorSignature: signedBy || userId,
      documentVersion: '1.0',
    } : undefined,
    
    // Metadata
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return waqfProfile;
}

/**
 * Save portfolio-based waqf to backend
 */
export async function savePortfolioAsWaqf(
  portfolio: Portfolio,
  userId: string,
  createWaqfFn: (data: Omit<WaqfProfile, 'id'>) => Promise<string>
): Promise<{ success: boolean; waqfId?: string; error?: string }> {
  try {
    // Transform portfolio to waqf profile
    const waqfData = portfolioToWaqfProfile(portfolio, userId);
    
    // Save to backend
    const waqfId = await createWaqfFn(waqfData);
    
    return { success: true, waqfId };
  } catch (error) {
    console.error('Failed to save portfolio as waqf:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
