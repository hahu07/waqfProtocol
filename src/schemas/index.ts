/**
 * Zod Validation Schemas
 *
 * Runtime type validation for all core data models
 */

import { z } from 'zod';

// ============================================
// IMPACT EVENT SCHEMAS
// ============================================

export const impactEventLocationSchema = z.object({
  country: z.string().min(2),
  city: z.string().optional(),
  region: z.string().optional(),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
});

export const beneficiaryTestimonialSchema = z.object({
  name: z.string().min(2),
  quote: z.string().min(10),
  photo: z.string().url().optional(),
  date: z.string().optional(),
});

export const impactEventMediaSchema = z.object({
  photos: z.array(z.string().url()).default([]),
  videos: z.array(z.string().url()).default([]),
  testimonials: z.array(beneficiaryTestimonialSchema).default([]),
});

export const impactEventVerificationSchema = z.object({
  verifiedBy: z.string().min(2),
  verificationDate: z.string(),
  proofDocuments: z.array(z.string().url()).default([]),
  status: z.enum(['pending', 'verified', 'rejected']),
  notes: z.string().optional(),
});

export const impactEventSchema = z.object({
  id: z.string(),
  waqfId: z.string(),
  waqfName: z.string(),
  causeId: z.string(),
  causeName: z.string(),
  timestamp: z.string(),
  type: z.enum(['distribution', 'milestone_completed', 'beneficiary_helped', 'project_completed', 'funds_deployed', 'emergency_response', 'investment_return']),
  amount: z.number().min(0),
  currency: z.string().length(3),
  beneficiaryCount: z.number().int().min(0),
  projectsCompleted: z.number().int().min(0).optional(),
  location: impactEventLocationSchema,
  media: impactEventMediaSchema,
  verification: impactEventVerificationSchema,
  description: z.string().min(10),
  title: z.string().min(5),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

// ============================================
// DONOR PROGRESSION SCHEMAS
// ============================================

export const donorBadgeSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  description: z.string().min(10),
  icon: z.string(),
  earnedAt: z.string(),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  category: z.enum(['contribution', 'impact', 'social', 'special', 'seasonal']),
  progress: z.object({
    current: z.number().min(0),
    target: z.number().min(1),
  }).optional(),
});

export const donorStatsSchema = z.object({
  totalContributed: z.number().min(0).default(0),
  beneficiariesHelped: z.number().int().min(0).default(0),
  causesSupported: z.number().int().min(0).default(0),
  waqfsCreated: z.number().int().min(0).default(0),
  referralsConverted: z.number().int().min(0).default(0),
  consecutiveDays: z.number().int().min(0).default(0),
  longestStreak: z.number().int().min(0).default(0),
  lastContributionDate: z.string().optional(),
});

export const donorRankSchema = z.object({
  global: z.number().int().min(0).default(0),
  category: z.record(z.string(), z.number().int().min(0)).default({}),
  monthly: z.number().int().min(0).default(0),
  allTime: z.number().int().min(0).default(0),
});

export const donorProgressionProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string().min(2).max(50),
  avatar: z.string().optional(),
  level: z.number().int().min(1).max(100).default(1),
  xp: z.number().min(0).default(0),
  nextLevelXp: z.number().min(1).default(100),
  badges: z.array(donorBadgeSchema).default([]),
  stats: donorStatsSchema,
  rank: donorRankSchema,
  publicProfile: z.boolean().default(false),
  showOnLeaderboard: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================
// REFERRAL SCHEMAS
// ============================================

export const referralTierSchema = z.object({
  tier: z.number().int().min(1),
  referralsRequired: z.number().int().min(1),
  bonus: z.string(),
  badge: z.string(),
  percentageBonus: z.number().min(0).max(100).optional(),
});

export const referralSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  joinedAt: z.string(),
  totalContributed: z.number().min(0).default(0),
  status: z.enum(['pending', 'active', 'inactive']),
  firstContributionDate: z.string().optional(),
});

export const referralStatsSchema = z.object({
  totalReferrals: z.number().int().min(0).default(0),
  activeReferrals: z.number().int().min(0).default(0),
  totalEarned: z.number().min(0).default(0),
  conversionRate: z.number().min(0).max(100).default(0),
  currentTier: z.number().int().min(1).default(1),
});

