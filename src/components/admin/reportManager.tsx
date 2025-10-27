// src/components/admin/reportManager.tsx - Production Grade
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { ReportModal } from '@/components/waqf/reportModal';
import { CausesAnalyticsModal } from './causesAnalyticsModal';
import { useState, useMemo, useEffect } from 'react';
import type { Waqf } from '@/types/waqfs';
import type { AdminManagerProps } from './types';
import { useFetchWaqfData } from '@/hooks/useWaqfData';
import { AnalyticsService, type AnalyticsData } from '@/lib/analytics-service';
import { FaChartLine, FaHandHoldingHeart, FaDollarSign, FaUsers, FaFileAlt, FaDownload, FaArrowUp, FaArrowDown, FaCalendarAlt, FaCheckCircle, FaClock, FaArrowRight, FaSync, FaPrint, FaFileExport } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface WaqfReport {
  id: string;
  data: Waqf;
}

export function ReportManager({ 
  showHeader = true,
  headerTitle = 'System Reports'
}: AdminManagerProps) {
  const { isAdmin } = useAuth();
  const [selectedWaqf, setSelectedWaqf] = useState<Waqf | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showCausesAnalytics, setShowCausesAnalytics] = useState(false);
  const [reportType, setReportType] = useState<'financial' | 'impact' | 'contributions' | null>(null);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Get raw data from hook
  const { waqfs: waqfProfiles, statistics, loading } = useFetchWaqfData();
  
  // Convert WaqfProfile[] to Waqf[]
  const waqfs = useMemo(() => 
    waqfProfiles.map(profile => ({
      key: profile.id,
      data: profile
    })),
    [waqfProfiles]
  );

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await AnalyticsService.getAnalytics();
        setAnalyticsData(data);
        setLastUpdated(new Date());
      } catch (error) {
        logger.error('Error fetching analytics', error instanceof Error ? error : { error });
      }
    };

    fetchAnalytics();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await AnalyticsService.getAnalytics();
      setAnalyticsData(data);
      setLastUpdated(new Date());
    } catch (error) {
      logger.error('Error refreshing analytics', error instanceof Error ? error : { error });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle export
  const handleExport = () => {
    if (analyticsData) {
      AnalyticsService.exportToCSV(analyticsData, `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

  // Handle print
  const handlePrint = () => {
    if (analyticsData) {
      const summary = AnalyticsService.generateSummary(analyticsData);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<pre>${summary}</pre>`);
        printWindow.print();
      }
    }
  };

  const handleViewReport = (type: 'financial' | 'impact' | 'contributions') => {
    logger.debug('Opening report:', { data: type });
    toast.loading('Loading report...');
    
    setReportType(type);
    
    // Use the first waqf if available
    if (waqfs.length > 0) {
      setSelectedWaqf(waqfs[0]);
      toast.dismiss();
      toast.success(`Opening ${type} report`);
    } else {
      // Create a mock waqf object for demo
      const mockWaqfData = {
        id: 'system-report',
        name: 'System Analytics',
        description: 'System-wide Analytics',
        selectedCauses: [],
        causeAllocation: {},
        waqfAssets: [],
        supportedCauses: [],
        waqfAsset: 0,
        donor: {
          name: 'System',
          email: 'system@waqf.com',
          type: 'individual' as const,
          contactPreference: 'email' as const,
        },
        financial: {
          totalDonations: analyticsData?.totalDonations || 0,
          totalDistributed: 0,
          currentBalance: analyticsData?.totalDonations || 0,
          totalInvestmentReturn: 0,
          impactMetrics: {
            beneficiariesSupported: analyticsData?.totalBeneficiaries || 0,
            projectsCompleted: 0,
            completionRate: 0,
          },
        },
        reportingPreferences: {
          frequency: 'quarterly' as const,
          reportTypes: ['financial', 'impact'],
          deliveryMethod: 'platform' as const,
        },
        status: 'active' as const,
        notifications: {
          contributionReminders: true,
          impactReports: true,
          financialUpdates: true,
        },
        createdBy: 'system',
        createdAt: new Date().toISOString(),
      };
      setSelectedWaqf({
        key: 'system-report',
        data: mockWaqfData as unknown,
      } as Waqf);
      toast.dismiss();
      toast.success(`Opening ${type} report`);
    }
    setShowReport(true);
  };

  const handleViewCausesAnalytics = () => {
    toast.success('Opening Causes Analytics');
    setShowCausesAnalytics(true);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Admin privileges required to view this page</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const reportCards = [
    {
      title: 'Financial Report',
      description: 'Comprehensive financial overview and analytics',
      icon: <FaDollarSign className="w-6 h-6" />,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      type: 'financial' as const,
      stats: {
        label: 'Total Donations',
        value: `$${(analyticsData?.totalDonations || 0).toLocaleString()}`,
        growth: analyticsData?.donationsGrowth || 0,
      },
    },
    {
      title: 'Impact Report',
      description: 'Measure cause impact and beneficiary reach',
      icon: <FaHandHoldingHeart className="w-6 h-6" />,
      gradient: 'linear-gradient(135deg, #2563eb, #9333ea)',
      type: 'impact' as const,
      stats: {
        label: 'Beneficiaries',
        value: (analyticsData?.totalBeneficiaries || 0).toLocaleString(),
        growth: 15, // Mock growth
      },
    },
    {
      title: 'Contributions',
      description: 'Donation analytics and contributor insights',
      icon: <FaChartLine className="w-6 h-6" />,
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      type: 'contributions' as const,
      stats: {
        label: 'Total Waqfs',
        value: (analyticsData?.totalWaqfs || 0).toLocaleString(),
        growth: analyticsData?.waqfsGrowth || 0,
      },
    },
    {
      title: 'Causes Analytics',
      description: 'Track cause performance and engagement metrics',
      icon: <FaUsers className="w-6 h-6" />,
      gradient: 'linear-gradient(135deg, #9333ea, #4338ca)',
      type: 'causes' as const,
      stats: {
        label: 'Active Causes',
        value: (analyticsData?.activeCauses || 0).toLocaleString(),
        growth: analyticsData?.causesGrowth || 0,
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {headerTitle}
              </h1>
              <p className="text-gray-600">Comprehensive analytics and reporting dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
              >
                <FaPrint className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
              >
                <FaDownload className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaClock className="w-4 h-4" />
            <span>Last updated: {lastUpdated.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card, index) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
            onClick={() => {
              if (card.type === 'causes') {
                handleViewCausesAnalytics();
              } else if (card.type) {
                handleViewReport(card.type);
              }
            }}
          >
            <div className="p-6">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: card.gradient }}
              >
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{card.description}</p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">{card.stats.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-gray-900">{card.stats.value}</p>
                  {card.stats.growth !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      card.stats.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.stats.growth >= 0 ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
                      <span>{Math.abs(card.stats.growth)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {card.type && (
              <div className="px-6 py-3 bg-gray-50 flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">View Details</span>
                <FaFileAlt className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaChartLine className="w-5 h-5 text-blue-600" />
            Platform Overview
          </h2>
          <div className="relative inline-block">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md">
              <FaCalendarAlt className="w-4 h-4 text-blue-600" />
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value as typeof timeFilter)}
                className="appearance-none bg-transparent text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none pr-8 border-none"
                style={{ backgroundImage: 'none' }}
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <svg className="w-4 h-4 text-blue-600 pointer-events-none absolute right-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-900 font-medium">Total Waqfs</p>
              {analyticsData && analyticsData.waqfsGrowth >= 0 ? 
                <FaArrowUp className="w-4 h-4 text-blue-600" /> :
                <FaArrowDown className="w-4 h-4 text-blue-600" />
              }
            </div>
            <p className="text-3xl font-bold text-blue-900">{analyticsData?.totalWaqfs || 0}</p>
            <p className="text-xs text-blue-700 mt-1">
              {analyticsData ? `${analyticsData.waqfsGrowth >= 0 ? '+' : ''}${analyticsData.waqfsGrowth}%` : 'N/A'} from last period
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-green-900 font-medium">Active Causes</p>
              <FaCheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{analyticsData?.activeCauses || 0}</p>
            <p className="text-xs text-green-700 mt-1">
              {analyticsData ? `${analyticsData.causesGrowth >= 0 ? '+' : ''}${analyticsData.causesGrowth}%` : 'N/A'} from last period
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-purple-900 font-medium">Beneficiaries</p>
              <FaUsers className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-900">{analyticsData?.totalBeneficiaries || 0}</p>
            <p className="text-xs text-purple-700 mt-1">+15% from last period</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-yellow-900 font-medium">Donations</p>
              <FaDollarSign className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-900">${(analyticsData?.totalDonations || 0).toLocaleString()}</p>
            <p className="text-xs text-yellow-700 mt-1">
              {analyticsData ? `${analyticsData.donationsGrowth >= 0 ? '+' : ''}${analyticsData.donationsGrowth}%` : 'N/A'} from last period
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Waqfs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaArrowUp className="w-5 h-5 text-green-600" />
            Top Performing Waqfs
          </h3>
          <div className="space-y-3">
            {analyticsData?.topWaqfs && analyticsData.topWaqfs.length > 0 ? (
              analyticsData.topWaqfs.map((waqf, index) => (
                <div key={waqf.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{waqf.name}</p>
                      <p className="text-xs text-gray-500">{waqf.causesCount} causes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">${waqf.totalRaised.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">raised</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaClock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No waqfs available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaClock className="w-5 h-5 text-blue-600" />
            Recent Activities
          </h3>
          <div className="space-y-3">
            {analyticsData?.recentActivities && analyticsData.recentActivities.length > 0 ? (
              analyticsData.recentActivities.map((activity, index) => {
                const getActivityIcon = () => {
                  switch (activity.type) {
                    case 'donation': return FaDollarSign;
                    case 'waqf_created': return FaHandHoldingHeart;
                    case 'cause_added': return FaCheckCircle;
                    case 'report_generated': return FaFileAlt;
                    default: return FaFileAlt;
                  }
                };
                const Icon = getActivityIcon();
                const timeAgo = new Date().getTime() - activity.timestamp.getTime();
                const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
                const timeText = hoursAgo < 1 ? 'Just now' : 
                                 hoursAgo < 24 ? `${hoursAgo} hours ago` : 
                                 `${Math.floor(hoursAgo / 24)} days ago`;
                
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{activity.type.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeText}</p>
                    </div>
                    <FaArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaClock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {selectedWaqf && showReport && (
        <ReportModal
          waqf={{ ...selectedWaqf }}
          isOpen={showReport}
          onClose={() => {
            setShowReport(false);
            setSelectedWaqf(null);
            setReportType(null);
          }}
        />
      )}

      {/* Causes Analytics Modal */}
      <CausesAnalyticsModal
        isOpen={showCausesAnalytics}
        onClose={() => setShowCausesAnalytics(false)}
        waqfs={waqfs}
      />
    </div>
  );
}
