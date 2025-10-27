// src/lib/impact-utils.ts
/**
 * Utilities for calculating and updating waqf impact metrics in real-time
 */

import type { WaqfProfile } from '@/types/waqfs';
import { updateWaqf } from './waqf-utils';

/**
 * Calculate impact metrics based on waqf financial data
 */
export function calculateImpactMetrics(waqf: WaqfProfile) {
  const totalDistributed = waqf.financial?.totalDistributed || 0;
  const totalDonations = waqf.financial?.totalDonations || 0;
  const causesCount = waqf.selectedCauses?.length || 0;
  
  // Estimate beneficiaries based on distribution and causes
  // Average impact: $100 helps 1 beneficiary (adjust based on your model)
  const estimatedBeneficiaries = Math.floor(totalDistributed / 100);
  
  // Estimate projects: 1 project per $1000 distributed per cause
  const estimatedProjects = Math.floor(totalDistributed / (1000 * Math.max(causesCount, 1)));
  
  // Calculate completion rate based on distribution vs donations
  const completionRate = totalDonations > 0 
    ? Math.min(totalDistributed / totalDonations, 1) 
    : 0;
  
  return {
    beneficiariesSupported: estimatedBeneficiaries,
    projectsCompleted: Math.max(estimatedProjects, 0),
    completionRate: completionRate
  };
}

/**
 * Update waqf with calculated impact metrics
 */
export async function updateWaqfImpactMetrics(
  waqfId: string,
  waqf: WaqfProfile,
  userId?: string,
  userName?: string
) {
  const impactMetrics = calculateImpactMetrics(waqf);
  
  const updatedWaqf: Partial<WaqfProfile> = {
    financial: {
      ...waqf.financial,
      impactMetrics
    }
  };
  
  await updateWaqf(waqfId, updatedWaqf, userId, userName);
  
  return impactMetrics;
}

/**
 * Generate timeline events from waqf history
 */
export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  value?: number;
}

