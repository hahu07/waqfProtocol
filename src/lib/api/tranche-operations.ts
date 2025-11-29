import { setDoc, getDoc } from '@junobuild/core';
import type {
  ContributionTranche,
  InstallmentPayment,
  WaqfProfile,
} from '@/types/waqfs';
import { logger } from '@/lib/logger';

const DAY_IN_NANOS = 24 * 60 * 60 * 1_000_000_000;
const MONTH_IN_NANOS = 30 * DAY_IN_NANOS;

const addNotification = (
  details: NonNullable<WaqfProfile['revolvingDetails']>,
  message: string,
): void => {
  if (!details.pendingNotifications) {
    details.pendingNotifications = [];
  }
  details.pendingNotifications.push(message);
};

const buildInstallmentSchedule = (
  tranche: ContributionTranche,
  totalToReturn: number,
  startTimestamp: number,
  schedule: NonNullable<
    NonNullable<WaqfProfile['revolvingDetails']>['installmentSchedule']
  >,
): InstallmentPayment[] => {
  const installmentCount = Math.max(1, schedule.numberOfInstallments);
  const intervalDays =
    schedule.frequency === 'quarterly'
      ? 90
      : schedule.frequency === 'annually'
        ? 365
        : 30;
  const intervalNanos = intervalDays * DAY_IN_NANOS;
  const baseAmount = totalToReturn / installmentCount;
  const payments: InstallmentPayment[] = [];

  for (let index = 0; index < installmentCount; index += 1) {
    const dueDate = startTimestamp + intervalNanos * (index + 1);
    payments.push({
      id: `inst_${tranche.id}_${index + 1}`,
      amount: baseAmount,
      dueDate: dueDate.toString(),
      status: 'scheduled',
    });
  }

  return payments;
};

/**
 * Return a matured tranche to the donor
 * Updates the tranche status in the waqf document
 */