export const referralProgramSchema = z.object({
  referrerId: z.string(),
  referralCode: z.string().min(6).max(20),
  refereeBonus: z.number().min(0).default(10),
  referrerBonus: z.number().min(0).default(10),
  tiers: z.array(referralTierSchema),
  stats: referralStatsSchema,
  referrals: z.array(referralSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================
// LEADERBOARD SCHEMAS
// ============================================

export const leaderboardEntrySchema = z.object({
  rank: z.number().int().min(1),
  userId: z.string(),
  displayName: z.string(),
  avatar: z.string().url().optional(),
  score: z.number().min(0),
  badge: z.string().optional(),
  change: z.number().int(),
  level: z.number().int().min(1).max(100).optional(),
});

export const leaderboardSchema = z.object({
  type: z.enum(['contributors', 'impact', 'rising_stars', 'streaks', 'referrals']),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'all-time']),
  category: z.string().optional(),
  waqfType: z.string().optional(),
  entries: z.array(leaderboardEntrySchema),
  generatedAt: z.string(),
  totalParticipants: z.number().int().min(0),
});

// ============================================
// DONOR & PROFILE SCHEMAS
// ============================================

export const donorProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').max(20),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
});

export type DonorProfileInput = z.infer<typeof donorProfileSchema>;

// ============================================
// CAUSE SCHEMAS
// ============================================

export const investmentStrategySchema = z.object({
  assetAllocation: z.string().min(5, 'Asset allocation description required'),
  expectedAnnualReturn: z.number().min(0).max(100),
  distributionFrequency: z.enum(['monthly', 'quarterly', 'annually']),
});

export const causeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  icon: z.string().min(1, 'Icon is required'),
  coverImage: z.string().url('Invalid image URL').optional(),
  category: z.string().min(2).max(50),
  isActive: z.boolean().default(true),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  sortOrder: z.number().int().min(0).default(0),
  followers: z.number().int().min(0).default(0),
  fundsRaised: z.number().min(0).default(0),
  targetAmount: z.number().positive('Target amount must be positive').optional(),
  primaryCurrency: z.string().default('NGN'),
  exchangeRateToUSD: z.number().positive('Exchange rate must be positive').optional(),
  impactScore: z.number().min(0).max(100).optional(),
  supportedWaqfTypes: z.array(z.enum(['permanent', 'temporary_consumable', 'temporary_revolving'])).min(1, 'Select at least one waqf type'),
  investmentStrategy: investmentStrategySchema.optional(),
  consumableOptions: z.object({
    minDurationMonths: z.number().int().min(1),
    maxDurationMonths: z.number().int().min(1),
    defaultSpendingSchedule: z.enum(['immediate', 'phased', 'milestone-based']),
  }).optional(),
  revolvingOptions: z.object({
    minLockPeriodMonths: z.number().int().min(1),
    maxLockPeriodMonths: z.number().int().min(1),
    expectedReturnDuringPeriod: z.number().min(0),
  }).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type CauseInput = z.infer<typeof causeSchema>;

// ============================================
// DONATION SCHEMAS
// ============================================

export const donationSchema = z.object({
  id: z.string().optional(),
  waqfId: z.string().min(1, 'Waqf ID is required'),
  date: z.string().datetime(),
  amount: z.number().positive('Amount must be positive').min(1, 'Minimum donation is $1'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'INR', 'SAR', 'AED']),
  status: z.enum(['completed', 'pending', 'failed']).default('pending'),
  transactionId: z.string().optional(),
  allocatedCauses: z.record(z.string(), z.number().min(0)).optional(),
  donorName: z.string().max(100).optional(),
});

export type DonationInput = z.infer<typeof donationSchema>;

// ============================================
// FINANCIAL METRICS SCHEMAS
// ============================================

export const financialMetricsSchema = z.object({
  totalDonations: z.number().min(0).default(0),
  totalDistributed: z.number().min(0).default(0),
  currentBalance: z.number().min(0).default(0),
  investmentReturns: z.array(z.number()).default([]),
  totalInvestmentReturn: z.number().default(0),
  growthRate: z.number().default(0),
  causeAllocations: z.record(z.string(), z.number().min(0)).default({}),
  impactMetrics: z.object({
    beneficiariesSupported: z.number().int().min(0).default(0),
    projectsCompleted: z.number().int().min(0).default(0),
    completionRate: z.number().min(0).max(100).optional(),
  }).optional(),
});

export type FinancialMetricsInput = z.infer<typeof financialMetricsSchema>;

// ============================================
// WAQF TYPE SCHEMAS
// ============================================

const portfolioAllocationChangeSchema = z.object({
  id: z.string().min(1),
  allocationId: z.string().min(1),
  previousPercentage: z.number().min(0).max(100),
  newPercentage: z.number().min(0).max(100),
  trigger: z.enum(['donor_request', 'system_alert', 'emergency_response', 'scheduled_rebalance']),
  notes: z.string().max(1000).optional(),
});

