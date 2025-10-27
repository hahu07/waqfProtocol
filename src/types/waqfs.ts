import type { Doc } from '@junobuild/core';

export type { Doc };

/**
 * Interface representing a donor's profile information.
 */
export interface DonorProfile {
  /**
   * Donor's full name.
   */
  name: string;
  /**
   * Donor's email address.
   */
  email: string;
  /**
   * Donor's phone number.
   */
  phone: string;
  /**
   * Donor's physical address.
   */
  address: string;
}

/**
 * Interface representing a main category (dynamic, stored in database)
 */
export interface Category {
  /**
   * Unique ID of the category.
   */
  id: string;
  /**
   * Name of the category (e.g., "Permanent Waqf", "Temporary Consumable Waqf").
   */
  name: string;
  /**
   * Detailed description of the category.
   */
  description: string;
  /**
   * Icon representing the category.
   */
  icon: string;
  /**
   * Color code for UI (hex format).
   */
  color?: string;
  /**
   * Whether the category is currently active.
   */
  isActive: boolean;
  /**
   * Sort order for display.
   */
  sortOrder: number;
  /**
   * Waqf types associated with this category.
   */
  associatedWaqfTypes: WaqfType[];
  /**
   * Timestamp when created.
   */
  createdAt: string;
  /**
   * Timestamp when last updated.
   */
  updatedAt: string;
}

/**
 * Type alias for a category document.
 */
export type CategoryDoc = Doc<Category>;

/**
 * Interface representing a subcategory (dynamic, stored in database)
 */
export interface Subcategory {
  /**
   * Unique ID of the subcategory.
   */
  id: string;
  /**
   * ID of the parent category.
   */
  categoryId: string;
  /**
   * Name of the subcategory (e.g., "Education Waqf", "Healthcare Investment").
   */
  name: string;
  /**
   * Detailed description of the subcategory.
   */
  description: string;
  /**
   * Icon representing the subcategory.
   */
  icon: string;
  /**
   * Array of example use cases.
   */
  examples: string[];
  /**
   * Whether the subcategory is currently active.
   */
  isActive: boolean;
  /**
   * Sort order within the parent category.
   */
  sortOrder: number;
  /**
   * Timestamp when created.
   */
  createdAt: string;
  /**
   * Timestamp when last updated.
   */
  updatedAt: string;
}

/**
 * Type alias for a subcategory document.
 */
export type SubcategoryDoc = Doc<Subcategory>;

/**
 * Interface representing a charitable cause.
 */
export interface Cause {
  /**
   * Unique ID of the cause.
   */
  id: string;
  /**
   * Name of the cause.
   */
  name: string;
  /**
   * Brief description of the cause.
   */
  description: string;
  /**
   * Icon or logo representing the cause.
   */
  icon: string;
  /**
   * Cover image URL for the cause (optional).
   */
  coverImage?: string;
  /**
   * ID of the main category this cause belongs to.
   */
  categoryId: string;
  /**
   * ID of the subcategory this cause belongs to.
   */
  subcategoryId: string;
  /**
   * @deprecated Legacy category field for backward compatibility. Use categoryId and subcategoryId instead.
   */
  category?: string;
  /**
   * Whether the cause is currently active.
   */
  isActive: boolean;
  /**
   * Status of the cause (pending, approved, rejected)
   */
  status: 'pending' | 'approved' | 'rejected';
  /**
   * Sort order of the cause.
   */
  sortOrder: number;
  /**
   * Number of supporters following this cause
   */
  followers: number;
  /**
   * Total funds raised for this cause
   */
  fundsRaised: number;
  /**
   * Optional target/goal amount for this cause
   */
  targetAmount?: number;
  /**
   * Primary currency for this cause (NGN, USD, etc.)
   */
  primaryCurrency?: string;
  /**
   * Exchange rate from primary to USD (if primary is not USD)
   */
  exchangeRateToUSD?: number;
  /**
   * Impact score for comparing cause effectiveness (0-100)
   */
  impactScore?: number;
  /**
   * Waqf types supported by this cause
   */
  supportedWaqfTypes: WaqfType[];
  /**
   * Investment strategy for permanent waqf (optional)
   */
  investmentStrategy?: InvestmentStrategy;
  /**
   * Configuration for consumable waqf options
   */
  consumableOptions?: {
    minDurationMonths: number;
    maxDurationMonths: number;
    defaultSpendingSchedule: SpendingSchedule;
  };
  /**
   * Configuration for revolving waqf options
   */
  revolvingOptions?: {
    minLockPeriodMonths: number;
    maxLockPeriodMonths: number;
    expectedReturnDuringPeriod: number;
  };
  /**
   * Timestamp when the cause was created.
   */
  createdAt: string;
  /**
   * Timestamp when the cause was last updated.
   */
  updatedAt: string;
}

