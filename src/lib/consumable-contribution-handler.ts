/**
 * Consumable Waqf Additional Contribution Handler
 * 
 * Handles logic for accepting additional contributions to consumable waqfs
 * and updating their parameters accordingly
 */

import type { WaqfProfile, ConsumableWaqfDetails } from '@/types/waqfs';

export interface ContributionResult {
  accepted: boolean;
  reason?: string;
  updatedDetails?: ConsumableWaqfDetails;
  updatedFinancial?: {
    currentBalance: number;
    totalDonations: number;
  };
}

/**
 * Check if a consumable waqf can accept additional contributions
 */
export function canAcceptContribution(
  waqf: WaqfProfile,
  additionalAmount: number
): ContributionResult {
  if (waqf.waqfType !== 'temporary_consumable') {
    return {
      accepted: false,
      reason: 'This waqf is not a consumable type'
    };
  }

  if (!waqf.consumableDetails) {
    return {
      accepted: false,
      reason: 'Consumable details are missing'
    };
  }

  const details = waqf.consumableDetails;
  const now = new Date();

  // Check based on spending schedule
  switch (details.spendingSchedule) {
    case 'ongoing':
      // Ongoing always accepts contributions
      return handleOngoingContribution(waqf, additionalAmount);

    case 'phased':
      return handlePhasedContribution(waqf, additionalAmount);

    case 'milestone-based':
      return handleMilestoneContribution(waqf, additionalAmount);

    case 'immediate':
      // Immediate spending - check if end date has passed
      if (details.endDate && new Date(details.endDate) < now) {
        return {
          accepted: false,
          reason: 'This waqf has completed its immediate spending period'
        };
      }
      return handleImmediateContribution(waqf, additionalAmount);

    default:
      return {
        accepted: false,
        reason: 'Unknown spending schedule'
      };
  }
}

/**
 * Handle contribution for ongoing schedule
 */
function handleOngoingContribution(
  waqf: WaqfProfile,
  amount: number
): ContributionResult {
  const details = waqf.consumableDetails!;
  
  // Check if target amount has been reached
  if (details.targetAmount) {
    const projectedTotal = waqf.financial.totalDonations + amount;
    if (projectedTotal > details.targetAmount) {
      return {
        accepted: false,
        reason: `Target amount of $${details.targetAmount} would be exceeded`
      };
    }
  }

  return {
    accepted: true,
    updatedFinancial: {
      currentBalance: waqf.financial.currentBalance + amount,
      totalDonations: waqf.financial.totalDonations + amount
    }
  };
}

/**
 * Handle contribution for phased schedule
 */
function handlePhasedContribution(
  waqf: WaqfProfile,
  amount: number
): ContributionResult {
  const details = waqf.consumableDetails!;
  const now = new Date();

  // If there's an end date and it has passed, reject
  if (details.endDate && new Date(details.endDate) < now) {
    return {
      accepted: false,
      reason: 'The phased spending period has ended'
    };
  }

  // Accept contribution - can extend end date or increase distribution rate
  const updatedFinancial = {
    currentBalance: waqf.financial.currentBalance + amount,
    totalDonations: waqf.financial.totalDonations + amount
  };

  // If end date exists, optionally extend it proportionally
  let updatedDetails: ConsumableWaqfDetails | undefined;
  if (details.startDate && details.endDate) {
    const originalAmount = waqf.waqfAsset; // Initial principal
    const percentageIncrease = amount / originalAmount;
    
    const startDate = new Date(details.startDate);
    const endDate = new Date(details.endDate);
    const originalDuration = endDate.getTime() - startDate.getTime();
    const extensionMs = originalDuration * percentageIncrease;
    
    const newEndDate = new Date(endDate.getTime() + extensionMs);
    
    updatedDetails = {
      ...details,
      endDate: newEndDate.toISOString()
    };
  }

  return {
    accepted: true,
    updatedFinancial,
    updatedDetails
  };
}

/**
 * Handle contribution for milestone-based schedule
 */
