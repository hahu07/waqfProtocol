'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HiPlus, HiPencil, HiTrash, HiCheck, HiX } from 'react-icons/hi';
import { 
  getCategories, 
  getCategoriesWithSubcategories, 
  saveCategory, 
  saveSubcategory,
  deleteCategory,
  deleteSubcategory 
} from '@/lib/categories';
import type { Category, Subcategory } from '@/types/waqfs';
import { WaqfType } from '@/types/waqfs';
import { logger } from '@/lib/logger';

export function CategoryManager() {
  const [categoriesData, setCategoriesData] = useState<Array<{
    category: Category;
    subcategories: Subcategory[];
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getCategoriesWithSubcategories();
      setCategoriesData(data);
      setError(null);
    } catch (err) {
      logger.error('Error loading categories', err);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      await saveCategory(category);
      await loadCategories();
      setShowCategoryForm(false);
      setEditingCategory(null);
    } catch (err) {
      logger.error('Error saving category', err);
      alert('Failed to save category');
    }
  };

  const handleSaveSubcategory = async (subcategory: Subcategory) => {
    try {
      await saveSubcategory(subcategory);
      await loadCategories();
      setShowSubcategoryForm(false);
      setEditingSubcategory(null);
      setSelectedCategoryId(null);
    } catch (err) {
      logger.error('Error saving subcategory', err);
      alert('Failed to save subcategory');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will affect all associated causes.')) {
      return;
    }
    
    try {
      await deleteCategory(categoryId);
      await loadCategories();
    } catch (err) {
      logger.error('Error deleting category', err);
      alert('Failed to delete category');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }
    
    try {
      await deleteSubcategory(subcategoryId);
      await loadCategories();
    } catch (err) {
      logger.error('Error deleting subcategory', err);
      alert('Failed to delete subcategory');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Category Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage main categories and subcategories for causes
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setShowCategoryForm(true);
          }}
          className="flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          Add Main Category
        </Button>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Subcategory Form Modal */}
      {showSubcategoryForm && selectedCategoryId && (
        <SubcategoryForm
          subcategory={editingSubcategory}
          categoryId={selectedCategoryId}
          onSave={handleSaveSubcategory}
          onCancel={() => {
            setShowSubcategoryForm(false);
            setEditingSubcategory(null);
            setSelectedCategoryId(null);
          }}
        />
      )}

      {/* Categories List */}
      <div className="space-y-6">
        {categoriesData.map(({ category, subcategories }) => (
          <div 
            key={category.id} 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            {/* Category Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{category.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      category.isActive 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">Sort Order: {category.sortOrder}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingCategory(category);
                    setShowCategoryForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <HiPencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <HiTrash className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Subcategories */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Subcategories ({subcategories.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setEditingSubcategory(null);
                    setShowSubcategoryForm(true);
                  }}
                  className="flex items-center gap-1 text-xs"
                >
                  <HiPlus className="w-3 h-3" />
                  Add Subcategory
                </Button>
              </div>

              {subcategories.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No subcategories yet
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subcategories.map(subcategory => (
                    <div
                      key={subcategory.id}
                      className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-2xl">{subcategory.icon}</span>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {subcategory.name}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {subcategory.description}
                            </p>
                            {subcategory.examples && subcategory.examples.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 dark:text-gray-500">Examples:</p>
                                <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside">
                                  {subcategory.examples.slice(0, 2).map((example, idx) => (
                                    <li key={idx}>{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategoryId(category.id);
                              setEditingSubcategory(subcategory);
                              setShowSubcategoryForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 p-1"
                          >
                            <HiPencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubcategory(subcategory.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <HiTrash className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Category Form Component
function CategoryForm({ 
  category, 
  onSave, 
  onCancel 
}: { 
  category: Category | null; 
  onSave: (category: Category) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Category>(
    category || {
      id: '',
      name: '',
      description: '',
      icon: '📦',
      color: '#3b82f6',
      isActive: true,
      sortOrder: 1,
      associatedWaqfTypes: [WaqfType.PERMANENT],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  // Auto-generate ID from name
  const generateId = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_')        // Replace spaces with underscores
      .replace(/_+/g, '_')         // Replace multiple underscores with single
      .replace(/^_|_$/g, '');      // Remove leading/trailing underscores
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      // Only auto-generate ID if it's a new category (not editing)
      id: category ? prev.id : generateId(name)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {category ? 'Edit Category' : 'Add New Category'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
              placeholder="e.g., Permanent Waqf"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category ID {!category && <span className="text-xs text-gray-500">(auto-generated)</span>}
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
              disabled={!!category}
              placeholder="permanent_waqf"
            />
            {!category && formData.name && (
              <p className="text-xs text-gray-500 mt-1">
                💡 ID is auto-generated from name. You can edit it before saving.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icon (Emoji)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color (Hex)
              </label>
              <input
                type="text"
                value={formData.color || '#3b82f6'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Associated Waqf Types
            </label>
            <div className="space-y-2">
              {Object.values(WaqfType).map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.associatedWaqfTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          associatedWaqfTypes: [...formData.associatedWaqfTypes, type]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          associatedWaqfTypes: formData.associatedWaqfTypes.filter(t => t !== type)
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <HiX className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <HiCheck className="w-4 h-4 mr-2" />
              Save Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subcategory Form Component
function SubcategoryForm({ 
  subcategory, 
  categoryId, 
  onSave, 
  onCancel 
}: { 
  subcategory: Subcategory | null; 
  categoryId: string;
  onSave: (subcategory: Subcategory) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Subcategory>(
    subcategory || {
      id: '',
      categoryId,
      name: '',
      description: '',
      icon: '📌',
      examples: [],
      isActive: true,
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  const [exampleInput, setExampleInput] = useState('');

  // Auto-generate ID from name
  const generateId = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_')        // Replace spaces with underscores
      .replace(/_+/g, '_')         // Replace multiple underscores with single
      .replace(/^_|_$/g, '');      // Remove leading/trailing underscores
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      // Only auto-generate ID if it's a new subcategory (not editing)
      id: subcategory ? prev.id : generateId(name)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString()
    });
  };

  const addExample = () => {
    if (exampleInput.trim()) {
      setFormData({
        ...formData,
        examples: [...formData.examples, exampleInput.trim()]
      });
      setExampleInput('');
    }
  };

  const removeExample = (index: number) => {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {subcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
              placeholder="e.g., Education Waqf"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subcategory ID {!subcategory && <span className="text-xs text-gray-500">(auto-generated)</span>}
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
              disabled={!!subcategory}
              placeholder="education_waqf"
            />
            {!subcategory && formData.name && (
              <p className="text-xs text-gray-500 mt-1">
                💡 ID is auto-generated from name. You can edit it before saving.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icon (Emoji)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.isActive ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Examples
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={exampleInput}
                onChange={(e) => setExampleInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExample())}
                placeholder="Enter an example..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <Button type="button" onClick={addExample} size="sm">
                <HiPlus className="w-4 h-4" />
              </Button>
            </div>
            {formData.examples.length > 0 && (
              <ul className="space-y-1">
                {formData.examples.map((example, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{example}</span>
                    <button
                      type="button"
                      onClick={() => removeExample(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <HiX className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <HiCheck className="w-4 h-4 mr-2" />
              Save Subcategory
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
