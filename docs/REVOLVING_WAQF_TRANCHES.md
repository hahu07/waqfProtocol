# Revolving Waqf Contribution Tranches System

## Overview

This document describes the implementation of the contribution tranches system for revolving waqfs, which allows fair tracking and maturity dates for each individual contribution.

## Problem Statement

Previously, revolving waqfs had a single maturity date for the entire waqf. When users made additional contributions after the initial donation, all funds would mature at the same time, which was unfair to later contributors who should have their funds locked for the full period.

## Solution: Contribution Tranches

We implemented a **tranche-based system** where each contribution is tracked separately with its own maturity date.

### Key Features

1. **Individual Maturity Tracking**: Each contribution has its own lock period and maturity date
2. **Fair Treatment**: New contributions are locked for the full lock period from their contribution date
3. **Granular Returns**: Users can return matured tranches individually as they mature
4. **Balance Breakdown**: Clear visibility of locked vs. available (matured) balances
5. **Audit Trail**: Complete history of contributions, maturities, and returns

## Architecture

### Data Structure

#### TypeScript Types (`src/types/waqfs.ts`)

```typescript
export interface ContributionTranche {
  id: string;
  amount: number;
  contributionDate: string; // Nanosecond timestamp
  maturityDate: string; // Nanosecond timestamp
  isReturned: boolean;
  returnedDate?: string; // Nanosecond timestamp
}

export interface RevolvingWaqfDetails {
  lockPeriodMonths: number;
  maturityDate: string; // Legacy field for first contribution
  contributionTranches: ContributionTranche[];
}
```

#### Rust Types (`src/satellite/src/waqf_types.rs`)

```rust
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ContributionTranche {
    pub id: String,
    pub amount: f64,
    pub contribution_date: String,
    pub maturity_date: String,
    pub is_returned: bool,
    pub returned_date: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RevolvingWaqfDetails {
    pub lock_period_months: u32,
    pub maturity_date: String,
    pub contribution_tranches: Vec<ContributionTranche>,
}
```

## Implementation Components

### 1. Backend (Rust Satellite)

**Location**: `src/satellite/src/donation_hooks.rs`

When a donation is recorded for a revolving waqf:

1. Calculate maturity date = contribution date + lock period
2. Create a new `ContributionTranche` with unique ID
3. Append to the waqf's `contribution_tranches` array
4. Update financial metrics

```rust
// Calculate maturity date
let maturity_date_ns = contribution_date_ns + 
    (lock_period_months as u64 * 30 * 24 * 60 * 60 * 1_000_000_000);

// Create tranche
let tranche = ContributionTranche {
    id: format!("tranche_{}", contribution_date_ns),
    amount: donation.amount,
    contribution_date: contribution_date_ns.to_string(),
    maturity_date: maturity_date_ns.to_string(),
    is_returned: false,
    returned_date: None,
};
```

### 2. Frontend Utilities

**Location**: `src/lib/revolving-waqf-utils.ts`

Provides helper functions to:

- Calculate locked vs. matured balance
- Get tranche status (locked, matured, returned)
- Sort tranches by maturity date
- Format dates for display
- Calculate time until maturity

```typescript
export function calculateRevolvingBalance(waqf: WaqfProfile) {
  const now = Date.now() * 1_000_000;
  
  const locked = tranches.filter(t => !t.isReturned && maturity > now);
  const matured = tranches.filter(t => !t.isReturned && maturity <= now);
  const returned = tranches.filter(t => t.isReturned);
  
  return {
    lockedBalance: sum(locked),
    maturedBalance: sum(matured),
    returnedBalance: sum(returned),
    // ... more details
  };
}
```

### 3. UI Components

#### TranchesDisplay Component

**Location**: `src/components/waqf/TranchesDisplay.tsx`

Displays:

1. **Summary Cards**:
   - Locked balance (funds still maturing)
   - Matured balance (available to return)
   - Returned balance (already returned)

2. **Next Maturity Alert**: Shows when the next tranche will mature

3. **Tranches List**: Detailed view of all tranches with:
   - Contribution amount and date
   - Maturity date
   - Status badge (locked/matured/returned)
   - "Return Funds" button for matured tranches

#### Dashboard Integration

**Location**: `src/components/waqf/EnhancedWaqfDashboard.tsx`

For revolving waqfs, the dashboard shows:

- **Card 2**: Matured Balance (available funds)
- **Card 3**: Locked Balance (still maturing)
- **TranchesDisplay section**: Full tranche breakdown

### 4. API Operations

**Location**: `src/lib/api/tranche-operations.ts`

#### `returnTranche(waqfId, trancheId)`

Process:
1. Fetch waqf document
2. Validate it's a revolving waqf
3. Find the specific tranche
4. Verify tranche has matured
5. Mark tranche as returned
6. Reduce waqf's current balance
7. Save updated waqf document

