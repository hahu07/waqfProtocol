# Consumable Waqf Validation Strategy

## Overview
Validation is split across **frontend** (UX) and **backend** (security) following defense-in-depth principles.

---

## Frontend Validation (src/schemas/index.ts + WaqfForm.tsx)

### Responsibilities:
- **Immediate user feedback** - prevent form submission with obvious errors
- **Format validation** - dates, emails, phone numbers
- **UX optimization** - reduce unnecessary backend calls
- **Client-side calculations** - allocation percentages, totals

### Rules (Keep):

#### 1. Format & Type Validation
```typescript
// Zod schema
z.string().datetime()              // ISO date format
z.string().email()                 // Email format
z.number().positive()              // Positive numbers
z.string().min(5).max(100)         // Length constraints
```

#### 2. User Experience Validation
```typescript
// Date comparison with friendly messages
if (endDate <= startDate) {
  alert('⚠️ End date must be after start date');
  return false;
}
```

#### 3. Basic Business Rules
```typescript
// Allocation percentages
const total = allocations.reduce((sum, a) => sum + a.percentage, 0);
if (Math.abs(total - 100) > 0.01) {
  alert('Allocations must sum to 100%');
}
```

### Rules (Remove - Duplicate with Backend):
```typescript
// ❌ Remove - Backend will check
if (details.spendingSchedule === 'phased' && 
    !details.startDate && !details.endDate) {
  // Backend handles this
}
```

---

## Backend Validation (src/satellite/src/waqf_hooks.rs)

### Responsibilities:
- **Security enforcement** - prevent malicious data
- **Data integrity** - ensure storage consistency
- **Business rule authority** - source of truth
- **Cross-entity validation** - check permissions, balances

### Rules (Keep):

#### 1. Critical Business Rules
```rust
// Spending schedule requirements
match consumable.spending_schedule.as_str() {
    "milestone-based" => {
        if consumable.milestones.is_none() {
            return Err("Milestones required");
        }
    },
    // ... other schedules
}
```

#### 2. Security Constraints
```rust
// Amount limits
if target_amount <= 0.0 {
    return Err("Target amount must be positive");
}

// Enum validation
match spending_schedule.as_str() {
    "immediate" | "phased" | "milestone-based" | "ongoing" => {},
    _ => return Err("Invalid schedule"),
}
```

#### 3. Data Integrity
```rust
// Required field checks
let consumable = waqf.consumable_details.as_ref()
    .ok_or("Consumable details required")?;

// Non-zero beneficiaries
if target_beneficiaries == 0 {
    return Err("At least 1 beneficiary required");
}
```

#### 4. Cross-Field Validation
```rust
// Conditional requirements
if schedule == "ongoing" {
    if min_distribution.is_none() && 
       target_amount.is_none() && 
       target_beneficiaries.is_none() {
        return Err("Ongoing requires distribution or target");
    }
}
```

### Rules (Simplify - Already in Frontend):
```rust
// ✅ Keep simplified version for security
// Frontend already shows nice error messages
if let (Some(start), Some(end)) = (&start_date, &end_date) {
    if start >= end {
        return Err("Invalid date range");
    }
}
```

---

## Validation Matrix

| Validation Type | Frontend | Backend | Rationale |
|----------------|----------|---------|-----------|
| **Format (email, phone)** | ✅ Primary | ❌ Skip | UX feedback, regex heavy |
| **Date format (ISO)** | ✅ Primary | ✅ Basic | Frontend catches, backend enforces |
| **Date logic (start < end)** | ✅ Detailed | ✅ Simple | Frontend UX, backend security |
| **Required fields** | ✅ UX | ✅ Authority | Both needed for UX + security |
| **Positive amounts** | ✅ UX | ✅ Authority | Both needed |
| **Spending schedule enum** | ✅ TypeScript | ✅ Rust | Type safety on both sides |
| **Schedule requirements** | ❌ Remove | ✅ Authority | Backend is source of truth |
| **Allocation percentages** | ✅ Primary | ❌ Skip | Client-side calculation |
| **Milestones validation** | ✅ UX | ✅ Authority | Both needed |
| **Permission checks** | ❌ Skip | ✅ Primary | Backend only |
| **Storage constraints** | ❌ Skip | ✅ Primary | Backend only |