export function generateWaqfTimeline(waqfs: WaqfProfile[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  
  // Sort waqfs by creation date
  const sortedWaqfs = [...waqfs].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  // Add waqf creation events
  sortedWaqfs.forEach((waqf, index) => {
    const createdDate = new Date(waqf.createdAt);
    const formattedDate = formatTimelineDate(createdDate);
    
    events.push({
      date: formattedDate,
      title: `${waqf.name} Created`,
      description: `Established ${waqf.name} with initial asset of $${waqf.waqfAsset.toLocaleString()}`,
      icon: '🌱',
      color: 'green',
      value: waqf.waqfAsset
    });
  });
  
  // Add major milestone events based on impact metrics
  const totalBeneficiaries = waqfs.reduce((sum, w) => 
    sum + (w.financial?.impactMetrics?.beneficiariesSupported || 0), 0);
  const totalProjects = waqfs.reduce((sum, w) => 
    sum + (w.financial?.impactMetrics?.projectsCompleted || 0), 0);
  const totalDistributed = waqfs.reduce((sum, w) => 
    sum + (w.financial?.totalDistributed || 0), 0);
  
  if (totalBeneficiaries > 0) {
    const latestWaqf = sortedWaqfs[sortedWaqfs.length - 1];
    const milestoneDate = latestWaqf?.updatedAt || latestWaqf?.createdAt;
    
    events.push({
      date: formatTimelineDate(new Date(milestoneDate)),
      title: 'Impact Milestone',
      description: `Reached ${totalBeneficiaries.toLocaleString()} beneficiaries across all waqfs`,
      icon: '🎉',
      color: 'blue',
      value: totalBeneficiaries
    });
  }
  
  if (totalProjects > 0) {
    const latestWaqf = sortedWaqfs[sortedWaqfs.length - 1];
    const milestoneDate = latestWaqf?.updatedAt || latestWaqf?.createdAt;
    
    events.push({
      date: formatTimelineDate(new Date(milestoneDate)),
      title: 'Projects Completed',
      description: `Successfully delivered ${totalProjects} community projects`,
      icon: '✅',
      color: 'purple',
      value: totalProjects
    });
  }
  
  if (totalDistributed > 0) {
    events.push({
      date: formatTimelineDate(new Date()),
      title: 'Distribution Milestone',
      description: `Distributed $${totalDistributed.toLocaleString()} to causes`,
      icon: '💰',
      color: 'orange',
      value: totalDistributed
    });
  }
  
  // Sort by date (newest first)
  return events.sort((a, b) => {
    const dateA = parseTimelineDate(a.date);
    const dateB = parseTimelineDate(b.date);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Format date for timeline display (e.g., "2024-Q4", "Dec 2024")
 */
function formatTimelineDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  
  // Use quarter format for better readability
  return `${year}-Q${quarter}`;
}

/**
 * Parse timeline date string back to Date object
 */
function parseTimelineDate(dateStr: string): Date {
  // Handle quarter format: "2024-Q4"
  const quarterMatch = dateStr.match(/(\d{4})-Q(\d)/);
  if (quarterMatch) {
    const year = parseInt(quarterMatch[1]);
    const quarter = parseInt(quarterMatch[2]);
    const month = (quarter - 1) * 3; // First month of the quarter
    return new Date(year, month, 1);
  }
  
  // Fallback to standard date parsing
  return new Date(dateStr);
}

/**
 * Calculate aggregate impact across multiple waqfs
 */
export function calculateAggregateImpact(waqfs: WaqfProfile[]) {
  const totalBeneficiaries = waqfs.reduce((sum, w) => 
    sum + (w.financial?.impactMetrics?.beneficiariesSupported || 0), 0);
  const totalProjects = waqfs.reduce((sum, w) => 
    sum + (w.financial?.impactMetrics?.projectsCompleted || 0), 0);
  const totalCauses = new Set(waqfs.flatMap(w => w.selectedCauses || [])).size;
  const avgCompletionRate = waqfs.reduce((sum, w) => 
    sum + ((w.financial?.impactMetrics?.completionRate || 0) * 100), 0) / Math.max(waqfs.length, 1);
  
  return {
    totalBeneficiaries,
    totalProjects,
    totalCauses,
    avgCompletionRate,
    waqfCount: waqfs.length
  };
}

/**
 * Generate impact summary text
 */
export function generateImpactSummary(waqfs: WaqfProfile[]): string {
  const impact = calculateAggregateImpact(waqfs);
  
  if (impact.totalBeneficiaries === 0 && impact.totalProjects === 0) {
    return `Your ${impact.waqfCount} waqf${impact.waqfCount > 1 ? 's are' : ' is'} ready to make an impact. Start distributing funds to see your real-world effect.`;
  }
  
  const parts: string[] = [];
  
  if (impact.totalBeneficiaries > 0) {
    parts.push(`${impact.totalBeneficiaries.toLocaleString()} lives touched`);
  }
  
  if (impact.totalProjects > 0) {
    parts.push(`${impact.totalProjects} projects completed`);
  }
  
  if (impact.totalCauses > 0) {
    parts.push(`${impact.totalCauses} causes supported`);
  }
  
  return `Your ${impact.waqfCount} waqf${impact.waqfCount > 1 ? 's have' : ' has'} achieved: ${parts.join(', ')}.`;
}

/**
 * Hook for auto-updating impact metrics when waqf changes
 */
export function shouldUpdateImpactMetrics(waqf: WaqfProfile): boolean {
  // Update if:
  // 1. No impact metrics exist
  // 2. Financial data has changed since last update
  // 3. Distribution has increased
  
  if (!waqf.financial?.impactMetrics) {
    return true;
  }
  
  const calculated = calculateImpactMetrics(waqf);
  const existing = waqf.financial.impactMetrics;
  
  // Check if calculated values differ significantly (>5%)
  const beneficiariesDiff = Math.abs(
    calculated.beneficiariesSupported - existing.beneficiariesSupported
  );
  const projectsDiff = Math.abs(
    calculated.projectsCompleted - (existing.projectsCompleted || 0)
  );
  
  return beneficiariesDiff > existing.beneficiariesSupported * 0.05 || 
         projectsDiff > 0; // Any project count change is significant
}
