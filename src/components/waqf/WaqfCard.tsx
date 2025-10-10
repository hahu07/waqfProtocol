import type { WaqfProfile } from "@/types/waqfs";
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
        
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
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