/**
 * Type alias for a cause document.
 */
export type CauseDoc = Doc<Cause>;

/**
 * Interface representing a donation made by a donor.
 */
export interface Donation {
  /**
   * Unique ID of the donation.
   */
  id: string;
  /**
   * ID of the waqf this donation belongs to
   */
  waqfId: string;
  /**
   * Date when the donation was made.
   */
  date: string;
  /**
   * Amount of the donation.
   */
  amount: number;
  /**
   * Currency of the donation (e.g. USD, EUR)
   */
  currency: string;
  /**
   * Status of the donation (completed, pending, or failed).
   */
  status: 'completed' | 'pending' | 'failed';
  /**
   * Unique transaction ID for the donation.
   */
  transactionId?: string;
  /**
   * Amount allocated to each cause.
   */
  allocatedCauses?: { [causeId: string]: number };
  /**
   * Name of the donor (optional, can be anonymous)
   */
  donorName?: string;
}

/**
 * Interface representing financial metrics for a waqf.
 */
export interface FinancialMetrics {
  /**
   * Total amount of donations received.
   */
  totalDonations: number;
  /**
   * Total amount distributed to causes.
   */
  totalDistributed: number;
  /**
   * Current balance of the waqf.
   */
  currentBalance: number;
  /**
   * Array of investment returns.
   */
  investmentReturns: number[];
  /**
   * Total investment return.
   */
  totalInvestmentReturn: number;
  /**
   * Growth rate of the waqf.
   */
  growthRate: number;
  /**
   * Total allocated per cause.
   */
  causeAllocations: { [causeId: string]: number };
  /**
   * Impact metrics showing the social impact of the waqf
   */
  impactMetrics?: {
    beneficiariesSupported: number;
    projectsCompleted: number;
    completionRate?: number;
    lastDistributionDate?: string;
  };
}

/**
 * Interface representing an impact report for a waqf.
 */
export interface ImpactReport {
  /**
   * Unique ID of the report.
   */
  id: string;
  /**
   * Period covered by the report (e.g., 2024-Q1, 2024-January, etc.).
   */
  period: string;
  /**
   * Timestamp when the report was generated.
   */
  generationDate: string;
  /**
   * Type of report (financial, impact, or comprehensive).
   */
  reportType: 'financial' | 'impact' | 'comprehensive';
  /**
   * Content of the report.
   */
  content: {
    /**
     * Financial summary of the waqf.
     */
    financialSummary: FinancialSummary;
    /**
     * Impact metrics of the waqf.
     */
    impactMetrics: ImpactMetrics;
    /**
     * Breakdown of causes supported by the waqf.
     */
    causeBreakdown: CauseBreakdown[];
    /**
     * Donor impact information.
     */
    donorImpact: DonorImpact;
  };
  /**
   * URL for downloading the report.
   */
  downloadUrl?: string;
}

/**
 * Interface representing a financial summary of a waqf.
 */
export interface FinancialSummary {
  /**
   * Total amount received by the waqf.
   */
  totalReceived: number;
  /**
   * Total amount distributed by the waqf.
   */
  totalDistributed: number;
  /**
   * Administrative costs of the waqf.
   */
  administrativeCosts: number;
  /**
   * Investment returns of the waqf.
   */
  investmentReturns: number;
}

/**
 * Interface representing impact metrics of a waqf.
 */
export interface ImpactMetrics {
  /**
   * Number of beneficiaries supported by the waqf.
   */
  beneficiariesSupported: number;
  /**
   * Number of projects completed by the waqf.
   */
  projectsCompleted: number;
  /**
   * Number of communities impacted by the waqf.
   */
  communitiesImpacted: number;
  /**
   * Array of success stories from the waqf.
   */
  successStories: string[];
}