export async function returnTranche(
  waqfId: string,
  trancheId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    logger.info('Returning tranche', { waqfId, trancheId });

    // 1. Fetch the waqf document
    const waqfDoc = await getDoc({
      collection: 'waqfs',
      key: waqfId,
    });

    if (!waqfDoc) {
      throw new Error('Waqf not found');
    }

    const waqf = waqfDoc.data as WaqfProfile;

    // 2. Validate it's a revolving waqf
    if (!waqf.revolvingDetails) {
      throw new Error('This is not a revolving waqf');
    }

    // 3. Find the tranche
    const tranches = waqf.revolvingDetails.contributionTranches;
    if (!tranches) {
      throw new Error('No contribution tranches found for this waqf');
    }

    const tranche = tranches.find((t) => t.id === trancheId);

    if (!tranche) {
      throw new Error('Tranche not found');
    }

    // 4. Validate tranche can be returned
    if (tranche.isReturned) {
      throw new Error('Tranche has already been returned');
    }

    const now = Date.now() * 1_000_000; // Convert to nanoseconds
    const maturityDate = parseInt(tranche.maturityDate);
    const isEarlyWithdrawal = now < maturityDate;

    if (
      isEarlyWithdrawal &&
      !waqf.revolvingDetails.earlyWithdrawalAllowed
    ) {
      const daysUntil = Math.ceil(
        (maturityDate - now) / (1_000_000 * 1000 * 60 * 60 * 24),
      );
      throw new Error(
        `Early withdrawals require proper notice. Tranche matures in ${daysUntil} days. Please provide advance notice for early withdrawal.`,
      );
    }

    // No penalty - Islamic finance principles
    // Early withdrawal allowed with proper notice
    const netReturnAmount = tranche.amount;

    if (isEarlyWithdrawal) {
      addNotification(
        waqf.revolvingDetails,
        `Early withdrawal processed for tranche ${tranche.id}. Amount: ${netReturnAmount.toFixed(2)}. Notice period requirement met.`,
      );
    }

    const usesInstallments =
      waqf.revolvingDetails.principalReturnMethod === 'installments' &&
      waqf.revolvingDetails.installmentSchedule;

    if (usesInstallments) {
      const schedule = waqf.revolvingDetails.installmentSchedule!;
        tranche.isReturned = false;
        tranche.status = 'return_scheduled';
        tranche.returnedDate = undefined;
        tranche.penaltyApplied = undefined; // No penalties

      if (!tranche.installmentPayments || tranche.installmentPayments.length === 0) {
        tranche.installmentPayments = buildInstallmentSchedule(
          tranche,
          netReturnAmount,
          now,
          schedule,
        );
      }

      addNotification(
        waqf.revolvingDetails,
        `Installment schedule created for tranche ${tranche.id}: ${tranche.installmentPayments.length} payments scheduled.`,
      );
    } else {
      const autoPreference =
        waqf.revolvingDetails.autoRolloverPreference ?? 'none';
      const shouldRollover =
        !isEarlyWithdrawal && autoPreference !== 'none';
      const returnDate = now.toString();

      if (shouldRollover) {
        const newTrancheId = `tranche_rollover_${tranche.id}_${now}`;
        const newMaturity =
          now + waqf.revolvingDetails.lockPeriodMonths * MONTH_IN_NANOS;
        const newTranche: ContributionTranche = {
          id: newTrancheId,
          amount: netReturnAmount,
          contributionDate: now.toString(),
          maturityDate: newMaturity.toString(),
          isReturned: false,
          returnedDate: undefined,
          status: 'locked',
          rolloverOriginId: tranche.id,
          installmentPayments: undefined,
          penaltyApplied: undefined,
          rolloverTargetId: undefined,
        };

        tranches.push(newTranche);
        tranche.status = 'rolled_over';
        tranche.isReturned = true;
        tranche.returnedDate = returnDate;
        tranche.rolloverTargetId = newTrancheId;
        tranche.penaltyApplied = undefined; // No penalties
        tranche.installmentPayments = undefined;

        const notificationTarget =
          waqf.revolvingDetails.autoRolloverTargetCause ?? 'portfolio';
        addNotification(
          waqf.revolvingDetails,
          `Tranche ${tranche.id} rolled into ${newTrancheId} (target: ${notificationTarget}).`,
        );
      } else {
        tranche.isReturned = true;
        tranche.status = 'returned';
        tranche.returnedDate = returnDate;
        tranche.rolloverTargetId = undefined;
        tranche.penaltyApplied = undefined; // No penalties
        tranche.installmentPayments = undefined;

        waqf.financial.currentBalance = Math.max(
          0,
          waqf.financial.currentBalance - netReturnAmount,
        );

        addNotification(
          waqf.revolvingDetails,
          `Tranche ${tranche.id} returned with payout ${netReturnAmount.toFixed(2)}.`,
        );
      }
    }

    // 7. Save the updated waqf
    await setDoc({
      collection: 'waqfs',
      doc: {
        key: waqfId,
        data: waqf,
        updated_at: waqfDoc.updated_at,
      },
    });

    logger.info('Tranche returned successfully', {
      waqfId,
      trancheId,
      amount: tranche.amount,
      newBalance: waqf.financial.currentBalance,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to return tranche', { waqfId, trancheId, error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Automatically process matured tranches according to auto-rollover preferences.
 */
export async function processAutoRolloverTranches(waqfId: string): Promise<void> {
  try {
    const waqfDoc = await getDoc({ collection: 'waqfs', key: waqfId });
    if (!waqfDoc) {
      return;
    }

    const waqf = waqfDoc.data as WaqfProfile;
    if (!waqf.revolvingDetails) {
      return;
    }

    const autoPreference = waqf.revolvingDetails.autoRolloverPreference ?? 'none';
    if (autoPreference === 'none') {
      return;
    }

    const matured = getMaturedTranches(waqf);
    for (const tranche of matured) {
      const result = await returnTranche(waqfId, tranche.id);
      if (!result.success) {
        logger.warn('Auto rollover failed for tranche', {
          waqfId,
          trancheId: tranche.id,
          error: result.error,
        });
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to process auto rollover tranches', { waqfId, error: message });
  }
}

/**
 * Get all matured tranches for a waqf
 */
export function getMaturedTranches(waqf: WaqfProfile): Array<{
  id: string;
  amount: number;
  maturityDate: string;
}> {
  if (!waqf.revolvingDetails?.contributionTranches) {
    return [];
  }

  const now = Date.now() * 1_000_000; // Convert to nanoseconds

  return waqf.revolvingDetails.contributionTranches
    .filter((tranche) => {
      const maturityDate = parseInt(tranche.maturityDate);
      const status = tranche.status ?? 'locked';
      const isReturnInProgress =
        status === 'return_scheduled' || status === 'rolled_over';
      return (
        !tranche.isReturned &&
        !isReturnInProgress &&
        now >= maturityDate
      );
    })
    .map((tranche) => ({
      id: tranche.id,
      amount: tranche.amount,
      maturityDate: tranche.maturityDate,
    }));
}

/**
 * Check if any tranches are ready to be returned
 */
export function hasMaturedTranches(waqf: WaqfProfile): boolean {
  return getMaturedTranches(waqf).length > 0;
}

/**
 * Rollover a matured tranche to extend its lock period
 */
export async function rolloverTranche(
  waqfId: string,
  trancheId: string,
  rolloverMonths: number,
  targetCauseId?: string
): Promise<{ success: boolean; error?: string; newTrancheId?: string }> {
  try {
    logger.info('Rolling over tranche', { waqfId, trancheId, rolloverMonths });

    // Fetch the waqf document
    const waqfDoc = await getDoc({
      collection: 'waqfs',
      key: waqfId,
    });

    if (!waqfDoc) {
      throw new Error('Waqf not found');
    }

    const waqf = waqfDoc.data as WaqfProfile;

    // Validate it's a revolving waqf
    if (!waqf.revolvingDetails) {
      throw new Error('This is not a revolving waqf');
    }

    // Find the tranche
    const tranches = waqf.revolvingDetails.contributionTranches;
    if (!tranches) {
      throw new Error('No contribution tranches found');
    }

    const tranche = tranches.find((t) => t.id === trancheId);
    if (!tranche) {
      throw new Error('Tranche not found');
    }

    // Validate tranche can be rolled over
    if (tranche.isReturned) {
      throw new Error('Cannot rollover returned tranche');
    }

    if (tranche.status === 'rolled_over') {
      throw new Error('Tranche has already been rolled over');
    }

    // Check if matured
    const now = Date.now() * 1_000_000;
    const maturityDate = parseInt(tranche.maturityDate);
    if (now < maturityDate) {
      throw new Error('Tranche has not matured yet');
    }

    // Create new rolled-over tranche
    const newTrancheId = `tranche_rollover_${trancheId}_${now}`;
    const newMaturity = now + rolloverMonths * MONTH_IN_NANOS;

    const newTranche: ContributionTranche = {
      id: newTrancheId,
      amount: tranche.amount,
      contributionDate: now.toString(),
      maturityDate: newMaturity.toString(),
      isReturned: false,
      status: 'locked',
      rolloverOriginId: trancheId,
      // Copy expiration preference if exists
      expirationPreference: tranche.expirationPreference,
    };

    // Update original tranche
    tranche.status = 'rolled_over';
    tranche.isReturned = true;
    tranche.returnedDate = now.toString();
    tranche.rolloverTargetId = newTrancheId;

    // Add new tranche to list
    tranches.push(newTranche);

    // Add notification
    addNotification(
      waqf.revolvingDetails,
      `Tranche ${trancheId} manually rolled over for ${rolloverMonths} months into ${newTrancheId}` +
        (targetCauseId ? ` (target cause: ${targetCauseId})` : '')
    );

    // Save the updated waqf
    await setDoc({
      collection: 'waqfs',
      doc: {
        key: waqfId,
        data: waqf,
        updated_at: waqfDoc.updated_at,
      },
    });

    logger.info('Tranche rolled over successfully', {
      waqfId,
      trancheId,
      newTrancheId,
      rolloverMonths,
    });

    return { success: true, newTrancheId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to rollover tranche', { waqfId, trancheId, error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Convert a matured tranche to a permanent waqf
 */
export async function convertTrancheToPermanent(
  waqfId: string,
  trancheId: string,
  investmentStrategy: WaqfProfile['investmentStrategy']
): Promise<{ success: boolean; error?: string; newWaqfId?: string }> {
  try {
    logger.info('Converting tranche to permanent waqf', { waqfId, trancheId });

    // Fetch the original waqf document
    const waqfDoc = await getDoc({
      collection: 'waqfs',
      key: waqfId,
    });

    if (!waqfDoc) {
      throw new Error('Waqf not found');
    }

    const originalWaqf = waqfDoc.data as WaqfProfile;

    // Validate it's a revolving waqf
    if (!originalWaqf.revolvingDetails) {
      throw new Error('This is not a revolving waqf');
    }

    // Find the tranche
    const tranches = originalWaqf.revolvingDetails.contributionTranches;
    if (!tranches) {
      throw new Error('No contribution tranches found');
    }

    const tranche = tranches.find((t) => t.id === trancheId);
    if (!tranche) {
      throw new Error('Tranche not found');
    }

    // Validate tranche can be converted
    if (tranche.isReturned) {
      throw new Error('Cannot convert returned tranche');
    }

    if (tranche.conversionDetails) {
      throw new Error('Tranche has already been converted');
    }

    // Check if matured
    const now = Date.now() * 1_000_000;
    const maturityDate = parseInt(tranche.maturityDate);
    if (now < maturityDate) {
      throw new Error('Tranche has not matured yet');
    }

    // Generate new waqf ID
    const newWaqfId = `waqf_converted_${trancheId}_${now}`;

    // Create new permanent waqf from tranche
    const newWaqf: WaqfProfile = {
      id: newWaqfId,
      name: `${originalWaqf.name} - Permanent Conversion`,
      description: `Converted from revolving waqf tranche on ${new Date().toLocaleDateString()}`,
      waqfAsset: tranche.amount,
      waqfType: 'permanent',
      isHybrid: false,
      donor: originalWaqf.donor,
      selectedCauses: originalWaqf.selectedCauses,
      causeAllocation: originalWaqf.causeAllocation,
      waqfAssets: [],
      supportedCauses: originalWaqf.supportedCauses,
      investmentStrategy: investmentStrategy || {
        assetAllocation: '60% Sukuk, 40% Equity',
        expectedAnnualReturn: 7.0,
        distributionFrequency: 'quarterly',
      },
      financial: {
        totalDonations: tranche.amount,
        totalDistributed: 0,
        currentBalance: tranche.amount,
        investmentReturns: [],
        totalInvestmentReturn: 0,
        growthRate: 0,
        causeAllocations: {},
      },
      reportingPreferences: originalWaqf.reportingPreferences,
      status: 'active',
      notifications: originalWaqf.notifications,
      createdBy: originalWaqf.createdBy,
      createdAt: now.toString(),
    };

    // Save the new permanent waqf
    await setDoc({
      collection: 'waqfs',
      doc: {
        key: newWaqfId,
        data: newWaqf,
      },
    });

    // Update original tranche with conversion details
    tranche.isReturned = true;
    tranche.status = 'returned';
    tranche.returnedDate = now.toString();
    tranche.conversionDetails = {
      convertedAt: now.toString(),
      newWaqfId,
      targetWaqfType: 'permanent',
      notes: 'Converted to permanent waqf',
    };

    // Reduce balance in original waqf
    originalWaqf.financial.currentBalance = Math.max(
      0,
      originalWaqf.financial.currentBalance - tranche.amount
    );

    // Add notification
    addNotification(
      originalWaqf.revolvingDetails,
      `Tranche ${trancheId} (${tranche.amount}) converted to permanent waqf: ${newWaqfId}`
    );

    // Save updated original waqf
    await setDoc({
      collection: 'waqfs',
      doc: {
        key: waqfId,
        data: originalWaqf,
        updated_at: waqfDoc.updated_at,
      },
    });

    logger.info('Tranche converted to permanent waqf successfully', {
      waqfId,
      trancheId,
      newWaqfId,
      amount: tranche.amount,
    });

    return { success: true, newWaqfId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to convert tranche to permanent', {
      waqfId,
      trancheId,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Convert a matured tranche to a consumable waqf
 */
export async function convertTrancheToConsumable(
  waqfId: string,
  trancheId: string,
  consumableDetails: WaqfProfile['consumableDetails']
): Promise<{ success: boolean; error?: string; newWaqfId?: string }> {
  try {
    logger.info('Converting tranche to consumable waqf', { waqfId, trancheId });

    // Fetch the original waqf document
    const waqfDoc = await getDoc({
      collection: 'waqfs',
      key: waqfId,
    });

    if (!waqfDoc) {
      throw new Error('Waqf not found');
    }

    const originalWaqf = waqfDoc.data as WaqfProfile;

    // Validate it's a revolving waqf
    if (!originalWaqf.revolvingDetails) {
      throw new Error('This is not a revolving waqf');
    }

    // Find the tranche
    const tranches = originalWaqf.revolvingDetails.contributionTranches;
    if (!tranches) {
      throw new Error('No contribution tranches found');
    }

    const tranche = tranches.find((t) => t.id === trancheId);
    if (!tranche) {
      throw new Error('Tranche not found');
    }

    // Validate tranche can be converted
    if (tranche.isReturned) {
      throw new Error('Cannot convert returned tranche');
    }

    if (tranche.conversionDetails) {
      throw new Error('Tranche has already been converted');
    }

    // Check if matured
    const now = Date.now() * 1_000_000;
    const maturityDate = parseInt(tranche.maturityDate);
    if (now < maturityDate) {
      throw new Error('Tranche has not matured yet');
    }

    // Validate consumable details
    if (!consumableDetails) {
      throw new Error('Consumable details are required for conversion');
    }

    // Generate new waqf ID
    const newWaqfId = `waqf_converted_${trancheId}_${now}`;

    // Create new consumable waqf from tranche
    const newWaqf: WaqfProfile = {
      id: newWaqfId,
      name: `${originalWaqf.name} - Consumable Conversion`,
      description: `Converted from revolving waqf tranche on ${new Date().toLocaleDateString()}`,
      waqfAsset: tranche.amount,
      waqfType: 'temporary_consumable',
      isHybrid: false,
      donor: originalWaqf.donor,
      selectedCauses: originalWaqf.selectedCauses,
      causeAllocation: originalWaqf.causeAllocation,
      waqfAssets: [],
      supportedCauses: originalWaqf.supportedCauses,
      consumableDetails: consumableDetails,
      financial: {
        totalDonations: tranche.amount,
        totalDistributed: 0,
        currentBalance: tranche.amount,
        investmentReturns: [],
        totalInvestmentReturn: 0,
        growthRate: 0,
        causeAllocations: {},
      },
      reportingPreferences: originalWaqf.reportingPreferences,
      status: 'active',
      notifications: originalWaqf.notifications,
      createdBy: originalWaqf.createdBy,
      createdAt: now.toString(),
    };

    // Save the new consumable waqf
    await setDoc({
      collection: 'waqfs',
      doc: {
        key: newWaqfId,
        data: newWaqf,
      },
    });

    // Update original tranche with conversion details
    tranche.isReturned = true;
    tranche.status = 'returned';
    tranche.returnedDate = now.toString();
    tranche.conversionDetails = {
      convertedAt: now.toString(),
      newWaqfId,
      targetWaqfType: 'temporary_consumable',
      notes: 'Converted to consumable waqf',
    };

    // Reduce balance in original waqf
    originalWaqf.financial.currentBalance = Math.max(
      0,
      originalWaqf.financial.currentBalance - tranche.amount
    );

    // Add notification
    addNotification(
      originalWaqf.revolvingDetails,
      `Tranche ${trancheId} (${tranche.amount}) converted to consumable waqf: ${newWaqfId}`
    );

    // Save updated original waqf
    await setDoc({
      collection: 'waqfs',
      doc: {
        key: waqfId,
        data: originalWaqf,
        updated_at: waqfDoc.updated_at,
      },
    });

    logger.info('Tranche converted to consumable waqf successfully', {
      waqfId,
      trancheId,
      newWaqfId,
      amount: tranche.amount,
    });

    return { success: true, newWaqfId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to convert tranche to consumable', {
      waqfId,
      trancheId,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}
