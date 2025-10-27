import { setDoc, getDoc } from '@junobuild/core';
import type { WaqfProfile } from '@/types/waqfs';
import { logger } from '@/lib/logger';

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
    const tranche = waqf.revolvingDetails.contributionTranches?.find(
      (t) => t.id === trancheId
    );

    if (!tranche) {
      throw new Error('Tranche not found');
    }

    // 4. Validate tranche can be returned
    if (tranche.isReturned) {
      throw new Error('Tranche has already been returned');
    }

    // Check if matured
    const now = Date.now() * 1_000_000; // Convert to nanoseconds
    const maturityDate = parseInt(tranche.maturityDate);
    
    if (now < maturityDate) {
      const daysUntil = Math.ceil((maturityDate - now) / (1_000_000 * 1000 * 60 * 60 * 24));
      throw new Error(`Tranche has not matured yet. Matures in ${daysUntil} days.`);
    }

    // 5. Update the tranche
    const returnDate = now.toString();
    tranche.isReturned = true;
    tranche.returnedDate = returnDate;

    // 6. Update waqf financial state
    waqf.financial.currentBalance = Math.max(
      0,
      waqf.financial.currentBalance - tranche.amount
    );

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
      return !tranche.isReturned && now >= maturityDate;
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
