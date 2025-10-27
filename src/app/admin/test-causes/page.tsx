'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { testCauses, causeExplanations } from '@/scripts/seed-test-causes';
import { createCause } from '@/lib/cause-utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function SeedTestCausesPage() {
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

    for (const cause of testCauses) {
      try {
        const id = await createCause(cause, user.key, user.key);
        newResults.push({
          success: true,
          message: `✅ Created: ${cause.name} (ID: ${id})`
        });
      } catch (error) {
        newResults.push({
          success: false,
          message: `❌ Failed to create ${cause.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    setResults(newResults);
    setSeeding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🧪 Seed Test Causes
              </h1>
              <p className="text-gray-600">
                Create sample causes to test and understand each waqf type
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {seeding ? '🔄 Seeding...' : '🌱 Seed Test Causes'}
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

        {/* Explanation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(causeExplanations).map(([key, explanation]) => (
            <div
              key={key}
              className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {explanation.title}
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {explanation.description}
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <p className="text-sm font-medium text-blue-900">
                  📊 Example:
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  {explanation.example}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <p className="font-semibold text-gray-900">Key Benefits:</p>
                {explanation.benefits.map((benefit, index) => (
                  <p key={index} className="text-sm text-gray-700">
                    {benefit}
                  </p>
                ))}
              </div>

              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900 mb-2">
                  Dashboard Cards:
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Card 1:</strong> {explanation.dashboard.card1}</p>
                  <p><strong>Card 2:</strong> {explanation.dashboard.card2}</p>
                  <p><strong>Card 3:</strong> {explanation.dashboard.card3}</p>
                  <p><strong>Card 4:</strong> {explanation.dashboard.card4}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Test Causes Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📋 Causes to be Created
          </h2>
          <div className="space-y-4">
            {testCauses.map((cause, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{cause.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {cause.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {cause.description}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                        {cause.supportedWaqfTypes[0]}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        Target: ${cause.targetAmount?.toLocaleString()}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        Impact Score: {cause.impactScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
