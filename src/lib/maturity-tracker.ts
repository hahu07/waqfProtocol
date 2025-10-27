/**
 * Maturity Tracker Utility
 * 
 * Handles revolving waqf maturity tracking and time-based calculations
 */

import type { Waqf, WaqfProfile } from '@/types/waqfs';

/**
 * Calculate time remaining until maturity date
 */
export function calculateTimeRemaining(maturityDate: string): string {
  const now = new Date();
  const maturity = new Date(maturityDate);
  const diff = maturity.getTime() - now.getTime();
  
  // If already matured
  if (diff <= 0) {
    return 'Matured';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) {
    const remainingMonths = months % 12;
    if (remainingMonths > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
    return `${years} year${years > 1 ? 's' : ''}`;
  }
  
  if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  
  return `${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Check if a waqf has matured
 */
export function hasMatured(maturityDate: string): boolean {
  const now = new Date();
  const maturity = new Date(maturityDate);
  return now >= maturity;
}

/**
 * Calculate maturity date based on lock period in months
 */
export function calculateMaturityDate(lockPeriodMonths: number, startDate?: string): string {
  const start = startDate ? new Date(startDate) : new Date();
  const maturity = new Date(start);
  maturity.setMonth(maturity.getMonth() + lockPeriodMonths);
  return maturity.toISOString();
}

/**
 * Get maturity progress percentage (0-100)
 */
export function getMaturityProgress(startDate: string, maturityDate: string): number {
  const now = new Date();
  const start = new Date(startDate);
  const maturity = new Date(maturityDate);
  
  const totalDuration = maturity.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  const progress = (elapsed / totalDuration) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Format maturity date for display
 */
export function formatMaturityDate(maturityDate: string): string {
  const date = new Date(maturityDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get all revolving waqfs that have matured
 */
export function getMaturedWaqfs(waqfs: WaqfProfile[]): WaqfProfile[] {
  return waqfs.filter(waqf => {
    if (waqf.waqfType !== 'temporary_revolving' || !waqf.revolvingDetails) {
      return false;
    }
    // Return waqfs that have matured but are still active (not yet marked as completed)
    return hasMatured(waqf.revolvingDetails.maturityDate) && waqf.status === 'active';
  });
}

/**
 * Get waqfs maturing soon (within specified days)
 */
export function getWaqfsMaturingSoon(waqfs: WaqfProfile[], days: number = 30): WaqfProfile[] {
  const now = new Date();
  const threshold = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return waqfs.filter(waqf => {
    if (waqf.waqfType !== 'temporary_revolving' || !waqf.revolvingDetails) {
      return false;
    }
    
    const maturityDate = new Date(waqf.revolvingDetails.maturityDate);
    return maturityDate > now && maturityDate <= threshold && waqf.status === 'active';
  });
}

/**
 * Calculate expected returns for revolving waqf
 */
export function calculateExpectedReturns(
  principal: number,
  annualReturnRate: number,
  lockPeriodMonths: number
): number {
  const years = lockPeriodMonths / 12;
  return principal * (annualReturnRate / 100) * years;
}

/**
 * Generate maturity summary for a revolving waqf
 */
export function generateMaturitySummary(waqf: WaqfProfile): {
  status: 'locked' | 'maturing_soon' | 'matured';
  timeRemaining: string;
  progress: number;
  principalAmount: number;
  maturityDate: string;
  formattedMaturityDate: string;
} | null {
  if (waqf.waqfType !== 'temporary_revolving' || !waqf.revolvingDetails) {
    return null;
  }
  
  const maturityDate = waqf.revolvingDetails.maturityDate;
  const timeRemaining = calculateTimeRemaining(maturityDate);
  const progress = getMaturityProgress(waqf.createdAt, maturityDate);
  const matured = hasMatured(maturityDate);
  
  // Determine status
  let status: 'locked' | 'maturing_soon' | 'matured';
  if (matured) {
    status = 'matured';
  } else {
    const maturingSoon = getWaqfsMaturingSoon([waqf], 30).length > 0;
    status = maturingSoon ? 'maturing_soon' : 'locked';
  }
  
  return {
    status,
    timeRemaining,
    progress,
    principalAmount: waqf.waqfAsset,
    maturityDate,
    formattedMaturityDate: formatMaturityDate(maturityDate)
  };
}

/**
 * Check for matured waqfs and return those needing status updates
 */
export async function checkMaturedWaqfs(waqfs: WaqfProfile[]): Promise<WaqfProfile[]> {
  return getMaturedWaqfs(waqfs);
}
