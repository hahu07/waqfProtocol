/**
 * Simple browser-executable seed script for consumable waqfs
 * 
 * INSTRUCTIONS:
 * 1. Navigate to your app and login as admin
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire file
 * 4. Press Enter to run
 */

(async function seedConsumableWaqfs() {
  console.log('🌱 Starting to seed consumable waqfs...');
  
  const { setDoc } = await import('https://cdn.jsdelivr.net/npm/@junobuild/core/+esm');
  
  const waqfs = [
    {
      name: 'Emergency Orphan Support Fund',
      description: 'Immediate financial assistance for 50 orphaned children covering food, clothing, and school supplies for 6 months',
      waqfAsset: 15000,
      waqfType: 'temporary_consumable',
      isHybrid: false,
      donor: {
        name: 'Ahmed Al-Rahman',
        email: 'ahmed@example.com',
        phone: '+1-555-0101',
        address: '123 Charity Lane, City, State 12345'
      },
      selectedCauses: ['orphan_support'],
      causeAllocation: { 'orphan_support': 100 },
      waqfAssets: [],
      supportedCauses: [],
      financial: {
        currentBalance: 15000,
        totalReceived: 15000,
        totalDistributed: 0,
        administrativeCosts: 0,
        investmentReturns: 0,
        impactMetrics: {
          beneficiariesSupported: 0,
          projectsCompleted: 0,
          communitiesImpacted: 0,
          successStories: []
        }
      },
      consumableDetails: {
        spendingSchedule: 'phased',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        targetAmount: 15000,
        targetBeneficiaries: 50,
        minimumMonthlyDistribution: 2500
      },
      reportingPreferences: {
        frequency: 'quarterly',
        reportTypes: ['financial', 'impact'],
        deliveryMethod: 'email'
      },
      status: 'inactive',
      isDonated: true,
      notifications: {
        contributionReminders: true,
        impactReports: true,
        financialUpdates: true
      },
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      lastContributionDate: new Date().toISOString()
    },
    {
      name: 'Ramadan Iftar Program 2025',
      description: 'Provide daily iftar meals for 200 fasting families during the blessed month of Ramadan',
      waqfAsset: 8000,
      waqfType: 'temporary_consumable',
      isHybrid: false,
      donor: {
        name: 'Fatima Hassan',
        email: 'fatima@example.com',
        phone: '+1-555-0102',
        address: '456 Blessed Street, City, State 12345'
      },
      selectedCauses: ['ramadan_feeding'],
      causeAllocation: { 'ramadan_feeding': 100 },
      waqfAssets: [],
      supportedCauses: [],
      financial: {
        currentBalance: 8000,
        totalReceived: 8000,
        totalDistributed: 0,
        administrativeCosts: 0,
        investmentReturns: 0,
        impactMetrics: {
          beneficiariesSupported: 0,
          projectsCompleted: 0,
          communitiesImpacted: 0,
          successStories: []
        }
      },
      consumableDetails: {
        spendingSchedule: 'immediate',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        targetAmount: 8000,
        targetBeneficiaries: 200,
        minimumMonthlyDistribution: 8000
      },
      reportingPreferences: {
        frequency: 'quarterly',
        reportTypes: ['financial', 'impact'],
        deliveryMethod: 'email'
      },
      status: 'inactive',
      isDonated: true,
      notifications: {
        contributionReminders: false,
        impactReports: true,
        financialUpdates: true
      },
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      lastContributionDate: new Date().toISOString()
    },
    {
      name: 'Winter Warmth Campaign',
      description: 'Ongoing monthly support providing warm clothing, blankets, and heating assistance to homeless families',
      waqfAsset: 24000,
      waqfType: 'temporary_consumable',
      isHybrid: false,
      donor: {
        name: 'Ibrahim Khalil',
        email: 'ibrahim@example.com',
        phone: '+1-555-0103',
        address: '789 Generosity Ave, City, State 12345'
      },
      selectedCauses: ['homeless_support'],
      causeAllocation: { 'homeless_support': 100 },
      waqfAssets: [],
      supportedCauses: [],
      financial: {
        currentBalance: 24000,
        totalReceived: 24000,
        totalDistributed: 0,
        administrativeCosts: 0,
        investmentReturns: 0,
        impactMetrics: {
          beneficiariesSupported: 0,
          projectsCompleted: 0,
          communitiesImpacted: 0,
          successStories: []
        }
      },
      consumableDetails: {
        spendingSchedule: 'ongoing',
        startDate: new Date().toISOString(),
        targetBeneficiaries: 100,
        minimumMonthlyDistribution: 2000
      },
      reportingPreferences: {
        frequency: 'quarterly',
        reportTypes: ['financial', 'impact'],
        deliveryMethod: 'both'
      },
      status: 'inactive',
      isDonated: true,
      notifications: {
        contributionReminders: true,
        impactReports: true,
        financialUpdates: true
      },
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      lastContributionDate: new Date().toISOString()
    }
  ];
  
  for (let i = 0; i < waqfs.length; i++) {
    const waqf = waqfs[i];
    try {
      await setDoc({
        collection: 'waqfs',
        doc: {
          key: `test-consumable-waqf-${i + 1}-${Date.now()}`,
          data: waqf,
          description: waqf.description
        }
      });
      console.log(`✅ Created waqf: ${waqf.name}`);
    } catch (error) {
      console.error(`❌ Error creating waqf ${waqf.name}:`, error);
    }
  }
  
  console.log('✨ Seeding complete! Refresh the distributions page to see the new waqfs.');
})();
