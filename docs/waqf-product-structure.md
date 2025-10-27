# Waqf Product Structure Documentation

## Overview
This document outlines the structure for causes/waqf products in our cash waqf platform, covering three distinct waqf models.

---

## Three Waqf Models

### 1. **Permanent Waqf** (Traditional)
- **Principal**: Never returned, invested perpetually
- **Returns**: Distributed to beneficiaries forever
- **Example**: $10,000 → generates $700/year forever

### 2. **Consumable Temporary Waqf**
- **Principal**: Spent down over time period
- **Returns**: Distributed alongside principal
- **Example**: $5,000 → fully spent over 2 years

### 3. **Revolving Temporary Waqf** (Mudarabah-style)
- **Principal**: **Returned to donor** after specified period
- **Returns**: Distributed to beneficiaries during holding period
- **Example**: $10,000 for 5 years → donor gets $10,000 back, charity keeps all returns ($3,500)

---

## Product Categories

### Permanent Waqf Products (Principal Preserved)
Structure causes where **100% of donations go to principal**, and only investment returns are distributed:

**Product Categories:**
- **Education Waqf** - Scholarships, school operations, teacher training
- **Healthcare Waqf** - Medical equipment, clinic operations, patient subsidies
- **Community Infrastructure** - Mosques, community centers, clean water projects
- **Orphan Support Waqf** - Long-term orphan care programs
- **Knowledge Waqf** - Libraries, research centers, Islamic education

**Key Attributes:**
- Donor's capital is never spent (invested instead)
- Returns distributed perpetually to beneficiaries
- Higher minimum contribution (e.g., $1000+)
- Long-term impact metrics

### Temporary Consumable Waqf Products (Time-Bound Spending)
Structure causes where **principal is gradually spent** over a defined period:

**Product Categories:**
- **Emergency Relief** - Disaster response, refugee aid (6-12 months)
- **Seasonal Programs** - Ramadan food packages, winter aid (annual cycle)
- **Project-Based** - Specific building projects, well construction (1-3 years)
- **Campaign Waqf** - Medical surgeries, student sponsorship (defined duration)
- **Community Events** - Eid celebrations, iftar programs (recurring annual)

**Key Attributes:**
- Principal + returns spent within timeframe
- Lower minimum contribution (e.g., $50+)
- Clear end date and completion criteria
- Faster direct impact

### Revolving Temporary Waqf Products (Principal Returns to Donor)
Structure causes where **principal is returned** but returns benefit charity:

**Product Categories:**
- **Education Fund** - Multi-year scholarship programs
- **Healthcare Investment** - Medical facility expansion
- **Economic Empowerment** - Microfinance pools, vocational training
- **Infrastructure Development** - Large-scale community projects
- **Research & Innovation** - Islamic finance research, tech development

**Key Attributes:**
- Principal returned after lock period (1-10 years)
- All investment returns go to beneficiaries during period
- Medium to high minimum contribution (e.g., $500+)
- Appeals to donors wanting liquidity preserved

---

## Technical Implementation

### TypeScript Schema

```typescript
type WaqfType = "permanent" | "temporary_consumable" | "temporary_revolving";

interface Cause {
  id: string;
  name: string;
  category: string; // Education, Healthcare, etc.
  supported_waqf_types: WaqfType[];
  
  // Permanent-specific
  investment_strategy?: {
    asset_allocation: string;
    expected_annual_return: number;
    distribution_frequency: "monthly" | "quarterly" | "annually";
  };
  
  // Temporary consumable-specific
  consumable_duration?: {
    start_date: Date;
    end_date: Date;
    spending_schedule: "immediate" | "phased" | "milestone-based";
  };
  
  // Temporary revolving-specific
  revolving_options?: {
    min_lock_period: number; // months, e.g., 12
    max_lock_period: number; // months, e.g., 120
    expected_return_during_period: number;
  };
  
  // Common attributes
  target_amount: number;
  current_amount: number;
  beneficiary_impact: string;
  shariah_compliance: {
    verified: boolean;
    certifying_authority: string;
  };
}

interface Waqf {
  id: string;
  cause_id: string;
  donor_id: string;
  waqf_type: WaqfType;
  principal_amount: number;
  status: "active" | "matured" | "withdrawn";
  
  // For temporary_revolving only
  revolving_terms?: {
    lock_period_months: number; // e.g., 60 months = 5 years
    maturity_date: Date;
    principal_return_method: "lump_sum" | "installments";
    early_withdrawal_penalty?: number; // e.g., 0.1 = 10%
  };
  
  // Financial tracking
  total_returns_generated: number;
  total_returns_distributed: number;
  beneficiaries_impacted: number;
}
```

