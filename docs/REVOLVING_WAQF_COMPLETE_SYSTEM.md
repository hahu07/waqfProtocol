# Complete Revolving Waqf System

## Overview
A comprehensive time-bound charitable endowment system with full user control over lock periods, expiration actions, and portfolio integration.

---

## 🎯 Feature Summary

### ✅ What Users Can Do

#### 1. **At Waqf Creation** (Portfolio Flow)
- ✅ Set initial lock period (6 months to 20 years)
- ✅ Choose default expiration action:
  - 💰 **Refund** - Return principal to donor
  - 🔄 **Rollover** - Extend for another period
  - 🏛️ **Convert to Permanent** - Make it perpetual
  - ⚡ **Convert to Consumable** - Spend over time
- ✅ Create as standalone or part of portfolio

#### 2. **When Adding Funds**
- ✅ New contributions automatically inherit lock period
- ✅ New contributions inherit default expiration preference
- ✅ Each contribution tracked as separate tranche
- ✅ Customize allocation across causes

#### 3. **At Maturity**
- ✅ View all matured tranches in dashboard
- ✅ Accept default action or override per-tranche
- ✅ Execute: refund, rollover, or convert
- ✅ Track conversion history

---

## 🏗️ System Architecture

### Frontend Components

```
Portfolio Creation Flow
├── 1. build-portfolio (Select causes)
├── 2. design-allocation ⭐
│   ├── Set lock period (NEW!)
│   └── Set expiration preference
├── 3. preview-impact
├── 4. donor-details
└── 5. sign-deed → Create waqf

Dashboard
├── PortfolioWaqfDashboard
│   ├── Maturity alerts
│   └── TrancheMaturityActions modal
└── AddFundsModal (Add contributions)
```

### Backend Components

```
Rust Satellite (Juno)
├── waqf_types.rs
│   ├── ExpirationAction enum
│   ├── TrancheExpirationPreference
│   ├── ContributionTranche
│   └── RevolvingWaqfDetails
├── donation_hooks.rs
│   ├── Create tranches on donation
│   ├── Calculate maturity dates
│   └── Auto-inherit preferences
└── tranche_hooks.rs
    ├── Validate expiration actions
    ├── Validate conversions
    └── Validate rollovers
```

### API Layer

```typescript
tranche-operations.ts
├── rolloverTranche()
├── convertTrancheToPermanent()
└── convertTrancheToConsumable()
```

---

## 📊 Data Flow

### Creating a Revolving Waqf

```
User Actions (UI)
  │
  ├─ Set lock period: 24 months
  ├─ Set allocation: 30% revolving
  └─ Set preference: Convert to Permanent
        │
        ↓
SessionStorage (portfolio)
        │
        ↓
Portfolio Transformation
        │
        ↓
WaqfProfile
  ├─ waqfType: "Hybrid" or "TemporaryRevolving"
  └─ revolvingDetails:
      ├─ lockPeriodMonths: 24
      └─ defaultExpirationPreference:
          └─ action: "convert_permanent"
        │
        ↓
Rust Backend (Juno)
        │
        ↓
Waqf Document Created ✓
```

### Adding Funds

```
User adds $1000
        │
        ↓
Backend: donation_hooks.rs
        │
        ├─ Read waqf.revolvingDetails
        ├─ Calculate maturity: now + 24 months
        └─ Create ContributionTranche:
            ├─ amount: 1000
            ├─ maturityDate: 2027-11-28
            └─ expirationPreference: { action: "convert_permanent" }
        │
        ↓
New Tranche Added to Waqf ✓
```

### At Maturity

```
Tranche reaches maturity date
        │
        ↓
PortfolioWaqfDashboard
        │
        └─ Shows alert: "2 matured contributions"
        │
User clicks "View"
        │
        ↓
TrancheMaturityActions Modal
        │
        ├─ Show tranche: $1000, matured 2025-11-28
        ├─ Pre-selected: Convert to Permanent
        └─ User can override or confirm
        │
User confirms
        │
        ↓
API: convertTrancheToPermanent()
        │
        ├─ Create new permanent waqf
        ├─ Mark tranche with conversionDetails
        └─ Notify user
        │
        ↓
Conversion Complete ✓
```

---

## 🎨 User Interface

### Design Allocation Page (when revolving > 0)

```
┌─────────────────────────────────────────────────┐
│ 🔄 Revolving Waqf Maturity Preferences          │
├─────────────────────────────────────────────────┤
│                                                  │
│ 💡 About Revolving Waqf                         │
│ Set how long funds stay locked, and what        │
│ happens when that period ends.                  │
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│ 🔒 Initial Lock Period                          │
│ How long should contributions be locked?        │
│                                                  │
│ [____24____] months     │ 24 months ≈ 2 years  │
│                                                  │
│ [6m] [1y] [2y] [3y] [5y]  ← Quick presets      │
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│ What should happen when lock period ends?       │
│                                                  │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│ │💰 Refund │  │🔄 Rollover│ │🏛️ Permanent│    │
│ └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│ ┌──────────────┐                                │
│ │⚡ Consumable │  ← Selected                    │
│ └──────────────┘                                │
│                                                  │
│ [Schedule: Phased    ▼]                         │
│ [Duration: __12__ months]                       │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Dashboard Alert (when tranches mature)

```
┌─────────────────────────────────────────────────┐
│ ⚠️  You have 2 matured contributions            │
│                                                  │
│ These contributions are ready for action.       │
│ [View Matured Tranches]                         │
└─────────────────────────────────────────────────┘
```

### Tranche Maturity Modal

```
┌─────────────────────────────────────────────────┐
│ 🔄 Handle Matured Contribution                  │
├─────────────────────────────────────────────────┤
│                                                  │
│ Tranche Details:                                │
│ • Amount: $1,000                                │
│ • Contributed: 2023-11-28                       │
│ • Matured: 2025-11-28                           │
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│ Choose Action:                                  │
│                                                  │
│ ◉ 🏛️ Convert to Permanent  ← Recommended       │
│ ○ 💰 Refund to Me                               │
│ ○ 🔄 Rollover for 12 months                    │
│ ○ ⚡ Convert to Consumable                      │
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│ [Cancel]  [Confirm Action]                      │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Key Files