/**
 * Interface representing a breakdown of causes supported by a waqf.
 */
export interface CauseBreakdown {
  /**
   * ID of the cause.
   */
  causeId: string;
  /**
   * Name of the cause.
   */
  causeName: string;
  /**
   * Amount allocated to the cause.
   */
  amountAllocated: number;
  /**
   * Amount utilized by the cause.
   */
  amountUtilized: number;
  /**
   * Number of beneficiaries supported by the cause.
   */
  beneficiaries: number;
  /**
   * Number of projects completed by the cause.
   */
  projects: number;
}

/**
 * Interface representing donor impact information.
 */
export interface DonorImpact {
  /**
   * Donor's contribution to the waqf.
   */
  donorContribution: number;
  /**
   * Percentage of total contributions made by the donor.
   */
  donorPercentage: number;
  /**
   * Array of causes supported by the donor.
   */
  causesSupported: string[];
  /**
   * Custom message about the donor's specific impact.
   */
  personalImpact: string;
}

/**
 * Enum representing the type of waqf
 */
export enum WaqfType {
  PERMANENT = 'permanent',              // Traditional perpetual waqf - principal preserved forever, returns distributed
  TEMPORARY_CONSUMABLE = 'temporary_consumable',  // Principal + returns spent over time period
  TEMPORARY_REVOLVING = 'temporary_revolving'     // Principal returned to donor, returns distributed
}

/**
 * Spending schedule for consumable temporary waqf
 */
export type SpendingSchedule = 'immediate' | 'phased' | 'milestone-based' | 'ongoing';

/**
 * Interface representing consumable temporary waqf configuration
 */
export interface ConsumableWaqfDetails {
  /**
   * How the funds will be spent
   */
  spendingSchedule: SpendingSchedule;
  
  /**
   * Start date of the waqf (optional for ongoing)
   */
  startDate?: string;
  
  /**
   * End date when all funds should be spent (optional)
   */
  endDate?: string;
  
  /**
   * Target amount to be distributed before completion (alternative to dates)
   */
  targetAmount?: number;
  
  /**
   * Target number of beneficiaries to support before completion
   */
  targetBeneficiaries?: number;
  
  /**
   * Milestones if using milestone-based spending
   */
  milestones?: {
    description: string;
    targetDate: string;
    targetAmount: number;
  }[];
  
  /**
   * Minimum amount to distribute monthly (for ongoing schedules)
   */
  minimumMonthlyDistribution?: number;
}

/**
 * Represents a single contribution tranche for revolving waqf
 */
export interface ContributionTranche {
  /**
   * Unique ID of this contribution
   */
  id: string;
  /**
   * Amount of this contribution
   */
  amount: number;
  /**
   * Date when this contribution was made
   */
  contributionDate: string;
  /**
   * Maturity date for this specific contribution
   */
  maturityDate: string;
  /**
   * Whether this tranche has matured and been returned
   */
  isReturned: boolean;
  /**
   * Date when the tranche was returned (if applicable)
   */
  returnedDate?: string;
}

/**
 * Interface representing revolving temporary waqf configuration
 */
export interface RevolvingWaqfDetails {
  /**
   * Lock period in months (e.g., 60 months = 5 years)
   */
  lockPeriodMonths: number;
  /**
   * ISO timestamp when principal will be returned (for initial contribution)
   */
  maturityDate: string;
  /**
   * How principal will be returned
   */
  principalReturnMethod: 'lump_sum' | 'installments';
  /**
   * Installment schedule if using installments
   */
  installmentSchedule?: {
    frequency: 'monthly' | 'quarterly' | 'annually';
    numberOfInstallments: number;
  };
  /**
   * Penalty percentage for early withdrawal (e.g., 0.1 = 10%)
   */
  earlyWithdrawalPenalty?: number;
  /**
   * Whether early withdrawal is allowed
   */
  earlyWithdrawalAllowed: boolean;
  /**
   * Array of contribution tranches (each with its own maturity date)
   */
  contributionTranches?: ContributionTranche[];
}

/**
 * Investment strategy configuration
 */
export interface InvestmentStrategy {
  /**
   * Asset allocation description (e.g., "60% Sukuk, 40% Equity")
   */
  assetAllocation: string;
  /**
   * Expected annual return percentage
   */
  expectedAnnualReturn: number;
  /**
   * How often returns are distributed
   */
  distributionFrequency: 'monthly' | 'quarterly' | 'annually';
}

