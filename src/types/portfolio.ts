// Portfolio Builder Types

import type { Cause, WaqfType } from './waqfs';

/**
 * Portfolio item representing a cause with allocation
 */
export interface PortfolioItem {
  cause: Cause;
  totalAmount: number;
  allocation: PortfolioAllocation;
  portfolioPercentage?: number;  // Percentage of total portfolio (0-100) - used in Advanced mode
}

/**
 * Allocation across waqf types for a single cause
 */
export interface PortfolioAllocation {
  permanent: number;        // Percentage (0-100)
  temporary_consumable: number;  // Percentage (0-100)
  temporary_revolving: number;   // Percentage (0-100)
}

/**
 * Complete portfolio state
 */
export interface Portfolio {
  id?: string;
  name: string;
  description?: string;
  items: PortfolioItem[];
  totalAmount: number;
  allocationMode: AllocationMode;
  globalAllocation?: PortfolioAllocation; // Used in Balanced mode
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

/**
 * Allocation mode for portfolio
 */
export type AllocationMode = 'simple' | 'balanced' | 'advanced';

/**
 * Portfolio template for quick start
 */
export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  allocationMode: AllocationMode;
  globalAllocation?: PortfolioAllocation;
  suggestedCauses?: string[]; // Cause IDs
  riskLevel: 'low' | 'medium' | 'high';
  diversificationScore: number; // 0-100
  liquidityLevel: 'low' | 'medium' | 'high';
  tags: string[];
}

/**
 * Portfolio statistics
 */
export interface PortfolioStats {
  totalAmount: number;
  causeCount: number;
  permanentAmount: number;
  permanentPercentage: number;
  consumableAmount: number;
  consumablePercentage: number;
  revolvingAmount: number;
  revolvingPercentage: number;
  diversificationScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  liquidityLevel: 'low' | 'medium' | 'high';
}

/**
 * Impact projection for portfolio
 */
export interface ImpactProjection {
  year1Beneficiaries: number;
  year5Beneficiaries: number;
  year10Beneficiaries: number;
  lifetimeBeneficiaries: number;
  annualBeneficiariesAfter10Years: number;
  consumableDeploymentMonths: number;
  revolvingMaturityDate?: string;
  permanentAnnualReturn: number;
}

/**
 * Cause filter options
 */
export interface CauseFilters {
  search: string;
  categoryId?: string;
  subcategoryId?: string;
  waqfType?: WaqfType;
  urgency?: 'emergency' | 'ongoing' | 'long-term';
  region?: string;
  impactSize?: 'small' | 'medium' | 'large';
  minImpactScore?: number;
}

/**
 * Portfolio validation result
 */
export interface PortfolioValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Saved portfolio draft
 */
export interface PortfolioDraft {
  id: string;
  portfolio: Portfolio;
  savedAt: string;
  userId: string;
}

