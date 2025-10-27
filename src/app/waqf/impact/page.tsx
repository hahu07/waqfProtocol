'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useFetchWaqfData } from '@/hooks/useWaqfData';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  calculateImpactMetrics, 
  generateWaqfTimeline, 
  shouldUpdateImpactMetrics,
  updateWaqfImpactMetrics,
  type TimelineEvent 
} from '@/lib/impact-utils';
import { logger } from '@/lib/logger';

export default function ImpactPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { waqfs, loading: dataLoading } = useFetchWaqfData();
  
  const [selectedWaqfId, setSelectedWaqfId] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'overview' | 'causes' | 'timeline'>('overview');
  
  const loading = authLoading || dataLoading;
  const [isUpdatingMetrics, setIsUpdatingMetrics] = useState(false);
  
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
  
  // Filter waqfs based on selection
  const selectedWaqfs = useMemo(() => {
    if (!waqfs) return [];
    if (selectedWaqfId === 'all') return waqfs;
    return waqfs.filter(w => w.id === selectedWaqfId);
  }, [waqfs, selectedWaqfId]);
  
  // Calculate impact metrics
  const impactMetrics = useMemo(() => {
    if (!selectedWaqfs.length) return null;
    
    const totalBeneficiaries = selectedWaqfs.reduce((sum, w) => 
      sum + (w.financial?.impactMetrics?.beneficiariesSupported || 0), 0);
    const totalProjects = selectedWaqfs.reduce((sum, w) => 
      sum + (w.financial?.impactMetrics?.projectsCompleted || 0), 0);
    const avgCompletionRate = selectedWaqfs.reduce((sum, w) => 
      sum + ((w.financial?.impactMetrics?.completionRate || 0) * 100), 0) / selectedWaqfs.length;
    
    // Get unique causes
    const allCauses = selectedWaqfs.flatMap(w => w.supportedCauses || []);
    const uniqueCausesCount = new Set(allCauses.map(c => c.id)).size;
    
    // Calculate cause distribution
    const causeDistribution: { [key: string]: number } = {};
    allCauses.forEach(cause => {
      causeDistribution[cause.category] = (causeDistribution[cause.category] || 0) + 1;
    });
    
    return {
      totalBeneficiaries,
      totalProjects,
      avgCompletionRate,
      uniqueCausesCount,
      causeDistribution,
      waqfCount: selectedWaqfs.length
    };
  }, [selectedWaqfs]);
  
  // Generate dynamic timeline from real waqf data
  const timelineEvents = useMemo(() => {
    if (!selectedWaqfs.length) return [];
    return generateWaqfTimeline(selectedWaqfs);
  }, [selectedWaqfs]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50/40 to-indigo-50/30">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <div className="space-y-3">
            <div className="h-10 bg-gradient-to-r from-purple-200 to-blue-100 rounded-lg animate-pulse w-1/3" />
            <div className="h-4 bg-blue-100 rounded animate-pulse w-1/4" />
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-2xl shadow-lg animate-pulse border border-gray-100" />
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md text-center border border-white/20">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <span className="text-5xl">🌍</span>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-blue-400 rounded-full blur-2xl opacity-30 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Start Making Impact
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">Create your first waqf and begin tracking the real-world difference you're making</p>
          <Button
            onClick={() => router.push('/waqf')}
            className="w-full py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' }}
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50/40 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl">🌍</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Social Impact</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                  Live Tracking
                </span>
              </div>
              <p className="text-gray-600 mt-1">Track the real-world difference your waqfs are making</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
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
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'overview' as const, label: 'Overview', icon: '📊' },
                  { value: 'causes' as const, label: 'By Cause', icon: '🌱' },
                  { value: 'timeline' as const, label: 'Timeline', icon: '📅' }
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedView(value)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      selectedView === value
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg transform scale-[1.02]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Key Impact Metrics */}
        {impactMetrics && (
          <div className="grid md:grid-cols-4 gap-6">
            <ImpactMetricCard
              title="Lives Touched"
              value={impactMetrics.totalBeneficiaries.toLocaleString()}
              icon="👥"
              gradient="from-blue-500 to-blue-600"
              description="People directly benefited"
            />
            <ImpactMetricCard
              title="Projects"
              value={impactMetrics.totalProjects.toString()}
              icon="🎯"
              gradient="from-purple-500 to-purple-600"
              description="Successfully completed"
            />
            <ImpactMetricCard
              title="Success Rate"
              value={`${impactMetrics.avgCompletionRate.toFixed(0)}%`}
              icon="✨"
              gradient="from-indigo-500 to-indigo-600"
              description="Project completion"
            />
            <ImpactMetricCard
              title="Causes"
              value={impactMetrics.uniqueCausesCount.toString()}
              icon="🌱"
              gradient="from-violet-500 to-violet-600"
              description="Areas of impact"
            />
          </div>
        )}
        
        {/* Overview Section */}
        {selectedView === 'overview' && impactMetrics && (
          <>
            {/* Impact Highlights */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-200/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">✨</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Impact Highlights</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Real-world difference you're making</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <HighlightCard
                  title="Community Reach"
                  description={`Your waqfs have touched the lives of ${impactMetrics.totalBeneficiaries.toLocaleString()} individuals across multiple communities.`}
                  icon="🌍"
                  color="blue"
                />
                <HighlightCard
                  title="Project Success"
                  description={`${impactMetrics.totalProjects} projects completed with ${impactMetrics.avgCompletionRate.toFixed(0)}% success rate, demonstrating effective resource allocation.`}
                  icon="🎯"
                  color="purple"
                />
                <HighlightCard
                  title="Diverse Impact"
                  description={`Supporting ${impactMetrics.uniqueCausesCount} different causes across ${Object.keys(impactMetrics.causeDistribution).length} categories.`}
                  icon="🌈"
                  color="green"
                />
                <HighlightCard
                  title="Sustained Giving"
                  description={`${impactMetrics.waqfCount} active waqfs creating perpetual impact for generations to come.`}
                  icon="♾️"
                  color="orange"
                />
              </div>
            </div>
            
            {/* Cause Distribution */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-200/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">📊</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Impact by Category</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Distribution across cause types</p>
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(impactMetrics.causeDistribution).map(([category, count]) => {
                  const percentage = (count / impactMetrics.uniqueCausesCount) * 100;
                  return (
                    <CauseDistributionBar
                      key={category}
                      category={category}
                      count={count}
                      percentage={percentage}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
        
        {/* Causes View */}
        {selectedView === 'causes' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Causes Supported</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedWaqfs.flatMap(w => w.supportedCauses || []).map((cause) => (
                <CauseCard key={cause.id} cause={cause} />
              ))}
            </div>
          </div>
        )}
        
        {/* Timeline View */}
        {selectedView === 'timeline' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Impact Timeline</h2>
            {timelineEvents.length > 0 ? (
              <div className="space-y-6">
                {timelineEvents.map((event, index) => (
                  <TimelineItem
                    key={`${event.date}-${index}`}
                    date={event.date}
                    title={event.title}
                    description={event.description}
                    icon={event.icon}
                    color={event.color}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📅</span>
                <p className="text-gray-500">No timeline events yet. Start making distributions to build your impact history!</p>
              </div>
            )}
          </div>
        )}
        
        {/* Share Impact */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-white">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold mb-2">Share Your Impact</h3>
            <p className="mb-6 opacity-90">
              Inspire others by sharing the difference your waqfs are making in the world.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-white text-purple-600 hover:bg-gray-50 border-0 hover:scale-105 transition-transform duration-200"
              >
                🐦 Share on Twitter
              </Button>
              <Button
                variant="outline"
                className="bg-white text-blue-600 hover:bg-gray-50 border-0 hover:scale-105 transition-transform duration-200"
              >
                📘 Share on Facebook
              </Button>
              <Button
                variant="outline"
                className="bg-white text-green-600 hover:bg-gray-50"
              >
                📧 Email Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ImpactMetricCard({ title, value, icon, gradient, description }: {
  title: string;
  value: string;
  icon: string;
  gradient: string;
  description: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-6 text-white`}>
      <span className="text-4xl mb-3 block">{icon}</span>
      <p className="text-sm opacity-90 mb-1">{title}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-xs opacity-75">{description}</p>
    </div>
  );
}

function HighlightCard({ title, description, icon, color }: {
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200'
  };
  
  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]}`}>
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

function CauseDistributionBar({ category, count, percentage }: {
  category: string;
  count: number;
  percentage: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-700 capitalize">{category}</span>
        <span className="text-gray-600">{count} causes ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function CauseCard({ cause }: { cause: { id: string; name: string; description: string; icon: string; category: string } }) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:shadow-lg transition-all">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{cause.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{cause.name}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{cause.description}</p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
            {cause.category}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ date, title, description, icon, color }: {
  date: string;
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };
  
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full ${colorClasses[color]} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div className="w-0.5 h-full bg-gray-200 mt-2" />
      </div>
      <div className="flex-1 pb-8">
        <p className="text-sm text-gray-500 mb-1">{date}</p>
        <h4 className="font-bold text-gray-900 text-lg mb-1">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
