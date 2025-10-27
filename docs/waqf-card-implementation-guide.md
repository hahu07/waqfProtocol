# WaqfCard Component Implementation Guide

## Overview
This guide shows how to update the WaqfCard component to display different metrics based on the waqf type (permanent, consumable, revolving, or hybrid).

## Required Import

```tsx
import { calculateTimeRemaining, generateMaturitySummary } from '@/lib/maturity-tracker';
```

## Type-Specific Display Logic

Add this conditional rendering logic inside your WaqfCard component where you display waqf metrics:

```tsx
{/* Type-Specific Metrics */}
<div className="space-y-3">
  {/* Waqf Type Badge */}
  <div className="flex items-center gap-2">
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ 
      waqf.waqfType === 'permanent' 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
        : waqf.waqfType === 'temporary_consumable'
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        : waqf.waqfType === 'temporary_revolving'
        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
        : 'bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 text-gray-800 dark:from-green-900/30 dark:via-blue-900/30 dark:to-purple-900/30 dark:text-gray-300'
    }`}>
      {waqf.waqfType === 'permanent' && '🏛️ Permanent'}
      {waqf.waqfType === 'temporary_consumable' && '⚡ Consumable'}
      {waqf.waqfType === 'temporary_revolving' && '🔄 Revolving'}
      {waqf.waqfType === 'hybrid' && '🎨 Hybrid'}
    </span>
    
    {/* Status Badge */}
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      waqf.status === 'active' 
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        : waqf.status === 'matured'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }`}>
      {waqf.status === 'active' && '● Active'}
      {waqf.status === 'matured' && '✓ Matured'}
      {waqf.status === 'paused' && '⏸ Paused'}
      {waqf.status === 'completed' && '✓ Completed'}
      {waqf.status === 'terminated' && '✕ Terminated'}
    </span>
  </div>

  {/* Permanent Waqf Metrics */}
  {waqf.waqfType === 'permanent' && (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Principal (Protected)</div>
        <div className="text-lg font-bold text-green-700 dark:text-green-300">
          ${waqf.waqfAsset.toLocaleString()}
        </div>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Legacy Status</div>
        <div className="text-lg font-bold text-green-700 dark:text-green-300">
          Active Forever ∞
        </div>
      </div>
      
      {waqf.financial && (
        <>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Returns Generated</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              ${waqf.financial.totalInvestmentReturn.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Distributed</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              ${waqf.financial.totalDistributed.toLocaleString()}
            </div>
          </div>
        </>
      )}
      
      {waqf.financial?.impactMetrics && (
        <div className="col-span-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Impact</div>
          <div className="text-sm font-semibold text-green-700 dark:text-green-300">
            {waqf.financial.impactMetrics.beneficiariesSupported.toLocaleString()} beneficiaries supported
          </div>
        </div>
      )}
    </div>
  )}

  {/* Consumable Waqf Metrics */}
  {waqf.waqfType === 'temporary_consumable' && waqf.consumableDetails && (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Initial Amount</div>
        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
          ${waqf.waqfAsset.toLocaleString()}
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Balance</div>
        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
          ${waqf.financial?.currentBalance.toLocaleString() || 0}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Spending Schedule</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
          {waqf.consumableDetails.spendingSchedule.replace('_', ' ')}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completion Date</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          {new Date(waqf.consumableDetails.endDate).toLocaleDateString()}
        </div>
      </div>
      
      <div className="col-span-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Distributed</div>
        <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          ${waqf.financial?.totalDistributed.toLocaleString() || 0} of ${waqf.waqfAsset.toLocaleString()}
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(((waqf.financial?.totalDistributed || 0) / waqf.waqfAsset) * 100, 100)}%` 
            }}
          />
        </div>
      </div>
      
      {waqf.financial?.impactMetrics && (
        <div className="col-span-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Impact</div>
          <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            {waqf.financial.impactMetrics.beneficiariesSupported.toLocaleString()} beneficiaries helped
          </div>
        </div>
      )}
    </div>
  )}

  {/* Revolving Waqf Metrics */}
  {waqf.waqfType === 'temporary_revolving' && waqf.revolvingDetails && (() => {
    const maturitySummary = generateMaturitySummary(waqf);
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Principal</div>
          <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
            ${waqf.waqfAsset.toLocaleString()}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            {waqf.status === 'matured' ? '✓ Ready to return' : '🔒 Locked'}
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Maturity Date</div>
          <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">
            {maturitySummary?.formattedMaturityDate}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            {maturitySummary?.timeRemaining}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lock Period</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {waqf.revolvingDetails.lockPeriodMonths} months
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Return Method</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
            {waqf.revolvingDetails.principalReturnMethod.replace('_', ' ')}
          </div>
        </div>
        
        {/* Progress Bar for Maturity */}
        {maturitySummary && (
          <div className="col-span-2 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">Progress to Maturity</div>
              <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                {maturitySummary.progress.toFixed(0)}%
              </div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  maturitySummary.status === 'matured' 
                    ? 'bg-green-500' 
                    : maturitySummary.status === 'maturing_soon'
                    ? 'bg-amber-500'
                    : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(maturitySummary.progress, 100)}%` }}
              />
            </div>
          </div>
        )}
        
        {waqf.financial && (
          <>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Returns Generated</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                ${waqf.financial.totalInvestmentReturn.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Distributed</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                ${waqf.financial.totalDistributed.toLocaleString()}
              </div>
            </div>
          </>
        )}
        
        {waqf.financial?.impactMetrics && (
          <div className="col-span-2 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Impact During Term</div>
            <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              {waqf.financial.impactMetrics.beneficiariesSupported.toLocaleString()} beneficiaries supported
            </div>
          </div>
        )}
      </div>
    );
  })()}

  {/* Hybrid Waqf Metrics */}
  {waqf.waqfType === 'hybrid' && (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Hybrid Allocation Strategy</div>
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Mixed allocation across multiple waqf types
        </div>
        
        {waqf.hybridAllocations && waqf.hybridAllocations.length > 0 && (
          <div className="space-y-2">
            {waqf.hybridAllocations.map((allocation, index) => {
              const cause = waqf.supportedCauses?.find(c => c.id === allocation.causeId);
              return (
                <div key={index} className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                    {cause?.name}
                  </div>
                  <div className="flex gap-2 text-xs">
                    {allocation.allocations.permanent && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded">
                        Permanent: {allocation.allocations.permanent}%
                      </span>
                    )}
                    {allocation.allocations.temporary_consumable && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                        Consumable: {allocation.allocations.temporary_consumable}%
                      </span>
                    )}
                    {allocation.allocations.temporary_revolving && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded">
                        Revolving: {allocation.allocations.temporary_revolving}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Overall metrics for hybrid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Asset</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${waqf.waqfAsset.toLocaleString()}
          </div>
        </div>
        
        {waqf.financial && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Distributed</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              ${waqf.financial.totalDistributed.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  )}
</div>
```

## Additional Helper: Status Color Function

You can add this helper function to get consistent status colors:

```tsx
function getStatusColor(status: string): string {
  switch(status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'matured':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'paused':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    case 'completed':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'terminated':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  }
}
```

## Usage Notes

1. **Import maturity utilities** at the top of your component
2. **Replace existing metrics section** with the type-conditional rendering above
3. **Test each waqf type** to ensure proper display
4. **Adjust styling** to match your existing design system
5. **Handle null/undefined** values gracefully for optional fields

## Testing Checklist

- [ ] Permanent waqf shows principal, legacy status, and returns
- [ ] Consumable waqf shows balance, spending schedule, and completion date
- [ ] Revolving waqf shows maturity date, lock period, and progress bar
- [ ] Hybrid waqf shows allocation breakdown per cause
- [ ] Status badges display correctly
- [ ] Maturity progress calculates correctly
- [ ] All dates format properly
- [ ] Dark mode styling works
- [ ] Responsive layout on mobile devices