| Component | File | Lines |
|-----------|------|-------|
| **Lock Period UI** | `design-allocation/page.tsx` | 600-672 |
| **Expiration Pref UI** | `design-allocation/page.tsx` | 594-841 |
| **Portfolio Transform** | `portfolio-to-waqf.ts` | 175-179 |
| **Backend Inheritance** | `donation_hooks.rs` | 139-188 |
| **Maturity Actions UI** | `TrancheMaturityActions.tsx` | Full file |
| **Dashboard Alert** | `PortfolioWaqfDashboard.tsx` | 398-496 |
| **API Operations** | `tranche-operations.ts` | Full file |
| **Backend Validation** | `tranche_hooks.rs` | Full file |

### Type Definitions

**TypeScript** (`src/types/waqfs.ts`):
```typescript
type ExpirationAction = 
  | 'refund' 
  | 'rollover' 
  | 'convert_permanent' 
  | 'convert_consumable';

interface TrancheExpirationPreference {
  action: ExpirationAction;
  rolloverMonths?: number;
  consumableSchedule?: SpendingSchedule;
  consumableDuration?: number;
}

interface ContributionTranche {
  id: string;
  amount: number;
  maturityDate: string;
  expirationPreference?: TrancheExpirationPreference;
  conversionDetails?: ConversionDetails;
}

interface RevolvingWaqfDetails {
  lockPeriodMonths: number;
  defaultExpirationPreference?: TrancheExpirationPreference;
  contributionTranches?: ContributionTranche[];
}
```

**Rust** (`src/satellite/src/waqf_types.rs`):
```rust
pub enum ExpirationAction {
    Refund,
    Rollover,
    ConvertPermanent,
    ConvertConsumable,
}

pub struct RevolvingWaqfDetails {
    pub lock_period_months: u32,
    pub default_expiration_preference: Option<TrancheExpirationPreference>,
    pub contribution_tranches: Option<Vec<ContributionTranche>>,
}
```

---

## 📈 Benefits

### For Donors
- ✅ **Control**: Full control over lock periods and expiration
- ✅ **Flexibility**: Can refund, extend, or convert at maturity
- ✅ **Visibility**: Clear tracking of all tranches and maturity dates
- ✅ **Options**: Choose what works best at each maturity

### For Causes
- ✅ **Predictability**: Know when funds arrive and leave
- ✅ **Planning**: Can plan projects around tranche maturities
- ✅ **Sustainability**: Option for donors to convert to permanent

### For Platform
- ✅ **Professional**: Industry-standard time-bound endowments
- ✅ **Scalable**: Handles multiple tranches efficiently
- ✅ **Compliant**: Proper tracking for audit and reporting
- ✅ **Flexible**: Supports diverse charitable models

---

## 🚀 Status

### ✅ Completed Features
- [x] Lock period user control
- [x] Expiration preference selection
- [x] Auto-inheritance on donations
- [x] Tranche-based tracking
- [x] Maturity dashboard alerts
- [x] All 4 expiration actions (refund/rollover/convert×2)
- [x] Backend validation
- [x] API operations
- [x] Portfolio integration
- [x] Hybrid waqf support

### 📝 Documentation
- [x] System overview (this document)
- [x] Lock period implementation guide
- [x] Expiration preference relocation guide
- [x] Integration guides
- [x] Implementation summary

### 🎯 Ready for Production
The complete revolving waqf system is **production-ready** with full user control over:
- ✅ Initial lock periods
- ✅ Expiration preferences
- ✅ Per-tranche overrides
- ✅ All conversion actions
- ✅ Portfolio integration

---

## 🔄 Complete User Journey

```
Day 1: Create Waqf
  ├─ Select 3 causes
  ├─ Allocate 30% to revolving
  ├─ Set 24-month lock period
  ├─ Choose "Convert to Permanent" at maturity
  └─ Sign deed → Waqf created with $10,000

Day 90: Add Funds
  ├─ Add $5,000 more
  └─ New tranche created (matures in 24 months)

Month 24: First Tranche Matures
  ├─ Dashboard shows alert
  ├─ View matured tranche: $10,000
  ├─ Confirm "Convert to Permanent"
  └─ New permanent waqf created

Month 27: Second Tranche Matures
  ├─ View matured tranche: $5,000
  ├─ Override: Choose "Rollover 12 months"
  └─ Extended to month 39

Month 39: Extended Tranche Matures
  ├─ View matured tranche: $5,000
  ├─ Choose "Refund"
  └─ $5,000 returned to donor

Result:
  ✅ $10,000 now in permanent waqf (perpetual impact)
  ✅ $5,000 returned (used elsewhere)
  ✅ Complete flexibility achieved
```

---

## 📞 Support

For questions or issues with revolving waqf functionality:
1. Check the implementation guides in `/docs`
2. Review type definitions in `src/types/waqfs.ts`
3. Test with the provided test scenarios
4. Verify backend logs in Rust satellite

---

**Built with**: Next.js 15 + React 19 + TypeScript + Rust + Juno
**Status**: ✅ Production Ready
**Last Updated**: 2025-11-28
