'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useFetchWaqfData } from '@/hooks/useWaqfData';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { WaqfProfile } from '@/types/waqfs';
import { 
  calculateImpactMetrics, 
  shouldUpdateImpactMetrics,
  updateWaqfImpactMetrics,
  calculateAggregateImpact
} from '@/lib/impact-utils';
import { logger } from '@/lib/logger';

export default function ReportsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { waqfs, loading: dataLoading } = useFetchWaqfData();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year' | 'all'>('all');
  const [selectedWaqfId, setSelectedWaqfId] = useState<string>('all');
  const [reportType, setReportType] = useState<'financial' | 'impact' | 'comprehensive'>('comprehensive');
  const [isUpdatingMetrics, setIsUpdatingMetrics] = useState(false);
  
  const loading = authLoading || dataLoading;
  
  // Auto-update impact metrics when waqfs load
  // TEMPORARILY DISABLED: Need to ensure all waqfs have complete schema first
  // useEffect(() => {
  //   if (!waqfs || waqfs.length === 0 || isUpdatingMetrics) return;
  //   
  //   const updateMetrics = async () => {
  //     setIsUpdatingMetrics(true);
  //     try {
  //       for (const waqf of waqfs) {
  //         if (shouldUpdateImpactMetrics(waqf)) {
  //           logger.debug('Auto-updating impact metrics', { waqfName: waqf.name });
  //           await updateWaqfImpactMetrics(waqf.id, waqf, user?.key);
  //         }
  //       }
  //     } catch (error) {
  //       logger.error('Failed to update impact metrics', { error });
  //     } finally {
  //       setIsUpdatingMetrics(false);
  //     }
  //   };
  //   
  //   updateMetrics();
  // }, [waqfs, user, isUpdatingMetrics]);
  
  // Filter waqfs based on selection and time period
  const selectedWaqfs = useMemo(() => {
    if (!waqfs) return [];
    let filtered = selectedWaqfId === 'all' ? waqfs : waqfs.filter(w => w.id === selectedWaqfId);
    
    // Apply time period filter
    if (selectedPeriod !== 'all') {
      const now = Date.now();
      const periodMs = {
        month: 30 * 24 * 60 * 60 * 1000,
        quarter: 90 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000
      }[selectedPeriod];
      
      const cutoffDate = now - periodMs;
      
      // Filter waqfs that have activity in the selected period
      filtered = filtered.filter(w => {
        const createdAt = w.createdAt ? new Date(w.createdAt).getTime() : 0;
        const updatedAt = w.updatedAt ? new Date(w.updatedAt).getTime() : createdAt;
        return updatedAt >= cutoffDate || createdAt >= cutoffDate;
      });
    }
    
    return filtered;
  }, [waqfs, selectedWaqfId, selectedPeriod]);
  
  // Calculate aggregate metrics using impact-utils for consistency
  const metrics = useMemo(() => {
    if (!selectedWaqfs.length) return null;
    
    // Financial metrics
    const totalDonations = selectedWaqfs.reduce((sum, w) => sum + (w.financial?.totalDonations || 0), 0);
    const totalDistributed = selectedWaqfs.reduce((sum, w) => sum + (w.financial?.totalDistributed || 0), 0);
    const currentBalance = selectedWaqfs.reduce((sum, w) => sum + (w.financial?.currentBalance || 0), 0);
    const totalReturns = selectedWaqfs.reduce((sum, w) => sum + (w.financial?.totalInvestmentReturn || 0), 0);
    const avgGrowthRate = selectedWaqfs.reduce((sum, w) => sum + (w.financial?.growthRate || 0), 0) / selectedWaqfs.length;
    
    // Use calculateAggregateImpact from impact-utils for consistent calculations
    const aggregatedImpact = calculateAggregateImpact(selectedWaqfs);
    
    const totalCauses = new Set(selectedWaqfs.flatMap(w => w.selectedCauses || [])).size;
    
    return {
      totalDonations,
      totalDistributed,
      currentBalance,
      totalReturns,
      avgGrowthRate,
      totalBeneficiaries: aggregatedImpact.totalBeneficiaries,
      totalProjects: aggregatedImpact.totalProjects,
      avgCompletionRate: aggregatedImpact.avgCompletionRate,
      totalCauses,
      waqfCount: selectedWaqfs.length
    };
  }, [selectedWaqfs]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/40 to-indigo-50/30">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <div className="space-y-3">
            <div className="h-10 bg-gradient-to-r from-blue-200 to-purple-100 rounded-lg animate-pulse w-1/3" />
            <div className="h-4 bg-purple-100 rounded animate-pulse w-1/4" />
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl shadow-lg animate-pulse border border-gray-100" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 bg-white rounded-2xl shadow-lg animate-pulse border border-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!waqfs || waqfs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/40 to-indigo-50/30 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md text-center border border-white/20">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
              <span className="text-5xl">📊</span>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-purple-400 rounded-full blur-2xl opacity-30 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            No Reports Available
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">Create your first waqf to start generating comprehensive reports and track your impact</p>
          <Button
            onClick={() => router.push('/waqf')}
            className="w-full py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}
          >
            <span className="flex items-center justify-center gap-2">
              <span>✨</span>
              Create Your First Waqf
            </span>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/40 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/waqf')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Reports & Analytics
                    </h1>
                    {isUpdatingMetrics && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full shadow-md">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-gray-600">Comprehensive insights into your waqf performance</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                  Live Data
                </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-shadow duration-300">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Waqf Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Waqf
              </label>
              <select
                value={selectedWaqfId}
                onChange={(e) => setSelectedWaqfId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors duration-200 shadow-sm"
              >
                <option value="all">All Waqfs ({waqfs.length})</option>
                {waqfs.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'month' | 'quarter' | 'year' | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as 'financial' | 'impact' | 'comprehensive')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="comprehensive">Comprehensive</option>
                <option value="financial">Financial Only</option>
                <option value="impact">Impact Only</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        {metrics && (
          <div className="grid md:grid-cols-4 gap-6">
            <MetricCard
              title="Total Donations"
              value={`$${metrics.totalDonations.toLocaleString()}`}
              icon="💰"
              gradient="from-blue-500 to-blue-600"
            />
            <MetricCard
              title="Distributed"
              value={`$${metrics.totalDistributed.toLocaleString()}`}
              icon="📤"
              gradient="from-purple-500 to-purple-600"
            />
            <MetricCard
              title="Current Balance"
              value={`$${metrics.currentBalance.toLocaleString()}`}
              icon="💎"
              gradient="from-indigo-500 to-indigo-600"
            />
            <MetricCard
              title="Growth Rate"
              value={`${metrics.avgGrowthRate.toFixed(1)}%`}
              icon="📈"
              gradient="from-violet-500 to-violet-600"
            />
          </div>
        )}
        
        {/* Financial Report Section */}
        {(reportType === 'financial' || reportType === 'comprehensive') && metrics && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-200/50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">💵</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Financial Performance</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Comprehensive financial overview</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Financial Overview */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-blue-600 font-semibold">Total Returns</p>
                    <span className="text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity">📈</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900 tracking-tight">${metrics.totalReturns.toLocaleString()}</p>
                </div>
                <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-purple-600 font-semibold">Active Waqfs</p>
                    <span className="text-purple-500 opacity-50 group-hover:opacity-100 transition-opacity">✨</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900 tracking-tight">{metrics.waqfCount}</p>
                </div>
                <div className="group p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-green-600 font-semibold">Causes Supported</p>
                    <span className="text-green-500 opacity-50 group-hover:opacity-100 transition-opacity">🌱</span>
                  </div>
                  <p className="text-3xl font-bold text-green-900 tracking-tight">{metrics.totalCauses}</p>
                </div>
              </div>
              
              {/* Distribution Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Analysis</h3>
                <div className="space-y-3">
                  <ProgressBar
                    label="Distributed"
                    value={metrics.totalDistributed}
                    max={metrics.totalDonations}
                    color="purple"
                  />
                  <ProgressBar
                    label="Remaining Balance"
                    value={metrics.currentBalance}
                    max={metrics.totalDonations}
                    color="blue"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Impact Report Section */}
        {(reportType === 'impact' || reportType === 'comprehensive') && metrics && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-200/50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">🌍</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Social Impact</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Measuring real-world change</p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <ImpactCard
                title="Beneficiaries Reached"
                value={metrics.totalBeneficiaries.toLocaleString()}
                icon="👥"
                color="blue"
              />
              <ImpactCard
                title="Projects Completed"
                value={metrics.totalProjects.toString()}
                icon="🎯"
                color="purple"
              />
              <ImpactCard
                title="Active Causes"
                value={metrics.totalCauses.toString()}
                icon="🌱"
                color="green"
              />
            </div>
          </div>
        )}
        
        {/* Export Options */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Export Report</h3>
            <span className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.print()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              📄 Export PDF
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              📊 Export Excel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, icon, gradient }: {
  title: string;
  value: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className={`group bg-gradient-to-br ${gradient} rounded-2xl shadow-lg hover:shadow-2xl p-6 text-white transition-all duration-300 transform hover:scale-[1.02] border border-white/10 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors duration-300">
            <span className="text-3xl">{icon}</span>
          </div>
          <svg className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="text-sm opacity-90 mb-2 font-medium">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ImpactCard({ title, value, icon, color }: {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'purple' | 'green';
}) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 text-blue-700 hover:from-blue-100 hover:to-blue-50',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50 text-purple-700 hover:from-purple-100 hover:to-purple-50',
    green: 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 text-green-700 hover:from-green-100 hover:to-green-50'
  };
  
  const iconBgColors = {
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    green: 'bg-green-100'
  };
  
  return (
    <div className={`group p-6 rounded-2xl border ${colorClasses[color]} transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/30 rounded-full blur-2xl"></div>
      <div className="relative z-10">
        <div className={`inline-flex p-3 ${iconBgColors[color]} rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-3xl">{icon}</span>
        </div>
        <p className="text-sm font-semibold mb-2 opacity-80">{title}</p>
        <p className="text-4xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max, color }: {
  label: string;
  value: number;
  max: number;
  color: 'blue' | 'purple' | 'green';
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500'
  };
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-600">${value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${colorClasses[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
