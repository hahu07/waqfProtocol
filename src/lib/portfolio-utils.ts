// Portfolio Utility Functions

import type {
  Portfolio,
  PortfolioItem,
  PortfolioAllocation,
  PortfolioStats,
  ImpactProjection,
  PortfolioValidation,
  AllocationMode,
} from '@/types/portfolio';
import type { Cause } from '@/types/waqfs';
import {
  calculateDiversificationScore,
  determineRiskLevel,
  determineLiquidityLevel,
} from './portfolio-templates';

/**
 * Create an empty portfolio
 */
export function createEmptyPortfolio(userId?: string): Portfolio {
  return {
    name: 'My Portfolio',
    description: '',
    items: [],
    totalAmount: 0,
    allocationMode: 'simple',
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Add cause to portfolio
 */
export function addCauseToPortfolio(
  portfolio: Portfolio,
  cause: Cause,
  allocation?: PortfolioAllocation
): Portfolio {
  // Check if cause already exists
  const existingIndex = portfolio.items.findIndex(item => item.cause.id === cause.id);
  
  if (existingIndex >= 0) {
    // Already exists, don't add again
    console.warn('Attempted to add duplicate cause to portfolio:', cause.id, cause.name);
    return portfolio;
  }
  
  console.log('Adding cause to portfolio:', cause.id, cause.name);
  
  // Add new item
  const defaultAllocation: PortfolioAllocation = allocation || 
    (portfolio.allocationMode === 'simple' 
      ? { permanent: 100, temporary_consumable: 0, temporary_revolving: 0 }
      : portfolio.globalAllocation || { permanent: 40, temporary_consumable: 30, temporary_revolving: 30 });
  
  const newItem: PortfolioItem = {
    cause,
    totalAmount: 0, // Will be calculated from portfolio.totalAmount
    allocation: defaultAllocation,
  };
  
  const updatedItems = [...portfolio.items, newItem];
  
  return {
    ...portfolio,
    items: updatedItems,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Remove cause from portfolio
 */
export function removeCauseFromPortfolio(portfolio: Portfolio, causeId: string): Portfolio {
  const updatedItems = portfolio.items.filter(item => item.cause.id !== causeId);
  
  return {
    ...portfolio,
    items: updatedItems,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update cause amount in portfolio
 */
export function updateCauseAmount(
  portfolio: Portfolio,
  causeId: string,
  amount: number
): Portfolio {
  const updatedItems = portfolio.items.map(item =>
    item.cause.id === causeId
      ? { ...item, totalAmount: amount }
      : item
  );
  
  return {
    ...portfolio,
    items: updatedItems,
    totalAmount: calculateTotalAmount(updatedItems),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update cause allocation in portfolio
 */
export function updateCauseAllocation(
  portfolio: Portfolio,
  causeId: string,
  allocation: PortfolioAllocation
): Portfolio {
  const updatedItems = portfolio.items.map(item =>
    item.cause.id === causeId
      ? { ...item, allocation }
      : item
  );
  
  return {
    ...portfolio,
    items: updatedItems,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Set global allocation for all causes (Balanced mode)
 */
export function setGlobalAllocation(
  portfolio: Portfolio,
  allocation: PortfolioAllocation
): Portfolio {
  const updatedItems = portfolio.items.map(item => ({
    ...item,
    allocation,
  }));
  
  return {
    ...portfolio,
    items: updatedItems,
    globalAllocation: allocation,
    allocationMode: 'balanced',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Change allocation mode
 */
export function changeAllocationMode(
  portfolio: Portfolio,
  mode: AllocationMode
): Portfolio {
  let updatedItems = portfolio.items;
  
  if (mode === 'simple') {
    // Set all to 100% permanent
    updatedItems = portfolio.items.map(item => ({
      ...item,
      allocation: { permanent: 100, temporary_consumable: 0, temporary_revolving: 0 },
    }));
  } else if (mode === 'balanced' && portfolio.globalAllocation) {
    // Apply global allocation to all
    updatedItems = portfolio.items.map(item => ({
      ...item,
      allocation: portfolio.globalAllocation!,
    }));
  }
  // For 'advanced' mode, keep existing allocations
  
  return {
    ...portfolio,
    items: updatedItems,
    allocationMode: mode,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate total amount from items
 */
function calculateTotalAmount(items: PortfolioItem[]): number {
  return items.reduce((sum, item) => sum + item.totalAmount, 0);
}

/**
 * Calculate portfolio statistics
 */
export function calculatePortfolioStats(portfolio: Portfolio): PortfolioStats {
  const totalAmount = portfolio.totalAmount;
  
  let permanentAmount = 0;
  let consumableAmount = 0;
  let revolvingAmount = 0;
  
  // In Balanced mode with globalAllocation, weight causes by their effective contribution
  if (portfolio.allocationMode === 'balanced' && portfolio.globalAllocation) {
    // Calculate the total "weight" of all causes based on what types they support
    let totalWeight = 0;
    const causeWeights = portfolio.items.map(item => {
      const weight = 
        (item.allocation.permanent > 0 ? portfolio.globalAllocation!.permanent : 0) +
        (item.allocation.temporary_consumable > 0 ? portfolio.globalAllocation!.temporary_consumable : 0) +
        (item.allocation.temporary_revolving > 0 ? portfolio.globalAllocation!.temporary_revolving : 0);
      totalWeight += weight;
      return weight;
    });
    
    // Distribute total amount across causes proportionally by their weights
    portfolio.items.forEach((item, index) => {
      const causeAmount = totalWeight > 0 ? (totalAmount * causeWeights[index]) / totalWeight : item.totalAmount;
      
      permanentAmount += (causeAmount * item.allocation.permanent) / 100;
      consumableAmount += (causeAmount * item.allocation.temporary_consumable) / 100;
      revolvingAmount += (causeAmount * item.allocation.temporary_revolving) / 100;
    });
  } else {
    // Advanced mode or Simple mode: use portfolio percentage or direct amounts
    portfolio.items.forEach(item => {
      const causeAmount = (typeof item.portfolioPercentage === 'number' && item.portfolioPercentage > 0)
        ? (totalAmount * item.portfolioPercentage) / 100
        : item.totalAmount;
      
      permanentAmount += (causeAmount * item.allocation.permanent) / 100;
      consumableAmount += (causeAmount * item.allocation.temporary_consumable) / 100;
      revolvingAmount += (causeAmount * item.allocation.temporary_revolving) / 100;
    });
  }
  
  const permanentPercentage = totalAmount > 0 ? (permanentAmount / totalAmount) * 100 : 0;
  const consumablePercentage = totalAmount > 0 ? (consumableAmount / totalAmount) * 100 : 0;
  const revolvingPercentage = totalAmount > 0 ? (revolvingAmount / totalAmount) * 100 : 0;
  
  const diversificationScore = calculateDiversificationScore(
    permanentPercentage,
    consumablePercentage,
    revolvingPercentage
  );
  
  const riskLevel = determineRiskLevel(
    permanentPercentage,
    consumablePercentage,
    revolvingPercentage
  );
  
  const liquidityLevel = determineLiquidityLevel(
    permanentPercentage,
    consumablePercentage,
    revolvingPercentage
  );
  
  return {
    totalAmount,
    causeCount: portfolio.items.length,
    permanentAmount,
    permanentPercentage,
    consumableAmount,
    consumablePercentage,
    revolvingAmount,
    revolvingPercentage,
    diversificationScore,
    riskLevel,
    liquidityLevel,
  };
}

/**
 * Calculate impact projection
 */
export function calculateImpactProjection(
  portfolio: Portfolio,
  averageBeneficiaryCostUSD: number = 100
): ImpactProjection {
  const stats = calculatePortfolioStats(portfolio);
  
  // Assumptions:
  // - Consumable deployed over 2 years on average
  // - Permanent returns 7% annually
  // - Revolving locked for 5 years, returns 5% annually
  
  const consumableDeploymentMonths = 24;
  const permanentAnnualReturn = 0.07;
  const revolvingAnnualReturn = 0.05;
  const revolvingLockYears = 5;
  
  // Year 1: Consumable starts deploying
  const year1Consumable = stats.consumableAmount * 0.5; // 50% deployed in year 1
  const year1Permanent = stats.permanentAmount * permanentAnnualReturn;
  const year1Revolving = stats.revolvingAmount * revolvingAnnualReturn;
  const year1Beneficiaries = Math.round((year1Consumable + year1Permanent + year1Revolving) / averageBeneficiaryCostUSD);
  
  // Year 5: Consumable fully deployed, permanent generating returns, revolving matures
  const year5Consumable = stats.consumableAmount; // Fully deployed
  const year5Permanent = stats.permanentAmount * permanentAnnualReturn * 5;
  const year5Revolving = stats.revolvingAmount * revolvingAnnualReturn * 5;
  const year5Beneficiaries = Math.round((year5Consumable + year5Permanent + year5Revolving) / averageBeneficiaryCostUSD);
  
  // Year 10: Only permanent generating returns
  const year10Permanent = stats.permanentAmount * permanentAnnualReturn * 10;
  const year10Beneficiaries = Math.round((stats.consumableAmount + year10Permanent + year5Revolving) / averageBeneficiaryCostUSD);
  
  // Lifetime: Permanent generates returns forever
  const annualBeneficiariesAfter10Years = Math.round((stats.permanentAmount * permanentAnnualReturn) / averageBeneficiaryCostUSD);
  
  // Rough lifetime estimate (100 years)
  const lifetimeBeneficiaries = year10Beneficiaries + (annualBeneficiariesAfter10Years * 90);
  
  const revolvingMaturityDate = new Date();
  revolvingMaturityDate.setFullYear(revolvingMaturityDate.getFullYear() + revolvingLockYears);
  
  return {
    year1Beneficiaries,
    year5Beneficiaries,
    year10Beneficiaries,
    lifetimeBeneficiaries,
    annualBeneficiariesAfter10Years,
    consumableDeploymentMonths,
    revolvingMaturityDate: revolvingMaturityDate.toISOString(),
    permanentAnnualReturn: permanentAnnualReturn * 100, // Convert to percentage
  };
}

/**
 * Validate portfolio
 */
export function validatePortfolio(portfolio: Portfolio): PortfolioValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if portfolio has items
  if (portfolio.items.length === 0) {
    errors.push('Portfolio must have at least one cause');
  }
  
  // Check if total amount is set
  if (portfolio.totalAmount <= 0) {
    errors.push('Total portfolio amount must be greater than 0');
  }
  
  // Validate each item's allocation
  portfolio.items.forEach((item, index) => {
    const total = item.allocation.permanent + item.allocation.temporary_consumable + item.allocation.temporary_revolving;
    
    if (Math.abs(total - 100) > 0.01) {
      errors.push(`Cause "${item.cause.name}" allocation must sum to 100% (currently ${total.toFixed(1)}%)`);
    }
    
    if (item.totalAmount < 0) {
      errors.push(`Cause "${item.cause.name}" amount cannot be negative`);
    }
  });
  
  // Warnings for portfolio composition
  const stats = calculatePortfolioStats(portfolio);
  
  if (stats.diversificationScore < 40) {
    warnings.push('Low diversification score. Consider spreading across multiple waqf types for better balance.');
  }
  
  if (portfolio.items.length === 1) {
    warnings.push('Single cause portfolio. Consider adding more causes for greater impact diversity.');
  }
  
  if (stats.permanentPercentage === 0 && stats.revolvingPercentage === 0) {
    warnings.push('100% consumable allocation means no long-term impact. Consider adding permanent or revolving waqf.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

