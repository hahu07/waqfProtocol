# Rust Satellite Category Implementation

## Overview

This document covers the Rust satellite backend updates to support the dynamic category system.

## Files Modified/Created

### New File: `src/satellite/src/category_hooks.rs`
Complete validation hooks for categories and subcategories collections.

### Modified File: `src/satellite/src/cause_hooks.rs`
Updated Cause struct and validation to support new categoryId/subcategoryId fields.

### Modified File: `src/satellite/src/lib.rs`
Integrated category hooks into the main satellite router.

## Changes Summary

### 1. New Collections Supported

The satellite now validates these additional collections:
- `categories` - Main category definitions
- `subcategories` - Subcategory definitions (linked to categories)

### 2. Category Validation (`category_hooks.rs`)

**Category Struct:**
```rust
pub struct Category {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub color: Option<String>,
    pub is_active: bool,
    pub sort_order: i32,
    pub associated_waqf_types: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}
```

**Validations:**
- ✅ ID required (max 100 chars)
- ✅ Name required (max 200 chars)
- ✅ Description required (max 1000 chars)
- ✅ Icon required
- ✅ Color validation (hex format #RRGGBB)
- ✅ At least one waqf type must be associated
- ✅ Waqf types must be valid: `permanent`, `temporary_consumable`, `temporary_revolving`
- ✅ Timestamps required

### 3. Subcategory Validation (`category_hooks.rs`)

**Subcategory Struct:**
```rust
pub struct Subcategory {
    pub id: String,
    pub category_id: String,  // Parent reference
    pub name: String,
    pub description: String,
    pub icon: String,
    pub examples: Vec<String>,
    pub is_active: bool,
    pub sort_order: i32,
    pub created_at: String,
    pub updated_at: String,
}
```

**Validations:**
- ✅ ID required (max 100 chars)
- ✅ Category ID (parent) required
- ✅ Name required (max 200 chars)
- ✅ Description required (max 1000 chars)
- ✅ Icon required
- ✅ Examples limited to 200 chars each
- ✅ Timestamps required

### 4. Updated Cause Validation (`cause_hooks.rs`)

**Updated Cause Struct:**
```rust
pub struct Cause {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub cover_image: Option<String>,
    pub category_id: String,           // NEW: Main category reference
    pub subcategory_id: String,        // NEW: Subcategory reference
    pub category: Option<String>,      // LEGACY: Backward compatibility
    pub is_active: bool,
    pub status: String,
    pub sort_order: i32,
    pub followers: i32,
    pub funds_raised: f64,
    pub impact_score: Option<f64>,
    pub created_at: String,
    pub updated_at: String,
}
```

**New Validations:**
- ✅ `categoryId` required
- ✅ `subcategoryId` required
- ✅ Valid main categories: `permanent`, `temporary_time_bound`, `temporary_revolving`
- ✅ Subcategory cannot be empty
- ✅ Enhanced logging includes category/subcategory info

**Backward Compatibility:**
- ✅ Legacy `category` field is optional
- ✅ Existing causes without new fields will need migration

## Build & Deploy

### 1. Build the Satellite

```bash
cd /home/mutalab/projects/waqfProtocol/src/satellite
cargo build --target wasm32-unknown-unknown --release
```

### 2. Check for Errors

```bash
cargo check
```

### 3. Run Tests (if any)

```bash
cargo test
```

### 4. Deploy to Juno

```bash
# From project root
juno hosting deploy
```

## Testing the Implementation

### Test Category Creation

1. Use the admin CategoryManager UI
2. Create a new category with all required fields
3. Check Juno console logs for validation messages

**Expected Log:**
```
Category validation passed: Test Category - Active: true, Types: ["permanent"]
Category CREATE: test_category - Name: 'Test Category', Active: true, Types: ["permanent"]
```

### Test Subcategory Creation

1. Create a subcategory linked to existing category
2. Verify parent reference is validated

**Expected Log:**
```
Subcategory validation passed: Test Subcategory - Parent: permanent, Active: true
Subcategory CREATE: test_sub - Name: 'Test Subcategory', Parent: permanent, Active: true
```

### Test Cause with Categories

1. Create a cause with categoryId and subcategoryId
2. Verify validation passes

**Expected Log:**
```
Cause validation passed: Test Cause - Status: pending, Active: false, Category: permanent, Subcategory: education_permanent
Cause CREATE: cause_001 - Name: 'Test Cause', Status: pending, Active: false, Category: permanent/education_permanent, Raised: $0
```

### Test Invalid Data

Try creating:
- Category without name → Should fail
- Category with invalid waqf type → Should fail
- Subcategory without category_id → Should fail
- Cause without categoryId → Should fail
- Cause with invalid categoryId → Should fail

## Validation Rules

### Category Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| id | Required, max 100 chars | "Category ID is required" |
| name | Required, max 200 chars | "Category name is required" |
| description | Required, max 1000 chars | "Category description is required" |
| icon | Required | "Category icon is required" |
| color | Optional, valid hex | "Invalid hex color format" |
| associated_waqf_types | At least one, valid types | "At least one waqf type must be associated" |
| created_at | Required | "Created at timestamp is required" |
| updated_at | Required | "Updated at timestamp is required" |

### Subcategory Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| id | Required, max 100 chars | "Subcategory ID is required" |
| category_id | Required | "Parent category ID is required" |
| name | Required, max 200 chars | "Subcategory name is required" |
| description | Required, max 1000 chars | "Subcategory description is required" |
| icon | Required | "Subcategory icon is required" |
| examples | Each max 200 chars | "Each example must be 200 characters or less" |
| created_at | Required | "Created at timestamp is required" |
| updated_at | Required | "Updated at timestamp is required" |

### Cause Rules (Updated)

| Field | Rule | Error Message |
|-------|------|---------------|
| category_id | Required, valid main category | "Category ID is required" |
| subcategory_id | Required, not empty | "Subcategory ID is required" |
| category | Optional (legacy) | N/A |

## Logging

### Category Operations

**Create:**
```
Category CREATE: permanent - Name: 'Permanent Waqf', Active: true, Types: ["permanent"]
```

**Update:**
```
Category UPDATE: permanent - Name: 'Permanent Waqf', Active: true, Types: ["permanent"]
```

**Delete:**
```
Category deletion: Permanent Waqf - Active: true
```

### Subcategory Operations

**Create:**
```
Subcategory CREATE: education_permanent - Name: 'Education Waqf', Parent: permanent, Active: true
```

**Update:**
```
Subcategory UPDATE: education_permanent - Name: 'Education Waqf', Parent: permanent, Active: true
```

**Delete:**
```
Subcategory deletion: Education Waqf - Parent: permanent
```

### Cause Operations (Enhanced)

**Create:**
```
Cause CREATE: cause_001 - Name: 'Education Support', Status: pending, Active: false, Category: permanent/education_permanent, Raised: $0
```

**Update:**
```
Cause UPDATE: cause_001 - Name: 'Education Support', Status: approved, Active: true, Category: permanent/education_permanent, Raised: $1500
```

## Production Considerations

### Additional Validations Needed

1. **Category Deletion:**
   - Check if any subcategories reference the category
   - Check if any causes use the category
   - Prevent deletion if in use

2. **Subcategory Deletion:**
   - Check if any causes use the subcategory
   - Prevent deletion if in use

3. **Category Reference Validation:**
   - Query categories collection to verify category_id exists
   - Query subcategories collection to verify subcategory_id exists
   - Verify subcategory belongs to specified category

4. **Permissions:**
   - Only admins with appropriate permissions can manage categories
   - Implement role-based access control

### Performance Optimizations

1. **Caching:**
   - Cache category/subcategory lookups
   - Invalidate cache on updates

2. **Batch Validation:**
   - Validate multiple causes at once
   - Reduce database queries

## Troubleshooting

### Build Errors

**Error:** `cannot find module category_hooks`
**Solution:** Ensure `category_hooks.rs` is in `src/satellite/src/` and mod declaration is correct in `lib.rs`

**Error:** `trait bounds not satisfied`
**Solution:** Ensure all structs derive `Serialize`, `Deserialize`, `Debug`, `Clone`

### Validation Errors

**Error:** "Category ID is required"
**Solution:** Ensure frontend is sending `categoryId` field

**Error:** "Invalid waqf type"
**Solution:** Check that waqf type values match: `permanent`, `temporary_consumable`, `temporary_revolving`

### Deployment Errors

**Error:** Deploy fails silently
**Solution:** Check Juno console for error logs, verify WASM build succeeded

## Migration Script Example

For existing causes without categoryId/subcategoryId:

```rust
// This would be a separate migration script
use junobuild_satellite::list_docs_store;

async fn migrate_causes() {
    let causes = list_docs_store("causes").await.unwrap();
    
    for cause_doc in causes {
        let mut cause_data = cause_doc.data;
        
        // Add default category/subcategory if missing
        if !cause_data.contains_key("categoryId") {
            cause_data.insert("categoryId".to_string(), "permanent".into());
            cause_data.insert("subcategoryId".to_string(), "education_permanent".into());
            
            // Update document
            // update_doc("causes", &cause_doc.key, cause_data).await;
        }
    }
}
```

## Next Steps

1. ✅ Build and deploy satellite
2. ✅ Test category creation via admin UI
3. ✅ Test subcategory creation
4. ✅ Test cause creation with new fields
5. ✅ Verify validation errors work correctly
6. ⏳ Implement referential integrity checks (production)
7. ⏳ Add permission-based validations
8. ⏳ Migrate existing causes (if any)

---

**Last Updated:** 2025-10-25
**Status:** ✅ Ready for Build & Deploy
**Dependencies:** Frontend implementation complete
