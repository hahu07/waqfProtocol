'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Button } from '@/components/ui/button';
import { listWaqfs, updateWaqf, getWaqf } from '@/lib/waqf-utils';
import { listDocs } from '@junobuild/core';
import type { WaqfProfile, ConsumableWaqfDetails, SpendingSchedule } from '@/types/waqfs';
import { getCompletionStatus, calculateUpdatedDistribution } from '@/lib/consumable-contribution-handler';
import { logger } from '@/lib/logger';

interface DistributionSummary {
  waqf: WaqfProfile;
  schedule: string;
  nextDistribution: Date | null;
  monthlyAmount: number;
  totalDistributed: number;
  currentBalance: number;
  progress: number;
  status: 'pending' | 'ready' | 'completed';
}

export default function DistributionsPage() {
  const { user } = useAuth();
  const { isAdmin, isLoading: adminCheckLoading } = useAdminCheck();
  const [distributions, setDistributions] = useState<DistributionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || adminCheckLoading) return;

    const fetchDistributions = async () => {
      try {
        setLoading(true);

        // Fetch all consumable waqfs
        const response = await listDocs({
          collection: 'waqfs',
          filter: {
            paginate: {
              startAfter: null,
              limit: 100
            }
          }
        });

        const allWaqfs = response.items.map(doc => ({
          id: doc.key,
          ...doc.data
        } as WaqfProfile));
        
        // Deduplicate waqfs by ID first
        const waqfs = allWaqfs.filter((waqf, index, self) => 
          index === self.findIndex(w => w.id === waqf.id)
        );
        
        logger.info('Deduplication', { 
          before: allWaqfs.length, 
          after: waqfs.length,
          removed: allWaqfs.length - waqfs.length
        });

        // Filter and process consumable waqfs (include both active and completed)
        const consumableWaqfs = waqfs.filter(w => {
          // Handle both snake_case and camelCase from backend
          const rawWaqf = w as WaqfProfile & { waqf_type?: string };
          const waqfType = rawWaqf.waqf_type || w.waqfType;
          const isConsumable = 
            waqfType === 'temporary_consumable' || 
            waqfType === 'TEMPORARY_CONSUMABLE' ||
            waqfType === 'TemporaryConsumable';
          
          const isActiveOrCompleted = w.status === 'active' || w.status === 'completed';
          
          logger.info('Checking waqf', { 
            id: w.id, 
            name: w.name, 
            waqfType: waqfType, 
            status: w.status,
            isConsumable,
            isActiveOrCompleted,
            matches: isConsumable && isActiveOrCompleted
          });
          
          return isConsumable && isActiveOrCompleted;
        });
        
        logger.info('Found consumable waqfs', { 
          total: waqfs.length, 
          consumable: consumableWaqfs.length,
          allWaqfs: waqfs.map(w => ({ 
            id: w.id, 
            name: w.name,
            type: w.waqfType, 
            status: w.status 
          })),
          ids: consumableWaqfs.map(w => w.id)
        });

        // Define types for backend data format (snake_case)
        type BackendFinancial = {
          total_donations?: number;
          totalDonations?: number;
          total_distributed?: number;
          totalDistributed?: number;
          current_balance?: number;
          currentBalance?: number;
          investment_returns?: number[];
          investmentReturns?: number[];
          total_investment_return?: number;
          totalInvestmentReturn?: number;
          growth_rate?: number;
          growthRate?: number;
          cause_allocations?: { [causeId: string]: number };
          causeAllocations?: { [causeId: string]: number };
          impact_metrics?: {
            beneficiariesSupported?: number;
            projectsCompleted?: number;
            completionRate?: number;
            lastDistributionDate?: string;
          };
          impactMetrics?: {
            beneficiariesSupported?: number;
            projectsCompleted?: number;
            completionRate?: number;
            lastDistributionDate?: string;
          };
        };

        type BackendConsumableDetails = {
          spending_schedule?: string;
          spendingSchedule?: string;
          start_date?: string;
          startDate?: string;
          end_date?: string;
          endDate?: string;
          target_amount?: number;
          targetAmount?: number;
          target_beneficiaries?: number;
          targetBeneficiaries?: number;
          minimum_monthly_distribution?: number;
          minimumMonthlyDistribution?: number;
          milestones?: Array<{
            description: string;
            targetDate: string;
            targetAmount: number;
          }>;
        };

        type BackendWaqfProfile = WaqfProfile & {
          financial: BackendFinancial;
          consumable_details?: BackendConsumableDetails;
          consumableDetails?: ConsumableWaqfDetails;
        };

        const summaries: DistributionSummary[] = consumableWaqfs.map((rawWaqf: WaqfProfile) => {
          // Transform waqf data from snake_case to camelCase for proper processing
          const backendWaqf = rawWaqf as BackendWaqfProfile;
          const waqf: WaqfProfile = {
            ...rawWaqf,
            financial: {
              totalDonations: backendWaqf.financial?.total_donations ?? backendWaqf.financial?.totalDonations ?? 0,
              totalDistributed: backendWaqf.financial?.total_distributed ?? backendWaqf.financial?.totalDistributed ?? 0,
              currentBalance: backendWaqf.financial?.current_balance ?? backendWaqf.financial?.currentBalance ?? 0,
              investmentReturns: backendWaqf.financial?.investment_returns || backendWaqf.financial?.investmentReturns || [],
              totalInvestmentReturn: backendWaqf.financial?.total_investment_return ?? backendWaqf.financial?.totalInvestmentReturn ?? 0,
              growthRate: backendWaqf.financial?.growth_rate ?? backendWaqf.financial?.growthRate ?? 0,
              causeAllocations: backendWaqf.financial?.cause_allocations || backendWaqf.financial?.causeAllocations || {},
              impactMetrics: backendWaqf.financial?.impact_metrics || backendWaqf.financial?.impactMetrics
            },
            consumableDetails: (() => {
              const details = backendWaqf.consumable_details || backendWaqf.consumableDetails;
              if (!details) return undefined;
              return {
                spendingSchedule: (details.spending_schedule || details.spendingSchedule) as SpendingSchedule,
                startDate: details.start_date || details.startDate,
                endDate: details.end_date || details.endDate,
                targetAmount: details.target_amount ?? details.targetAmount,
                targetBeneficiaries: details.target_beneficiaries ?? details.targetBeneficiaries,
                minimumMonthlyDistribution: details.minimum_monthly_distribution ?? details.minimumMonthlyDistribution,
                milestones: details.milestones
              };
            })()
          };
          
          const completionStatus = getCompletionStatus(waqf);
          const monthlyAmount = waqf.consumableDetails?.minimumMonthlyDistribution || 0;
          
          // Calculate next distribution date (assuming monthly)
          const impactMetrics = waqf.financial?.impactMetrics;
          const lastDistDate = impactMetrics?.lastDistributionDate;
          const startDate = waqf.consumableDetails?.startDate;
          
          const lastDistribution = lastDistDate
            ? new Date(lastDistDate)
            : new Date(startDate || waqf.createdAt);
          
          const nextDistribution = new Date(lastDistribution);
          nextDistribution.setMonth(nextDistribution.getMonth() + 1);
          
          // Determine status
          let status: 'pending' | 'ready' | 'completed';
          if (completionStatus.isCompleted) {
            status = 'completed';
          } else if (new Date() >= nextDistribution) {
            status = 'ready';
          } else {
            status = 'pending';
          }

          return {
            waqf,
            schedule: waqf.consumableDetails?.spendingSchedule || 'unknown',
            nextDistribution: status !== 'completed' ? nextDistribution : null,
            monthlyAmount,
            totalDistributed: waqf.financial?.totalDistributed || 0,
            currentBalance: waqf.financial?.currentBalance || 0,
            progress: completionStatus.progress,
            status
          };
        });
        
        // Remove duplicates by waqf ID
        const uniqueSummaries = summaries.filter((summary, index, self) => 
          index === self.findIndex(s => s.waqf.id === summary.waqf.id)
        );

        // Sort: ready first, then by next distribution date
        uniqueSummaries.sort((a, b) => {
          if (a.status === 'ready' && b.status !== 'ready') return -1;
          if (a.status !== 'ready' && b.status === 'ready') return 1;
          if (a.nextDistribution && b.nextDistribution) {
            return a.nextDistribution.getTime() - b.nextDistribution.getTime();
          }
          return 0;
        });

        setDistributions(uniqueSummaries);
        logger.info('Fetched distributions', { count: uniqueSummaries.length });
      } catch (error) {
        logger.error('Error fetching distributions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDistributions();
  }, [isAdmin, adminCheckLoading]);

  const executeDistribution = async (summary: DistributionSummary) => {
    if (executing) return;
    
    const { waqf: summaryWaqf, monthlyAmount } = summary;
    
    const confirmed = confirm(
      `Execute distribution for "${summaryWaqf.name}"?\n\n` +
      `Amount: $${monthlyAmount.toLocaleString()}\n` +
      `Current Balance: $${summary.currentBalance.toLocaleString()}\n\n` +
      `This will record the distribution and update the waqf balance.`
    );

    if (!confirmed) return;

    try {
      setExecuting(summaryWaqf.id);
      
      // Fetch fresh waqf data from backend to ensure we have all financial fields
      const waqf = await getWaqf(summaryWaqf.id);
      if (!waqf) {
        alert('❌ Could not fetch waqf data');
        return;
      }

      // Calculate distribution amount (use minimum monthly or proportional amount)
      const distributionAmount = Math.min(monthlyAmount, summary.currentBalance);

      if (distributionAmount <= 0) {
        alert('No funds available to distribute');
        return;
      }

      // Update financial metrics - preserve existing data and only update changed fields
      // Backend validates: current_balance = total_donations - total_distributed + total_investment_return
      const newTotalDistributed = (waqf.financial.totalDistributed || 0) + distributionAmount;
      const totalDonations = waqf.financial.totalDonations || 0;
      const totalInvestmentReturn = waqf.financial.totalInvestmentReturn || 0;
      
      // Calculate balance according to backend formula
      const calculatedBalance = totalDonations - newTotalDistributed + totalInvestmentReturn;
      
      // Preserve ALL existing financial data and only update specific fields
      const updatedFinancial = {
        ...waqf.financial,  // Keep all existing fields including totalDonations!
        totalDistributed: newTotalDistributed,
        currentBalance: Math.max(0, calculatedBalance),
        impactMetrics: {
          ...waqf.financial.impactMetrics,
          projectsCompleted: (waqf.financial.impactMetrics?.projectsCompleted || 0) + 1,
          lastDistributionDate: new Date().toISOString()
        }
      };

      // Check if waqf should be completed
      const completionStatus = getCompletionStatus({
        ...waqf,
        financial: updatedFinancial
      });

      const updateData: Partial<WaqfProfile> = {
        financial: updatedFinancial,
        status: completionStatus.isCompleted ? 'completed' : 'active'
      };

      await updateWaqf(waqf.id, updateData, user?.key, user?.key);

      logger.info('Distribution executed', {
        waqfId: waqf.id,
        amount: distributionAmount,
        isCompleted: completionStatus.isCompleted
      });

      alert(
        `✅ Distribution executed successfully!\n\n` +
        `Amount: $${distributionAmount.toLocaleString()}\n` +
        `New Balance: $${updatedFinancial.currentBalance.toLocaleString()}\n` +
        (completionStatus.isCompleted ? `\n🎉 Waqf has been marked as completed!` : '')
      );

      // Refresh distributions
      window.location.reload();
    } catch (error) {
      logger.error('Error executing distribution', error);
      alert('❌ Failed to execute distribution. Please try again.');
    } finally {
      setExecuting(null);
    }
  };

  if (adminCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have admin permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Distributions Management</h1>
              <p className="text-gray-600 mt-1">Execute and track consumable waqf distributions</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center gap-2"
            >
              🔄 Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-600 rounded-xl shadow-lg p-6 text-white border-2 border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100 mb-2">Total Distributions</p>
                <p className="text-4xl font-bold">{distributions.length}</p>
              </div>
              <div className="text-5xl opacity-80">📊</div>
            </div>
          </div>

          <div className="bg-green-600 rounded-xl shadow-lg p-6 text-white border-2 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100 mb-2">Ready to Execute</p>
                <p className="text-4xl font-bold">
                  {distributions.filter(d => d.status === 'ready').length}
                </p>
              </div>
              <div className="text-5xl opacity-80">✅</div>
            </div>
          </div>

          <div className="bg-yellow-600 rounded-xl shadow-lg p-6 text-white border-2 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-100 mb-2">Pending</p>
                <p className="text-4xl font-bold">
                  {distributions.filter(d => d.status === 'pending').length}
                </p>
              </div>
              <div className="text-5xl opacity-80">⏳</div>
            </div>
          </div>

          <div className="bg-purple-600 rounded-xl shadow-lg p-6 text-white border-2 border-purple-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100 mb-2">Completed</p>
                <p className="text-4xl font-bold">
                  {distributions.filter(d => d.status === 'completed').length}
                </p>
              </div>
              <div className="text-5xl opacity-80">🎉</div>
            </div>
          </div>
        </div>

        {/* Distributions Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Active Distributions</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading distributions...</p>
            </div>
          ) : distributions.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl mb-4 block">📭</span>
              <p className="text-gray-600 text-lg">No active consumable waqfs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Waqf</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Monthly Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Next Distribution</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {distributions.filter((dist, index, self) => 
                    index === self.findIndex(d => d.waqf.id === dist.waqf.id)
                  ).map((dist, index) => (
                    <tr key={`${dist.waqf.id}-${index}`} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {dist.waqf.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{dist.waqf.name}</p>
                            <p className="text-xs text-gray-500">👤 {dist.waqf.donor.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                          {dist.schedule.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-green-700">
                          ${dist.monthlyAmount.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">per month</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-base font-semibold text-gray-900">
                          ${dist.currentBalance.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">available</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, dist.progress)}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">{dist.progress.toFixed(1)}%</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {dist.nextDistribution 
                          ? dist.nextDistribution.toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            dist.status === 'ready'
                              ? 'bg-green-100 text-green-800'
                              : dist.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {dist.status === 'ready' ? '✅ Ready' : 
                           dist.status === 'pending' ? '⏳ Pending' : '🎉 Completed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => executeDistribution(dist)}
                          disabled={dist.status !== 'ready' || executing === dist.waqf.id}
                          size="sm"
                          className={dist.status === 'ready' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          {executing === dist.waqf.id ? '⏳ Processing...' : '💸 Execute'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
