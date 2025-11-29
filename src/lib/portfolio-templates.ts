// Portfolio Templates

import type { PortfolioTemplate } from '@/types/portfolio';

/**
 * Pre-built portfolio templates for quick start
 */
export const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  {
    id: 'balanced-impact',
    name: 'Balanced Impact Portfolio',
    description: 'A diversified approach combining long-term stability, immediate impact, and flexible capital. Perfect for donors seeking a well-rounded charitable strategy.',
    icon: '⚖️',
    allocationMode: 'balanced',
    globalAllocation: {
      permanent: 40,
      temporary_consumable: 30,
      temporary_revolving: 30,
    },
    riskLevel: 'medium',
    diversificationScore: 85,
    liquidityLevel: 'medium',
    tags: ['diversified', 'balanced', 'recommended', 'beginner-friendly'],
  },
  {
    id: 'emergency-response',
    name: 'Emergency Response Portfolio',
    description: 'Rapid deployment for urgent humanitarian needs. 100% consumable waqf for immediate, direct impact where it\'s needed most.',
    icon: '🚨',
    allocationMode: 'simple',
    globalAllocation: {
      permanent: 0,
      temporary_consumable: 100,
      temporary_revolving: 0,
    },
    riskLevel: 'low',
    diversificationScore: 40,
    liquidityLevel: 'high',
    tags: ['urgent', 'immediate-impact', 'humanitarian', 'crisis-response'],
  },
  {
    id: 'legacy-endowment',
    name: 'Legacy Endowment Portfolio',
    description: 'Build a lasting charitable legacy that benefits future generations. Primarily permanent waqf with a small liquidity reserve for flexibility.',
    icon: '🏛️',
    allocationMode: 'balanced',
    globalAllocation: {
      permanent: 80,
      temporary_consumable: 0,
      temporary_revolving: 20,
    },
    riskLevel: 'low',
    diversificationScore: 60,
    liquidityLevel: 'low',
    tags: ['long-term', 'legacy', 'perpetual', 'estate-planning'],
  },
  {
    id: 'flexible-growth',
    name: 'Flexible Growth Portfolio',
    description: 'Maximize flexibility while supporting charity. Heavy revolving allocation lets you support causes without permanently parting with capital.',
    icon: '🌱',
    allocationMode: 'balanced',
    globalAllocation: {
      permanent: 30,
      temporary_consumable: 20,
      temporary_revolving: 50,
    },
    riskLevel: 'medium',
    diversificationScore: 75,
    liquidityLevel: 'high',
    tags: ['flexible', 'capital-preservation', 'growth', 'strategic'],
  },
  {
    id: 'education-focused',
    name: 'Education Champion Portfolio',
    description: 'Dedicated to transforming lives through education. Balanced allocation optimized for long-term scholarship programs and immediate student aid.',
    icon: '🎓',
    allocationMode: 'balanced',
    globalAllocation: {
      permanent: 60,
      temporary_consumable: 25,
      temporary_revolving: 15,
    },
    riskLevel: 'low',
    diversificationScore: 50,
    liquidityLevel: 'low',
    tags: ['education', 'scholarships', 'youth', 'knowledge'],
  },
  {
    id: 'healthcare-hero',
    name: 'Healthcare Hero Portfolio',
    description: 'Support medical care and health infrastructure. Mix of permanent endowment for hospitals and consumable for emergency medical aid.',
    icon: '🏥',
    allocationMode: 'balanced',
    globalAllocation: {
      permanent: 50,
      temporary_consumable: 40,
      temporary_revolving: 10,
    },
    riskLevel: 'medium',
    diversificationScore: 55,
    liquidityLevel: 'medium',
    tags: ['healthcare', 'medical', 'hospitals', 'emergency-care'],
  },
  {
    id: 'ramadan-special',
    name: 'Ramadan Blessing Portfolio',
    description: 'Seasonal giving optimized for Ramadan. Higher consumable allocation for immediate Iftar programs, Zakat distribution, and Eid support.',
    icon: '🌙',
    allocationMode: 'balanced',
    globalAllocation: {
      permanent: 20,
      temporary_consumable: 60,
      temporary_revolving: 20,
    },
    riskLevel: 'low',
    diversificationScore: 65,
    liquidityLevel: 'high',
    tags: ['ramadan', 'seasonal', 'zakat', 'iftar', 'eid'],
  },
  {
    id: 'orphan-care',
    name: 'Orphan Care Portfolio',
    description: 'Comprehensive support for orphans and vulnerable children. Long-term education endowment plus immediate needs funding.',
    icon: '👶',
    allocationMode: 'balanced',
    globalAllocation: {
      permanent: 55,
      temporary_consumable: 35,
      temporary_revolving: 10,
    },
    riskLevel: 'low',
    diversificationScore: 60,
    liquidityLevel: 'low',
    tags: ['orphans', 'children', 'vulnerable', 'long-term-care'],
  },
  {
    id: 'water-for-life',
    name: 'Water for Life Portfolio',
    description: 'Clean water access for communities in need. Permanent waqf for well maintenance, revolving for infrastructure expansion.',
    icon: '💧',
    allocationMode: 'balanced',
    globalAllocation: {
      permanent: 45,
      temporary_consumable: 15,
      temporary_revolving: 40,
    },
    riskLevel: 'low',
    diversificationScore: 70,
    liquidityLevel: 'medium',
    tags: ['water', 'infrastructure', 'sustainable', 'community'],
  },
  {
    id: 'entrepreneur-builder',
    name: 'Entrepreneur Builder Portfolio',
    description: 'Economic empowerment through microfinance and business training. Heavy revolving allocation creates a sustainable lending pool.',
    icon: '💼',
    allocationMode: 'balanced',
    globalAllocation: {
      permanent: 25,
      temporary_consumable: 15,
      temporary_revolving: 60,
    },
    riskLevel: 'medium',
    diversificationScore: 70,
    liquidityLevel: 'high',
    tags: ['microfinance', 'entrepreneurship', 'economic-empowerment', 'sustainable'],
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): PortfolioTemplate | undefined {
  return PORTFOLIO_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by tag
 */
export function getTemplatesByTag(tag: string): PortfolioTemplate[] {
  return PORTFOLIO_TEMPLATES.filter(t => t.tags.includes(tag));
}

/**
 * Get recommended templates for first-time donors
 */
export function getRecommendedTemplates(): PortfolioTemplate[] {
  return PORTFOLIO_TEMPLATES.filter(t => t.tags.includes('recommended') || t.tags.includes('beginner-friendly'));
}

/**
 * Get templates by risk level
 */
export function getTemplatesByRisk(riskLevel: 'low' | 'medium' | 'high'): PortfolioTemplate[] {
  return PORTFOLIO_TEMPLATES.filter(t => t.riskLevel === riskLevel);
}

/**
 * Get templates by liquidity level
 */
export function getTemplatesByLiquidity(liquidityLevel: 'low' | 'medium' | 'high'): PortfolioTemplate[] {
  return PORTFOLIO_TEMPLATES.filter(t => t.liquidityLevel === liquidityLevel);
}

/**
 * Calculate diversification score based on allocation
 */
export function calculateDiversificationScore(
  permanent: number,
  consumable: number,
  revolving: number
): number {
  // Perfect diversification (33/33/33) = 100
  // Single type (100/0/0) = 0
  
  const ideal = 33.33;
  const deviation = Math.abs(permanent - ideal) + Math.abs(consumable - ideal) + Math.abs(revolving - ideal);
  const maxDeviation = 200; // Maximum possible deviation (100-33.33)*3
  
  return Math.round(100 - (deviation / maxDeviation) * 100);
}

/**
 * Determine risk level based on allocation
 */
export function determineRiskLevel(
  permanent: number,
  consumable: number,
  revolving: number
): 'low' | 'medium' | 'high' {
  // High permanent = low risk (stable, predictable)
  // High consumable = low risk (direct, immediate)
  // High revolving = medium risk (depends on returns)
  
  if (permanent >= 60 || consumable >= 60) {
    return 'low';
  } else if (revolving >= 60) {
    return 'medium';
  } else {
    return 'medium'; // Balanced portfolios are medium risk
  }
}

/**
 * Determine liquidity level based on allocation
 */
export function determineLiquidityLevel(
  permanent: number,
  consumable: number,
  revolving: number
): 'low' | 'medium' | 'high' {
  // High permanent = low liquidity (locked forever)
  // High consumable = high liquidity (spent quickly)
  // High revolving = high liquidity (returned after lock period)
  
  const liquidAssets = consumable + revolving;
  
  if (liquidAssets >= 70) {
    return 'high';
  } else if (liquidAssets >= 40) {
    return 'medium';
  } else {
    return 'low';
  }
}

