/**
 * Seed script to populate initial categories and subcategories
 * Run this script once to set up the initial category structure
 * 
 * Usage: npx ts-node src/scripts/seed-categories.ts
 */

import { initJuno } from '@junobuild/core';
import { saveCategory, saveSubcategory } from '@/lib/categories';
import type { Category, Subcategory } from '@/types/waqfs';
import { WaqfType } from '@/types/waqfs';

const categories: Category[] = [
  {
    id: 'permanent',
    name: 'Permanent Waqf',
    description: 'Principal preserved forever, returns distributed perpetually',
    icon: '🏛️',
    color: '#10b981', // green
    isActive: true,
    sortOrder: 1,
    associatedWaqfTypes: [WaqfType.PERMANENT],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'temporary_time_bound',
    name: 'Temporary Consumable Waqf',
    description: 'Principal spent down over defined period',
    icon: '⚡',
    color: '#3b82f6', // blue
    isActive: true,
    sortOrder: 2,
    associatedWaqfTypes: [WaqfType.TEMPORARY_CONSUMABLE],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'temporary_revolving',
    name: 'Revolving Temporary Waqf',
    description: 'Principal returned to donor after period, returns to charity',
    icon: '🔄',
    color: '#a855f7', // purple
    isActive: true,
    sortOrder: 3,
    associatedWaqfTypes: [WaqfType.TEMPORARY_REVOLVING],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const subcategories: Subcategory[] = [
  // PERMANENT WAQF SUBCATEGORIES
  {
    id: 'education_permanent',
    categoryId: 'permanent',
    name: 'Education Waqf',
    description: 'Scholarships, school operations, teacher training',
    icon: '🎓',
    examples: [
      'Endowed scholarship funds',
      'Teacher training programs',
      'Educational institution support'
    ],
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'healthcare_permanent',
    categoryId: 'permanent',
    name: 'Healthcare Waqf',
    description: 'Medical equipment, clinic operations, patient subsidies',
    icon: '🏥',
    examples: [
      'Hospital endowments',
      'Medical equipment funds',
      'Patient care subsidies'
    ],
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'infrastructure_permanent',
    categoryId: 'permanent',
    name: 'Community Infrastructure',
    description: 'Mosques, community centers, clean water projects',
    icon: '🕌',
    examples: [
      'Mosque maintenance',
      'Community center operations',
      'Water project sustainability'
    ],
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'orphan_support_permanent',
    categoryId: 'permanent',
    name: 'Orphan Support Waqf',
    description: 'Long-term orphan care programs',
    icon: '👶',
    examples: [
      'Orphan education funds',
      'Healthcare for orphans',
      'Housing support'
    ],
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'knowledge_permanent',
    categoryId: 'permanent',
    name: 'Knowledge Waqf',
    description: 'Libraries, research centers, Islamic education',
    icon: '📚',
    examples: [
      'Library endowments',
      'Research funding',
      'Islamic scholarship programs'
    ],
    isActive: true,
    sortOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // TEMPORARY CONSUMABLE WAQF SUBCATEGORIES
  {
    id: 'emergency_relief',
    categoryId: 'temporary_time_bound',
    name: 'Emergency Relief',
    description: 'Disaster response, refugee aid (6-12 months)',
    icon: '🚨',
    examples: [
      'Earthquake relief',
      'Flood response',
      'Refugee assistance'
    ],
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seasonal_programs',
    categoryId: 'temporary_time_bound',
    name: 'Seasonal Programs',
    description: 'Ramadan food packages, winter aid (annual cycle)',
    icon: '🌙',
    examples: [
      'Ramadan food distribution',
      'Winter clothing',
      'Eid celebrations'
    ],
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'project_based',
    categoryId: 'temporary_time_bound',
    name: 'Project-Based',
    description: 'Specific building projects, well construction (1-3 years)',
    icon: '🏗️',
    examples: [
      'School construction',
      'Well drilling',
      'Clinic building'
    ],
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'campaign_waqf',
    categoryId: 'temporary_time_bound',
    name: 'Campaign Waqf',
    description: 'Medical surgeries, student sponsorship (defined duration)',
    icon: '🎯',
    examples: [
      'Surgery campaigns',
      'Student sponsorship',
      'Medical treatment'
    ],
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'community_events',
    categoryId: 'temporary_time_bound',
    name: 'Community Events',
    description: 'Eid celebrations, iftar programs (recurring annual)',
    icon: '🎊',
    examples: [
      'Iftar programs',
      'Community iftars',
      'Holiday celebrations'
    ],
    isActive: true,
    sortOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // REVOLVING TEMPORARY WAQF SUBCATEGORIES
  {
    id: 'education_revolving',
    categoryId: 'temporary_revolving',
    name: 'Education Fund',
    description: 'Multi-year scholarship programs',
    icon: '🎓',
    examples: [
      '5-year scholarship programs',
      'Teacher training funds',
      'Educational facility development'
    ],
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'healthcare_revolving',
    categoryId: 'temporary_revolving',
    name: 'Healthcare Investment',
    description: 'Medical facility expansion',
    icon: '🏥',
    examples: [
      'Hospital expansion',
      'Medical equipment pools',
      'Healthcare facility development'
    ],
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'economic_empowerment',
    categoryId: 'temporary_revolving',
    name: 'Economic Empowerment',
    description: 'Microfinance pools, vocational training',
    icon: '💼',
    examples: [
      'Microfinance programs',
      'Vocational training',
      'Small business support'
    ],
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'infrastructure_development',
    categoryId: 'temporary_revolving',
    name: 'Infrastructure Development',
    description: 'Large-scale community projects',
    icon: '🏗️',
    examples: [
      'Community center development',
      'Infrastructure projects',
      'Facility upgrades'
    ],
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'research_innovation',
    categoryId: 'temporary_revolving',
    name: 'Research & Innovation',
    description: 'Islamic finance research, tech development',
    icon: '🔬',
    examples: [
      'Islamic finance research',
      'Technology development',
      'Innovation programs'
    ],
    isActive: true,
    sortOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function seedCategories() {
  console.log('🌱 Starting category seeding...');
  
  try {
    // Initialize Juno
    const satelliteId = process.env.NEXT_PUBLIC_SATELLITE_ID;
    if (!satelliteId) {
      throw new Error('NEXT_PUBLIC_SATELLITE_ID environment variable is not set');
    }
    
    console.log('🔧 Initializing Juno...');
    await initJuno({ satelliteId });
    console.log('✅ Juno initialized\n');
    
    // Seed main categories
    console.log(`📦 Seeding ${categories.length} main categories...`);
    for (const category of categories) {
      await saveCategory(category);
      console.log(`  ✅ Created category: ${category.name}`);
    }
    
    // Seed subcategories
    console.log(`📦 Seeding ${subcategories.length} subcategories...`);
    for (const subcategory of subcategories) {
      await saveSubcategory(subcategory);
      console.log(`  ✅ Created subcategory: ${subcategory.name} (under ${subcategory.categoryId})`);
    }
    
    console.log('✨ Category seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedCategories()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { categories, subcategories, seedCategories };
