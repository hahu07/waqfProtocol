# Waqf Types Documentation

This document provides comprehensive definitions, features, and use cases for each type of waqf supported by the platform.

## Table of Contents
- [Overview](#overview)
- [Permanent Waqf](#permanent-waqf)
- [Temporary Consumable Waqf](#temporary-consumable-waqf)
- [Temporary Revolving Waqf](#temporary-revolving-waqf)
- [Hybrid Portfolio](#hybrid-portfolio)
- [Comparison Matrix](#comparison-matrix)

---

## Overview

The Waqf Platform supports four distinct waqf structures, each designed for different charitable giving strategies and impact goals. Understanding these types helps donors choose the best approach for their philanthropic objectives.

---

## Permanent Waqf

### Definition
A **Permanent Waqf** (Waqf Khairi) is an endowment where the principal amount is preserved forever. Only the investment returns (profit, dividends, or income) are distributed to beneficiaries, ensuring perpetual charitable impact across generations.

### Key Features

#### 1. **Principal Preservation**
- The original donation amount (corpus) is never spent
- Asset value remains intact indefinitely
- Protected from depletion or consumption

#### 2. **Return Distribution**
- Only investment returns are distributed to causes
- Typical annual return: 5-7% (based on investment strategy)
- Predictable, sustainable income stream

#### 3. **Perpetual Impact**
- Continues benefiting causes forever
- Creates a lasting legacy for future generations
- Compounds impact over time

#### 4. **Investment Management**
- Funds invested in Shariah-compliant instruments
- Diversified portfolio to minimize risk
- Professional management to maximize returns

### Financial Model

```
Initial Donation: $10,000
Annual Return: 7% ($700/year)
10-Year Distribution: $7,000
Lifetime Impact: Infinite

Principal Preserved: $10,000 (forever)
```

### Best For
- ✅ **Long-term impact seekers** - Want perpetual charitable benefit
- ✅ **Legacy builders** - Creating generational wealth transfer
- ✅ **Stable cause funding** - Organizations needing consistent annual income
- ✅ **Wealth preservation** - Protecting assets while giving back
- ✅ **Estate planning** - Structuring charitable trusts

### Use Cases

**Education Endowments**
- University scholarships funded by annual returns
- Research grants from endowment income
- Library acquisitions from investment proceeds

**Healthcare Support**
- Hospital equipment maintenance from returns
- Medical research funding from annual income
- Community health programs sustained by returns

**Religious Institutions**
- Mosque operations funded by waqf income
- Islamic school teacher salaries from returns
- Maintenance and utilities from annual proceeds

### Limitations
- ❌ Lower immediate impact (only returns distributed)
- ❌ Requires larger initial donation for meaningful returns
- ❌ Subject to investment risk and market fluctuations
- ❌ Less flexible for urgent/emergency needs

### Platform Implementation
- **Type Code**: `permanent` or `Permanent`
- **Backend Field**: `waqfType: "Permanent"`
- **Principal Field**: `waqfAsset` (immutable)
- **Distribution**: Calculated from `investmentReturns` array

---

## Temporary Consumable Waqf

### Definition
A **Temporary Consumable Waqf** (Waqf Muaqqat Istihlaqi) is a time-bound charitable endowment where the entire principal amount is gradually spent over time to achieve maximum immediate impact on urgent needs.

### Key Features

#### 1. **Full Deployment**
- 100% of donated funds are spent on causes
- Principal gradually consumed over deployment period
- No amount held back or preserved

#### 2. **Immediate Impact**
- Funds reach beneficiaries quickly
- Maximum short-term benefit
- Direct, tangible results

#### 3. **Time-Bound**
- Finite lifespan (typically 1-5 years)
- Depletion timeline set at creation
- Automatic completion tracking

#### 4. **Emergency Response**
- Ideal for disaster relief
- Crisis intervention
- Urgent humanitarian needs

### Financial Model

```
Initial Donation: $10,000
Deployment Period: 2 years (24 months)
Monthly Distribution: $416.67
Total Impact: $10,000 (fully deployed)

Remaining After 2 Years: $0 (depleted)
```

### Depletion Schedule

**Month 1-6**: $2,500 (25%)
**Month 7-12**: $2,500 (25%)
**Month 13-18**: $2,500 (25%)
**Month 19-24**: $2,500 (25%)

### Best For
- ✅ **Emergency relief** - Natural disasters, conflicts, crises
- ✅ **Immediate needs** - Hunger, homelessness, medical emergencies
- ✅ **Short-term projects** - Specific campaigns with defined goals
- ✅ **Direct service** - Food distribution, shelter, medical care
- ✅ **One-time impact** - Projects that don't require ongoing funding

### Use Cases

**Disaster Relief**
- Earthquake/flood emergency response
- Refugee camp supplies and services
- Emergency medical aid

**Food Security**
- Ramadan feeding programs
- Famine relief operations
- Food bank restocking

**Medical Emergencies**
- Surgery funding for indigent patients
- Epidemic response (vaccines, treatment)
- Medical equipment for crisis areas

**Infrastructure**
- Water well construction
- Temporary shelter building
- Emergency school repairs

### Limitations
- ❌ No long-term sustainability (funds deplete)
- ❌ Cannot create perpetual legacy
- ❌ Requires repeat donations for continued impact
- ❌ Not suitable for ongoing operational expenses

### Platform Implementation
- **Type Code**: `temporary_consumable` or `TemporaryConsumable`
- **Backend Field**: `waqfType: "TemporaryConsumable"`
- **Depletion Tracking**: `financial.currentBalance` decreases over time
- **Completion Check**: `canAcceptContribution()` returns false when depleted
- **Status**: Automatically changes to "completed" when fully spent

---

## Temporary Revolving Waqf

### Definition
A **Temporary Revolving Waqf** (Waqf Muaqqat Mudawir) is a sustainable lending model where funds are lent to beneficiaries, recovered over time, and then re-lent to new beneficiaries, creating a cyclical impact mechanism.

### Key Features

#### 1. **Loan-Based Model**
- Funds provided as Qard Hasan (interest-free loans)
- Shariah-compliant lending structure
- No interest or profit charged

#### 2. **Fund Recovery**
- Borrowers repay principal over time
- Recovered funds create liquidity for new loans
- Self-sustaining cycle of impact

#### 3. **Cyclical Impact**
- Same dollar serves multiple beneficiaries
- Multiplier effect over time
- Sustainable microfinance model

#### 4. **Graduated Repayment**
- Flexible repayment schedules
- Grace periods for struggling borrowers
- Default protection mechanisms

### Financial Model

```
Initial Donation: $10,000
Loan Term: 2 years per cycle
Number of Beneficiaries (10 years): ~5 cycles
Multiplied Impact: $10,000 x 5 = $50,000 total economic benefit

Recovery Rate: 85% (typical microfinance)
Sustained Value: $8,500 perpetually revolving
```

### Revolving Cycle Example

**Year 0**: Lend $10,000 to 10 entrepreneurs ($1,000 each)
**Year 2**: Recover $8,500 (85% recovery)
**Year 2**: Re-lend $8,500 to 8 new entrepreneurs
**Year 4**: Recover $7,225 (85% recovery)
**Year 4**: Re-lend $7,225 to 7 new entrepreneurs
*Cycle continues...*

### Best For
- ✅ **Microfinance** - Small business loans for entrepreneurs
- ✅ **Educational loans** - Student financing for vocational training
- ✅ **Agricultural support** - Farmers' seasonal capital needs
- ✅ **Economic empowerment** - Self-employment initiatives
- ✅ **Community development** - Cooperative ventures

### Use Cases

**Microenterprise Development**
- Small business startup capital
- Inventory purchase for vendors
- Equipment loans for artisans

**Education Financing**
- Tuition loans for students
- Vocational training costs
- Professional certification fees

**Agricultural Lending**
- Seed and fertilizer purchase
- Farm equipment acquisition
- Seasonal working capital

**Housing Improvement**
- Home repair loans
- Water/sanitation installation
- Solar panel financing

### Risk Management

**Default Mitigation**
- Community-based lending groups
- Social collateral (peer pressure)
- Flexible repayment on hardship
- Grace periods for temporary setbacks

**Fund Preservation**
- Reserve fund for losses (15-20%)
- Diversification across borrowers
- Risk-adjusted loan sizing
- Progressive lending (start small)

### Limitations
- ❌ Subject to default risk (typically 10-15%)
- ❌ Requires active management and monitoring
- ❌ Not suitable for emergency/non-recoverable needs
- ❌ Capital gradually erodes due to defaults
- ❌ Cultural challenges in loan collection

### Platform Implementation
- **Type Code**: `temporary_revolving` or `TemporaryRevolving`
- **Backend Field**: `waqfType: "TemporaryRevolving"`
- **Loan Tracking**: `allocations` collection tracks disbursements
- **Recovery**: `returnTranche()` function processes repayments
- **Maturity**: Fixed term (e.g., 5 years), then full recovery

---

## Hybrid Portfolio

### Definition
A **Hybrid Portfolio** is a diversified waqf structure that combines multiple waqf types within a single portfolio, allowing donors to balance immediate impact, sustainable returns, and revolving benefits across different causes.

### Key Features

#### 1. **Multi-Type Strategy**
- Combines Permanent, Consumable, and Revolving
- Customizable allocation per cause
- Balanced risk and impact profile

#### 2. **Cause-Specific Allocation**
- Each cause can have different waqf type percentages
- Tailor strategy to cause characteristics
- Match funding type to organizational needs

#### 3. **Diversified Impact**
- Short-term + long-term benefits
- Risk mitigation through diversification
- Flexibility to adapt to changing needs

#### 4. **Advanced Customization**
- Granular control over allocations
- Rebalancing capabilities
- Performance optimization

### Allocation Models

#### Balanced Hybrid (Recommended)
```
40% Permanent - Sustainable legacy
30% Consumable - Immediate impact
30% Revolving - Cyclical benefit
```

#### Emergency-Focused Hybrid
```
10% Permanent - Minimal long-term
70% Consumable - Maximum immediate impact
20% Revolving - Recovery-based aid
```

#### Legacy-Focused Hybrid
```
70% Permanent - Maximum perpetuity
15% Consumable - Some immediate help
15% Revolving - Economic empowerment
```

### Example Portfolio

**Total Donation: $10,000**
**3 Causes Selected:**

**Healthcare (40% = $4,000)**
- 100% Consumable
- Emergency medical procedures
- Immediate patient care

**Education (35% = $3,500)**
- 100% Permanent
- Scholarship endowment
- Perpetual student support

**Microfinance (25% = $2,500)**
- 100% Revolving
- Small business loans
- Cyclical entrepreneur support

### Financial Projection (10 Years)

```
Permanent ($3,500): 
  - Returns (7% x 10): $2,450
  - Principal preserved: $3,500
  - Total benefit: $5,950

Consumable ($4,000):
  - Fully deployed: $4,000
  - Remaining: $0
  - Total benefit: $4,000

Revolving ($2,500):
  - Cycles (85% recovery): ~3 cycles
  - Economic impact: $7,500
  - Remaining: ~$1,800
  - Total benefit: $9,300

Overall Impact: $19,250 from $10,000 donation
```

### Best For
- ✅ **Strategic donors** - Want optimized impact
- ✅ **Multi-cause support** - Diverse charitable interests
- ✅ **Risk managers** - Prefer diversification
- ✅ **Impact maximizers** - Balance all benefit types
- ✅ **Sophisticated givers** - Understand portfolio theory

### Allocation Strategies

**By Cause Type:**
- **Healthcare**: 60% Consumable, 20% Permanent, 20% Revolving
- **Education**: 70% Permanent, 20% Consumable, 10% Revolving
- **Poverty Relief**: 50% Consumable, 30% Revolving, 20% Permanent
- **Infrastructure**: 40% Permanent, 30% Consumable, 30% Revolving

**By Urgency:**
- **High Urgency**: 80% Consumable, 10% Permanent, 10% Revolving
- **Medium Urgency**: 40% each (balanced)
- **Low Urgency**: 70% Permanent, 20% Revolving, 10% Consumable

### Platform Implementation
- **Type Code**: `hybrid` or `Hybrid`
- **Backend Field**: `waqfType: "Hybrid"`, `isHybrid: true`
- **Allocation Storage**: `hybridAllocations` array with per-cause breakdowns
- **Calculation**: Complex weighted distribution across types
- **Flexibility**: Can be rebalanced over time

### Limitations
- ❌ More complex to understand
- ❌ Requires active management
- ❌ Higher administrative overhead
- ❌ May not optimize for single objective

---

## Comparison Matrix

| Feature | Permanent | Consumable | Revolving | Hybrid |
|---------|-----------|------------|-----------|--------|
| **Principal** | Preserved Forever | Fully Spent | Revolving | Mixed |
| **Impact Timeline** | Perpetual | 1-5 Years | Cyclical (ongoing) | Mixed |
| **Immediate Impact** | Low (returns only) | Very High | Medium | Customizable |
| **Long-term Impact** | Very High | None | Medium | High |
| **Risk Level** | Medium (investment) | Low (direct) | High (defaults) | Balanced |
| **Management** | Passive (invested) | Active (distribution) | Very Active (loans) | Complex |
| **Beneficiary Count** | Moderate (ongoing) | High (one-time) | Very High (multiple cycles) | Variable |
| **Flexibility** | Low | High | Medium | Very High |
| **Best For** | Legacy | Emergency | Empowerment | Strategy |
| **Shariah Status** | Fully Compliant | Fully Compliant | Fully Compliant (Qard) | Fully Compliant |
| **Minimum Amount** | High ($5,000+) | Low ($100+) | Medium ($1,000+) | Medium ($1,000+) |
| **Donor Engagement** | Low (set & forget) | Medium (track spending) | High (monitor loans) | Very High |

---

## Selection Guide

### Choose **Permanent Waqf** if:
- You want to create a lasting legacy
- You have substantial capital to endow
- You prefer passive management
- Your causes need stable, predictable funding
- You're thinking generationally

### Choose **Consumable Waqf** if:
- You're responding to an emergency or crisis
- You want maximum immediate impact
- Your causes have urgent, time-sensitive needs
- You don't need perpetual funding
- You prefer simplicity

### Choose **Revolving Waqf** if:
- You support economic empowerment
- You're comfortable with loan recovery
- You want multiplicative impact
- Your beneficiaries can repay
- You prefer active engagement

### Choose **Hybrid Portfolio** if:
- You support multiple causes
- You want balanced impact (short + long term)
- You're comfortable with complexity
- You want to optimize returns
- You prefer diversification

---

## Technical Reference

### Type Definitions (TypeScript)

```typescript
type WaqfType = 
  | 'permanent' 
  | 'temporary_consumable' 
  | 'temporary_revolving' 
  | 'hybrid';

interface WaqfProfile {
  waqfType: WaqfType;
  isHybrid: boolean;
  waqfAsset: number; // Principal amount
  hybridAllocations?: {
    causeId: string;
    allocations: {
      Permanent?: number;
      TemporaryConsumable?: number;
      TemporaryRevolving?: number;
    };
  }[];
}
```

### Backend Mapping (Rust)

```rust
pub enum WaqfType {
    Permanent,
    TemporaryConsumable,
    TemporaryRevolving,
    Hybrid,
}
```

---

## References

- Islamic Fiqh Council rulings on Waqf
- Shariah standards for endowment management
- AAOIFI (Accounting and Auditing Organization for Islamic Financial Institutions) guidelines
- Contemporary Islamic finance practices

---

**Document Version**: 1.0  
**Last Updated**: November 27, 2025  
**Maintained By**: Waqf Protocol Development Team
