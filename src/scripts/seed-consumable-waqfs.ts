/**
 * Seed script to create test consumable waqfs for distribution testing
 * Usage: Import and use from Admin Dashboard
 */

import type { WaqfProfile } from '@/types/waqfs';
import { WaqfType } from '@/types/waqfs';

const testConsumableWaqfs: Omit<WaqfProfile, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Emergency Orphan Support Fund',
    description: 'Immediate financial assistance for 50 orphaned children covering food, clothing, and school supplies for 6 months',
    waqfAsset: 15000,
    waqfType: 'TemporaryConsumable' as WaqfType,
    isHybrid: false,
    donor: {
      name: 'Ahmed Al-Rahman',
      email: 'ahmed@example.com',
      phone: '+1-555-0101',
      address: '123 Charity Lane, City, State 12345'
    },
    selectedCauses: ['orphan_support'],
    causeAllocation: {
      'orphan_support': 100
    },
    waqfAssets: [],
    supportedCauses: [],
    financial: {
      totalDonations: 15000,
      totalDistributed: 0,
      currentBalance: 15000,
      investmentReturns: [],
      totalInvestmentReturn: 0,
      growthRate: 0,
      causeAllocations: {}
    },
    consumableDetails: {
      spendingSchedule: 'phased',
      startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      targetAmount: 15000,
      targetBeneficiaries: 50,
      minimumMonthlyDistribution: 2500
    },
    reportingPreferences: {
      frequency: 'quarterly',
      reportTypes: ['financial', 'impact'],
      deliveryMethod: 'email'
    },
    status: 'active',
    isDonated: true,
    notifications: {
      contributionReminders: true,
      impactReports: true,
      financialUpdates: true
    },
    createdBy: 'test-user',
    lastContributionDate: new Date().toISOString()
  },
  {
    name: 'Ramadan Iftar Program 2025',
    description: 'Provide daily iftar meals for 200 fasting families during the blessed month of Ramadan',
    waqfAsset: 8000,
    waqfType: 'TemporaryConsumable' as WaqfType,
    isHybrid: false,
    donor: {
      name: 'Fatima Hassan',
      email: 'fatima@example.com',
      phone: '+1-555-0102',
      address: '456 Blessed Street, City, State 12345'
    },
    selectedCauses: ['ramadan_feeding'],
    causeAllocation: {
      'ramadan_feeding': 100
    },
    waqfAssets: [],
    supportedCauses: [],
    financial: {
      totalDonations: 8000,
      totalDistributed: 0,
      currentBalance: 8000,
      investmentReturns: [],
      totalInvestmentReturn: 0,
      growthRate: 0,
      causeAllocations: {}
    },
    consumableDetails: {
      spendingSchedule: 'immediate',
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      targetAmount: 8000,
      targetBeneficiaries: 200,
      minimumMonthlyDistribution: 8000
    },
    reportingPreferences: {
      frequency: 'quarterly',
      reportTypes: ['financial', 'impact'],
      deliveryMethod: 'email'
    },
    status: 'active',
    isDonated: true,
    notifications: {
      contributionReminders: false,
      impactReports: true,
      financialUpdates: true
    },
    createdBy: 'test-user',
    lastContributionDate: new Date().toISOString()
  },
  {
    name: 'Winter Warmth Campaign',
    description: 'Ongoing monthly support providing warm clothing, blankets, and heating assistance to homeless families',
    waqfAsset: 24000,
    waqfType: 'TemporaryConsumable' as WaqfType,
    isHybrid: false,
    donor: {
      name: 'Ibrahim Khalil',
      email: 'ibrahim@example.com',
      phone: '+1-555-0103',
      address: '789 Generosity Ave, City, State 12345'
    },
    selectedCauses: ['homeless_support'],
    causeAllocation: {
      'homeless_support': 100
    },
    waqfAssets: [],
    supportedCauses: [],
    financial: {
      totalDonations: 24000,
      totalDistributed: 0,
      currentBalance: 24000,
      investmentReturns: [],
      totalInvestmentReturn: 0,
      growthRate: 0,
      causeAllocations: {}
    },
    consumableDetails: {
      spendingSchedule: 'ongoing',
      startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      targetBeneficiaries: 100,
      minimumMonthlyDistribution: 2000,
      endDate: undefined,
      targetAmount: undefined,
      milestones: undefined
    },
    reportingPreferences: {
      frequency: 'quarterly',
      reportTypes: ['financial', 'impact'],
      deliveryMethod: 'both'
    },
    status: 'active',
    isDonated: true,
    notifications: {
      contributionReminders: true,
      impactReports: true,
      financialUpdates: true
    },
    createdBy: 'test-user',
    lastContributionDate: new Date().toISOString()
  }
];

export { testConsumableWaqfs };

