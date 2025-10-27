import type { WaqfProfile } from "@/types/waqfs";
import { WaqfType } from "@/types/waqfs";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { BarChart } from "@/components/ui/charts";
import { TransactionHistory } from "./TransactionHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { CauseCard } from "@/components/waqf/CauseCard";
import { TableHeader } from "@/components/waqf/tableHeader";

export function WaqfCard({ profile, isLoading, isLoadingCauses }: { profile: WaqfProfile, isLoading: boolean, isLoadingCauses: boolean }) {
  const donorName = profile.donor?.name ?? 'Anonymous';
  const status = profile.status ?? 'Unknown';
  const balance = profile.financial?.currentBalance ?? 0;
  const totalDonations = profile.financial?.totalDonations ?? 0;
  const totalDistributed = profile.financial?.totalDistributed ?? 0;
  
  // Prepare data for charts
  const financialData = [
    { name: 'Balance', value: balance },
    { name: 'Donations', value: totalDonations },
    { name: 'Distributed', value: totalDistributed }
  ];
  
  const causeAllocationData = Object.entries(profile.causeAllocation || {}).map(([causeId, amount]) => {
    const cause = profile.supportedCauses?.find(c => c.id === causeId);
    return {
      id: causeId,
      name: cause?.name || 'Unknown Cause',
      value: amount,
      percentage: totalDistributed > 0 ? (amount / totalDistributed) * 100 : 0,
      description: cause?.description || '',
      icon: cause?.icon || '❤️'
    };
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Summary */}
      <TableHeader 
        onShowCauses={() => {/* handle cause browsing */}}
        isLoading={isLoadingCauses}
        subtitle={`${profile.donor?.name}'s Waqf Portfolio`}
      />
      <div className="rounded-lg border p-4 sm:p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg sm:text-xl font-semibold dark:text-white">
          {donorName}'s Waqf
        </h2>
        
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
          <div>
            <p className="font-medium dark:text-gray-300">Waqf Type</p>
            <div className="flex items-center flex-wrap gap-2">
              {profile.isHybrid ? (
                <span className="text-xs bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 text-gray-800 dark:from-green-900/30 dark:via-blue-900/30 dark:to-purple-900/30 dark:text-gray-200 px-3 py-1 rounded-full font-semibold">
                  🎯 Hybrid
                </span>
              ) : (
                <>
                  {profile.waqfType === WaqfType.PERMANENT && (
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 px-3 py-1 rounded-full font-semibold">
                      🏛️ Permanent
                    </span>
                  )}
                  {profile.waqfType === WaqfType.TEMPORARY_CONSUMABLE && (
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 px-3 py-1 rounded-full font-semibold">
                      ⚡ Consumable
                    </span>
                  )}
                  {profile.waqfType === WaqfType.TEMPORARY_REVOLVING && (
                    <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 px-3 py-1 rounded-full font-semibold">
                      🔄 Revolving
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div>
            <p className="font-medium dark:text-gray-300">Status</p>
            <p className="dark:text-gray-400">{status}</p>
          </div>
          
          <div>
            <p className="font-medium dark:text-gray-300">Balance</p>
            <p className="dark:text-gray-400">{formatCurrency(balance)}</p>
          </div>
          
          {profile.createdAt && (
            <div className="col-span-1 sm:col-span-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Created: {formatDate(profile.createdAt)}
              </p>
            </div>
          )}
        </div>
        
        {/* Consumable Waqf Details */}
        {profile.waqfType === WaqfType.TEMPORARY_CONSUMABLE && profile.consumableDetails && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center space-x-2">
              <span>⚡</span>
              <span>Consumable Waqf Configuration</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400">Start Date</p>
                <p className="text-blue-600 dark:text-blue-300">{formatDate(profile.consumableDetails.startDate)}</p>
              </div>
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400">End Date</p>
                <p className="text-blue-600 dark:text-blue-300">{formatDate(profile.consumableDetails.endDate)}</p>
              </div>
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400">Spending Schedule</p>
                <p className="text-blue-600 dark:text-blue-300 capitalize">
                  {profile.consumableDetails.spendingSchedule.replace(/-/g, ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Revolving Waqf Details */}
        {profile.waqfType === WaqfType.TEMPORARY_REVOLVING && profile.revolvingDetails && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center space-x-2">
              <span>🔄</span>
              <span>Revolving Waqf Configuration</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="font-medium text-purple-700 dark:text-purple-400">Lock Period</p>
                <p className="text-purple-600 dark:text-purple-300">{profile.revolvingDetails.lockPeriodMonths} months</p>
              </div>
              <div>
                <p className="font-medium text-purple-700 dark:text-purple-400">Maturity Date</p>
                <p className="text-purple-600 dark:text-purple-300">{formatDate(profile.revolvingDetails.maturityDate)}</p>
              </div>
              <div>
                <p className="font-medium text-purple-700 dark:text-purple-400">Return Method</p>
                <p className="text-purple-600 dark:text-purple-300 capitalize">
                  {profile.revolvingDetails.principalReturnMethod.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Hybrid Allocation Display */}
        {profile.isHybrid && profile.hybridAllocations && profile.hybridAllocations.length > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-900/10 dark:via-blue-900/10 dark:to-purple-900/10 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center space-x-2">
              <span>🎯</span>
              <span>Hybrid Allocation Breakdown</span>
            </h4>
            <div className="space-y-2">
              {profile.hybridAllocations.map((allocation) => {
                const cause = profile.supportedCauses?.find(c => c.id === allocation.causeId);
                return (
                  <div key={allocation.causeId} className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {cause?.name || 'Unknown Cause'}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {allocation.allocations.permanent && allocation.allocations.permanent > 0 && (
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 px-2 py-1 rounded">
                          🏛️ {allocation.allocations.permanent}%
                        </span>
                      )}
                      {allocation.allocations.temporary_consumable && allocation.allocations.temporary_consumable > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 px-2 py-1 rounded">
                          ⚡ {allocation.allocations.temporary_consumable}%
                        </span>
                      )}
                      {allocation.allocations.temporary_revolving && allocation.allocations.temporary_revolving > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 px-2 py-1 rounded">
                          🔄 {allocation.allocations.temporary_revolving}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Financial Overview */}
      <div className="rounded-lg border p-4 sm:p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 dark:text-white">Financial Overview</h3>
        <BarChart 
          data={financialData} 
          height={200}
          colors={['#3b82f6', '#10b981', '#ef4444']}
        />
      </div>

      {/* Causes Allocation */}
      {isLoadingCauses ? (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {profile.supportedCauses?.map((cause) => (
            <CauseCard 
              key={cause.id} 
              cause={{ 
                ...cause,
                isActive: true
              }} 
            />
          ))}
        </div>
      )}
      <TransactionHistory transactions={profile.waqfAssets || []} />
    </div>
  );
}
