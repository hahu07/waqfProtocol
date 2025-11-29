# Lock Period User Control Implementation

## Problem
The initial lock period for revolving waqf contributions was **hardcoded to 12 months** in the portfolio-to-waqf transformation. Users had no way to set this important parameter during waqf creation.

## Solution
Added user control for setting the initial lock period during the portfolio creation flow.

---

## Changes Made

### 1. Frontend: Design Allocation Page (`/src/app/waqf/design-allocation/page.tsx`)

#### Added State
```typescript
const [lockPeriodMonths, setLockPeriodMonths] = useState<number>(12);
```

#### Added Load/Save Logic
- **Load**: Reads `lockPeriodMonths` from sessionStorage on mount
- **Save**: Auto-saves to sessionStorage along with other portfolio data
- **Dependency**: Added to useEffect dependency array

#### Added UI Section (Shows when revolving allocation > 0)

```
🔒 Initial Lock Period
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
How long should contributions be locked?

[Input: ___12___ months]  [Display: 12 months ≈ 1 year]

Quick presets:
[6 months] [1 year] [2 years] [3 years] [5 years]

💡 Tip: Longer lock periods for larger projects,
       shorter periods for more flexibility
```

**Features:**
- Number input (1-240 months)
- Real-time display showing years + months
- Quick preset buttons (6m, 12m, 24m, 36m, 60m)
- Purple-themed styling matching revolving waqf
- Help text explaining tradeoffs

### 2. Backend: Portfolio Transformation (`/src/lib/portfolio-to-waqf.ts`)

#### Extract from Portfolio
```typescript
const lockPeriodMonths = (portfolio as any).lockPeriodMonths || 12;
```
- Reads user's selection from portfolio
- Defaults to 12 months if not set (backward compatible)

#### Use in revolvingDetails
```typescript
revolvingDetails: {
  lockPeriodMonths: lockPeriodMonths, // ← Now uses user's value!
  defaultExpirationPreference: defaultExpirationPreference || { action: 'refund' },
}
```

---

## User Flow

### Creating a Revolving Waqf

1. **Select causes** (build-portfolio)
2. **Design allocation** (design-allocation):
   - Choose mode (simple/balanced/advanced)
   - Set revolving allocation % → **Lock period section appears**
   - **Set initial lock period** (e.g., 24 months)
   - Set expiration preference (refund/rollover/convert)
3. **Preview & continue** through remaining steps
4. **Sign deed** → Waqf created with user's lock period

### What Happens

- Initial contribution is locked for the specified period
- When additional funds are added, they use the same lock period
- Each contribution creates a separate tranche with its own maturity date
- Users can see all tranches in the dashboard with their maturity dates

---

## Technical Details

### Data Flow
```
User Input (UI)
  ↓
lockPeriodMonths: 24
  ↓
SessionStorage (portfolio)
  ↓
Portfolio → WaqfProfile transformation
  ↓
revolvingDetails.lockPeriodMonths: 24
  ↓
Backend (Rust satellite)
  ↓
Used for calculating tranche maturity dates
```

### Lock Period Calculation
When a donation is made (in `donation_hooks.rs`):
```rust
let lock_period_nanos = (revolving_details.lock_period_months as u64) 
    * 30 * 24 * 60 * 60 * 1_000_000_000; // months → nanoseconds
let maturity_time_nanos = current_time_nanos + lock_period_nanos;
```

### Range Validation
- **Minimum**: 1 month
- **Maximum**: 240 months (20 years)
- **Default**: 12 months
- **UI prevents**: Invalid values via input constraints

---

## UI/UX Considerations

### Visibility
Lock period UI appears **only when** revolving allocation > 0:
- Simple mode: `simpleWaqfType === 'temporary_revolving'`
- Balanced mode: `globalAllocation.temporary_revolving > 0`
- Advanced mode: Any cause has `allocation.temporary_revolving > 0`

### Display Format
- Input shows months (more precise)
- Display shows years + months (more intuitive)
  - Example: `24 months ≈ 2 years`
  - Example: `30 months ≈ 2 years 6mo`

### Quick Presets
Common periods for easy selection:
- **6 months**: Short-term microfinance
- **1 year**: Standard revolving period
- **2 years**: Medium-term projects
- **3 years**: Business development cycles
- **5 years**: Long-term capacity building

---

## Files Modified

| File | Changes |
|------|---------|
| `/src/app/waqf/design-allocation/page.tsx` | Added state, load/save logic, and UI |
| `/src/lib/portfolio-to-waqf.ts` | Extract and use user's lock period |

## Files Not Changed

| File | Reason |
|------|--------|
| `/src/satellite/src/donation_hooks.rs` | Already uses `lock_period_months` from waqf |
| `/src/types/waqfs.ts` | `RevolvingWaqfDetails` already has field |
| `/src/satellite/src/waqf_types.rs` | Rust type already defined |

---

## Testing Checklist

- [ ] Test with different lock periods (6m, 12m, 24m, 36m, 60m)
- [ ] Test custom values (e.g., 18 months, 30 months)
- [ ] Verify display format shows correct years/months
- [ ] Test min/max boundaries (1 month, 240 months)
- [ ] Verify save/load from sessionStorage
- [ ] Test complete flow: set period → create waqf → verify in backend
- [ ] Add funds → verify new tranche uses same lock period
- [ ] Check maturity date calculations are correct
- [ ] Verify UI only shows when revolving allocation > 0
- [ ] Test all three modes (simple/balanced/advanced)

---

## Backward Compatibility

✅ **Existing waqfs**: Not affected (already have their lock periods)
✅ **New waqfs without selection**: Default to 12 months
✅ **Portfolio data**: Optional field, doesn't break old portfolios

---

## Benefits

### For Users
✅ **Full control** over contribution lock periods
✅ **Flexibility** to match project timelines
✅ **Visual feedback** showing timespan
✅ **Quick presets** for common scenarios
✅ **Clear understanding** of when funds mature

### For Platform
✅ **Better UX** - no hidden defaults
✅ **More flexibility** - supports diverse use cases
✅ **Clearer expectations** - users know exact timeline
✅ **Professional** - standard practice for time-bound endowments

---

## Status
✅ **Complete** - Lock period is now fully user-controlled

Users can now set the initial lock period when creating revolving waqfs, giving them complete control over the time-bound nature of their contributions.
