'use client';

import { useState, useMemo } from 'react';
import type { Cause } from '@/types/waqfs';
import type { CauseFilters } from '@/types/portfolio';
import { Button } from '@/components/ui/button';

// Currency formatting helper
const formatCurrency = (amount: number, currency: string = 'NGN') => {
  const currencySymbols: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

// Convert to USD for secondary display
const convertToUSD = (amount: number, currency: string, exchangeRateToUSD?: number) => {
  if (currency === 'USD') return amount;
  if (!exchangeRateToUSD) return null;
  return amount / exchangeRateToUSD;
};

interface CauseMarketplaceProps {
  causes: Cause[];
  selectedCauseIds: string[];
  onCauseToggle: (cause: Cause) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function CauseMarketplace({
  causes,
  selectedCauseIds,
  onCauseToggle,
  isLoading = false,
  error = null,
}: CauseMarketplaceProps) {
  const [filters, setFilters] = useState<CauseFilters>({
    search: '',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const toggleDescription = (causeId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(causeId)) {
        newSet.delete(causeId);
      } else {
        newSet.add(causeId);
      }
      return newSet;
    });
  };

  // Debug logging
  console.log('CauseMarketplace - causes received:', causes.length);
  console.log('CauseMarketplace - causes:', causes);
  console.log('CauseMarketplace - filters:', filters);

  // Filter causes
  const filteredCauses = useMemo(() => {
    const filtered = causes.filter(cause => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          cause.name.toLowerCase().includes(searchLower) ||
          cause.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          console.log(`Cause ${cause.name} filtered out by search`);
          return false;
        }
      }

      // Category filter
      if (filters.categoryId && cause.categoryId !== filters.categoryId) {
        console.log(`Cause ${cause.name} filtered out by category: ${cause.categoryId} !== ${filters.categoryId}`);
        return false;
      }

      // Waqf type filter
      if (filters.waqfType && !cause.supportedWaqfTypes.includes(filters.waqfType)) {
        console.log(`Cause ${cause.name} filtered out by waqfType: ${filters.waqfType} not in`, cause.supportedWaqfTypes);
        return false;
      }

      return true;
    });

    console.log('CauseMarketplace - filtered causes:', filtered.length);
    console.log('CauseMarketplace - filtered causes:', filtered);

    return filtered;
  }, [causes, filters]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-200 p-16">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute inset-0"></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Causes</h3>
            <p className="text-gray-600">Discovering impactful opportunities for you...</p>
          </div>
          {/* Loading skeleton cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg border-2 border-red-200 p-16">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Causes</h3>
          <p className="text-red-600 font-medium mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search causes by name or description..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm font-medium placeholder:text-gray-400"
              />
              <svg
                className="absolute left-4 top-4 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-transparent text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-transparent text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Results count with stats */}
        <div className="mt-5 pt-5 border-t-2 border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">
                Showing {filteredCauses.length} of {causes.length} causes
              </span>
            </div>
            {selectedCauseIds.length > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-full px-4 py-1.5">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-bold text-blue-700">
                  {selectedCauseIds.length} in portfolio
                </span>
              </div>
            )}
          </div>
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Cause Cards */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
        {filteredCauses.length === 0 ? (
          <div className="col-span-full bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 p-20 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-6xl opacity-50">🔍</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Causes Found</h3>
            <p className="text-gray-600 text-lg">Try adjusting your search or filters to find more causes.</p>
          </div>
        ) : (
          filteredCauses.map(cause => {
            const isSelected = selectedCauseIds.includes(cause.id);
            const progress = cause.targetAmount
              ? (cause.fundsRaised / cause.targetAmount) * 100
              : 0;

            return (
              <div
                key={cause.id}
                className={`group relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  isSelected
                    ? 'border-blue-500 ring-4 ring-blue-100 shadow-xl'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* Selection Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-10 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs font-bold">In Portfolio</span>
                  </div>
                )}

                {/* Cover Image or Icon Header */}
                {cause.coverImage ? (
                  <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src={cause.coverImage}
                      alt={cause.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    {/* Icon Badge on Image */}
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                      <div className="text-4xl">{cause.icon}</div>
                    </div>
                  </div>
                ) : (
                  <div className={`relative h-32 bg-gradient-to-br ${
                    isSelected
                      ? 'from-blue-500 via-blue-600 to-purple-600'
                      : 'from-gray-100 via-gray-200 to-gray-300 group-hover:from-blue-50 group-hover:via-blue-100 group-hover:to-purple-100'
                  } transition-all duration-300`}>
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative h-full flex items-center justify-center">
                      <div className={`text-6xl transform transition-transform duration-300 ${
                        isSelected ? 'scale-110' : 'group-hover:scale-110'
                      }`}>
                        {cause.icon}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-xl mb-2 line-clamp-2 min-h-[3.5rem]">
                      {cause.name}
                    </h3>

                    {/* Impact Score Badge */}
                    {cause.impactScore && (
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-full px-3 py-1.5">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs font-bold text-green-700">
                          Impact Score: {cause.impactScore}/100
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-5">
                    <p className={`text-gray-600 text-sm ${
                      expandedDescriptions.has(cause.id) ? '' : 'line-clamp-3'
                    } transition-all duration-300`}>
                      {cause.description}
                    </p>
                    {cause.description.length > 150 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDescription(cause.id);
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        {expandedDescriptions.has(cause.id) ? (
                          <>
                            Show less
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            Read more
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Progress Section */}
                  {cause.targetAmount && (
                    <div className="mb-5 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between items-baseline mb-2">
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Raised
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(cause.fundsRaised, cause.primaryCurrency || 'NGN')}
                          </div>
                          {/* USD Conversion (if not already USD) */}
                          {cause.primaryCurrency !== 'USD' && cause.exchangeRateToUSD && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              ≈ {formatCurrency(convertToUSD(cause.fundsRaised, cause.primaryCurrency || 'NGN', cause.exchangeRateToUSD) || 0, 'USD')}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Goal
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrency(cause.targetAmount, cause.primaryCurrency || 'NGN')}
                          </div>
                          {/* USD Conversion (if not already USD) */}
                          {cause.primaryCurrency !== 'USD' && cause.exchangeRateToUSD && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              ≈ {formatCurrency(convertToUSD(cause.targetAmount, cause.primaryCurrency || 'NGN', cause.exchangeRateToUSD) || 0, 'USD')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Progress Bar */}
                      <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        >
                          {progress >= 20 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-xs font-bold drop-shadow">
                                {Math.round(progress)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {progress < 20 && (
                        <div className="text-center mt-1">
                          <span className="text-xs font-bold text-green-600">
                            {Math.round(progress)}% funded
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Waqf Type Badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {cause.supportedWaqfTypes.map(type => (
                      <span
                        key={type}
                        className={`px-3 py-1.5 text-xs rounded-full font-semibold border-2 transition-all ${
                          type === 'permanent'
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200'
                            : type === 'temporary_consumable'
                            ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200'
                            : 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200'
                        }`}
                      >
                        {type === 'permanent' && '♾️ Permanent'}
                        {type === 'temporary_consumable' && '⚡ Consumable'}
                        {type === 'temporary_revolving' && '🔄 Revolving'}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => onCauseToggle(cause)}
                    className={`w-full font-semibold py-3 transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl'
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove from Portfolio
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add to Portfolio
                      </span>
                    )}
                  </Button>
                </div>

                {/* Hover Effect Overlay */}
                <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${
                  isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

