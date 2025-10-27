# Dynamic Category System Documentation

## Overview

The Waqf Platform now uses a **fully dynamic category system** where main categories and subcategories are stored in the database and managed by administrators. This replaces the previous hardcoded category approach.

## Architecture

### Data Structure

#### Main Categories
Stored in the `categories` collection:
- **ID**: `permanent`, `temporary_time_bound`, `temporary_revolving`
- **Properties**: name, description, icon, color, sort order, active status
- **Waqf Type Association**: Each category is associated with specific waqf types

#### Subcategories
Stored in the `subcategories` collection:
- **ID**: e.g., `education_permanent`, `healthcare_revolving`
- **Properties**: name, description, icon, examples, sort order, active status
- **Parent Reference**: `categoryId` links to main category

#### Causes
Each cause now references both:
- `categoryId` - Main category (e.g., "permanent")
- `subcategoryId` - Subcategory (e.g., "education_permanent")

### Database Collections

```
categories/
├─ permanent
├─ temporary_time_bound
└─ temporary_revolving

subcategories/
├─ education_permanent
├─ healthcare_permanent
├─ emergency_relief
├─ education_revolving
└─ ... (15 total)

causes/
├─ cause_001 (references: categoryId + subcategoryId)
└─ ...
```

## Initial Setup

### 1. Seed Categories

Run the seed script to populate initial categories:

```bash
npx ts-node src/scripts/seed-categories.ts
```

This creates:
- **3 main categories** (Permanent, Temporary Consumable, Temporary Revolving)
- **15 subcategories** (5 per main category)

### 2. Configure Juno Collections

Ensure these collections exist in your Juno satellite:
- `categories` - Main categories
- `subcategories` - Subcategories  
- `causes` - Updated to use categoryId/subcategoryId

## Category Structure

### Permanent Waqf Categories
**Main Category**: `permanent`
- Education Waqf 🎓
- Healthcare Waqf 🏥
- Community Infrastructure 🕌
- Orphan Support Waqf 👶
- Knowledge Waqf 📚

### Temporary Consumable Waqf Categories
**Main Category**: `temporary_time_bound`
- Emergency Relief 🚨
- Seasonal Programs 🌙
- Project-Based 🏗️
- Campaign Waqf 🎯
- Community Events 🎊

### Revolving Temporary Waqf Categories
**Main Category**: `temporary_revolving`
- Education Fund 🎓
- Healthcare Investment 🏥
- Economic Empowerment 💼
- Infrastructure Development 🏗️
- Research & Innovation 🔬

## Admin Usage

### Accessing Category Management

Navigate to: **Admin Dashboard → Settings → Category Management**

### Managing Main Categories

#### Add New Category
1. Click "Add Main Category"
2. Fill in:
   - Category ID (unique, lowercase_with_underscores)
   - Name (display name)
   - Description
   - Icon (emoji)
   - Color (hex code)
   - Sort Order
   - Associated Waqf Types
3. Click "Save Category"

#### Edit Category
1. Click pencil icon on category card
2. Update fields
3. Save changes

#### Delete Category
⚠️ **Warning**: Deleting a category affects all associated causes
1. Click trash icon
2. Confirm deletion

### Managing Subcategories

#### Add Subcategory
1. Find the main category
2. Click "Add Subcategory" button
3. Fill in:
   - Subcategory ID
   - Name
   - Description
   - Icon
   - Examples (add multiple)
   - Sort Order
   - Status
4. Save

#### Edit/Delete Subcategory
Similar to category management, use pencil/trash icons

### Creating Causes with Dynamic Categories

When creating a cause (in Cause Manager):
1. Select **Main Category** dropdown (fetches from `categories` collection)
2. Select **Subcategory** dropdown (cascades based on main category)
3. Rest of cause details remain the same

## API/Service Methods

### Category Service (`src/lib/categories.ts`)

```typescript
// Fetch all categories
getCategories(): Promise<Category[]>

// Fetch single category
getCategoryById(categoryId: string): Promise<Category | null>

// Fetch subcategories for a category
getSubcategoriesByCategoryId(categoryId: string): Promise<Subcategory[]>

// Fetch all subcategories
getAllSubcategories(): Promise<Subcategory[]>

// Save category
saveCategory(category: Category): Promise<void>

// Save subcategory
saveSubcategory(subcategory: Subcategory): Promise<void>

// Delete category
deleteCategory(categoryId: string): Promise<void>

// Delete subcategory
deleteSubcategory(subcategoryId: string): Promise<void>

// Get categories with subcategories grouped
getCategoriesWithSubcategories(): Promise<Array<{
  category: Category;
  subcategories: Subcategory[];
}>>
```

