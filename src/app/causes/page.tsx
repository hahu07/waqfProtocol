'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listActiveCauses } from '@/lib/cause-utils';
import type { Cause } from '@/types/waqfs';
import { toast } from 'sonner';

export default function CausesPage() {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCausesInDB, setTotalCausesInDB] = useState<number>(0);
  const [filteredOutCount, setFilteredOutCount] = useState<number>(0);

  useEffect(() => {
    loadCauses();
  }, []);

  const loadCauses = async () => {
    try {
      setLoading(true);
      
      // First, let's try to get ALL causes to see what we have
      const { listCauses } = await import('@/lib/cause-utils');
      const allCauses = await listCauses();
      console.log('📊 ALL causes in database:', allCauses.length);
      console.log('📋 All causes data:', allCauses);
      setTotalCausesInDB(allCauses.length);
      
      // Now get only active ones
      const activeCauses = await listActiveCauses();
      console.log('✅ Active & Approved causes:', activeCauses.length);
      console.log('✅ Active causes data:', activeCauses);
      
      // Show what was filtered out
      if (allCauses.length > activeCauses.length) {
        const filtered = allCauses.filter(c => !activeCauses.some(ac => ac.id === c.id));
        console.log('🚫 Filtered out causes (not active or not approved):', filtered.length);
        setFilteredOutCount(filtered.length);
        filtered.forEach(cause => {
          console.log(`   - ${cause.name}: isActive=${cause.isActive}, status=${cause.status}`);
        });
      } else {
        setFilteredOutCount(0);
      }
      
      // Sort by sortOrder and then by creation date
      const sorted = activeCauses.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setCauses(sorted);
    } catch (error: any) {
      console.error('❌ Error loading causes:', error);
      
      // Check if it's a collection not found error
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('Collection') || errorMessage.includes('not found')) {
        toast.error('Causes collection not set up. Please contact administrator.');
      } else {
        toast.error('Failed to load causes. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(causes.map(c => c.category)))];

  // Filter causes based on category and search
  const filteredCauses = causes.filter(cause => {
    const matchesCategory = selectedCategory === 'all' || cause.category === selectedCategory;
    const matchesSearch = cause.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cause.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-blue-600 to-purple-600 border-b border-purple-700"
        style={{
          background: 'linear-gradient(to right, #2563eb, #9333ea)',
          minHeight: '200px'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
              Charitable Causes
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ color: 'white' }}>
              Support Meaningful Causes
            </h1>
            <p className="text-xl text-blue-50 max-w-3xl mx-auto" style={{ color: '#dbeafe' }}>
              Discover and contribute to charitable causes that make a lasting impact on communities worldwide
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Diagnostic Banner - Only show when there are issues */}
        {!loading && totalCausesInDB > 0 && causes.length === 0 && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Causes Exist But Are Hidden</h3>
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-semibold text-gray-900">{totalCausesInDB}</span> cause(s) found in database, but <span className="font-semibold text-gray-900">{filteredOutCount}</span> are hidden because they don't meet visibility requirements.
                </p>
                <div className="bg-white border border-amber-100 rounded-lg p-4 mt-3">
                  <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    To make causes visible:
                  </p>
                  <ol className="text-sm text-gray-700 space-y-2 ml-5 list-decimal">
                    <li>Go to <code className="bg-gray-100 px-2 py-1 rounded text-blue-600 font-mono text-xs">/admin/causes</code></li>
                    <li>Edit each cause and ensure:
                      <ul className="ml-5 mt-2 space-y-1 list-disc">
                        <li><strong>Active</strong> checkbox is checked</li>
                        <li><strong>Status</strong> is set to "Approved"</li>
                      </ul>
                    </li>
                    <li>Save the changes and refresh this page</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search causes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
                style={{
                  backgroundColor: selectedCategory === category ? '#2563eb' : 'white',
                  color: selectedCategory === category ? 'white' : '#374151',
                  border: selectedCategory === category ? 'none' : '1px solid #d1d5db'
                }}
              >
                <span style={{ 
                  color: selectedCategory === category ? 'white' : '#374151',
                  fontWeight: '600'
                }}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading causes...</p>
          ) : (
            <p className="text-gray-700 text-sm font-medium">
              Showing <span className="font-bold text-gray-900">{filteredCauses.length}</span> {filteredCauses.length === 1 ? 'cause' : 'causes'}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-5 w-3/4" />
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="h-20 bg-gray-100 rounded-lg" />
                    <div className="h-20 bg-gray-100 rounded-lg" />
                  </div>
                  <div className="h-12 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Causes Grid */}
        {!loading && filteredCauses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCauses.map(cause => (
              <div
                key={cause.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200"
              >
                {/* Header Section - Cover Image or Gradient */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
                  {cause.coverImage ? (
                    // Cover Image
                    <>
                      <img 
                        src={cause.coverImage} 
                        alt={cause.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback to gradient if image fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {/* Subtle overlay for better badge visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      
                      {/* Category Badge on image */}
                      <span className="absolute top-3 left-3 px-3 py-1 bg-white text-blue-600 text-xs font-semibold rounded-md shadow-sm">
                        {cause.category.toUpperCase()}
                      </span>
                    </>
                  ) : (
                    // Gradient Background (no cover image)
                    <div className="relative h-full bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-50 flex items-center justify-center">
                      {/* Icon */}
                      <div className="text-6xl opacity-30">
                        {cause.icon || '🎯'}
                      </div>
                      
                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 px-3 py-1 bg-white text-blue-600 text-xs font-semibold rounded-md shadow-sm">
                        {cause.category.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {cause.name}
                  </h3>

                {/* Description - Clean markdown/HTML */}
                <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
                  {cause.description
                    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove markdown images
                    .replace(/<[^>]*>/g, '') // Remove HTML
                    .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
                    .replace(/[#*_`]/g, '') // Remove formatting
                    .trim()
                    .substring(0, 150) || 'Supporting meaningful charitable work'}...
                </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                      <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">Supporters</div>
                      <div className="text-xl font-bold text-blue-600">{cause.followers || 0}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                      <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">Raised</div>
                      <div className="text-xl font-bold text-green-600">
                        ${cause.fundsRaised > 999 ? `${(cause.fundsRaised / 1000).toFixed(1)}k` : (cause.fundsRaised || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Impact Score */}
                  {cause.impactScore && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-500 uppercase tracking-wide font-semibold">Impact Score</span>
                        <span className="text-sm font-bold text-blue-600">{cause.impactScore}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${cause.impactScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    href="/auth?mode=signup"
                    className="flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white'
                    }}
                  >
                    <span className="text-white font-semibold" style={{ color: 'white', fontWeight: '600' }}>Support This Cause</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCauses.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No causes found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'No causes are currently available. Causes must be both Active and Approved by admin to appear here.'}
            </p>
            {(searchQuery || selectedCategory !== 'all') ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm"
              >
                Clear Filters
              </button>
            ) : (
              <div className="max-w-2xl mx-auto mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl text-left">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  For Administrators
                </h4>
                <p className="text-sm text-gray-700 mb-4">
                  If you're an admin, you need to:
                </p>
                <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                  <li>Ensure the <code className="bg-white px-2 py-0.5 rounded text-blue-600 font-mono">causes</code> collection is set up in Juno Console</li>
                  <li>Create causes in the <strong>Admin Dashboard</strong> at <code className="bg-white px-2 py-0.5 rounded text-purple-600">/admin/causes</code></li>
                  <li>Make sure each cause is marked as:
                    <ul className="ml-4 mt-2 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span> <strong>Active</strong> (checkbox checked)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span> <strong>Approved</strong> (status dropdown)
                      </li>
                    </ul>
                  </li>
                </ol>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs text-gray-600">
                    📚 See <code className="bg-white px-1 py-0.5 rounded">COLLECTION_SETUP_CHECKLIST.md</code> for setup instructions
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Call to Action */}
        {!loading && filteredCauses.length > 0 && (
          <div className="mt-16 bg-white border-2 border-gray-200 rounded-2xl p-10 text-center shadow-sm">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-4">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Make an Impact
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Support These Causes?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Create your Waqf endowment and start making a lasting difference in the causes you care about
              </p>
              <Link
                href="/auth?mode=signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white'
                }}
              >
                <span style={{ color: 'white', fontWeight: '600' }}>Get Started Today</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