```typescript
export async function returnTranche(
  waqfId: string,
  trancheId: string
): Promise<{ success: boolean; error?: string }>
```

### 5. User Interface Flow

**Location**: `src/app/waqf/page.tsx`

User journey:

1. User views their revolving waqf dashboard
2. Sees locked/matured balance breakdown
3. Views detailed tranche list
4. Clicks "Return Funds" on a matured tranche
5. Confirms the return action
6. System processes the return and updates balance
7. Dashboard refreshes to show new state

## Usage Example

### Creating a Revolving Waqf with Tranches

1. User creates revolving waqf with $1,000 initial donation, 12-month lock
   - Creates Tranche 1: $1,000, matures in 12 months

2. After 6 months, user adds $500
   - Creates Tranche 2: $500, matures in 12 months (from contribution date)

3. After 12 months total:
   - Tranche 1 is matured ($1,000 available)
   - Tranche 2 is still locked ($500), will mature in 6 more months

4. User can return Tranche 1 while Tranche 2 continues to mature

### Balance Calculation

At any point in time:

```
Total Balance = Locked + Matured + Returned
Current Balance = Locked + Matured
Available to Return = Matured
```

## Benefits

### For Donors

1. **Fair Treatment**: Each contribution gets the full lock period
2. **Flexibility**: Can return matured funds while others continue to mature
3. **Transparency**: Clear visibility into each contribution's status
4. **Granular Control**: Don't have to wait for all funds to mature

### For Platform

1. **Accurate Tracking**: Every contribution is properly tracked
2. **Audit Trail**: Complete history of all transactions
3. **Compliance**: Meets Islamic finance principles of fairness
4. **Scalability**: Can handle unlimited contributions per waqf

## Technical Considerations

### Date Handling

- All dates stored as nanosecond timestamps (Juno standard)
- Conversion: `Date.now() * 1_000_000` (milliseconds to nanoseconds)
- 30-day months used for lock period calculation

### Maturity Calculation

```typescript
maturityDate = contributionDate + (lockPeriodMonths × 30 days)
```

### Tranche ID Generation

Format: `tranche_{contributionDateNanoseconds}`

Example: `tranche_1735257600000000000`

## Future Enhancements

1. **Partial Returns**: Allow returning a portion of a matured tranche
2. **Auto-Return**: Automatically return matured funds after X days
3. **Tranche Transfers**: Transfer matured tranches to another waqf
4. **Investment Returns**: Track investment returns per tranche
5. **Notifications**: Alert users when tranches mature
6. **Batch Operations**: Return multiple matured tranches at once

## Testing Considerations

### Test Scenarios

1. ✅ Create revolving waqf with initial contribution
2. ✅ Add additional contributions at different times
3. ✅ Verify each tranche has correct maturity date
4. ✅ Return matured tranche
5. ✅ Verify balance updates correctly
6. ✅ Attempt to return un-matured tranche (should fail)
7. ✅ Attempt to return already-returned tranche (should fail)

### Edge Cases

- Zero contributions (should show empty state)
- Single contribution (simple case)
- Many contributions (stress test)
- Contributions on same day (ensure unique IDs)
- Maturity date in past (should be immediately available)

## Code References

### Key Files

- **Types**: `src/types/waqfs.ts`
- **Backend Types**: `src/satellite/src/waqf_types.rs`
- **Donation Hook**: `src/satellite/src/donation_hooks.rs`
- **Tranche Hooks**: `src/satellite/src/tranche_hooks.rs`
- **Utils**: `src/lib/revolving-waqf-utils.ts`
- **API**: `src/lib/api/tranche-operations.ts`
- **Component**: `src/components/waqf/TranchesDisplay.tsx`
- **Dashboard**: `src/components/waqf/EnhancedWaqfDashboard.tsx`
- **Page**: `src/app/waqf/page.tsx`

### Integration Points

1. **Waqf Creation**: `src/components/waqf/WaqfForm.tsx`
2. **Donation Recording**: `src/hooks/useWaqfData.ts`
3. **Backend Validation**: `src/satellite/src/donation_hooks.rs`
4. **Data Transformation**: `src/lib/waqf-utils.ts`

## Deployment Checklist

- [x] Update TypeScript types
- [x] Update Rust backend types
- [x] Implement donation hook logic
- [x] Create utility functions
- [x] Build TranchesDisplay component
- [x] Integrate with dashboard
- [x] Create API operations
- [x] Wire up to page handlers
- [ ] Deploy Rust satellite to Juno
- [ ] Test in production environment
- [ ] Monitor for errors

## Support & Maintenance

For questions or issues related to the tranche system:

1. Check logs in browser console (development)
2. Check Rust satellite logs (production)
3. Verify data structure in Juno console
4. Review this documentation

---

**Last Updated**: 2025-10-26  
**Version**: 1.0.0  
**Author**: Warp AI Assistant
