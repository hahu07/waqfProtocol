'use client';

import { useState } from 'react';
import { listCauses, updateCause } from '@/lib/cause-utils';
import { WaqfType } from '@/types/waqfs';
import { useAuth } from '@/components/auth/AuthProvider';
import { getCategories, getAllSubcategories } from '@/lib/categories';

export default function MigrateCausesPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('');
  const [isMigrating, setIsMigrating] = useState(false);

  const migrateCauses = async () => {
    setIsMigrating(true);
    setStatus('🔍 Loading all causes...\n');

    try {
      const allCauses = await listCauses();
      setStatus(prev => prev + `Found ${allCauses.length} causes\n`);

      // Load categories and subcategories
      setStatus(prev => prev + '📂 Loading categories...\n');
      const categories = await getCategories();
      const subcategories = await getAllSubcategories();
      
      if (categories.length === 0) {
        setStatus(prev => prev + '\n❌ Error: No categories found. Please create categories first.\n');
        setIsMigrating(false);
        return;
      }

      // Use first category and its first subcategory as defaults
      const defaultCategory = categories[0];
      const defaultSubcategory = subcategories.find(s => s.categoryId === defaultCategory.id) || subcategories[0];
      
      setStatus(prev => prev + `📌 Default category: ${defaultCategory.name}\n`);
      if (defaultSubcategory) {
        setStatus(prev => prev + `📌 Default subcategory: ${defaultSubcategory.name}\n\n`);
      } else {
        setStatus(prev => prev + '⚠️  No subcategories found\n\n');
      }

      let migratedCount = 0;
      let skippedCount = 0;

      for (const cause of allCauses) {
        // Log raw field values for debugging
        console.log(`Checking cause: ${cause.name}`, {
          categoryId: cause.categoryId,
          subcategoryId: cause.subcategoryId,
          supportedWaqfTypes: cause.supportedWaqfTypes,
          categoryIdType: typeof cause.categoryId,
          subcategoryIdType: typeof cause.subcategoryId
        });
        
        const needsWaqfTypes = !cause.supportedWaqfTypes || cause.supportedWaqfTypes.length === 0;
        const needsCategoryId = !cause.categoryId || cause.categoryId === '';
        const needsSubcategoryId = !cause.subcategoryId || cause.subcategoryId === '';
        
        console.log(`Needs check for ${cause.name}:`, {
          needsWaqfTypes,
          needsCategoryId,
          needsSubcategoryId
        });

        // Check if cause needs any migration
        if (!needsWaqfTypes && !needsCategoryId && !needsSubcategoryId) {
          setStatus(prev => prev + `⏭️  Skipped: ${cause.name} (already migrated)\n`);
          skippedCount++;
          continue;
        }
        
        // Log what needs updating
        const missingFields = [];
        if (needsWaqfTypes) missingFields.push('waqfTypes');
        if (needsCategoryId) missingFields.push('categoryId');
        if (needsSubcategoryId) missingFields.push('subcategoryId');
        setStatus(prev => prev + `🔎 ${cause.name} needs: ${missingFields.join(', ')}\n`);

        // Build updates object
        const updates: Partial<typeof cause> = { ...cause };
        const changes: string[] = [];

        if (needsWaqfTypes) {
          updates.supportedWaqfTypes = [
            WaqfType.PERMANENT,
            WaqfType.TEMPORARY_CONSUMABLE,
            WaqfType.TEMPORARY_REVOLVING
          ];
          changes.push('waqf types');
        }

        if (needsCategoryId) {
          updates.categoryId = defaultCategory.id;
          changes.push('categoryId');
        }

        if (needsSubcategoryId && defaultSubcategory) {
          updates.subcategoryId = defaultSubcategory.id;
          changes.push('subcategoryId');
        }

        await updateCause(cause.id, updates, user?.key, 'Admin Migration');
        setStatus(prev => prev + `✅ Migrated: ${cause.name} (added ${changes.join(', ')})\n`);
        migratedCount++;

        // Add small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setStatus(prev => prev + `\n🎉 Migration complete!\n`);
      setStatus(prev => prev + `   Migrated: ${migratedCount}\n`);
      setStatus(prev => prev + `   Skipped: ${skippedCount}\n`);
      setStatus(prev => prev + `   Total: ${allCauses.length}\n`);

    } catch (error) {
      setStatus(prev => prev + `\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">🔧 Migrate Causes</h1>
          <p className="text-blue-100">Add missing fields to existing causes</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-900 mb-2">What this does:</h3>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>Finds all causes missing <code className="bg-amber-100 px-1 rounded">supportedWaqfTypes</code></li>
                  <li>Finds all causes missing <code className="bg-amber-100 px-1 rounded">categoryId</code> or <code className="bg-amber-100 px-1 rounded">subcategoryId</code></li>
                  <li>Adds all three waqf types (Permanent, Consumable, Revolving) as default</li>
                  <li>Assigns first available category/subcategory to causes without them</li>
                  <li>Safe to run multiple times - skips already migrated causes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-center">
            <button
              onClick={migrateCauses}
              disabled={isMigrating}
              className={`px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all ${
                isMigrating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105'
              }`}
            >
              {isMigrating ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Migrating...
                </span>
              ) : (
                '🚀 Run Migration'
              )}
            </button>
          </div>

          {/* Status Output */}
          {status && (
            <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm">
              <div className="text-green-400 whitespace-pre-wrap">{status}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