const portfolioRebalanceEventSchema = z.object({
  id: z.string().min(1),
  timestamp: z.string().datetime(),
  requestedBy: z.string().optional(),
  reason: z.string().min(5),
  changes: z.array(portfolioAllocationChangeSchema).nonempty(),
});

const portfolioAllocationSchema = z.object({
  allocationId: z.string().min(1),
  causeId: z.string().min(1),
  allocationPercentage: z.number().min(0).max(100),
  currentBalance: z.number().min(0),
  targetBalance: z.number().min(0),
  lockUntil: z.string().datetime().optional(),
  lastAdjustedAt: z.string().datetime().optional(),
});

const portfolioImpactMetricsSchema = z.object({
  beneficiariesSupported: z.number().int().min(0),
  projectsCompleted: z.number().int().min(0),
  householdsServed: z.number().int().min(0).optional(),
  impactScore: z.number().min(0).max(100).optional(),
});

const basePortfolioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  ownerId: z.string().min(1),
  participatingWaqfs: z.array(z.string()).min(1),
  allocations: z.array(portfolioAllocationSchema).nonempty(),
  rebalanceHistory: z.array(portfolioRebalanceEventSchema).default([]),
  impactMetrics: portfolioImpactMetricsSchema.optional(),
  tags: z.array(z.string().min(1)).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const consumablePortfolioSchema = basePortfolioSchema.extend({
  portfolioType: z.literal('consumable'),
  allowedWaqfTypes: z.tuple([z.literal('temporary_consumable')]),
  totalCommitted: z.number().min(0),
  totalDistributed: z.number().min(0),
  totalContributed: z.number().min(0).optional(),
  totalBeneficiaries: z.number().int().min(0).optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
  targetCompletionDate: z.string().datetime().optional(),
  nextRebalanceDate: z.string().datetime().optional(),
}).refine(
  (portfolio) => {
    const totalPercentage = portfolio.allocations.reduce((sum, alloc) => sum + alloc.allocationPercentage, 0);
    return Math.abs(totalPercentage - 100) < 0.01;
  },
  {
    message: 'Portfolio allocations must sum to 100%',
    path: ['allocations'],
  }
);

export const returnsPortfolioSchema = basePortfolioSchema.extend({
  portfolioType: z.literal('returns'),
  allowedWaqfTypes: z.tuple([z.literal('permanent'), z.literal('temporary_revolving')]),
  totalPrincipal: z.number().min(0),
  availableReturns: z.number().min(0),
  projectedAnnualReturns: z.number().min(0),
  totalReturnsDistributed: z.number().min(0),
  nextDistributionDate: z.string().datetime().optional(),
  lastDistributionDate: z.string().datetime().optional(),
}).refine(
  (portfolio) => {
    const totalPercentage = portfolio.allocations.reduce((sum, alloc) => sum + alloc.allocationPercentage, 0);
    return Math.abs(totalPercentage - 100) < 0.01;
  },
  {
    message: 'Portfolio allocations must sum to 100%',
    path: ['allocations'],
  }
);

export const portfolioSchema = z.discriminatedUnion('portfolioType', [
  consumablePortfolioSchema,
  returnsPortfolioSchema,
]);

const consumablePortfolioMembershipSchema = z.object({
  portfolioId: z.string().min(1),
  portfolioType: z.literal('consumable'),
  preferredRebalanceCadence: z.enum(['weekly', 'monthly', 'quarterly', 'annually']).optional(),
  enableRebalanceAlerts: z.boolean().optional(),
  allowUrgentOverrides: z.boolean().optional(),
});

const returnsPortfolioMembershipSchema = z.object({
  portfolioId: z.string().min(1),
  portfolioType: z.literal('returns'),
  preferredRebalanceCadence: z.enum(['weekly', 'monthly', 'quarterly', 'annually']).optional(),
  enableRebalanceAlerts: z.boolean().optional(),
});

export const portfolioMembershipSchema = z.discriminatedUnion('portfolioType', [
  consumablePortfolioMembershipSchema,
  returnsPortfolioMembershipSchema,
]);

