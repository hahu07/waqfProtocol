# Tranche Maturity Actions - Dashboard Integration Guide

## Overview
This guide shows how to integrate the `TrancheMaturityActions` component into your waqf dashboard to allow users to manage matured tranches.

## Component Location
```
src/components/waqf/TrancheMaturityActions.tsx
```

## Basic Integration

### Step 1: Import the Component
```typescript
import { TrancheMaturityActions } from '@/components/waqf/TrancheMaturityActions';
import { getMaturedTranches } from '@/lib/api/tranche-operations';
```

### Step 2: Check for Matured Tranches
```typescript
const maturedTranches = waqf.revolvingDetails?.contributionTranches?.filter(tranche => {
  const now = Date.now() * 1_000_000; // Convert to nanoseconds
  const maturityDate = parseInt(tranche.maturityDate);
  return !tranche.isReturned && now >= maturityDate && tranche.status !== 'rolled_over';
}) || [];

const hasMaturedTranches = maturedTranches.length > 0;
```

### Step 3: Display Alert for Matured Tranches
```tsx
{hasMaturedTranches && (
  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 mb-6">
    <div className="flex items-start gap-3">
      <span className="text-2xl">⏰</span>
      <div className="flex-1">
        <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-1">
          Action Required: {maturedTranches.length} Matured Tranche{maturedTranches.length > 1 ? 's' : ''}
        </h3>
        <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
          You have tranches that have reached maturity. Please choose what to do with them.
        </p>
        <button
          onClick={() => setShowMaturityActions(true)}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-semibold"
        >
          Take Action Now
        </button>
      </div>
    </div>
  </div>
)}
```

### Step 4: Show Maturity Actions in Modal or Section
```tsx
{showMaturityActions && (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
      Matured Tranches
    </h2>
    
    {maturedTranches.map((tranche) => (
      <TrancheMaturityActions
        key={tranche.id}
        waqf={waqf}
        tranche={tranche}
        onActionComplete={() => {
          // Refresh waqf data
          refetchWaqfData();
          // Optionally close modal or show success message
          toast.success('Action completed successfully!');
        }}
      />
    ))}
  </div>
)}
```

## Complete Dashboard Integration Example

