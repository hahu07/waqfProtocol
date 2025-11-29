'use client';

import { useMemo, useState } from 'react';
import type { WaqfProfile } from '@/types/waqfs';
import { Button } from '@/components/ui/button';
import { calculateDiversificationScore } from '@/lib/portfolio-templates';
import { TrancheMaturityActions } from './TrancheMaturityActions';

interface PortfolioWaqfDashboardProps {
  profile: WaqfProfile;
  onAddFunds?: () => void;
  onViewDetails?: () => void;
}

export function PortfolioWaqfDashboard({ profile, onAddFunds, onViewDetails }: PortfolioWaqfDashboardProps) {
  const [showMaturityActions, setShowMaturityActions] = useState(false);
  
  // Currency formatting helpers
  const formatNGN = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  const formatUSD = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  const convertToUSD = (amountNGN: number, exchangeRate: number = 1650) => amountNGN / exchangeRate;

  // Calculate portfolio stats
  const portfolioStats = useMemo(() => {
    const causes = profile.supportedCauses || [];
    const totalCauses = causes.length;
    
    // Use actual cause allocations from financial tracking
    const causeAllocations = profile.financial.causeAllocations || {};
    const portfolioTotal = profile.financial?.currentBalance || profile.waqfAsset;

    // 1) Base breakdown from waqf type / hybrid allocations
    let basePermanentAmount = 0;
    let baseConsumableAmount = 0;
    let baseRevolvingAmount = 0;

    if (profile.isHybrid && profile.hybridAllocations && profile.hybridAllocations.length > 0) {
      // Hybrid: derive amounts from per-cause hybrid allocations
      profile.hybridAllocations.forEach(allocation => {
        const actualCauseAmount = causeAllocations[allocation.causeId] || 0;
        const allocs = allocation.allocations as any;

        const permanentPct = allocs.Permanent ?? allocs.permanent ?? 0;
        const consumablePct = allocs.TemporaryConsumable ?? allocs.temporary_consumable ?? 0;
        const revolvingPct = allocs.TemporaryRevolving ?? allocs.temporary_revolving ?? 0;

        basePermanentAmount += (actualCauseAmount * permanentPct) / 100;
        baseConsumableAmount += (actualCauseAmount * consumablePct) / 100;
        baseRevolvingAmount += (actualCauseAmount * revolvingPct) / 100;
      });
    } else {
      // Non-hybrid or missing hybrid allocations: treat as single-type waqf
      const amount = profile.financial.currentBalance;
      const waqfType = typeof profile.waqfType === 'string' ? profile.waqfType : '';
      
      if (waqfType === 'Permanent' || waqfType === 'permanent') {
        basePermanentAmount = amount;
      } else if (waqfType === 'TemporaryConsumable' || waqfType === 'temporary_consumable') {
        baseConsumableAmount = amount;
      } else if (waqfType === 'TemporaryRevolving' || waqfType === 'temporary_revolving') {
        baseRevolvingAmount = amount;
      }
    }

    // 2) Fallback for legacy hybrid waqfs where hybridAllocations don't encode revolving slice
    let permanentAmount = basePermanentAmount;
    let consumableAmount = baseConsumableAmount;
    let revolvingAmount = baseRevolvingAmount;

    const hasRevolvingTranches =
      profile.revolvingDetails?.contributionTranches &&
      profile.revolvingDetails.contributionTranches.length > 0;

    if (
      profile.isHybrid &&
      hasRevolvingTranches &&
      revolvingAmount === 0 &&
      portfolioTotal > 0
    ) {
      const totalRevolvingPrincipal =
        profile.revolvingDetails!.contributionTranches!.reduce(
          (sum, tranche) => sum + tranche.amount,
          0
        );

      if (totalRevolvingPrincipal > 0 && profile.waqfAsset > 0) {
        const revolvingRatio = Math.min(1, totalRevolvingPrincipal / profile.waqfAsset);
        revolvingAmount = portfolioTotal * revolvingRatio;

        const remaining = Math.max(0, portfolioTotal - revolvingAmount);
        const baseNonRevolving = basePermanentAmount + baseConsumableAmount;

        if (baseNonRevolving > 0) {
          const permShare = basePermanentAmount / baseNonRevolving;
          const consShare = baseConsumableAmount / baseNonRevolving;
          permanentAmount = remaining * permShare;
          consumableAmount = remaining * consShare;
        } else {
          // If we have no prior breakdown, treat all remaining as consumable
          permanentAmount = 0;
          consumableAmount = remaining;
        }
      }
    }
    
    const total = permanentAmount + consumableAmount + revolvingAmount || portfolioTotal;
    
    // Calculate diversity score using actual cause allocations
    const diversityScore = causes.length > 0 
      ? calculateDiversificationScore(causes.map(c => ({ 
          id: c.id, 
          categoryId: c.categoryId,
          amount: causeAllocations[c.id] || 0
        }))) 
      : 0;
    
    // Ensure valid number (handle NaN)
    const validDiversityScore = isNaN(diversityScore) ? 0 : diversityScore;
    
    return {
      totalCauses,
      permanentAmount,
      consumableAmount,
      revolvingAmount,
      permanentPercentage: total > 0 ? (permanentAmount / total) * 100 : 0,
      consumablePercentage: total > 0 ? (consumableAmount / total) * 100 : 0,
      revolvingPercentage: total > 0 ? (revolvingAmount / total) * 100 : 0,
      diversityScore: validDiversityScore,
      totalAmount: portfolioTotal,
    };
  }, [profile]);

  const waqfTypeLabel = useMemo(() => {
    if (profile.isHybrid) return 'Hybrid Portfolio';
    const type = typeof profile.waqfType === 'string' ? profile.waqfType : '';
    if (type === 'Permanent' || type === 'permanent') return 'Permanent Waqf';
    if (type === 'TemporaryConsumable' || type === 'temporary_consumable') return 'Consumable Waqf';
    if (type === 'TemporaryRevolving' || type === 'temporary_revolving') return 'Revolving Waqf';
    return 'Waqf Portfolio';
  }, [profile.waqfType, profile.isHybrid]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl border-2 border-blue-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
                🏛️
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">{profile.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-1 rounded-full bg-white text-sm font-semibold text-blue-600 shadow-sm">
                    {waqfTypeLabel}
                  </span>
                  {profile.isHybrid && (
                    <span className="px-3 py-1 rounded-full bg-white text-sm font-semibold text-purple-600 shadow-sm">
                      Multi-Type
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed max-w-2xl">
              {profile.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            {onAddFunds && (
              <Button
                onClick={onAddFunds}
                className="px-6 py-3 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                💰 Add Funds
              </Button>
            )}
            {onViewDetails && (
              <Button
                onClick={onViewDetails}
                variant="outline"
                className="px-6 py-3 text-lg font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                📊 View Details
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💎</span>
            <p className="text-sm font-semibold text-gray-600">Portfolio Value</p>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {formatNGN(portfolioStats.totalAmount)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ≈ {formatUSD(convertToUSD(portfolioStats.totalAmount))}
          </p>
        </div>

        {/* Causes Supported */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🎯</span>
            <p className="text-sm font-semibold text-gray-600">Causes Supported</p>
          </div>
          <p className="text-3xl font-black text-green-600">{portfolioStats.totalCauses}</p>
        </div>

        {/* Diversity Score */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🌈</span>
            <p className="text-sm font-semibold text-gray-600">Diversity Score</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-purple-600">
              {Math.round(portfolioStats.diversityScore)}
            </p>
            <span className="text-lg text-gray-500">/100</span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">✨</span>
            <p className="text-sm font-semibold text-gray-600">Status</p>
          </div>
          <p className="text-2xl font-black text-blue-600 capitalize">{profile.status}</p>
        </div>
      </div>

      {/* Waqf Type Breakdown - Only show if hybrid or any type has funds */}
      {profile.isHybrid && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Waqf Type Allocation
          </h3>
          
          {(portfolioStats.permanentPercentage === 0 && portfolioStats.consumablePercentage === 0 && portfolioStats.revolvingPercentage === 0) ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Waqf type allocation will appear after funds are distributed</p>
              <p className="text-xs mt-2">Add funds using the &quot;Add Funds&quot; button above</p>
            </div>
          ) : (
          <div className="space-y-4">
            {/* Permanent */}
            {portfolioStats.permanentPercentage > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏛️</span>
                    <div>
                      <p className="font-bold text-gray-900">Permanent Waqf</p>
                      <p className="text-xs text-gray-600">Principal preserved forever</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-blue-600">
                      {formatNGN(portfolioStats.permanentAmount)}
                    </p>
                    <p className="text-xs text-gray-500">≈ {formatUSD(convertToUSD(portfolioStats.permanentAmount))}</p>
                    <p className="text-sm text-gray-600">{Math.round(portfolioStats.permanentPercentage)}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${portfolioStats.permanentPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Consumable */}
            {portfolioStats.consumablePercentage > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <p className="font-bold text-gray-900">Consumable Waqf</p>
                      <p className="text-xs text-gray-600">Spent over time for impact</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-green-600">
                      {formatNGN(portfolioStats.consumableAmount)}
                    </p>
                    <p className="text-xs text-gray-500">≈ {formatUSD(convertToUSD(portfolioStats.consumableAmount))}</p>
                    <p className="text-sm text-gray-600">{Math.round(portfolioStats.consumablePercentage)}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${portfolioStats.consumablePercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Revolving */}
            {portfolioStats.revolvingPercentage > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <p className="font-bold text-gray-900">Revolving Waqf</p>
                      <p className="text-xs text-gray-600">Lent and redistributed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-purple-600">
                      {formatNGN(portfolioStats.revolvingAmount)}
                    </p>
                    <p className="text-xs text-gray-500">≈ {formatUSD(convertToUSD(portfolioStats.revolvingAmount))}</p>
                    <p className="text-sm text-gray-600">{Math.round(portfolioStats.revolvingPercentage)}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${portfolioStats.revolvingPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {/* Beneficiary Causes */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Beneficiary Causes ({profile.supportedCauses?.length || 0})
        </h3>
        
        {profile.supportedCauses && profile.supportedCauses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.supportedCauses.map(cause => {
              const allocation = profile.causeAllocation[cause.id] || 0;
              // Use actual allocated amount from financial tracking
              const amount = profile.financial.causeAllocations?.[cause.id] || 0;
              
              // Get hybrid breakdown if applicable
              const hybridAlloc = profile.hybridAllocations?.find(a => a.causeId === cause.id);
              const allocs = hybridAlloc?.allocations as any;
              
              return (
                <div 
                  key={cause.id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-3xl">{cause.icon}</span>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{cause.name}</h4>
                        <p className="text-xs text-gray-600">{cause.category || 'General'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900">{formatNGN(amount)}</p>
                      <p className="text-xs text-gray-500">≈ {formatUSD(convertToUSD(amount))}</p>
                      <p className="text-sm text-gray-600">{Math.round(allocation)}%</p>
                    </div>
                  </div>
                  
                  {/* Show hybrid allocation breakdown */}
                  {profile.isHybrid && allocs && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                      {(allocs.Permanent || allocs.permanent) > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                          🏛️ {Math.round(allocs.Permanent || allocs.permanent)}%
                        </span>
                      )}
                      {(allocs.TemporaryConsumable || allocs.temporary_consumable) > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                          🎁 {Math.round(allocs.TemporaryConsumable || allocs.temporary_consumable)}%
                        </span>
                      )}
                      {(allocs.TemporaryRevolving || allocs.temporary_revolving) > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                          🔄 {Math.round(allocs.TemporaryRevolving || allocs.temporary_revolving)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No causes assigned yet</p>
          </div>
        )}
      </div>

      {/* Donor Information */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">👤</span>
          Donor Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Name</p>
            <p className="font-semibold text-gray-900">{profile.donor.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="font-semibold text-gray-900">{profile.donor.email}</p>
          </div>
          {profile.donor.phone && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Phone</p>
              <p className="font-semibold text-gray-900">{profile.donor.phone}</p>
            </div>
          )}
          {profile.donor.address && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <p className="font-semibold text-gray-900">{profile.donor.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tranche Management Section for Revolving Waqfs */}
      {((typeof profile.waqfType === 'string' && (profile.waqfType === 'TemporaryRevolving' || profile.waqfType === 'temporary_revolving')) || 
        (profile.isHybrid && portfolioStats.revolvingPercentage > 0)) && 
        profile.revolvingDetails?.contributionTranches && (() => {
        const now = Date.now() * 1_000_000;
        
        const maturedTranches = profile.revolvingDetails.contributionTranches.filter(tranche => {
          const maturityDate = parseInt(tranche.maturityDate);
          const isMatured = now >= maturityDate;
          const isNotReturned = !tranche.isReturned;
          const isNotRolledOver = tranche.status !== 'rolled_over';
          const isNotConverted = !tranche.conversionDetails;
          return isMatured && isNotReturned && isNotRolledOver && isNotConverted;
        });
        
        const upcomingTranches = profile.revolvingDetails.contributionTranches.filter(tranche => {
          const maturityDate = parseInt(tranche.maturityDate);
          const isNotMatured = now < maturityDate;
          const isNotReturned = !tranche.isReturned;
          const isNotRolledOver = tranche.status !== 'rolled_over';
          return isNotMatured && isNotReturned && isNotRolledOver;
        }).sort((a, b) => parseInt(a.maturityDate) - parseInt(b.maturityDate));
        
        const nextMaturity = upcomingTranches[0];

        // Show section if there are any tranches (matured or upcoming)
        if (maturedTranches.length === 0 && upcomingTranches.length === 0) return null;

        return (
          <div className="space-y-4">
            {/* Matured Tranches - Action Required */}
            {maturedTranches.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⏰</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                      🎉 {maturedTranches.length} Tranche{maturedTranches.length > 1 ? 's' : ''} Ready!
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-4">
                      Great news! Your revolving waqf contributions have matured. You can now:
                    </p>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 mb-4 ml-4">
                      <li>💰 Get your principal back (Refund)</li>
                      <li>🔄 Extend for another period (Rollover)</li>
                      <li>🏛️ Convert to permanent waqf (Lasting Legacy)</li>
                      <li>⚡ Convert to consumable waqf (Immediate Impact)</li>
                    </ul>
                    <button
                      onClick={() => setShowMaturityActions(true)}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      Take Action Now →
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Upcoming Maturities - Planning Section */}
            {upcomingTranches.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-600 rounded-xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📅</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2">
                      📊 Upcoming Maturities ({upcomingTranches.length})
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                      Plan ahead! You can view and manage your contribution maturity preferences.
                    </p>
                    
                    {/* Next Maturity Highlight */}
                    {nextMaturity && (() => {
                      const maturityDate = new Date(parseInt(nextMaturity.maturityDate) / 1_000_000);
                      const daysUntil = Math.ceil((maturityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      const timeText = daysUntil < 30 
                        ? `${daysUntil} days` 
                        : daysUntil < 365 
                        ? `${Math.floor(daysUntil / 30)} months` 
                        : `${Math.floor(daysUntil / 365)} years`;
                      
                      return (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">Next Maturity</p>
                              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(nextMaturity.amount)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Matures in</p>
                              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{timeText}</p>
                              <p className="text-xs text-gray-500">{maturityDate.toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    
                    <button
                      onClick={() => setShowMaturityActions(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      View All Tranches & Set Preferences →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Maturity Actions Modal - Shows both matured and upcoming tranches */}
      {showMaturityActions && profile.revolvingDetails?.contributionTranches && (() => {
        const now = Date.now() * 1_000_000;
        
        const maturedTranches = profile.revolvingDetails.contributionTranches.filter(tranche => {
          const maturityDate = parseInt(tranche.maturityDate);
          return !tranche.isReturned && now >= maturityDate && tranche.status !== 'rolled_over' && !tranche.conversionDetails;
        });
        
        const upcomingTranches = profile.revolvingDetails.contributionTranches.filter(tranche => {
          const maturityDate = parseInt(tranche.maturityDate);
          return !tranche.isReturned && now < maturityDate && tranche.status !== 'rolled_over' && !tranche.conversionDetails;
        }).sort((a, b) => parseInt(a.maturityDate) - parseInt(b.maturityDate));

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Tranche Management
                </h2>
                <button
                  onClick={() => setShowMaturityActions(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Matured Tranches Section */}
                {maturedTranches.length > 0 && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 flex items-center gap-2">
                        <span>⏰</span>
                        Matured Tranches ({maturedTranches.length}) - Action Required
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        These tranches have reached maturity. Choose what to do with each one.
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      {maturedTranches.map((tranche, index) => (
                        <div key={tranche.id} className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4">
                          {index > 0 && <div className="border-t border-yellow-200 dark:border-yellow-700 my-4" />}
                          
                          <div className="mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Tranche #{index + 1} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tranche.amount)}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Contributed: {new Date(parseInt(tranche.contributionDate) / 1_000_000).toLocaleDateString()}
                              {' • '}
                              Matured: {new Date(parseInt(tranche.maturityDate) / 1_000_000).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <TrancheMaturityActions
                            waqf={profile}
                            tranche={tranche}
                            onActionComplete={() => {
                              window.location.reload();
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Upcoming Tranches Section */}
                {upcomingTranches.length > 0 && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                        <span>📅</span>
                        Upcoming Maturities ({upcomingTranches.length}) - For Planning
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        These tranches are still locked. You can set preferences now for when they mature.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {upcomingTranches.map((tranche, index) => {
                        const maturityDate = new Date(parseInt(tranche.maturityDate) / 1_000_000);
                        const daysUntil = Math.ceil((maturityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        const timeText = daysUntil < 30 
                          ? `${daysUntil} days` 
                          : daysUntil < 365 
                          ? `${Math.floor(daysUntil / 30)} months` 
                          : `${Math.floor(daysUntil / 365)} years`;
                        
                        return (
                          <div key={tranche.id} className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                                  Tranche #{maturedTranches.length + index + 1}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Amount: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tranche.amount)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Contributed: {new Date(parseInt(tranche.contributionDate) / 1_000_000).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Matures in</p>
                                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{timeText}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{maturityDate.toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            {tranche.expirationPreference && (
                              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                  ✅ Preference set: <span className="font-semibold">
                                    {tranche.expirationPreference.action === 'refund' && 'Refund'}
                                    {tranche.expirationPreference.action === 'rollover' && `Rollover for ${tranche.expirationPreference.rolloverMonths || 12} months`}
                                    {tranche.expirationPreference.action === 'convert_permanent' && 'Convert to Permanent'}
                                    {tranche.expirationPreference.action === 'convert_consumable' && 'Convert to Consumable'}
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {maturedTranches.length === 0 && upcomingTranches.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No active tranches found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
