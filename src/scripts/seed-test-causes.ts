/**
 * Seed script to create test causes for each waqf type
 * This helps test and understand how different waqf types work
 * 
 * Usage: Run from Admin Dashboard at /admin/seed-test-causes
 */

import type { Cause } from '@/types/waqfs';
import { WaqfType } from '@/types/waqfs';

export const testCauses: Omit<Cause, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // PERMANENT WAQF CAUSE
  {
    name: 'Permanent Education Endowment',
    description: 'A perpetual scholarship fund where the principal is preserved forever. Investment returns fund annual scholarships for underprivileged students. This is traditional waqf - your donation becomes a lasting legacy.',
    icon: '🎓',
    coverImage: undefined,
    categoryId: 'permanent',
    subcategoryId: 'education_permanent',
    isActive: false,
    status: 'pending',
    sortOrder: 1,
    followers: 0,
    fundsRaised: 0,
    targetAmount: 50000,
    primaryCurrency: 'USD',
    impactScore: 95,
    supportedWaqfTypes: [WaqfType.PERMANENT],
    investmentStrategy: {
      assetAllocation: '60% Islamic Bonds (Sukuk), 30% Ethical Equity, 10% Cash',
      expectedAnnualReturn: 6.5,
      distributionFrequency: 'annually'
    }
  },
  
  // TEMPORARY CONSUMABLE WAQF CAUSE
  {
    name: 'Ramadan Feeding Program',
    description: 'Annual Ramadan iftar and suhoor meals for 500 fasting families in need. Your entire donation will be fully spent during the blessed month to provide nutritious meals, dates, and food packages. The full amount goes directly to feeding the hungry during Ramadan.',
    icon: '🌙',
    coverImage: undefined,
    categoryId: 'temporary_time_bound',
    subcategoryId: 'seasonal_programs',
    isActive: false,
    status: 'pending',
    sortOrder: 2,
    followers: 0,
    fundsRaised: 0,
    targetAmount: 15000,
    primaryCurrency: 'USD',
    impactScore: 92,
    supportedWaqfTypes: [WaqfType.TEMPORARY_CONSUMABLE],
    consumableOptions: {
      minDurationMonths: 1,
      maxDurationMonths: 2,
      defaultSpendingSchedule: 'immediate'
    }
  },
  
  // TEMPORARY REVOLVING WAQF CAUSE
  {
    name: 'Healthcare Facility Expansion',
    description: 'A 5-year investment in expanding a community clinic. Your principal is locked for 5 years while investment returns fund medical equipment. At maturity, your principal is returned to you while the returns create lasting impact.',
    icon: '🏥',
    coverImage: undefined,
    categoryId: 'temporary_revolving',
    subcategoryId: 'healthcare_revolving',
    isActive: false,
    status: 'pending',
    sortOrder: 3,
    followers: 0,
    fundsRaised: 0,
    targetAmount: 100000,
    primaryCurrency: 'USD',
    impactScore: 88,
    supportedWaqfTypes: [WaqfType.TEMPORARY_REVOLVING],
    revolvingOptions: {
      minLockPeriodMonths: 36,
      maxLockPeriodMonths: 120,
      expectedReturnDuringPeriod: 25
    },
    investmentStrategy: {
      assetAllocation: '70% Sukuk, 20% Real Estate, 10% Cash',
      expectedAnnualReturn: 5.0,
      distributionFrequency: 'quarterly'
    }
  }
];

export const causeExplanations = {
  permanent: {
    title: 'Permanent Waqf (Perpetual)',
    description: 'The traditional form of Islamic endowment. Your principal ($200 in the example) is preserved forever and invested ethically. Only the investment returns are distributed to the cause annually. This creates a lasting legacy that benefits people for generations.',
    example: 'You donate $200 → Principal stays $200 forever → $13/year (6.5% return) goes to scholarships forever',
    benefits: [
      '✅ Creates perpetual impact',
      '✅ Principal always protected',
      '✅ Tax deductible in many countries',
      '✅ Islamic tradition of Sadaqah Jariyah'
    ],
    dashboard: {
      card1: 'Waqf Principal - Your protected endowment that stays intact',
      card2: 'Total Donations - Additional contributions you\'ve made',
      card3: 'Investment Returns - Proceeds generated from investing the principal',
      card4: 'Proceeds Distributed - Investment returns given to the cause'
    }
  },
  
  temporary_consumable: {
    title: 'Temporary Consumable Waqf',
    description: 'For urgent needs that require immediate action. Both your principal AND any returns are fully spent on the cause within your chosen timeframe. Perfect for Ramadan programs, seasonal feeding, disaster relief, or time-sensitive projects.',
    example: 'You donate $500 for Ramadan feeding → All $500 buys food and feeds 50 families during the blessed month',
    benefits: [
      '✅ Maximum immediate impact',
      '✅ 100% of funds go to cause',
      '✅ Perfect for seasonal needs',
      '✅ Full amount spent quickly'
    ],
    dashboard: {
      card1: 'Total Asset - The full amount available to be spent',
      card2: 'Funds Spent - How much has been distributed so far',
      card3: 'Remaining Balance - Funds still to be allocated',
      card4: 'Funds Allocated - Distribution to selected causes'
    }
  },
  
  temporary_revolving: {
    title: 'Temporary Revolving Waqf',
    description: 'An innovative hybrid approach. Your principal is locked for a set period (e.g., 5 years), during which investment returns help the cause. At maturity, your principal comes back to you, but the returns have created lasting impact. Think of it as an interest-free loan to charity.',
    example: 'You lock $5,000 for 5 years → $250/year (5% return) goes to clinic → After 5 years, you get your $5,000 back',
    benefits: [
      '✅ Get your principal back',
      '✅ Returns still help causes',
      '✅ Lower financial risk',
      '✅ Good for large contributions'
    ],
    dashboard: {
      card1: 'Locked Principal - Your funds locked until maturity date',
      card2: 'Maturity Date - When your principal will be returned',
      card3: 'Investment Returns - Proceeds generated during lock period',
      card4: 'Returns Distributed - Investment returns given to causes'
    }
  },
  
  hybrid: {
    title: 'Hybrid Waqf',
    description: 'Mix different waqf types across multiple causes. For example: 50% permanent for education, 30% consumable for Ramadan feeding, 20% revolving for healthcare. This gives you flexibility to balance long-term impact with immediate seasonal needs.',
    example: '$1,000 total → $500 permanent (education) + $300 consumable (Ramadan feeding) + $200 revolving (healthcare)',
    benefits: [
      '✅ Diversified impact strategy',
      '✅ Balance immediate and long-term needs',
      '✅ Flexible allocation per cause',
      '✅ Optimal risk/reward balance'
    ],
    dashboard: {
      card1: 'Waqf Asset - Your combined asset value across all types',
      card2: 'Total Donations - All contributions you\'ve made',
      card3: 'Total Returns - Combined investment returns from all types',
      card4: 'Total Distributed - Distributions across all waqf types and causes'
    }
  }
};
