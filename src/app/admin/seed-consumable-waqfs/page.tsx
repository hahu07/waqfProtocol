'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { testConsumableWaqfs } from '@/scripts/seed-consumable-waqfs';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createWaqf } from '@/lib/waqf-utils';

export default function SeedConsumableWaqfsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);
  const [results, setResults] = useState<{ success: boolean; message: string }[]>([]);

  const handleSeed = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    setSeeding(true);
    setResults([]);
    const newResults: { success: boolean; message: string }[] = [];

    for (let i = 0; i < testConsumableWaqfs.length; i++) {
      const waqf = testConsumableWaqfs[i];
      try {
        // Use createWaqf which properly transforms data to backend format
        await createWaqf(waqf, user.key, user.key);
        newResults.push({
          success: true,
          message: `✅ Created: ${waqf.name}`
        });
      } catch (error) {
        newResults.push({
          success: false,
          message: `❌ Failed to create ${waqf.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    setResults(newResults);
    setSeeding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🧪 Seed Test Consumable Waqfs
              </h1>
              <p className="text-gray-600">
                Create sample consumable waqfs to test distribution management
              </p>
            </div>
            <Button
              onClick={() => router.push('/admin')}
              variant="outline"
            >
              ← Back to Admin
            </Button>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSeed}
              disabled={seeding}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {seeding ? '🔄 Seeding...' : '🌱 Seed Consumable Waqfs'}
            </Button>
            <Button
              onClick={() => router.push('/admin/distributions')}
              variant="outline"
            >
              View Distributions →
            </Button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="font-semibold text-gray-900 mb-3">Results:</h3>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    result.success
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {result.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Waqfs Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📋 Waqfs to be Created
          </h2>
          <div className="space-y-4">
            {testConsumableWaqfs.map((waqf, index) => {
              // Type-safe access to backend format data
              type BackendWaqf = Record<string, unknown> & {
                waqf_asset?: number;
                waqf_type?: string;
                consumable_details?: {
                  spending_schedule?: string;
                  minimum_monthly_distribution?: number;
                  target_beneficiaries?: number;
                };
              };
              const backendWaqf = waqf as BackendWaqf;
              const waqfAsset = backendWaqf.waqf_asset ?? 0;
              const waqfType = backendWaqf.waqf_type ?? 'unknown';
              const spendingSchedule = backendWaqf.consumable_details?.spending_schedule ?? 'unknown';
              const monthlyDistribution = backendWaqf.consumable_details?.minimum_monthly_distribution ?? 0;
              const targetBeneficiaries = backendWaqf.consumable_details?.target_beneficiaries ?? 0;

              return (
              <div
                key={index}
                className="border-2 border-blue-100 rounded-xl p-6 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">💸</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900">
                      {waqf.name}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {waqf.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-green-600 font-medium">Asset</p>
                        <p className="text-lg font-bold text-green-900">
                          ${waqfAsset.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium">Schedule</p>
                        <p className="text-sm font-semibold text-blue-900 capitalize">
                          {spendingSchedule}
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-600 font-medium">Monthly</p>
                        <p className="text-lg font-bold text-purple-900">
                          ${monthlyDistribution.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-xs text-orange-600 font-medium">Beneficiaries</p>
                        <p className="text-lg font-bold text-orange-900">
                          {targetBeneficiaries}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {waqfType}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Status: {waqf.status}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        Donor: {waqf.donor.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
          <h3 className="font-bold text-blue-900 mb-2">ℹ️ About This Seed Data</h3>
          <p className="text-blue-800 text-sm leading-relaxed">
            These test waqfs are designed to demonstrate the distribution management system. 
            Each waqf has different spending schedules (immediate, phased, ongoing) to showcase 
            various distribution patterns. After seeding, visit the <strong>Distributions</strong> page 
            to manage and execute monthly distributions.
          </p>
        </div>
      </div>
    </div>
  );
}
