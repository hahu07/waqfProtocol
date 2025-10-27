/**
 * Revolving Waqf Tranche Utilities
 * 
 * Helper functions for managing contribution tranches in revolving waqfs
 */

import type { WaqfProfile, ContributionTranche } from '@/types/waqfs';

export interface TrancheStatus {
  id: string;
  amount: number;
  contributionDate: string;
  maturityDate: string;
  isMatured: boolean;
  isReturned: boolean;
  daysUntilMaturity: number;
  status: 'locked' | 'matured' | 'returned';
}

export interface RevolvingWaqfBalance {
  totalPrincipal: number;
  lockedBalance: number;
  maturedBalance: number;
  returnedBalance: number;
  lockedTranches: TrancheStatus[];
  maturedTranches: TrancheStatus[];
  returnedTranches: TrancheStatus[];
  nextMaturityDate: string | null;
  nextMaturityAmount: number;
}

/**
 * Calculate days until a date
 */
function getDaysUntil(dateString: string): number {
  const targetDate = new Date(parseInt(dateString) / 1_000_000); // Convert nanoseconds to milliseconds
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a tranche has matured
 */
function isTrancheMatured(maturityDate: string): boolean {
  const maturity = new Date(parseInt(maturityDate) / 1_000_000);
  return maturity <= new Date();
}

/**
 * Get status for a single tranche
 */
export function getTrancheStatus(tranche: ContributionTranche): TrancheStatus {
  const isMatured = isTrancheMatured(tranche.maturityDate);
  const daysUntil = getDaysUntil(tranche.maturityDate);
  
  let status: 'locked' | 'matured' | 'returned' = 'locked';
  if (tranche.isReturned) {
    status = 'returned';
  } else if (isMatured) {
    status = 'matured';
  }
  
  return {
    id: tranche.id,
    amount: tranche.amount,
    contributionDate: tranche.contributionDate,
    maturityDate: tranche.maturityDate,
    isMatured,
    isReturned: tranche.isReturned,
    daysUntilMaturity: daysUntil,
    status
  };
}

/**
 * Calculate revolving waqf balance breakdown
 */
export function calculateRevolvingBalance(waqf: WaqfProfile): RevolvingWaqfBalance {
  const tranches = waqf.revolvingDetails?.contributionTranches || [];
  
  console.log('🔧 calculateRevolvingBalance - Input:', {
    hasRevolvingDetails: !!waqf.revolvingDetails,
    tranchesArray: tranches,
    tranchesLength: tranches.length,
    isArray: Array.isArray(tranches)
  });
  
  // Process all tranches
  const trancheStatuses = tranches.map(getTrancheStatus);
  
  console.log('🔧 calculateRevolvingBalance - Processed:', {
    trancheStatusesLength: trancheStatuses.length,
    statuses: trancheStatuses.map(t => ({ id: t.id, status: t.status, amount: t.amount }))
  });
  
  // Categorize tranches
  const lockedTranches = trancheStatuses.filter(t => t.status === 'locked');
  const maturedTranches = trancheStatuses.filter(t => t.status === 'matured');
  const returnedTranches = trancheStatuses.filter(t => t.status === 'returned');
  
  // Calculate balances
  const totalPrincipal = waqf.financial.totalDonations;
  const lockedBalance = lockedTranches.reduce((sum, t) => sum + t.amount, 0);
  const maturedBalance = maturedTranches.reduce((sum, t) => sum + t.amount, 0);
  const returnedBalance = returnedTranches.reduce((sum, t) => sum + t.amount, 0);
  
  // Find next maturity
  const upcomingTranches = lockedTranches
    .sort((a, b) => a.daysUntilMaturity - b.daysUntilMaturity);
  const nextMaturity = upcomingTranches[0] || null;
  
  return {
    totalPrincipal,
    lockedBalance,
    maturedBalance,
    returnedBalance,
    lockedTranches,
    maturedTranches,
    returnedTranches,
    nextMaturityDate: nextMaturity?.maturityDate || null,
    nextMaturityAmount: nextMaturity?.amount || 0
  };
}

/**
 * Format tranche date for display
 */
export function formatTrancheDate(dateString: string): string {
  const date = new Date(parseInt(dateString) / 1_000_000);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Get human-readable time until maturity
 */
export function getTimeUntilMaturity(daysUntil: number): string {
  if (daysUntil < 0) return 'Matured';
  if (daysUntil === 0) return 'Today';
  if (daysUntil === 1) return 'Tomorrow';
  if (daysUntil < 30) return `${daysUntil} days`;
  if (daysUntil < 365) return `${Math.floor(daysUntil / 30)} months`;
  return `${Math.floor(daysUntil / 365)} years`;
}

/**
 * Sort tranches by maturity date (earliest first)
 */
export function sortTranchesByMaturity(tranches: TrancheStatus[]): TrancheStatus[] {
  return [...tranches].sort((a, b) => 
    parseInt(a.maturityDate) - parseInt(b.maturityDate)
  );
}
