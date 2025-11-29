/**
 * Seed script to create test causes for each waqf type
 * This helps test and understand how different waqf types work
 * 
 * Usage: Run from Admin Dashboard at /admin/seed-test-causes
 */

import type { Cause } from '@/types/waqfs';
import { WaqfType } from '@/types/waqfs';

export const testCauses: Omit<Cause, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // EDUCATION CAUSE - Supports multiple waqf types
  {
    name: 'Education Support Fund',
    description: 'Support education through scholarships and school infrastructure. You can choose how to structure your donation: as a permanent endowment for perpetual scholarships, as consumable funds for immediate student aid, or as revolving microloans for student entrepreneurs.',
    icon: '🎓',
    coverImage: undefined,
    categoryId: 'education',
    subcategoryId: 'education_general',
    isActive: true,
    status: 'approved',
    sortOrder: 1,
    followers: 0,
    fundsRaised: 20625000, // ₦12,500 USD × 1650 = ₦20,625,000
    targetAmount: 82500000, // $50,000 USD × 1650 = ₦82,500,000
    primaryCurrency: 'NGN',
    exchangeRateToUSD: 1650,
    impactScore: 95,
    supportedWaqfTypes: [WaqfType.PERMANENT, WaqfType.TEMPORARY_CONSUMABLE, WaqfType.TEMPORARY_REVOLVING],
    investmentStrategy: {
      assetAllocation: '60% Islamic Bonds (Sukuk), 30% Ethical Equity, 10% Cash',
      expectedAnnualReturn: 6.5,
      distributionFrequency: 'annually'
    }
  },

  // HUMANITARIAN AID - Supports permanent and consumable
  {
    name: 'Humanitarian Relief Fund',
    description: 'Support families in crisis through emergency aid and sustainable programs. Donate as permanent waqf to create an ongoing relief fund, or as consumable waqf for immediate emergency response. Your choice determines the impact timeline.',
    icon: '🌙',
    coverImage: undefined,
    categoryId: 'humanitarian',
    subcategoryId: 'relief_programs',
    isActive: true,
    status: 'approved',
    sortOrder: 2,
    followers: 0,
    fundsRaised: 13530000, // $8,200 × 1650 = ₦13,530,000
    targetAmount: 24750000, // $15,000 × 1650 = ₦24,750,000
    primaryCurrency: 'NGN',
    exchangeRateToUSD: 1650,
    impactScore: 92,
    supportedWaqfTypes: [WaqfType.PERMANENT, WaqfType.TEMPORARY_CONSUMABLE],
    consumableOptions: {
      minDurationMonths: 1,
      maxDurationMonths: 24,
      defaultSpendingSchedule: 'immediate'
    },
    investmentStrategy: {
      assetAllocation: '50% Sukuk, 30% Equity, 20% Cash',
      expectedAnnualReturn: 5.5,
      distributionFrequency: 'quarterly'
    }
  },

  // HEALTHCARE - Supports all three types
  {
    name: 'Healthcare Access Initiative',
    description: 'Expand healthcare access through clinics, medical equipment, and patient support. Choose permanent waqf for sustainable healthcare infrastructure, consumable for immediate medical aid, or revolving for healthcare microloans and equipment financing.',
    icon: '🏥',
    coverImage: undefined,
    categoryId: 'healthcare',
    subcategoryId: 'healthcare_general',
    isActive: true,
    status: 'approved',
    sortOrder: 3,
    followers: 0,
    fundsRaised: 74250000, // $45,000 × 1650 = ₦74,250,000
    targetAmount: 165000000, // $100,000 × 1650 = ₦165,000,000
    primaryCurrency: 'NGN',
    exchangeRateToUSD: 1650,
    impactScore: 88,
    supportedWaqfTypes: [WaqfType.PERMANENT, WaqfType.TEMPORARY_CONSUMABLE, WaqfType.TEMPORARY_REVOLVING],
    revolvingOptions: {
      minLockPeriodMonths: 36,
      maxLockPeriodMonths: 120,
      expectedReturnDuringPeriod: 25
    },
    consumableOptions: {
      minDurationMonths: 6,
      maxDurationMonths: 36,
      defaultSpendingSchedule: 'phased'
    },
    investmentStrategy: {
      assetAllocation: '70% Sukuk, 20% Real Estate, 10% Cash',
      expectedAnnualReturn: 5.0,
      distributionFrequency: 'quarterly'
    }
  },

  // EMERGENCY RELIEF - Only consumable (makes sense - can't preserve principal for emergencies)
  {
    name: 'Emergency Disaster Relief',
    description: 'Immediate response to natural disasters and humanitarian crises. This cause only accepts consumable waqf because emergency relief requires immediate deployment of all funds to save lives and provide urgent aid.',
    icon: '🚨',
    coverImage: undefined,
    categoryId: 'emergency',
    subcategoryId: 'disaster_relief',
    isActive: true,
    status: 'approved',
    sortOrder: 4,
    followers: 0,
    fundsRaised: 41250000, // $25,000 × 1650 = ₦41,250,000
    targetAmount: 123750000, // $75,000 × 1650 = ₦123,750,000
    primaryCurrency: 'NGN',
    exchangeRateToUSD: 1650,
    impactScore: 98,
    supportedWaqfTypes: [WaqfType.TEMPORARY_CONSUMABLE],
    consumableOptions: {
      minDurationMonths: 1,
      maxDurationMonths: 6,
      defaultSpendingSchedule: 'immediate'
    }
  },

  // MICROFINANCE - Only revolving (makes sense - loans are repaid and recycled)
  {
    name: 'Microfinance for Entrepreneurs',
    description: 'Interest-free microloans for small business owners. This cause only accepts revolving waqf because loans are repaid and recycled to help more entrepreneurs. Your principal returns to you after the loan term while creating sustainable economic impact.',
    icon: '💼',
    coverImage: undefined,
    categoryId: 'economic_empowerment',
    subcategoryId: 'microfinance',
    isActive: true,
    status: 'approved',
    sortOrder: 5,
    followers: 0,
    fundsRaised: 29700000, // $18,000 × 1650 = ₦29,700,000
    targetAmount: 82500000, // $50,000 × 1650 = ₦82,500,000
    primaryCurrency: 'NGN',
    exchangeRateToUSD: 1650,
    impactScore: 85,
    supportedWaqfTypes: [WaqfType.TEMPORARY_REVOLVING],
    revolvingOptions: {
      minLockPeriodMonths: 12,
      maxLockPeriodMonths: 60,
      expectedReturnDuringPeriod: 100
    }
  },

  // MOSQUE ENDOWMENT - Only permanent (makes sense - mosques are perpetual)
  {
    name: 'Mosque Endowment Fund',
    description: 'Perpetual support for mosque operations and maintenance. This cause only accepts permanent waqf because mosques are meant to serve communities for generations. Your principal is preserved forever while returns fund ongoing mosque expenses.',
    icon: '🕌',
    coverImage: undefined,
    categoryId: 'religious',
    subcategoryId: 'mosque_support',
    isActive: true,
    status: 'approved',
    sortOrder: 6,
    followers: 0,
    fundsRaised: 57750000, // $35,000 × 1650 = ₦57,750,000
    targetAmount: 165000000, // $100,000 × 1650 = ₦165,000,000
    primaryCurrency: 'NGN',
    exchangeRateToUSD: 1650,
    impactScore: 90,
    supportedWaqfTypes: [WaqfType.PERMANENT],
    investmentStrategy: {
      assetAllocation: '80% Sukuk, 15% Real Estate, 5% Cash',
      expectedAnnualReturn: 5.0,
      distributionFrequency: 'monthly'
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
