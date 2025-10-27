# Flexible Consumable Waqf Implementation

## Overview
Implemented a flexible consumable waqf system that supports additional funding with optional time constraints and multiple completion criteria.

## Changes Made

### 1. Rust Satellite Types (`src/satellite/src/waqf_types.rs`)

Updated `ConsumableWaqfDetails` struct:

```rust
pub struct ConsumableWaqfDetails {
    pub spending_schedule: String,       // "immediate" | "phased" | "milestone-based" | "ongoing"
    
    // Optional time boundaries
    pub start_date: Option<String>,      // ISO timestamp (optional for ongoing)
    pub end_date: Option<String>,        // ISO timestamp when all funds should be spent (optional)
    
    // Alternative completion criteria
    pub target_amount: Option<f64>,      // Target amount to be distributed before completion
    pub target_beneficiaries: Option<u32>, // Target number of beneficiaries to support
    
    // Spending parameters
    pub milestones: Option<Vec<Milestone>>, // Milestones if using milestone-based spending
    pub minimum_monthly_distribution: Option<f64>, // Minimum amount to distribute monthly (for ongoing)
}
```

### 2. Rust Validation (`src/satellite/src/waqf_hooks.rs`)

Enhanced validation with:
- Support for `ongoing` spending schedule
- Schedule-specific validation rules:
  - **Phased**: Requires time boundaries OR minimum distribution
  - **Ongoing**: Requires minimum distribution OR target criteria
  - **Milestone-based**: Requires at least one milestone
- Validation for optional dates, target amounts, and beneficiaries

### 3. TypeScript Types (`src/types/waqfs.ts`)

Updated `ConsumableWaqfDetails` interface and `SpendingSchedule` type to match Rust structure with all optional fields.

### 4. Zod Schema Validation (`src/schemas/index.ts`)

Updated `consumableWaqfDetailsSchema` with:
- Optional date fields
- New optional fields: `targetAmount`, `targetBeneficiaries`, `minimumMonthlyDistribution`
- Refined validation that checks dates only if both are provided
- Schedule-specific validation logic

### 5. WaqfForm UI Component (`src/components/waqf/WaqfForm.tsx`)

Enhanced UI with:
- **Spending Schedule Dropdown**: Added "Ongoing" option
- **Conditional Date Fields**: Hidden for ongoing schedule
- **Target-Based Completion**:
  - Target Amount input (optional)
  - Target Beneficiaries input (optional)
- **Minimum Monthly Distribution**: For ongoing and phased schedules
- **Dynamic Help Text**: Explains each schedule type

### 6. Contribution Handler Utility (`src/lib/consumable-contribution-handler.ts`)

Created new utility for handling additional contributions:

#### Functions:

**`canAcceptContribution(waqf, amount)`**
- Checks if consumable waqf can accept additional funds
- Returns acceptance status and updated details

**Logic by Schedule**:
- **Ongoing**: Always accepts (until target reached)
- **Phased**: Accepts if end date not passed, extends duration proportionally
- **Milestone-based**: Accepts if milestones remain
- **Immediate**: Accepts if within period

**`calculateUpdatedDistribution(waqf, amount)`**
- Calculates new monthly distribution rate after contribution

**`getCompletionStatus(waqf)`**
- Returns completion status and progress percentage
- Checks: time-based, target amount, target beneficiaries, balance depletion

## How Additional Funding Works

### Ongoing Schedule
```typescript
spendingSchedule: 'ongoing'
minimumMonthlyDistribution: 5000
// OR
targetAmount: 100000
```
- **Always accepts** contributions
- No fixed end date
- Distributes continuously
- Completes when target reached or manually stopped

### Phased Schedule with Extension
```typescript
spendingSchedule: 'phased'
startDate: '2025-01-01'
endDate: '2025-12-31'
```
- **Accepts contributions** before end date
- **Auto-extends** end date proportionally:
  - $10k over 12 months
  - Add $5k (50% more) → extends by 6 months

### Target-Based Completion
```typescript
spendingSchedule: 'ongoing'
targetAmount: 50000
targetBeneficiaries: 1000
```
- Accepts contributions until target reached
- Can have multiple completion criteria
- Progress tracked in `getCompletionStatus()`

## Usage Examples

### Creating Ongoing Waqf (No End Date)
```typescript
{
  waqfType: 'temporary_consumable',
  consumableDetails: {
    spendingSchedule: 'ongoing',
    minimumMonthlyDistribution: 2000,
    targetBeneficiaries: 500
  }
}
```

### Creating Phased Waqf (Accepts Additional Funding)
```typescript
{
  waqfType: 'temporary_consumable',
  consumableDetails: {
    spendingSchedule: 'phased',
    startDate: '2025-01-01',
    endDate: '2026-01-01',
    minimumMonthlyDistribution: 1000
  }
}
```

### Adding Contribution
```typescript
import { canAcceptContribution } from '@/lib/consumable-contribution-handler';

const result = canAcceptContribution(waqf, 5000);

if (result.accepted) {
  // Update waqf financial data
  await updateWaqf(waqf.id, {
    financial: result.updatedFinancial,
    consumableDetails: result.updatedDetails // If dates were extended
  });
  
  // Create donation record
  await createDonation({
    waqfId: waqf.id,
    amount: 5000,
    status: 'completed'
  });
} else {
  alert(result.reason);
}
```

### Checking Completion
```typescript
import { getCompletionStatus } from '@/lib/consumable-contribution-handler';

const status = getCompletionStatus(waqf);

if (status.isCompleted) {
  // Mark waqf as completed
  await updateWaqf(waqf.id, { status: 'completed' });
  console.log(`Completed: ${status.reason}`);
} else {
  console.log(`Progress: ${status.progress}%`);
}
```

## Validation Rules Summary

| Schedule | Requires | Optional | Additional Funding |
|----------|----------|----------|-------------------|
| **Immediate** | None | Dates, targets | Until end date |
| **Phased** | Dates OR min distribution | Targets | Extends duration |
| **Milestone-based** | Milestones | Dates, targets | Until milestones done |
| **Ongoing** | Min dist OR targets | Dates | Always (until target) |

## Testing Checklist

- [ ] Create ongoing waqf without dates
- [ ] Create phased waqf with dates
- [ ] Create milestone-based waqf
- [ ] Add contribution to ongoing waqf
- [ ] Add contribution to phased waqf (verify date extension)
- [ ] Try adding contribution after end date (should reject)
- [ ] Verify target amount prevents over-contribution
- [ ] Check completion status calculation
- [ ] Validate form with various schedule combinations
- [ ] Test Rust satellite validation

## Next Steps

1. **Frontend Donation UI**: Add "Contribute More" button on waqf dashboard
2. **Webhook for Maturity**: Automatically mark waqfs as completed when criteria met
3. **Admin Distribution Panel**: Allow admins to execute distributions
4. **Impact Tracking**: Track beneficiaries count for target-based completion
5. **Reporting**: Show contribution history and date extensions