```tsx
'use client';

import { useState } from 'react';
import { TrancheMaturityActions } from '@/components/waqf/TrancheMaturityActions';
import type { WaqfProfile } from '@/types/waqfs';

interface WaqfDashboardProps {
  waqf: WaqfProfile;
  onRefresh: () => void;
}

export function WaqfDashboard({ waqf, onRefresh }: WaqfDashboardProps) {
  const [showMaturityActions, setShowMaturityActions] = useState(false);
  
  // Get matured tranches
  const maturedTranches = waqf.revolvingDetails?.contributionTranches?.filter(tranche => {
    const now = Date.now() * 1_000_000;
    const maturityDate = parseInt(tranche.maturityDate);
    const isMatured = now >= maturityDate;
    const isNotReturned = !tranche.isReturned;
    const isNotRolledOver = tranche.status !== 'rolled_over';
    const isNotConverted = !tranche.conversionDetails;
    
    return isMatured && isNotReturned && isNotRolledOver && isNotConverted;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Matured Tranches Alert */}
      {maturedTranches.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⏰</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                🎉 {maturedTranches.length} Tranche{maturedTranches.length > 1 ? 's' : ''} Ready!
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-4">
                Great news! Your contributions have matured. You can now:
              </p>
              <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 mb-4 ml-4">
                <li>💰 Get your principal back (Refund)</li>
                <li>🔄 Extend for another period (Rollover)</li>
                <li>🏛️ Convert to permanent waqf (Lasting Legacy)</li>
                <li>⚡ Convert to consumable waqf (Immediate Impact)</li>
              </ul>
              <button
                onClick={() => setShowMaturityActions(true)}
                className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Choose Action →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regular Dashboard Content */}
      {/* ... your existing dashboard content ... */}

      {/* Maturity Actions Section (Modal or In-Page) */}
      {showMaturityActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Matured Tranches - Take Action
              </h2>
              <button
                onClick={() => setShowMaturityActions(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {maturedTranches.map((tranche, index) => (
                <div key={tranche.id}>
                  {index > 0 && <div className="border-t border-gray-200 dark:border-gray-700 my-6" />}
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Tranche #{index + 1}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Contributed: {new Date(parseInt(tranche.contributionDate) / 1_000_000).toLocaleDateString()}
                      {' • '}
                      Matured: {new Date(parseInt(tranche.maturityDate) / 1_000_000).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <TrancheMaturityActions
                    waqf={waqf}
                    tranche={tranche}
                    onActionComplete={() => {
                      onRefresh();
                      // Check if all tranches are processed
                      const remaining = maturedTranches.filter(t => 
                        t.id !== tranche.id && !t.isReturned
                      );
                      if (remaining.length === 0) {
                        setShowMaturityActions(false);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Display Tranche History

Show conversion history for tranches that have been converted:

```tsx
{/* Tranche History Section */}
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Tranche History</h3>
  
  {waqf.revolvingDetails?.contributionTranches?.map((tranche) => (
    <div 
      key={tranche.id}
      className={`p-4 rounded-lg border-2 ${
        tranche.conversionDetails 
          ? 'border-purple-200 bg-purple-50 dark:bg-purple-900/20' 
          : tranche.status === 'rolled_over'
          ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
          : tranche.isReturned
          ? 'border-gray-200 bg-gray-50 dark:bg-gray-900/20'
          : 'border-green-200 bg-green-50 dark:bg-green-900/20'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">
            ${tranche.amount.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Contributed: {new Date(parseInt(tranche.contributionDate) / 1_000_000).toLocaleDateString()}
          </p>
        </div>
        
        {tranche.conversionDetails && (
          <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
            Converted to {tranche.conversionDetails.targetWaqfType === 'permanent' ? '🏛️ Permanent' : '⚡ Consumable'}
          </span>
        )}
        
        {tranche.status === 'rolled_over' && (
          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
            🔄 Rolled Over
          </span>
        )}
        
        {tranche.isReturned && !tranche.conversionDetails && tranche.status !== 'rolled_over' && (
          <span className="px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full">
            💰 Refunded
          </span>
        )}
      </div>
      
      {tranche.conversionDetails && (
        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-md">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            New Waqf ID: <code className="text-xs">{tranche.conversionDetails.newWaqfId}</code>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Converted: {new Date(parseInt(tranche.conversionDetails.convertedAt) / 1_000_000).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  ))}
</div>
```

## Testing the Integration

### Test Scenarios

1. **No Matured Tranches**
   - Dashboard should display normally without alerts
   - No maturity actions available

2. **One Matured Tranche**
   - Alert should appear at the top
   - Clicking "Take Action" shows the maturity actions component
   - User can select and execute action

3. **Multiple Matured Tranches**
   - Alert shows count of matured tranches
   - Modal shows all matured tranches
   - Actions can be taken individually

4. **After Action Completion**
   - Dashboard refreshes
   - Alert disappears if no more matured tranches
   - Tranche history updates

### Debug Tips

```typescript
// Add console logs for debugging
console.log('Matured tranches:', maturedTranches);
console.log('Current time (nanos):', Date.now() * 1_000_000);
maturedTranches.forEach(t => {
  console.log(`Tranche ${t.id}:`, {
    amount: t.amount,
    maturityDate: parseInt(t.maturityDate),
    isMatured: Date.now() * 1_000_000 >= parseInt(t.maturityDate),
    isReturned: t.isReturned,
    status: t.status,
  });
});
```

## Styling Recommendations

### Alert Styles
- Use warm colors (yellow/orange) for attention
- Include icons for visual interest
- Make action button prominent

### Modal/Section Styles
- Ensure adequate spacing between tranches
- Use color coding for different actions
- Provide clear visual feedback

### Mobile Responsiveness
```tsx
{/* Mobile-friendly modal */}
<div className="fixed inset-0 md:inset-4 ...">
  <div className="w-full md:max-w-4xl ...">
    {/* Content with responsive padding */}
    <div className="p-4 md:p-6 ...">
      {/* ... */}
    </div>
  </div>
</div>
```

## Next Steps

1. Choose integration approach (modal vs in-page section)
2. Add to your waqf dashboard page
3. Test with various scenarios
4. Add analytics tracking for actions
5. Deploy and monitor

---

**Note**: The component is fully functional and includes all validation, error handling, and confirmation flows. Just integrate it into your dashboard UI!