---

## Implementation Plan

### Step 1: Clean Frontend Validation
- Keep Zod schema for format/type validation
- Keep form validation for UX feedback
- **Remove** duplicate business rule checks that backend handles
- Add clear error messages from backend responses

### Step 2: Strengthen Backend Validation
- Keep all business rules as source of truth
- Simplify date parsing (basic ISO check)
- Add detailed error messages
- Ensure all enum values are validated

### Step 3: Error Handling Bridge
- Frontend displays backend errors gracefully
- Map backend error codes to user-friendly messages
- Log validation failures for debugging

---

## Error Message Flow

```
User Input → Frontend Validation → Backend Validation → Storage
              ↓ (instant)           ↓ (authoritative)
            UX Feedback          Security Enforcement
              ↓                     ↓
         Form Errors          API Error Response
                                   ↓
                            Frontend displays
```

---

## Code Changes Needed

### 1. Frontend (WaqfForm.tsx)
```typescript
// ✅ KEEP - Format validation
if (details.startDate && details.endDate) {
  const startDate = new Date(details.startDate);
  const endDate = new Date(details.endDate);
  
  if (endDate <= startDate) {
    alert('⚠️ End date must be after start date');
    return false;
  }
}

// ❌ REMOVE - Backend will handle
// if (details.spendingSchedule === 'phased' && ...) {
//   alert('⚠️ Phased spending requires...');
//   return false;
// }
```

### 2. Backend (waqf_hooks.rs)
```rust
// ✅ KEEP - Authority on business rules
match consumable.spending_schedule.as_str() {
    "phased" => {
        if consumable.start_date.is_none() 
            && consumable.end_date.is_none() 
            && consumable.minimum_monthly_distribution.is_none() {
            return Err("Phased spending requires time boundaries or minimum distribution".to_string());
        }
    },
    // ... other rules
}

// ✅ SIMPLIFY - Date validation
if let (Some(start), Some(end)) = (&start_date, &end_date) {
    // Basic validation - frontend already checked format
    if start >= end {
        return Err("Invalid date range".to_string());
    }
}
```

### 3. Zod Schema (schemas/index.ts)
```typescript
// ✅ KEEP - Type & format validation
export const consumableWaqfDetailsSchema = z.object({
  spendingSchedule: z.enum(['immediate', 'phased', 'milestone-based', 'ongoing']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  targetAmount: z.number().positive().optional(),
  targetBeneficiaries: z.number().int().positive().optional(),
  minimumMonthlyDistribution: z.number().positive().optional(),
  milestones: z.array(...).optional(),
  portfolioMembership: portfolioMembershipSchema.optional(),
})
.refine((data) => {
  // ✅ KEEP - UX date validation
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, { message: 'End date must be after start date' });

// ❌ REMOVE - Let backend handle business rules
// .refine((data) => {
//   if (data.spendingSchedule === 'phased') {
//     return data.startDate || data.endDate || ...
//   }
// })
```

---

## Benefits

1. **Faster UX** - Immediate feedback on format errors
2. **Better Security** - Backend enforces all business rules
3. **Single Source of Truth** - Backend owns validation logic
4. **Easier Maintenance** - No duplicate rule updates
5. **Clear Separation** - Frontend = UX, Backend = Security
6. **Graceful Degradation** - If frontend skipped, backend catches

---

## Testing Strategy

### Frontend Tests
- Format validation (email, dates)
- Required field checks
- Allocation percentage calculations
- User-friendly error messages

### Backend Tests
- Business rule enforcement
- Security constraint validation
- Data integrity checks
- Malicious input rejection

### Integration Tests
- Happy path: frontend + backend pass
- Frontend bypass: backend still validates
- Error mapping: backend errors → user messages