export const consumableWaqfDetailsSchema = z.object({
  spendingSchedule: z.enum(['immediate', 'phased', 'milestone-based', 'ongoing']),
  
  // Optional time boundaries
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  
  // Alternative completion criteria
  targetAmount: z.number().positive('Target amount must be positive').optional(),
  targetBeneficiaries: z.number().int().positive('Target beneficiaries must be at least 1').optional(),
  
  // Spending parameters
  milestones: z.array(z.object({
    description: z.string().min(5, 'Milestone description required'),
    targetDate: z.string().datetime(),
    targetAmount: z.number().positive(),
  })).optional(),
  minimumMonthlyDistribution: z.number().positive('Minimum distribution must be positive').optional(),
  portfolioMembership: consumablePortfolioMembershipSchema.optional(),
}).refine(
  (data) => {
    // UX validation: Date logic for better error messages
    // Backend will also validate this as source of truth
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);
// Note: Backend (waqf_hooks.rs) validates business rules as authority
// This schema focuses on format/type validation for UX


const installmentPaymentSchema = z.object({
  id: z.string().min(1),
  amount: z.number().min(0),
  dueDate: z.string(),
  status: z.enum(['scheduled', 'paid', 'missed']),
  paidDate: z.string().optional(),
});

const contributionTrancheSchema = z.object({
  id: z.string().min(1),
  amount: z.number().min(0),
  contributionDate: z.string(),
  maturityDate: z.string(),
  isReturned: z.boolean(),
  returnedDate: z.string().optional(),
  status: z.enum(['locked', 'matured', 'return_scheduled', 'returned', 'rolled_over']).optional(),
  penaltyApplied: z.number().min(0).optional(),
  rolloverOriginId: z.string().optional(),
  rolloverTargetId: z.string().optional(),
  installmentPayments: z.array(installmentPaymentSchema).optional(),
});

export const revolvingWaqfDetailsSchema = z.object({
  lockPeriodMonths: z.number().int().min(1, 'Lock period must be at least 1 month').max(240),
  maturityDate: z.string().datetime(),
  principalReturnMethod: z.enum(['lump_sum', 'installments']),
  installmentSchedule: z.object({
    frequency: z.enum(['monthly', 'quarterly', 'annually']),
    numberOfInstallments: z.number().int().min(1),
  }).optional(),
  earlyWithdrawalPenalty: z.number().min(0).max(1).optional(),
  earlyWithdrawalAllowed: z.boolean().default(false),
  contributionTranches: z.array(contributionTrancheSchema).optional(),
  autoRolloverPreference: z.enum(['none', 'same_cause', 'cause_pool']).default('none'),
  autoRolloverTargetCause: z.string().optional(),
  pendingNotifications: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.principalReturnMethod === 'installments' && !data.installmentSchedule) {
      return false;
    }
    return true;
  },
  {
    message: 'Installment schedule required when using installments',
    path: ['installmentSchedule'],
  }
);

export const hybridCauseAllocationSchema = z.object({
  causeId: z.string().min(1),
  allocations: z.object({
    permanent: z.number().min(0).max(100).optional(),
    temporary_consumable: z.number().min(0).max(100).optional(),
    temporary_revolving: z.number().min(0).max(100).optional(),
  }).refine(
    (allocations) => {
      const total = (allocations.permanent || 0) + 
                     (allocations.temporary_consumable || 0) + 
                     (allocations.temporary_revolving || 0);
      return Math.abs(total - 100) < 0.01;
    },
    { message: 'Allocations must sum to 100%' }
  ),
});

export type ConsumableWaqfDetailsInput = z.infer<typeof consumableWaqfDetailsSchema>;
export type RevolvingWaqfDetailsInput = z.infer<typeof revolvingWaqfDetailsSchema>;
export type HybridCauseAllocationInput = z.infer<typeof hybridCauseAllocationSchema>;

// ============================================
// WAQF SCHEMAS
// ============================================

export const reportingPreferencesSchema = z.object({
  frequency: z.enum(['quarterly', 'semiannually', 'yearly']),
  reportTypes: z.array(z.enum(['financial', 'impact'])).min(1, 'Select at least one report type'),
  deliveryMethod: z.enum(['email', 'platform', 'both']),
});

export const notificationPreferencesSchema = z.object({
  contributionReminders: z.boolean().default(true),
  impactReports: z.boolean().default(true),
  financialUpdates: z.boolean().default(true),
});

