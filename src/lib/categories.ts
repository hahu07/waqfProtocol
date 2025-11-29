import { listDocs, setDoc, deleteDoc } from '@junobuild/core';
import type { Category, CategoryDoc, Subcategory, SubcategoryDoc } from '@/types/waqfs';
import { logger } from './logger';

/**
 * Fetch all categories from the database
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const docs = await listDocs<Category>({
      collection: 'categories',
      filter: {}
    });
    
    const categories = docs.items
      .map(doc => doc.data)
      .filter(cat => cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    
    logger.info(`Fetched ${categories.length} active categories`);
    return categories;
  } catch (error) {
    logger.error('Error fetching categories', error);
    console.error('Categories fetch error:', error);
    // Return empty array instead of throwing to prevent breaking the UI
    return [];
  }
}

/**
 * Fetch a single category by ID
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  try {
    const docs = await listDocs<Category>({
      collection: 'categories',
      filter: {}
    });
    
    const categoryDoc = docs.items.find(doc => doc.data.id === categoryId);
    return categoryDoc ? categoryDoc.data : null;
  } catch (error) {
    logger.error('Error fetching category by ID', error);
    return null;
  }
}

/**
 * Fetch all subcategories for a specific category
 */
export async function getSubcategoriesByCategoryId(categoryId: string): Promise<Subcategory[]> {
  try {
    const docs = await listDocs<Subcategory>({
      collection: 'subcategories',
      filter: {}
    });
    
    const subcategories = docs.items
      .map(doc => doc.data)
      .filter(sub => sub.categoryId === categoryId && sub.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    
    logger.info(`Fetched ${subcategories.length} active subcategories for category ${categoryId}`);
    return subcategories;
  } catch (error) {
    logger.error('Error fetching subcategories', error);
    console.error('Subcategories fetch error:', error);
    // Return empty array instead of throwing to prevent breaking the UI
    return [];
  }
}

/**
 * Fetch all subcategories (regardless of category)
 */
export async function getAllSubcategories(): Promise<Subcategory[]> {
  try {
    const docs = await listDocs<Subcategory>({
      collection: 'subcategories',
      filter: {}
    });
    
    return docs.items
      .map(doc => doc.data)
      .filter(sub => sub.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    logger.error('Error fetching all subcategories', error);
    throw new Error('Failed to fetch subcategories');
  }
}

/**
 * Fetch a single subcategory by ID
 */
export async function getSubcategoryById(subcategoryId: string): Promise<Subcategory | null> {
  try {
    const docs = await listDocs<Subcategory>({
      collection: 'subcategories',
      filter: {}
    });
    
    const subcategoryDoc = docs.items.find(doc => doc.data.id === subcategoryId);
    return subcategoryDoc ? subcategoryDoc.data : null;
  } catch (error) {
    logger.error('Error fetching subcategory by ID', error);
    return null;
  }
}

/**
 * Create or update a category
 */
export async function saveCategory(category: Category): Promise<void> {
  try {
    await setDoc({
      collection: 'categories',
      doc: {
        key: category.id,
        data: category
      }
    });
    logger.info('Category saved successfully', { categoryId: category.id });
  } catch (error) {
    logger.error('Error saving category', error);
    throw new Error('Failed to save category');
  }
}

/**
 * Create or update a subcategory
 */
export async function saveSubcategory(subcategory: Subcategory): Promise<void> {
  try {
    await setDoc({
      collection: 'subcategories',
      doc: {
        key: subcategory.id,
        data: subcategory
      }
    });
    logger.info('Subcategory saved successfully', { subcategoryId: subcategory.id });
  } catch (error) {
    logger.error('Error saving subcategory', error);
    throw new Error('Failed to save subcategory');
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    await deleteDoc({
      collection: 'categories',
      doc: {
        key: categoryId
      }
    });
    logger.info('Category deleted successfully', { categoryId });
  } catch (error) {
    logger.error('Error deleting category', error);
    throw new Error('Failed to delete category');
  }
}

/**
 * Delete a subcategory
 */
export async function deleteSubcategory(subcategoryId: string): Promise<void> {
  try {
    await deleteDoc({
      collection: 'subcategories',
      doc: {
        key: subcategoryId
      }
    });
    logger.info('Subcategory deleted successfully', { subcategoryId });
  } catch (error) {
    logger.error('Error deleting subcategory', error);
    throw new Error('Failed to delete subcategory');
  }
}

/**
 * Get categories with their subcategories grouped
 */
export async function getCategoriesWithSubcategories(): Promise<Array<{
  category: Category;
  subcategories: Subcategory[];
}>> {
  try {
    const categories = await getCategories();
    const allSubcategories = await getAllSubcategories();
    
    return categories.map(category => ({
      category,
      subcategories: allSubcategories.filter(sub => sub.categoryId === category.id)
    }));
  } catch (error) {
    logger.error('Error fetching categories with subcategories', error);
    throw new Error('Failed to fetch categories with subcategories');
  }
}
