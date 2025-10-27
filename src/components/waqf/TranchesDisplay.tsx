'use client';

import type { WaqfProfile } from '@/types/waqfs';
import { 
  calculateRevolvingBalance, 
  formatTrancheDate, 
  getTimeUntilMaturity,
  sortTranchesByMaturity,
  type TrancheStatus 
} from '@/lib/revolving-waqf-utils';

interface TranchesDisplayProps {
  waqf: WaqfProfile;
  onReturnTranche?: (trancheId: string) => void;
}

export function TranchesDisplay({ waqf, onReturnTranche }: TranchesDisplayProps) {
  console.log('🔍 TranchesDisplay - Waqf Data:', {
    waqfId: waqf.id,
    hasRevolvingDetails: !!waqf.revolvingDetails,
    contributionTranches: waqf.revolvingDetails?.contributionTranches,
    tranchesLength: waqf.revolvingDetails?.contributionTranches?.length || 0
  });
  
  const balance = calculateRevolvingBalance(waqf);
  
  console.log('📊 TranchesDisplay - Calculated Balance:', {
    lockedCount: balance.lockedTranches.length,
    maturedCount: balance.maturedTranches.length,
    returnedCount: balance.returnedTranches.length,
    lockedBalance: balance.lockedBalance,
    maturedBalance: balance.maturedBalance
  });
  
  const allTranches = sortTranchesByMaturity([
    ...balance.lockedTranches,
    ...balance.maturedTranches,
    ...balance.returnedTranches
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: TrancheStatus['status']) => {
    switch (status) {
      case 'locked':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'matured':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'returned':
        return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const getStatusIcon = (status: TrancheStatus['status']) => {
    switch (status) {
      case 'locked':
        return '🔒';
      case 'matured':
        return '✅';
      case 'returned':
        return '↩️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔒</span>
            <span className="text-sm font-medium text-blue-700">Locked</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(balance.lockedBalance)}</p>
          <p className="text-xs text-blue-600 mt-1">{balance.lockedTranches.length} tranches</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">✅</span>
            <span className="text-sm font-medium text-green-700">Matured</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(balance.maturedBalance)}</p>
          <p className="text-xs text-green-600 mt-1">{balance.maturedTranches.length} ready to return</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">↩️</span>
            <span className="text-sm font-medium text-gray-700">Returned</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance.returnedBalance)}</p>
          <p className="text-xs text-gray-600 mt-1">{balance.returnedTranches.length} tranches</p>
        </div>
      </div>

      {/* Next Maturity Alert */}
      {balance.nextMaturityDate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div className="flex-1">
              <p className="font-semibold text-yellow-900">Next Maturity</p>
              <p className="text-sm text-yellow-700">
                {formatCurrency(balance.nextMaturityAmount)} matures {getTimeUntilMaturity(getDaysUntil(balance.nextMaturityDate))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tranches List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Contribution Tranches</h3>
          <p className="text-sm text-gray-600">Track each contribution with its own maturity date</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {allTranches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No contribution tranches yet
            </div>
          ) : (
            allTranches.map((tranche) => (
              <div key={tranche.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{getStatusIcon(tranche.status)}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{formatCurrency(tranche.amount)}</p>
                        <p className="text-xs text-gray-500">
                          Contributed {formatTrancheDate(tranche.contributionDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-8 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Matures:</span>
                        <span className="font-medium text-gray-700">
                          {formatTrancheDate(tranche.maturityDate)}
                        </span>
                        {tranche.status === 'locked' && (
                          <span className="text-gray-500">
                            ({getTimeUntilMaturity(tranche.daysUntilMaturity)})
                          </span>
                        )}
                      </div>
                      
                      {tranche.status === 'returned' && tranche.returnedDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Returned:</span>
                          <span>{formatTrancheDate(tranche.returnedDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tranche.status)}`}>
                      {tranche.status.charAt(0).toUpperCase() + tranche.status.slice(1)}
                    </span>
                    
                    {tranche.status === 'matured' && onReturnTranche && (
                      <button
                        onClick={() => onReturnTranche(tranche.id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Return Funds
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function (duplicated from utils for component use)
function getDaysUntil(dateString: string): number {
  const targetDate = new Date(parseInt(dateString) / 1_000_000);
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