function handleMilestoneContribution(
  waqf: WaqfProfile,
  amount: number
): ContributionResult {
  const details = waqf.consumableDetails!;
  
  // Check if all milestones are completed
  if (details.milestones && details.milestones.length > 0) {
    const now = new Date();
    const allPast = details.milestones.every(
      m => new Date(m.targetDate) < now
    );
    
    if (allPast && details.endDate && new Date(details.endDate) < now) {
      return {
        accepted: false,
        reason: 'All milestones have been completed'
      };
    }
  }

  return {
    accepted: true,
    updatedFinancial: {
      currentBalance: waqf.financial.currentBalance + amount,
      totalDonations: waqf.financial.totalDonations + amount
    }
  };
}

/**
 * Handle contribution for immediate schedule
 */
function handleImmediateContribution(
  waqf: WaqfProfile,
  amount: number
): ContributionResult {
  return {
    accepted: true,
    updatedFinancial: {
      currentBalance: waqf.financial.currentBalance + amount,
      totalDonations: waqf.financial.totalDonations + amount
    }
  };
}

/**
 * Calculate recommended monthly distribution after contribution
 */
export function calculateUpdatedDistribution(
  waqf: WaqfProfile,
  additionalAmount: number
): number | null {
  if (!waqf.consumableDetails) return null;

  const details = waqf.consumableDetails;
  const newBalance = waqf.financial.currentBalance + additionalAmount;

  if (details.spendingSchedule === 'phased' && details.startDate && details.endDate) {
    const now = new Date();
    const endDate = new Date(details.endDate);
    const remainingMs = endDate.getTime() - now.getTime();
    const remainingMonths = Math.max(1, remainingMs / (1000 * 60 * 60 * 24 * 30));
    
    return newBalance / remainingMonths;
  }

  if (details.minimumMonthlyDistribution) {
    return details.minimumMonthlyDistribution;
  }

  return null;
}

/**
 * Get completion status and progress
 */
export function getCompletionStatus(waqf: WaqfProfile): {
  isCompleted: boolean;
  progress: number;
  reason?: string;
} {
  if (!waqf.consumableDetails) {
    return { isCompleted: false, progress: 0 };
  }

  const details = waqf.consumableDetails;
  const now = new Date();

  console.log('🔍 Completion check for', waqf.name, {
    currentBalance: waqf.financial.currentBalance,
    totalDonations: waqf.financial.totalDonations,
    totalDistributed: waqf.financial.totalDistributed,
    targetAmount: details.targetAmount
  });

  // Check balance depletion first (most definitive completion indicator)
  // If balance is 0, it's completed regardless of how it got there
  if (waqf.financial.currentBalance <= 0) {
    return {
      isCompleted: true,
      progress: 100,
      reason: 'All funds distributed'
    };
  }

  // Check time-based completion
  if (details.endDate && new Date(details.endDate) < now) {
    return {
      isCompleted: true,
      progress: 100,
      reason: 'End date reached'
    };
  }

  // Check target amount completion
  if (details.targetAmount) {
    const progress = (waqf.financial.totalDistributed / details.targetAmount) * 100;
    if (progress >= 100) {
      return {
        isCompleted: true,
        progress: 100,
        reason: 'Target amount distributed'
      };
    }
    return { isCompleted: false, progress };
  }

  // Check target beneficiaries (would need tracking in financial metrics)
  if (details.targetBeneficiaries && waqf.financial.impactMetrics?.beneficiariesSupported) {
    const progress = (waqf.financial.impactMetrics.beneficiariesSupported / details.targetBeneficiaries) * 100;
    if (progress >= 100) {
      return {
        isCompleted: true,
        progress: 100,
        reason: 'Target beneficiaries reached'
      };
    }
    return { isCompleted: false, progress };
  }

  // Calculate time-based progress if dates exist
  if (details.startDate && details.endDate) {
    const start = new Date(details.startDate).getTime();
    const end = new Date(details.endDate).getTime();
    const current = now.getTime();
    const progress = Math.min(100, ((current - start) / (end - start)) * 100);
    return { isCompleted: false, progress: Math.max(0, progress) };
  }

  return { isCompleted: false, progress: 0 };
}
