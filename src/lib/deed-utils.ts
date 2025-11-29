// Waqf Deed Utility Functions

/**
 * Generate next sequential deed reference number
 * TODO: This should fetch from Juno backend to ensure uniqueness across all deeds
 * For now, using a combination of date + counter that will be replaced with backend call
 */
export async function getNextDeedReference(): Promise<string> {
  // TODO: Replace with actual backend call to Juno
  // This should be: const response = await fetch('/api/deeds/next-reference');
  // For now, generate a sequential number based on current year + counter
  
  try {
    // Try to get last deed number from sessionStorage (temporary solution)
    const lastDeedNumber = sessionStorage.getItem('lastDeedNumber');
    const currentYear = new Date().getFullYear();
    
    let nextNumber = 1;
    if (lastDeedNumber) {
      const parsed = parseInt(lastDeedNumber, 10);
      nextNumber = parsed + 1;
    }
    
    // Save for next time (temporary)
    sessionStorage.setItem('lastDeedNumber', nextNumber.toString());
    
    // Format: WQF/YYYY/NNNN (e.g., WQF/2025/0001)
    const paddedNumber = nextNumber.toString().padStart(4, '0');
    return `WQF/${currentYear}/${paddedNumber}`;
  } catch (error) {
    console.error('Error generating deed reference:', error);
    // Fallback to timestamp-based reference
    const timestamp = Date.now();
    return `WQF/TEMP/${timestamp}`;
  }
}

/**
 * Calculate management fees based on waqf type and amount
 */
export interface ManagementFees {
  permanentFee: number;
  permanentFeePercentage: number;
  consumableFee: number;
  consumableFeePercentage: number;
  revolvingFee: number;
  revolvingFeePercentage: number;
  totalFees: number;
}

export function calculateManagementFees(
  permanentAmount: number,
  consumableAmount: number,
  revolvingAmount: number
): ManagementFees {
  // Management fee rates
  const PERMANENT_FEE_RATE = 0.015; // 1.5% annual management fee
  const CONSUMABLE_FEE_RATE = 0.04; // 4% one-time processing fee
  const REVOLVING_FEE_RATE = 0.025; // 2.5% annual management fee
  
  const permanentFee = permanentAmount * PERMANENT_FEE_RATE;
  const consumableFee = consumableAmount * CONSUMABLE_FEE_RATE;
  const revolvingFee = revolvingAmount * REVOLVING_FEE_RATE;
  
  return {
    permanentFee,
    permanentFeePercentage: PERMANENT_FEE_RATE * 100,
    consumableFee,
    consumableFeePercentage: CONSUMABLE_FEE_RATE * 100,
    revolvingFee,
    revolvingFeePercentage: REVOLVING_FEE_RATE * 100,
    totalFees: permanentFee + consumableFee + revolvingFee,
  };
}
