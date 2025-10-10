/**
 * Utility functions for calculating growth rates and related metrics
 */

type GrowthRateInput = {
  current: number;
  previous: number;
};

type PeriodComparison = {
  currentPeriod: number;
  previousPeriod: number;
};

/**
 * Calculates growth rate between two periods
 * @param input Object containing current and previous values
 * @returns Growth rate as percentage (positive for growth, negative for decline), or null if cannot calculate
 */
export const calculateGrowthRate = (input: GrowthRateInput): number | null => {
  const { current, previous } = input;
  
  // Can't calculate if no previous data
  if (previous === 0 || previous === null || previous === undefined) {
    return null;
  }
  
  // Calculate percentage change
  return ((current - previous) / previous) * 100;
};

/**
 * Calculates donation growth rate for a Waqf
 * @param currentPeriodDonations Total donations in current period
 * @param previousPeriodDonations Total donations in previous period
 * @returns Growth rate percentage or null if cannot calculate
 */
export const calculateDonationGrowth = (input: PeriodComparison): number | null => {
  return calculateGrowthRate({
    current: input.currentPeriod,
    previous: input.previousPeriod
  });
};

/**
 * Calculates allocation growth rate for a Waqf
 * @param currentPeriodAllocations Total allocations in current period
 * @param previousPeriodAllocations Total allocations in previous period
 * @returns Growth rate percentage or null if cannot calculate
 */
export const calculateAllocationGrowth = (input: PeriodComparison): number | null => {
  return calculateGrowthRate({
    current: input.currentPeriod,
    previous: input.previousPeriod
  });
};

/**
 * Calculates overall Waqf growth rate based on net activity
 * @param currentPeriodDonations
 * @param previousPeriodDonations
 * @param currentPeriodAllocations
 * @param previousPeriodAllocations
 * @returns Net growth rate percentage or null if cannot calculate
 */
export const calculateNetWaqfGrowth = (
  donations: PeriodComparison,
  allocations: PeriodComparison
): number | null => {
  const donationGrowth = calculateGrowthRate({
    current: donations.currentPeriod,
    previous: donations.previousPeriod
  }) || 0;
  
  const allocationGrowth = calculateGrowthRate({
    current: allocations.currentPeriod,
    previous: allocations.previousPeriod
  }) || 0;
  
  // Simple average for now - could be weighted differently
  return (donationGrowth + allocationGrowth) / 2;
};
