/**
 * Portfolio validation utilities
 * Ensures waqf types match their portfolio types
 */

import type { WaqfProfile, Portfolio, ConsumablePortfolio, ReturnsPortfolio } from '@/types/waqfs';
import { WaqfType } from '@/types/waqfs';
import { normalizeWaqfType } from './waqf-type-utils';

/**
 * Validate that a waqf's portfolio membership matches its type
 */
export function validatePortfolioMembership(waqf: WaqfProfile): {
  valid: boolean;
  error?: string;
} {
  const waqfType = normalizeWaqfType(waqf.waqfType);
  
  // Check consumable waqf
  if (waqf.consumableDetails?.portfolioMembership) {
    if (waqfType !== 'temporary_consumable') {
      return {
        valid: false,
        error: 'Only temporary consumable waqfs can have consumable portfolio membership'
      };
    }
    
    if (waqf.consumableDetails.portfolioMembership.portfolioType !== 'consumable') {
      return {
        valid: false,
        error: 'Consumable waqf must join a consumable portfolio'
      };
    }
  }
  
  // Check revolving waqf
  if (waqf.revolvingDetails?.portfolioMembership) {
    if (waqfType !== 'temporary_revolving') {
      return {
        valid: false,
        error: 'Only temporary revolving waqfs can have returns portfolio membership via revolvingDetails'
      };
    }
    
    if (waqf.revolvingDetails.portfolioMembership.portfolioType !== 'returns') {
      return {
        valid: false,
        error: 'Revolving waqf must join a returns portfolio'
      };
    }
  }
  
  // Check permanent waqf
  if (waqf.investmentStrategy?.portfolioMembership) {
    if (waqfType !== 'permanent') {
      return {
        valid: false,
        error: 'Only permanent waqfs can have returns portfolio membership via investmentStrategy'
      };
    }
    
    if (waqf.investmentStrategy.portfolioMembership.portfolioType !== 'returns') {
      return {
        valid: false,
        error: 'Permanent waqf must join a returns portfolio'
      };
    }
  }
  
  return { valid: true };
}

/**
 * Validate that a portfolio only contains compatible waqf types
 */
export function validatePortfolioWaqfs(
  portfolio: Portfolio,
  waqfs: WaqfProfile[]
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  for (const waqfId of portfolio.participatingWaqfs) {
    const waqf = waqfs.find(w => w.id === waqfId);
    
    if (!waqf) {
      errors.push(`Waqf ${waqfId} not found`);
      continue;
    }
    
    const waqfType = normalizeWaqfType(waqf.waqfType);
    
    if (portfolio.portfolioType === 'consumable') {
      // Consumable portfolios only accept temporary_consumable waqfs
      if (waqfType !== 'temporary_consumable') {
        errors.push(
          `Waqf "${waqf.name}" (${waqfType}) cannot join consumable portfolio. Only temporary consumable waqfs allowed.`
        );
      }
      
      // Check that waqf has consumable details with matching portfolio membership
      if (!waqf.consumableDetails?.portfolioMembership) {
        errors.push(`Waqf "${waqf.name}" lacks portfolio membership configuration`);
      } else if (waqf.consumableDetails.portfolioMembership.portfolioId !== portfolio.id) {
        errors.push(`Waqf "${waqf.name}" portfolio membership points to different portfolio`);
      }
    } else {
      // Returns portfolios accept permanent or temporary_revolving
      if (waqfType !== 'permanent' && waqfType !== 'temporary_revolving') {
        errors.push(
          `Waqf "${waqf.name}" (${waqfType}) cannot join returns portfolio. Only permanent or temporary revolving waqfs allowed.`
        );
      }
      
      // Check appropriate portfolio membership
      if (waqfType === 'permanent') {
        if (!waqf.investmentStrategy?.portfolioMembership) {
          errors.push(`Permanent waqf "${waqf.name}" lacks portfolio membership in investment strategy`);
        } else if (waqf.investmentStrategy.portfolioMembership.portfolioId !== portfolio.id) {
          errors.push(`Permanent waqf "${waqf.name}" portfolio membership points to different portfolio`);
        }
      } else if (waqfType === 'temporary_revolving') {
        if (!waqf.revolvingDetails?.portfolioMembership) {
          errors.push(`Revolving waqf "${waqf.name}" lacks portfolio membership in revolving details`);
        } else if (waqf.revolvingDetails.portfolioMembership.portfolioId !== portfolio.id) {
          errors.push(`Revolving waqf "${waqf.name}" portfolio membership points to different portfolio`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a waqf type is compatible with a portfolio type
 */
export function isWaqfCompatibleWithPortfolio(
  waqfType: WaqfType | string,
  portfolioType: 'consumable' | 'returns'
): boolean {
  const normalized = normalizeWaqfType(waqfType);
  
  if (portfolioType === 'consumable') {
    return normalized === 'temporary_consumable';
  } else {
    return normalized === 'permanent' || normalized === 'temporary_revolving';
  }
}

/**
 * Get portfolio membership from a waqf based on its type
 */
export function getPortfolioMembership(waqf: WaqfProfile) {
  const waqfType = normalizeWaqfType(waqf.waqfType);
  
  switch (waqfType) {
    case 'temporary_consumable':
      return waqf.consumableDetails?.portfolioMembership;
    case 'temporary_revolving':
      return waqf.revolvingDetails?.portfolioMembership;
    case 'permanent':
      return waqf.investmentStrategy?.portfolioMembership;
    default:
      return undefined;
  }
}

/**
 * Get portfolio ID from a waqf if it's a member
 */
export function getPortfolioId(waqf: WaqfProfile): string | undefined {
  return getPortfolioMembership(waqf)?.portfolioId;
}

/**
 * Check if a waqf is a member of any portfolio
 */
export function isPortfolioMember(waqf: WaqfProfile): boolean {
  return !!getPortfolioId(waqf);
}

/**
 * Type guard for ConsumablePortfolio
 */
export function isConsumablePortfolio(portfolio: Portfolio): portfolio is ConsumablePortfolio {
  return portfolio.portfolioType === 'consumable';
}

/**
 * Type guard for ReturnsPortfolio
 */
export function isReturnsPortfolio(portfolio: Portfolio): portfolio is ReturnsPortfolio {
  return portfolio.portfolioType === 'returns';
}
