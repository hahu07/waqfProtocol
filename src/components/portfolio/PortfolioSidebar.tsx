'use client';

import { Button } from '@/components/ui/button';
import type { Portfolio } from '@/types/portfolio';
import { calculatePortfolioStats } from '@/lib/portfolio-utils';

interface PortfolioSidebarProps {
  portfolio: Portfolio;
  onRemoveCause: (causeId: string) => void;
  onUpdateTotalAmount: (amount: number) => void;
  onContinue: () => void;
}

export function PortfolioSidebar({
  portfolio,
  onRemoveCause,
  onUpdateTotalAmount,
  onContinue,
}: PortfolioSidebarProps) {
  const stats = calculatePortfolioStats(portfolio);
  const hasItems = portfolio.items.length > 0;
  const MIN_AMOUNT = 100;

  return (
    <div className="space-y-5">
      {/* Portfolio Summary Card */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                📋
              </div>
              <h2 className="text-2xl font-bold">Your Portfolio</h2>
            </div>
            <p className="text-sm text-blue-100">
              {portfolio.items.length} {portfolio.items.length === 1 ? 'cause' : 'causes'} selected
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!hasItems ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-5xl">🎯</div>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Start Building</h3>
              <p className="text-gray-600 text-sm max-w-xs mx-auto">
                Select causes from the marketplace to build your charitable portfolio.
              </p>
            </div>
          ) : (
            <>
              {/* Total Portfolio Amount */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 mb-6 border-2 border-green-200">
                <label className="block mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-bold text-gray-800">Total Portfolio Amount</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">$</span>
                    <input
                      type="number"
                      min={MIN_AMOUNT}
                      step="50"
                      value={portfolio.totalAmount || ''}
                      onChange={(e) => onUpdateTotalAmount(Number(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 text-lg font-bold text-gray-900 bg-white border-2 border-green-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                </label>
                <div className="flex items-center gap-2 mt-2">
                  {portfolio.totalAmount < MIN_AMOUNT ? (
                    <>
                      <span className="text-red-500">⚠️</span>
                      <p className="text-xs font-semibold text-red-600">
                        Minimum amount: ${MIN_AMOUNT}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-green-600">✓</span>
                      <p className="text-xs font-semibold text-green-700">
                        Amount distributed across {portfolio.items.length} {portfolio.items.length === 1 ? 'cause' : 'causes'}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Selected Causes */}
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {portfolio.items.map(item => (
                  <div
                    key={item.cause.id}
                    className="group flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        {item.cause.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {item.cause.name}
                        </p>
                        {item.cause.impactScore && (
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs font-semibold text-green-700">
                              {item.cause.impactScore}/100
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveCause(item.cause.id)}
                      className="flex-shrink-0 w-8 h-8 rounded-lg text-red-500 hover:text-white hover:bg-red-500 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Remove from portfolio"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Diversity Score */}
              <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 rounded-xl p-5 mb-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <span className="text-sm font-bold text-gray-800">Diversity Score</span>
                  </div>
                  <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stats.diversificationScore}/100
                  </span>
                </div>
                <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm relative"
                    style={{ width: `${stats.diversificationScore}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-lg">
                    {stats.diversificationScore >= 70 && '✨'}
                    {stats.diversificationScore >= 50 && stats.diversificationScore < 70 && '👍'}
                    {stats.diversificationScore < 50 && '💡'}
                  </span>
                  <p className="text-xs font-semibold text-gray-700">
                    {stats.diversificationScore >= 70 && 'Excellent diversification!'}
                    {stats.diversificationScore >= 50 && stats.diversificationScore < 70 && 'Good balance'}
                    {stats.diversificationScore < 50 && 'Consider more variety'}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border-2 border-blue-200 hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-1">🎲</div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">Risk</div>
                  <div className="font-black text-blue-700 capitalize text-sm">
                    {stats.riskLevel}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border-2 border-purple-200 hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-1">💧</div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">Liquidity</div>
                  <div className="font-black text-purple-700 capitalize text-sm">
                    {stats.liquidityLevel}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border-2 border-green-200 hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-1">📊</div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">Causes</div>
                  <div className="font-black text-green-700 text-sm">
                    {stats.causeCount}
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={onContinue}
                disabled={portfolio.totalAmount < MIN_AMOUNT}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <span className="flex items-center justify-center gap-2">
                  {portfolio.totalAmount < MIN_AMOUNT ? `Enter at least $${MIN_AMOUNT}` : 'Continue to Allocation'}
                  {portfolio.totalAmount >= MIN_AMOUNT && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                </span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl shadow-lg border-2 border-yellow-300 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
            💡
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-3">Pro Tips</h3>
            <ul className="text-xs text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Select <strong>3-5 causes</strong> for optimal diversification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Mix different <strong>waqf types</strong> for balanced impact</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Check <strong>impact scores</strong> to maximize effectiveness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Higher diversity scores mean <strong>better risk distribution</strong></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 text-base mb-5 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Portfolio Creation Steps
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/30">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-600">Select Causes</p>
              <p className="text-xs text-gray-600">Choose what matters to you</p>
            </div>
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex items-center gap-4 opacity-60">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">Design Allocation</p>
              <p className="text-xs text-gray-600">Set waqf type strategy</p>
            </div>
          </div>
          <div className="flex items-center gap-4 opacity-60">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">Preview Impact</p>
              <p className="text-xs text-gray-600">See projected outcomes</p>
            </div>
          </div>
          <div className="flex items-center gap-4 opacity-60">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">
              4
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">Enter Details</p>
              <p className="text-xs text-gray-600">Donor information</p>
            </div>
          </div>
          <div className="flex items-center gap-4 opacity-60">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">
              5
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">Sign Waqf Deed</p>
              <p className="text-xs text-gray-600">Review and sign document</p>
            </div>
          </div>
          <div className="flex items-center gap-4 opacity-60">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">
              6
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">Make Payment</p>
              <p className="text-xs text-gray-600">Complete your waqf</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