## Migration Guide

### Migrating Existing Causes

Existing causes use the legacy `category` string field. To migrate:

#### Option 1: Automatic Migration (Recommended)
Create a migration script that:
1. Reads all existing causes
2. Maps legacy category to new categoryId/subcategoryId using `LEGACY_CATEGORY_MAPPING`
3. Updates each cause document

#### Option 2: Manual Update
Admin manually edits each cause and selects new categories

### Example Migration Script

```typescript
import { listDocs, setDoc } from '@junobuild/core';
import type { Cause } from '@/types/waqfs';

// Legacy mapping (adjust based on your needs)
const legacyMap: Record<string, { categoryId: string; subcategoryId: string }> = {
  'education': { categoryId: 'permanent', subcategoryId: 'education_permanent' },
  'healthcare': { categoryId: 'permanent', subcategoryId: 'healthcare_permanent' },
  'disaster_relief': { categoryId: 'temporary_time_bound', subcategoryId: 'emergency_relief' },
  // ... add more mappings
};

async function migrateCauses() {
  const causes = await listDocs<Cause>({ collection: 'causes', filter: {} });
  
  for (const causeDoc of causes.items) {
    const cause = causeDoc.data;
    const legacy = cause.category;
    
    if (legacy && legacyMap[legacy]) {
      const { categoryId, subcategoryId } = legacyMap[legacy];
      
      await setDoc({
        collection: 'causes',
        doc: {
          key: cause.id,
          data: {
            ...cause,
            categoryId,
            subcategoryId,
            // Keep legacy field for compatibility
            category: legacy
          }
        }
      });
      
      console.log(`✅ Migrated cause: ${cause.name}`);
    }
  }
}
```

## Frontend Integration

### Cause Form Modal

The cause form now includes cascading category dropdowns:

1. **Main Category Dropdown**
   - Fetches from `categories` collection
   - Shows active categories only
   - Sorted by sort order

2. **Subcategory Dropdown**
   - Dynamically loads based on selected main category
   - Filtered by `categoryId`
   - Shows icon + name

### Cause Selection Modal

Enhanced filtering:
- Filter by main category
- Filter by subcategory
- Filter by waqf type (existing)
- Combined filters work together

## Backward Compatibility

The system maintains backward compatibility:

- `Cause.category` field is marked `@deprecated` but retained
- Existing code referencing `cause.category` will still work
- New code should use `cause.categoryId` and `cause.subcategoryId`
- Migration can be done gradually

## Best Practices

### Adding New Categories

1. **Think strategically**: Only add categories that serve clear user needs
2. **Use clear naming**: Names should be self-explanatory
3. **Choose appropriate icons**: Emojis that represent the category well
4. **Set correct waqf type associations**: Match category purpose with waqf type
5. **Order matters**: Use sort order to prioritize important categories

### Managing Subcategories

1. **Group logically**: Subcategories should clearly belong to their parent
2. **Provide examples**: Help users understand what fits in each subcategory
3. **Avoid duplication**: Don't create overlapping subcategories
4. **Keep active**: Only activate subcategories that are ready for use

### Performance Considerations

- Categories/subcategories are cached in memory
- Re-fetch only when admin makes changes
- Use efficient queries with filters
- Consider implementing pagination if subcategories exceed 50+

## Troubleshooting

### Categories Not Showing
- Check if categories collection exists in Juno
- Verify categories have `isActive: true`
- Check browser console for errors

### Cascading Dropdown Not Working
- Ensure subcategories have correct `categoryId`
- Verify subcategories are active
- Check network tab for failed API calls

### Migration Issues
- Verify legacy mapping covers all old categories
- Check cause documents have required fields
- Ensure no orphaned category references

## Future Enhancements

Potential improvements:
1. **Category Analytics**: Track most popular categories
2. **Category Images**: Support for cover images beyond emojis
3. **Multi-language Support**: Translate category names/descriptions
4. **Category Permissions**: Restrict certain categories to specific admin roles
5. **Category Templates**: Pre-configured category sets for different regions
6. **AI-Powered Categorization**: Auto-suggest categories for new causes

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Juno console logs
3. Contact platform administrators
4. Refer to Juno documentation for collection management

---

**Last Updated**: {{ current_date }}
**Version**: 1.0.0
