'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { calculatePortfolioStats, calculateImpactProjection } from '@/lib/portfolio-utils';
import type { Portfolio } from '@/types/portfolio';
import { WaqfType } from '@/types/waqfs';

export default function PreviewImpactPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load portfolio from session storage
  useEffect(() => {
    try {
      const savedPortfolio = sessionStorage.getItem('portfolio');
      if (savedPortfolio) {
        const parsed = JSON.parse(savedPortfolio) as Portfolio;
        setPortfolio(parsed);
        setLoadError(null);
      } else {
        setLoadError('No portfolio found');
        setTimeout(() => router.push('/waqf/build-portfolio'), 2000);
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setLoadError('Failed to load portfolio. Please try again.');
      setTimeout(() => router.push('/waqf/build-portfolio'), 2000);
    }
  }, [router]);

  // Calculate stats and projections
  const stats = useMemo(() => {
    if (!portfolio) return null;
    return calculatePortfolioStats(portfolio);
  }, [portfolio]);

  const projection = useMemo(() => {
    if (!portfolio) return null;
    return calculateImpactProjection(portfolio);
  }, [portfolio]);

  // Calculate weighted amounts for each cause in Balanced mode
  const causeAmounts = useMemo(() => {
    if (!portfolio) return [];
    
    if (portfolio.allocationMode === 'balanced' && portfolio.globalAllocation) {
      // Calculate weights based on supported types
      let totalWeight = 0;
      const weights = portfolio.items.map(item => {
        const weight = 
          (item.allocation.permanent > 0 ? portfolio.globalAllocation!.permanent : 0) +
          (item.allocation.temporary_consumable > 0 ? portfolio.globalAllocation!.temporary_consumable : 0) +
          (item.allocation.temporary_revolving > 0 ? portfolio.globalAllocation!.temporary_revolving : 0);
        totalWeight += weight;
        return weight;
      });
      
      // Return weighted amounts
      return portfolio.items.map((item, index) => {
        return totalWeight > 0 ? (portfolio.totalAmount * weights[index]) / totalWeight : item.totalAmount;
      });
    } else if (portfolio.allocationMode === 'advanced') {
      // Advanced mode uses portfolio percentages
      return portfolio.items.map(item => {
        return (typeof item.portfolioPercentage === 'number' && item.portfolioPercentage > 0)
          ? (portfolio.totalAmount * item.portfolioPercentage) / 100
          : item.totalAmount;
      });
    } else {
      // Simple mode uses direct amounts
      return portfolio.items.map(item => item.totalAmount);
    }
  }, [portfolio]);

  if (!portfolio || !stats || !projection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {loadError ? (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-gray-900 font-semibold text-lg mb-2">{loadError}</p>
              <p className="text-gray-600 text-sm">Redirecting you back...</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-600">Loading preview...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    // Navigate to donor details page
    router.push('/waqf/donor-details');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-2xl shadow-lg">
                📊
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                  Preview Your Impact
                </h1>
                <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">3</span>
                  See your projected charitable impact
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/waqf/design-allocation')}
              variant="outline"
              className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
            >
              ← Back
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8 lg:py-10 space-y-8">
        {/* Portfolio Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Portfolio Summary</h2>
            <p className="text-sm text-gray-600">Overview of your charitable portfolio allocation</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Amount */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200">
                <div className="text-sm font-semibold text-gray-500 mb-2">Total Portfolio</div>
                <div className="text-3xl font-black text-gray-900">${stats.totalAmount.toLocaleString()}</div>
              </div>

              {/* Causes Count */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border-2 border-blue-200">
                <div className="text-sm font-semibold text-gray-500 mb-2">Causes Supported</div>
                <div className="text-3xl font-black text-blue-600">{stats.causeCount}</div>
              </div>

              {/* Diversity Score */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border-2 border-green-200">
                <div className="text-sm font-semibold text-gray-500 mb-2">Diversity Score</div>
                <div className="text-3xl font-black text-green-600">{Math.round(stats.diversificationScore)}/100</div>
              </div>
            </div>

            {/* Allocation Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Waqf Type Allocation</h3>
              
              {/* Permanent */}
              {stats.permanentPercentage > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🏛️</div>
                      <div>
                        <div className="font-semibold text-gray-900">Permanent Waqf</div>
                        <div className="text-xs text-gray-600">${stats.permanentAmount.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-blue-600">{Math.round(stats.permanentPercentage)}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                      style={{ width: `${stats.permanentPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Consumable */}
              {stats.consumablePercentage > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🎁</div>
                      <div>
                        <div className="font-semibold text-gray-900">Consumable Waqf</div>
                        <div className="text-xs text-gray-600">${stats.consumableAmount.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-green-600">{Math.round(stats.consumablePercentage)}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                      style={{ width: `${stats.consumablePercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Revolving */}
              {stats.revolvingPercentage > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🔄</div>
                      <div>
                        <div className="font-semibold text-gray-900">Revolving Waqf</div>
                        <div className="text-xs text-gray-600">${stats.revolvingAmount.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-purple-600">{Math.round(stats.revolvingPercentage)}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                      style={{ width: `${stats.revolvingPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Impact Projection Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🌟 Projected Impact</h2>
            <p className="text-sm text-gray-600">Estimated beneficiaries your portfolio will help over time</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Year 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border-2 border-blue-200 text-center">
                <div className="text-4xl mb-3">1️⃣</div>
                <div className="text-sm font-semibold text-gray-500 mb-2">Year 1</div>
                <div className="text-3xl font-black text-blue-600 mb-2">
                  {projection.year1Beneficiaries.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">people helped</div>
              </div>

              {/* Year 5 */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border-2 border-green-200 text-center">
                <div className="text-4xl mb-3">5️⃣</div>
                <div className="text-sm font-semibold text-gray-500 mb-2">Year 5</div>
                <div className="text-3xl font-black text-green-600 mb-2">
                  {projection.year5Beneficiaries.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">cumulative</div>
              </div>

              {/* Year 10 */}
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border-2 border-purple-200 text-center">
                <div className="text-4xl mb-3">🔟</div>
                <div className="text-sm font-semibold text-gray-500 mb-2">Year 10</div>
                <div className="text-3xl font-black text-purple-600 mb-2">
                  {projection.year10Beneficiaries.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">cumulative</div>
              </div>

              {/* Lifetime */}
              <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-6 border-2 border-orange-200 text-center">
                <div className="text-4xl mb-3">♾️</div>
                <div className="text-sm font-semibold text-gray-500 mb-2">Lifetime</div>
                <div className="text-3xl font-black text-orange-600 mb-2">
                  {projection.lifetimeBeneficiaries.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">total impact</div>
              </div>
            </div>

            {/* Additional Info */}
            {projection.annualBeneficiariesAfter10Years > 0 && (
              <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">💫</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Perpetual Impact</h4>
                    <p className="text-sm text-gray-700">
                      After year 10, your permanent waqf will continue helping approximately{' '}
                      <strong className="text-blue-600">{projection.annualBeneficiariesAfter10Years.toLocaleString()}</strong>{' '}
                      beneficiaries every year, forever.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Causes Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Your Selected Causes</h2>
            <p className="text-sm text-gray-600">How your funds will be distributed</p>
          </div>
          
          <div className="p-8 space-y-4">
            {portfolio.items.map((item, index) => (
              <div key={item.cause.id} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{item.cause.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{item.cause.name}</h3>
                    <p className="text-sm text-gray-600">Amount: ${Math.round(causeAmounts[index] || item.totalAmount).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {item.allocation.permanent > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏛️</span>
                      <span className="font-semibold text-blue-600">{Math.round(item.allocation.permanent)}%</span>
                    </div>
                  )}
                  {item.allocation.temporary_consumable > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎁</span>
                      <span className="font-semibold text-green-600">{Math.round(item.allocation.temporary_consumable)}%</span>
                    </div>
                  )}
                  {item.allocation.temporary_revolving > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔄</span>
                      <span className="font-semibold text-purple-600">{Math.round(item.allocation.temporary_revolving)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => router.push('/waqf/design-allocation')}
            variant="outline"
            className="border-2 border-gray-300 hover:border-gray-400"
          >
            ← Back to Allocation
          </Button>
          <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 shadow-lg shadow-green-500/30 hover:shadow-xl"
          >
            Confirm & Continue →
          </Button>
        </div>
      </div>
    </div>
  );
}