export const waqfProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(3, 'Waqf name must be at least 3 characters')
    .max(100, 'Waqf name must not exceed 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  waqfAsset: z.number()
    .positive('Waqf asset must be positive')
    .min(100, 'Minimum waqf asset is $100 for meaningful impact'),
  waqfType: z.enum(['permanent', 'temporary_consumable', 'temporary_revolving', 'hybrid']),
  isHybrid: z.boolean().default(false),
  hybridAllocations: z.array(hybridCauseAllocationSchema).optional(),
  consumableDetails: consumableWaqfDetailsSchema.optional(),
  revolvingDetails: revolvingWaqfDetailsSchema.optional(),
  investmentStrategy: investmentStrategySchema.optional(),
  portfolioDetails: consumablePortfolioSchema.optional(),
  donor: donorProfileSchema,
  selectedCauses: z.array(z.string()).min(1, 'Select at least one cause'),
  causeAllocation: z.record(z.string(), z.number().min(0).max(100))
    .refine(
      (allocations) => {
        const total = Object.values(allocations).reduce((sum, val) => sum + val, 0);
        return Math.abs(total - 100) < 0.01; // Allow for floating point errors
      },
      { message: 'Cause allocations must sum to 100%' }
    ),
  financial: financialMetricsSchema.default({
    totalDonations: 0,
    totalDistributed: 0,
    currentBalance: 0,
    investmentReturns: [],
    totalInvestmentReturn: 0,
    growthRate: 0,
    causeAllocations: {},
  }),
  reportingPreferences: reportingPreferencesSchema,
  isDonated: z.boolean().optional(),
  status: z.enum(['active', 'paused', 'completed', 'terminated', 'matured']).default('active'),
  notifications: notificationPreferencesSchema.default({
    contributionReminders: true,
    impactReports: true,
    financialUpdates: true,
  }),
  createdBy: z.string().min(1),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  lastContributionDate: z.string().datetime().optional(),
  nextContributionDate: z.string().datetime().optional(),
  nextReportDate: z.string().datetime().optional(),
}).refine(
  (data) => {
    // Hybrid waqf must have hybrid allocations
    if (data.isHybrid && (!data.hybridAllocations || data.hybridAllocations.length === 0)) {
      return false;
    }
    // Non-hybrid waqf should not have hybrid allocations
    if (!data.isHybrid && data.hybridAllocations) {
      return false;
    }
    // Consumable waqf must have consumable details
    if (data.waqfType === 'temporary_consumable' && !data.consumableDetails) {
      return false;
    }
    // Revolving waqf must have revolving details
    if (data.waqfType === 'temporary_revolving' && !data.revolvingDetails) {
      return false;
    }
    return true;
  },
  {
    message: 'Waqf type must match its configuration details',
    path: ['waqfType'],
  }
);

export type WaqfProfileInput = z.infer<typeof waqfProfileSchema>;

// ============================================
// PAYMENT SCHEMAS
// ============================================

export const paymentIntentSchema = z.object({
  id: z.string().optional(),
  amount: z.number().positive('Amount must be positive').min(1),
  currency: z.enum(['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'INR', 'SAR', 'AED']),
  description: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  customerId: z.string().optional(),
  customerEmail: z.string().email().optional(),
});

export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>;

export const paymentResultSchema = z.object({
  success: z.boolean(),
  transactionId: z.string(),
  provider: z.enum(['stripe', 'paypal', 'flutterwave', 'paystack', 'razorpay', 'square']),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'INR', 'SAR', 'AED']),
  error: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime(),
});

export type PaymentResultInput = z.infer<typeof paymentResultSchema>;

// ============================================
// ADMIN SCHEMAS
// ============================================

export const adminSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(2).max(100),
  role: z.enum(['admin', 'super_admin']).default('admin'),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  createdBy: z.string().optional(),
});

export type AdminInput = z.infer<typeof adminSchema>;

export const adminRequestSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(2).max(100),
  requestReason: z.string().min(10, 'Please provide a reason (at least 10 characters)').max(500),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  requestedAt: z.string().datetime().optional(),
  reviewedAt: z.string().datetime().optional(),
  reviewedBy: z.string().optional(),
  reviewNotes: z.string().max(1000).optional(),
});

export type AdminRequestInput = z.infer<typeof adminRequestSchema>;

// ============================================
// ALLOCATION SCHEMAS
// ============================================

export const allocationSchema = z.object({
  id: z.string().optional(),
  waqfId: z.string().min(1),
  causeId: z.string().min(1),
  amount: z.number().positive('Amount must be positive'),
  rationale: z.string().min(10, 'Rationale must be at least 10 characters').max(1000),
  allocatedAt: z.string().datetime(),
  allocatedBy: z.string().min(1).optional(),
});

export type AllocationInput = z.infer<typeof allocationSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safely parse data with a schema and return validation result
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

/**
 * Format Zod errors into user-friendly messages
 */
export function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map((err) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}
