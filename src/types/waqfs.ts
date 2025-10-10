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
   * Category of the cause (e.g., education, healthcare, etc.).
   */
  category: string;
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
   * Impact score for comparing cause effectiveness (0-100)
   */
  impactScore?: number;
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
  
  // Donor and basic info
  donor: DonorProfile;
  
  // Cause selection
  selectedCauses: string[]; // Array of cause IDs
  causeAllocation: { [causeId: string]: number }; // Percentage allocation per cause
  
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
   * Status of the waqf (active, paused, or completed).
   */
  status: 'active' | 'paused' | 'completed';
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