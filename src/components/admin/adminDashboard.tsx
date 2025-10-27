'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaUsers, FaLandmark, FaFileAlt, FaCog, FaMoneyBillWave } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import { useFetchWaqfData } from '@/hooks/useWaqfData';
import { useRecentActivities } from '@/hooks/useRecentActivities';
import { useRouter } from 'next/navigation';
import { logActivity } from '@/lib/activity-utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { useEffect } from 'react';
import type { AdminManagerProps } from './types';

type StatCard = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  badge?: { label: string; variant: 'destructive' | 'default' | 'outline' | 'secondary' };
};

type ActivityItem = {
  id: string;
  user: string;
  action: string;
  time: string;
};

export const AdminDashboard: React.FC<AdminManagerProps> = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { waqf, causes, assets, allocations, loading, error } = useFetchWaqfData();
  const { activities: recentActivity, loading: activitiesLoading, error: activitiesError, refetch: refetchActivities } = useRecentActivities(5);
  
  // Log dashboard access activity
  useEffect(() => {
    if (user?.key) {
      logActivity(
        'login_activity',
        user.key,
        'Admin User', // You could get the actual name from user profile
        {
          targetName: 'Admin Dashboard'
        }
      );
    }
  }, [user?.key]);

  // Real data metrics
  const totalCauses = causes?.length || 0;
  const activeCauses = causes?.filter(c => c.isActive)?.length || 0;
  const pendingCauses = causes?.filter(c => c.status === 'pending')?.length || 0;
  const approvedCauses = causes?.filter(c => c.status === 'approved')?.length || 0;
  const totalAssets = assets?.length || 0;
  const totalFundsRaised = causes?.reduce((sum, c) => sum + (c.fundsRaised || 0), 0) || 0;

  const stats: StatCard[] = [
    {
      title: 'Total Causes',
      value: totalCauses,
      icon: <FaFileAlt className="h-4 w-4" />,
    },
    {
      title: 'Active Causes',
      value: activeCauses,
      icon: <FaFileAlt className="h-4 w-4" />,
    },
    {
      title: 'Approved Causes',
      value: approvedCauses,
      icon: <FaFileAlt className="h-4 w-4" />,
    },
    {
      title: 'Waqf Assets',
      value: totalAssets,
      icon: <FaLandmark className="h-4 w-4" />,
    },
    {
      title: 'Pending Approvals',
      value: pendingCauses,
      icon: <FaFileAlt className="h-4 w-4" />,
      badge: pendingCauses > 0 ? { label: 'Urgent', variant: 'destructive' } as const : undefined,
    },
  ];

  // Recent activity data is now fetched dynamically via useRecentActivities hook

  const quickActions = [
    { label: 'Manage Users', icon: <FaUsers className="h-5 w-5" />, href: '/admin/users' },
    { label: 'Distributions', icon: <FaMoneyBillWave className="h-5 w-5" />, href: '/admin/distributions' },
    { label: 'View Reports', icon: <FaFileAlt className="h-5 w-5" />, href: '/admin/reports' },
    { label: 'System Settings', icon: <FaCog className="h-5 w-5" />, href: '/admin/settings' },
  ];

  if (loading) return (
    <div className="space-y-6 p-2 sm:p-6">
      {/* Skeleton Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map((i) => (
          <Card key={i} className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skeleton Quick Actions */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {[1,2,3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Skeleton Recent Activity */}
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-start gap-4 flex-col sm:flex-row">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (error) {
    // Check if it's a collection not found error
    const isCollectionError = error.message.includes('not_found') || error.message.includes('Datastore');
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">{isCollectionError ? '📦' : '⚠️'}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isCollectionError ? 'Collections Not Set Up' : 'Error Loading Dashboard'}
              </h3>
              <p className="text-gray-600 mb-4">{error.message}</p>
              
              {isCollectionError && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">🔧 Setup Required:</p>
                  <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                    <li>Go to <a href="https://console.juno.build/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Juno Console</a></li>
                    <li>Select your satellite</li>
                    <li>Go to <strong>Datastore</strong> section</li>
                    <li>Create these collections with <strong>Read: managed, Write: managed</strong>:</li>
                  </ol>
                  <div className="mt-3 ml-8">
                    <code className="text-xs bg-white px-2 py-1 rounded border border-blue-300 inline-block mb-1">waqfs</code>{' '}
                    <code className="text-xs bg-white px-2 py-1 rounded border border-blue-300 inline-block mb-1">causes</code>{' '}
                    <code className="text-xs bg-white px-2 py-1 rounded border border-blue-300 inline-block mb-1">donations</code>{' '}
                    <code className="text-xs bg-white px-2 py-1 rounded border border-blue-300 inline-block mb-1">allocations</code>{' '}
                    <code className="text-xs bg-white px-2 py-1 rounded border border-blue-300 inline-block mb-1">admins</code>
                  </div>
                  <div className="mt-3 ml-8">
                    <p className="text-xs text-blue-700">For assets:</p>
                    <code className="text-xs bg-white px-2 py-1 rounded border border-blue-300 inline-block">cause_images</code>
                    <span className="text-xs text-blue-700 ml-2">(Type: Assets, Read: public, Write: managed)</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  🔄 Retry
                </Button>
                <a 
                  href="https://console.juno.build/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  🚀 Open Juno Console
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your Waqf Protocol platform</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Last updated:</span>
            <span className="text-sm font-medium text-gray-900">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => {
          const gradients = [
            'linear-gradient(135deg, #2563eb, #9333ea)',
            'linear-gradient(135deg, #10b981, #059669)',
            'linear-gradient(135deg, #06b6d4, #0891b2)',
            'linear-gradient(135deg, #f59e0b, #d97706)',
            'linear-gradient(135deg, #ef4444, #dc2626)',
          ];
          const emojis = ['📊', '✅', '🎯', '🏛️', '⏳'];
          
          return (
            <div 
              key={stat.title} 
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">{stat.title}</p>
                    {stat.badge && (
                      <Badge variant={stat.badge.variant} className="text-xs mt-1">
                        {stat.badge.label}
                      </Badge>
                    )}
                  </div>
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
                    style={{ background: gradients[index % gradients.length] }}
                  >
                    <span className="text-2xl">{emojis[index]}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {index === 0 && totalCauses > 0 && (
                    <span className="text-sm text-gray-500">
                      ({activeCauses} active)
                    </span>
                  )}
                </div>
                {/* Subtitle with additional info */}
                <p className="text-xs text-gray-500 mt-2">
                  {index === 0 && `${activeCauses} active, ${totalCauses - activeCauses} inactive`}
                  {index === 1 && `${totalCauses - activeCauses} inactive`}
                  {index === 2 && `${pendingCauses} pending approval`}
                  {index === 3 && totalAssets > 0 && `Managing ${totalAssets} ${totalAssets === 1 ? 'asset' : 'assets'}`}
                  {index === 4 && pendingCauses === 0 && 'All caught up! 🎉'}
                  {index === 4 && pendingCauses > 0 && `${pendingCauses} ${pendingCauses === 1 ? 'cause' : 'causes'} awaiting review`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            const gradients = [
              'linear-gradient(135deg, #2563eb, #9333ea)',
              'linear-gradient(135deg, #10b981, #059669)',
              'linear-gradient(135deg, #9333ea, #4338ca)',
              'linear-gradient(135deg, #4338ca, #2563eb)',
            ];
            return (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex flex-col items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
                    style={{ background: gradients[index % gradients.length] }}
                  >
                    {action.icon}
                  </div>
                  <span className="font-semibold text-gray-900">{action.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <button
            onClick={refetchActivities}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 flex items-center gap-1"
            disabled={activitiesLoading}
          >
            {activitiesLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
        <div className="p-6">
          {activitiesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : activitiesError ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Activities</h3>
              <p className="text-gray-600 mb-4">{activitiesError}</p>
              <button
                onClick={refetchActivities}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
              <p className="text-gray-600">Activity will appear here as users interact with the platform</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}
                    style={{ background: activity.color }}
                  >
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 capitalize">{activity.type.replace('_', ' ')}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