/**
 * Interface representing return allocation information.
 */
export interface ReturnAllocation {
  /**
   * Unique ID of the return allocation.
   */
  id: string;
  /**
   * ID of the waqf.
   */
  waqfId: string;
  /**
   * Period of the return allocation.
   */
  period: string;
  /**
   * Total returns allocated.
   */
  totalReturns: number;
  /**
   * User who allocated the returns.
   */
  allocatedBy: string;
  /**
   * Timestamp when the returns were allocated.
   */
  allocatedAt: string;
  /**
   * Array of allocations to causes.
   */
  allocations: {
    /**
     * ID of the cause.
     */
    causeId: string;
    /**
     * Amount allocated to the cause.
     */
    amount: number;
    /**
     * Rationale for the allocation.
     */
    rationale: string;
  }[];
}

/**
 * Hybrid allocation for a single cause across multiple waqf types
 */
export interface HybridCauseAllocation {
  /**
   * ID of the cause
   */
  causeId: string;
  /**
   * Allocation split across waqf types (percentages should sum to 100)
   */
  allocations: {
    permanent?: number;              // Percentage allocated to permanent waqf
    temporary_consumable?: number;   // Percentage allocated to consumable waqf
    temporary_revolving?: number;    // Percentage allocated to revolving waqf
  };
}

/**
 * Represents a Waqf (Islamic endowment) profile with donor information,
 * cause allocations, financial tracking, and reporting preferences.
 */
export interface WaqfProfile {
  /**
   * Unique ID of the waqf
   */
  id: string;
  /**
   * Name/title of the waqf
   */
  name: string;
  /**
   * Description of the waqf
   */
  description: string;
  /**
   * Waqf asset (principal endowment) - preserved and invested, only proceeds distributed
   */
  waqfAsset: number;
  /**
   * Primary type of waqf (can be mixed if using hybrid)
   */
  waqfType: WaqfType | 'hybrid';
  /**
   * Whether this waqf uses hybrid allocation across multiple types
   */
  isHybrid: boolean;
  /**
   * Hybrid allocations per cause (only for hybrid waqfs)
   */
  hybridAllocations?: HybridCauseAllocation[];
  /**
   * Details for consumable temporary waqf
   */
  consumableDetails?: ConsumableWaqfDetails;
  /**
   * Details for revolving temporary waqf
   */
  revolvingDetails?: RevolvingWaqfDetails;
  /**
   * Investment strategy for permanent portion
   */
  investmentStrategy?: InvestmentStrategy;
  
  // Donor and basic info
  donor: DonorProfile;
  
  // Cause selection
  selectedCauses: string[]; // Array of cause IDs
  causeAllocation: { [causeId: string]: number }; // Percentage allocation per cause (for non-hybrid)
  
  waqfAssets: Donation[];
  supportedCauses: Cause[];
  
  // Financial tracking
  financial: FinancialMetrics;
  
  // Impact and reporting
  reportingPreferences: {
    frequency: 'quarterly' | 'semiannually' | 'yearly';
    reportTypes: ('financial' | 'impact')[];
    deliveryMethod: 'email' | 'platform' | 'both';
  };
  
  /**
   * Whether the waqf has received its first donation
   */
  isDonated?: boolean;

  /**
   * Status of the waqf (active, paused, completed, or terminated).
   */
  status: 'active' | 'paused' | 'completed' | 'terminated';
  /**
   * Notification preferences of the waqf.
   */
  notifications: {
    /**
     * Whether to send contribution reminders.
     */
    contributionReminders: boolean;
    /**
     * Whether to send impact reports.
     */
    impactReports: boolean;
    /**
     * Whether to send financial updates.
     */
    financialUpdates: boolean;
  };
  
  /**
   * Stored waqf deed document data
   */
  deedDocument?: {
    signedAt: string;
    donorSignature: string;
    documentVersion: string;
  };
  
  /**
   * Metadata of the waqf.
   */
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  lastContributionDate?: string;
  nextContributionDate?: string;
  nextReportDate?: string;
}

/**
 * Type alias for a waqf document.
 */
export type Waqf = Doc<WaqfProfile>;