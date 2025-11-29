# Waqf Type String Standardization

## Problem
The codebase had **3 different formats** for waqf types:
1. `'temporary_consumable'` (frontend standard - lowercase with underscores)
2. `'TemporaryConsumable'` (Rust backend - PascalCase)
3. `'TEMPORARY_CONSUMABLE'` (legacy - uppercase with underscores)

This caused bugs and required defensive code everywhere.

## Solution
**Standardized format**: `lowercase_with_underscores`

### TypeScript Enum (Frontend)
```typescript
// src/types/waqfs.ts
export enum WaqfType {
  PERMANENT = 'permanent',
  TEMPORARY_CONSUMABLE = 'temporary_consumable',
  TEMPORARY_REVOLVING = 'temporary_revolving'
}
```

### Rust Enum (Backend)
```rust
// src/satellite/src/waqf_types.rs
pub enum WaqfType {
    Permanent,              // Maps to 'permanent'
    TemporaryConsumable,    // Maps to 'temporary_consumable'
    TemporaryRevolving,     // Maps to 'temporary_revolving'
    Hybrid,                 // Maps to 'hybrid'
}
```

## Utility Functions
Created `src/lib/waqf-type-utils.ts` with:

### 1. Normalization
```typescript
normalizeWaqfType('TemporaryConsumable') // → 'temporary_consumable'
normalizeWaqfType('TEMPORARY_CONSUMABLE') // → 'temporary_consumable'
normalizeWaqfType('temporary_consumable') // → 'temporary_consumable'
```

### 2. Type Checking
```typescript
isConsumableWaqf('TemporaryConsumable')  // → true
isRevolvingWaqf('temporary_revolving')   // → true
isPermanentWaqf('Permanent')             // → true
```

### 3. Enum Conversion
```typescript
toWaqfTypeEnum('TemporaryConsumable') // → WaqfType.TEMPORARY_CONSUMABLE
```

### 4. Display Formatting
```typescript
formatWaqfType('temporary_consumable') // → 'Temporary Consumable Waqf'
```

## Changes Made

### ✅ Fixed Files

#### 1. Seed Scripts
**File**: `src/scripts/seed-consumable-waqfs.ts`
```diff
- waqfType: 'TemporaryConsumable' as WaqfType,
+ waqfType: WaqfType.TEMPORARY_CONSUMABLE,
```

#### 2. Admin Pages
**File**: `src/app/admin/distributions/page.tsx`
```diff
+ import { isConsumableWaqf } from '@/lib/waqf-type-utils';

- const isConsumable = 
-   waqfType === 'temporary_consumable' || 
-   waqfType === 'TEMPORARY_CONSUMABLE' ||
-   waqfType === 'TemporaryConsumable';
+ const isConsumable = isConsumableWaqf(waqfType);
```

#### 3. Already Correct
**File**: `src/app/admin/migrate-causes/page.tsx`
```typescript
// Already using enum correctly ✅
supportedWaqfTypes: [
  WaqfType.PERMANENT,
  WaqfType.TEMPORARY_CONSUMABLE,
  WaqfType.TEMPORARY_REVOLVING
]
```

## Usage Guidelines

### ✅ DO: Use enum values
```typescript
import { WaqfType } from '@/types/waqfs';

const waqf = {
  waqfType: WaqfType.TEMPORARY_CONSUMABLE  // ✅ Good
};
```

### ✅ DO: Use utility functions for comparison
```typescript
import { isConsumableWaqf } from '@/lib/waqf-type-utils';

if (isConsumableWaqf(waqf.waqfType)) {  // ✅ Good - handles all variants
  // ...
}
```

### ❌ DON'T: Hardcode string literals
```typescript
const waqf = {
  waqfType: 'TemporaryConsumable'  // ❌ Bad - inconsistent
};

if (waqfType === 'TEMPORARY_CONSUMABLE') {  // ❌ Bad - brittle
  // ...
}
```

### ❌ DON'T: Multiple comparison checks
```typescript
// ❌ Bad - duplicate logic
if (waqfType === 'temporary_consumable' || 
    waqfType === 'TemporaryConsumable' ||
    waqfType === 'TEMPORARY_CONSUMABLE') {
  // Use isConsumableWaqf() instead!
}
```

## Migration Checklist

- [x] Created utility functions (`waqf-type-utils.ts`)
- [x] Fixed seed scripts (`seed-consumable-waqfs.ts`)
- [x] Fixed admin distributions page
- [x] Verified migrate-causes already correct
- [x] Added documentation

### Remaining (Optional Cleanup)
- [ ] Search codebase for remaining hardcoded string comparisons
- [ ] Update components to use utility functions
- [ ] Add ESLint rule to prevent hardcoded waqf type strings

## Backend Serialization

Rust enums automatically serialize to snake_case when using serde:
```rust
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WaqfType {
    Permanent,              // → "permanent"
    TemporaryConsumable,    // → "temporary_consumable"
    TemporaryRevolving,     // → "temporary_revolving"
}
```

If not using `rename_all`, add manual renames:
```rust
pub enum WaqfType {
    #[serde(rename = "permanent")]
    Permanent,
    #[serde(rename = "temporary_consumable")]
    TemporaryConsumable,
    #[serde(rename = "temporary_revolving")]
    TemporaryRevolving,
}
```

## Testing

### Test Coverage
```typescript
// Test normalization
expect(normalizeWaqfType('TemporaryConsumable')).toBe('temporary_consumable');
expect(normalizeWaqfType('TEMPORARY_CONSUMABLE')).toBe('temporary_consumable');

// Test type checking
expect(isConsumableWaqf('TemporaryConsumable')).toBe(true);
expect(isConsumableWaqf('temporary_consumable')).toBe(true);
expect(isConsumableWaqf('Permanent')).toBe(false);

// Test enum conversion
expect(toWaqfTypeEnum('TemporaryConsumable')).toBe(WaqfType.TEMPORARY_CONSUMABLE);
```

## Benefits

1. **Single source of truth** - Enum defines valid values
2. **Defensive programming** - Utils handle all variants
3. **Type safety** - TypeScript catches invalid values
4. **Easier maintenance** - Change normalization logic in one place
5. **Better DX** - Clear, consistent API
6. **Reduced bugs** - No more missed comparison cases

## Future Improvements

1. Add ESLint rule to enforce enum usage
2. Add runtime validation on backend deserialization
3. Create migration script to fix existing data
4. Add type guards for runtime type checking
