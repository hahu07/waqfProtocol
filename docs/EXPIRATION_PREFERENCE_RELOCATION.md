# Revolving Waqf Expiration Preference UI Relocation

## Summary
Successfully relocated the default expiration preference UI from the abandoned WaqfForm to the active portfolio creation flow in CauseMarketplace/design-allocation page.

## Problem
The expiration preference UI was previously added to `WaqfForm.tsx` (lines 1017-1239), but this component has been abandoned since waqf creation moved to the CauseMarketplace flow. Users now create waqfs through:
1. `/waqf/build-portfolio` - Select causes
2. `/waqf/design-allocation` - Configure waqf type allocations
3. `/waqf/preview-impact` - See projections
4. `/waqf/donor-details` - Enter personal info
5. `/waqf/sign-deed` - Create waqf

## Solution
Moved the expiration preference UI to **Step 2: design-allocation page**, where users configure their waqf type allocations.

## Changes Made

### 1. `/src/app/waqf/design-allocation/page.tsx`
**Added imports:**
```typescript
import type { TrancheExpirationPreference } from '@/types/waqfs';
```

**Added state:**
```typescript
const [defaultExpirationPreference, setDefaultExpirationPreference] = useState<TrancheExpirationPreference>({
  action: 'refund',
});
```

**Added load logic:**
- Loads saved expiration preference from sessionStorage on mount
- Pre-fills preference if it exists in the portfolio

**Added save logic:**
- Auto-saves preference to sessionStorage along with other portfolio data
- Included in the dependency array of the auto-save useEffect

**Added UI section:**
- Conditionally shows when revolving allocation > 0
- Displays after Mode Selection and before Allocation Interface
- Features:
  - 4 action options: Refund, Rollover, Convert to Permanent, Convert to Consumable
  - Additional configuration fields for rollover (months) and consumable (schedule, duration)
  - Help text explaining that preferences can be overridden per-tranche
  - Purple/purple-themed styling to match revolving waqf branding

**Visibility conditions:**
- Simple mode: shows when `simpleWaqfType === 'temporary_revolving'`
- Balanced mode: shows when `globalAllocation.temporary_revolving > 0`
- Advanced mode: shows when any cause has `item.allocation.temporary_revolving > 0`

### 2. `/src/components/waqf/WaqfForm.tsx`
**Removed lines 1017-1239:**
- Removed the entire expiration preference section
- This component is no longer used for waqf creation

### 3. `/src/lib/portfolio-to-waqf.ts`
**Added to `portfolioToWaqfProfile()` function:**
- Extracts `defaultExpirationPreference` from portfolio
- Calculates revolving stats to determine if revolvingDetails should be included
- Adds `revolvingDetails` to waqf profile when applicable:
  ```typescript
  revolvingDetails: waqfType === 'temporary_revolving' || (isHybrid && stats.revolving > 0) ? {
    lockPeriodMonths: 12, // Default lock period
    defaultExpirationPreference: defaultExpirationPreference || { action: 'refund' },
  } : undefined,
  ```

## User Flow

1. **User selects causes** in build-portfolio page
2. **User designs allocation** in design-allocation page:
   - Chooses allocation mode (simple/balanced/advanced)
   - Sets waqf type allocations
   - **If revolving allocation > 0**: Sets default expiration preference
3. **Preference auto-saves** to sessionStorage with portfolio
4. **User continues** through preview-impact and donor-details
5. **User signs deed** in sign-deed page
6. **Portfolio transforms to waqf** via `savePortfolioAsWaqf()`:
   - Default expiration preference included in revolvingDetails
   - Stored with the waqf in the backend
7. **Future donations inherit** the default preference (via `donation_hooks.rs`)
8. **Users can override** per-tranche via TrancheMaturityActions component

## Files Modified
- ✅ `/src/app/waqf/design-allocation/page.tsx` - Added UI and logic
- ✅ `/src/components/waqf/WaqfForm.tsx` - Removed UI (lines 1017-1239)
- ✅ `/src/lib/portfolio-to-waqf.ts` - Added revolvingDetails with preference

## Files Not Changed (Already Complete)
- `/src/types/waqfs.ts` - Types already defined
- `/src/satellite/src/waqf_types.rs` - Rust types already defined
- `/src/lib/api/tranche-operations.ts` - API operations already implemented
- `/src/satellite/src/donation_hooks.rs` - Auto-inheritance already implemented
- `/src/satellite/src/tranche_hooks.rs` - Validation already implemented
- `/src/components/waqf/TrancheMaturityActions.tsx` - UI for matured tranches already exists
- `/src/components/waqf/PortfolioWaqfDashboard.tsx` - Dashboard integration already complete

## Testing Checklist
- [ ] Test simple mode with revolving waqf - preference UI should show
- [ ] Test balanced mode with revolving % > 0 - preference UI should show
- [ ] Test advanced mode with at least one cause having revolving % > 0 - preference UI should show
- [ ] Test that UI hides when no revolving allocation
- [ ] Test each action option (refund, rollover, convert_permanent, convert_consumable)
- [ ] Test rollover configuration (months field)
- [ ] Test consumable configuration (schedule dropdown, duration field)
- [ ] Test that preference saves to sessionStorage
- [ ] Test that preference loads on page reload
- [ ] Test complete flow: build → allocate → set preference → preview → details → sign → verify waqf created
- [ ] Verify preference appears in created waqf's revolvingDetails
- [ ] Verify new donations inherit the default preference (check backend)
- [ ] Test matured tranche handling via PortfolioWaqfDashboard

## Deployment Notes
- Frontend changes only - no Rust satellite deployment needed for this relocation
- The backend already supports default expiration preferences
- This change makes the feature accessible in the correct user flow

## Status
✅ **Complete** - All changes implemented and integrated

The revolving waqf expiration preference UI is now properly located in the active portfolio creation flow where users configure their waqf allocations.
