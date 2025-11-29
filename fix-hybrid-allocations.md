# Fix for Null hybridAllocations

## Problem
Existing waqf profiles have `hybridAllocations` with `null` values instead of actual percentages, causing the "Waqf Type Allocation" section to not display.

## Temporary Manual Fix

Until we can run a data migration, you can manually fix your existing waqf by re-saving it through the "Edit This Waqf" button or by rebuilding the portfolio.

## Automatic Fix (Run in Browser Console)

If you want to fix it immediately, you can run this in your browser console while viewing the waqf page:

```javascript
// This will recalculate and set proper hybridAllocations
async function fixHybridAllocations() {
  const waqfId = 'YOUR_WAQF_ID_HERE'; // Replace with actual ID
  
  // Example: Set proper allocations (adjust percentages as needed)
  const hybridAllocations = [
    {
      causeId: '1b23878-7f17-4485-a547-485c38a977f98',  // Healthcare
      allocations: {
        Permanent: 0,
        TemporaryConsumable: 100,
        TemporaryRevolving: 0
      }
    },
    {
      causeId: 'eb37b7c-833d-4d16-87b7-b498650f9bc8',  // Education
      allocations: {
        Permanent: 100,
        TemporaryConsumable: 0,
        TemporaryRevolving: 0
      }
    },
    {
      causeId: 'd61942e-2844-47dd-8b7d-4acf85516c08',  // Feeding
        allocations: {
        Permanent: 0,
        TemporaryConsumable: 100,
        TemporaryRevolving: 0
      }
    }
  ];
  
  // Update the waqf
  await updateWaqf(waqfId, { hybridAllocations });
  console.log('✅ Fixed hybrid allocations');
  
  // Refresh the page
  window.location.reload();
}

// Run the fix
fixHybridAllocations();
```

## Long-term Solution

We need to add a data migration that:
1. Detects waqf profiles with null hybridAllocations
2. Recalculates proper values from the portfolio data
3. Updates the database

This should be part of a backend migration script.