---

## Donor Experience Flow

### When Creating a Waqf:

1. **Donor selects cause category** (Education, Healthcare, etc.)
2. **System presents waqf model options** for that cause:
   - Permanent: "Create lasting legacy - returns help forever"
   - Temporary Consumable: "Direct impact - principal helps within [timeframe]"
   - Temporary Revolving: "Support while preserving capital - get principal back after [period]"
3. **Donor chooses model** based on preference
4. **Configure terms** (amount, duration for temporary types)
5. **Review and commit**

### Dashboard Display Examples

**Permanent Waqf:**
```
Your Permanent Waqf: Education Fund
├─ Principal: $10,000 (invested perpetually)
├─ Returns Generated (lifetime): $4,250
├─ Returns Distributed: $4,250 (100% to beneficiaries)
├─ Beneficiaries Helped: 342 students
└─ Legacy Status: Active forever
```

**Revolving Waqf:**
```
Your Revolving Waqf: Healthcare Investment
├─ Principal: $10,000 (returns to you on Dec 2030)
├─ Time Remaining: 3 years 2 months
├─ Returns Generated: $2,450
├─ Returns Distributed: $2,450 (100% to beneficiaries)
└─ Beneficiaries Helped: 147 patients
```

---

## Use Cases

### Revolving Waqf - Ideal for Donors Who Want To:
- Support charity without permanent capital loss
- "Lend" rather than "give" principal
- Earn spiritual rewards during lock period
- Maintain liquidity for future needs (marriage, hajj, business)
- Test the platform before committing to permanent waqf

### Revolving Waqf - Ideal for Causes Needing:
- Larger initial capital pools
- Medium-term funding (3-10 years)
- Predictable return schedules to plan operations
- Higher donation amounts from risk-averse donors

---

## Strategic Recommendations

1. **Default to Permanent** for traditional causes (education, healthcare, orphan support)
2. **Default to Temporary Consumable** for urgent/seasonal causes (emergency relief, campaigns)
3. **Default to Revolving** for large infrastructure or economic empowerment projects
4. **Allow Multiple Types** for flexible causes - let donors choose
5. **Hybrid Option**: Donor splits contribution across models (e.g., 50% permanent, 30% revolving, 20% consumable)

---

## Shariah Compliance Considerations

### Revolving Waqf Permissibility

✅ **Permissible because:**
- Donor's intention is charitable (all returns go to charity)
- No interest/riba involved (returns are investment profits)
- Similar to "Qard Hasan" (benevolent loan) with investment benefit going to charity
- Donor accepts investment risk
- Historical precedent in Islamic finance structures

⚠️ **Must ensure:**
- Clear upfront agreement on terms (lock period, return conditions)
- No guaranteed returns to donor (they only get principal back, subject to investment risk)
- Investment follows Shariah-compliant methods (no haram industries)
- Charity receives 100% of returns, donor receives 0%
- Early withdrawal penalties (if any) go to charity, not platform
- Proper documentation and transparency

### General Requirements (All Types)
- Shariah board approval for investment strategies
- Regular audits of fund usage
- Transparent reporting to donors
- Proper segregation of principal and returns
- Clear beneficiary impact metrics

---

## Implementation Priority

### Phase 1 (MVP):
- Permanent Waqf
- Temporary Consumable Waqf

### Phase 2:
- Revolving Waqf (requires more complex financial tracking)
- Hybrid allocation options

### Phase 3:
- Advanced features (auto-renewal, flexible terms, secondary market)

---

## Additional Notes

- Always test with Shariah advisors before launching new product types
- Consider regional preferences (some markets may prefer certain models)
- Monitor donor behavior to optimize product mix
- Ensure clear communication to avoid confusion between models
- Build trust through transparency and impact reporting
