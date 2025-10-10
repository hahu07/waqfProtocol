// src/components/admin/userManager.tsx
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { AdminList } from './AdminList';
import { AddAdminForm } from './AddAdminForm';
import { AuditLog } from './AuditLog';
import { AdminRequestManager } from './adminRequestManager';
import type { AdminManagerProps } from './types';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listAdmins, canCreateAdminRequests, canApproveAdminRequests } from '@/lib/admin-utils';

export function UserManager({ 
  showHeader = true,
  headerTitle = 'User Management'
}: AdminManagerProps) {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState('administrators');
  const [canCreateRequests, setCanCreateRequests] = useState(false);
  const [canApproveRequests, setCanApproveRequests] = useState(false);
  
  // Check admin request permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (user?.key) {
        const hasCreatePermission = await canCreateAdminRequests(user.key);
        const hasApprovalPermission = await canApproveAdminRequests(user.key);
        setCanCreateRequests(hasCreatePermission);
        setCanApproveRequests(hasApprovalPermission);
      }
    };
    checkPermissions();
  }, [user]);
  
  // Fetch admin data
  const {
    data: admins,
    isLoading: adminsLoading,
    refetch: refetchAdmins,
    error: adminsError
  } = useQuery({
    queryKey: ['admins'],
    queryFn: listAdmins,
    enabled: isAdmin
  });

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

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Professional Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#667eea' }}>
                {headerTitle}
              </h1>
              <p className="text-gray-600 mt-2" style={{ color: '#6b7280' }}>Manage administrators and monitor user activity</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500" style={{ color: '#6b7280' }}>Current User:</span>
                <span className="text-sm font-medium text-gray-900" style={{ color: '#111827' }}>
                  {user?.key?.substring(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600" style={{ color: '#6b7280' }}>Total Admins</p>
                <p className="text-2xl font-bold text-gray-900 mt-1" style={{ color: '#111827' }}>
                  {adminsLoading ? '...' : admins?.filter(admin => !admin.data.deleted).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600" style={{ color: '#6b7280' }}>Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1" style={{ color: '#111827' }}>
                  {adminsLoading ? '...' : admins?.filter(admin => !admin.data.deleted && admin.data.lastActive && (Date.now() - admin.data.lastActive) < 86400000).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🟢</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600" style={{ color: '#6b7280' }}>🏛️ Platform Admins</p>
                <p className="text-2xl font-bold text-gray-900 mt-1" style={{ color: '#111827' }}>
                  {adminsLoading ? '...' : admins?.filter(admin => !admin.data.deleted && admin.data.permissions.includes('platform_governance')).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('administrators')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                  activeTab === 'administrators'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>👥</span>
                  <span style={{ color: activeTab === 'administrators' ? '#ffffff' : '#6b7280' }}>Administrators</span>
                </span>
              </button>
              
              {(canCreateRequests || canApproveRequests) && (
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                    activeTab === 'requests'
                      ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>📝</span>
                    <span style={{ color: activeTab === 'requests' ? '#ffffff' : '#6b7280' }}>Admin Requests</span>
                  </span>
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                  activeTab === 'audit'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>📜</span>
                  <span style={{ color: activeTab === 'audit' ? '#ffffff' : '#6b7280' }}>Audit Log</span>
                </span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'administrators' && (
              <div className="space-y-6">
                {/* Show different content based on user permissions */}
                {canApproveRequests ? (
                  /* Platform Admins: Show traditional add admin form */
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Admin Management</h3>
                      <p className="text-sm text-gray-600">As a Platform Admin, you can directly add/remove admins or use the request workflow.</p>
                    </div>
                    <AddAdminForm currentUserId={user?.key} />
                  </div>
                ) : canCreateRequests ? (
                  /* Compliance Officers: Show request workflow info */
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-100">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <span className="text-xl text-white">🔐</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Request Workflow</h3>
                        <p className="text-sm text-gray-600 mb-3">As a Compliance Officer, you can create requests to add or remove admins. These requests require Platform Admin approval.</p>
                        <button
                          onClick={() => setActiveTab('requests')}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                        >
                          🚀 Go to Admin Requests
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Other admins: View only */
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                        <span className="text-xl text-white">👁️</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">View-Only Access</h3>
                        <p className="text-sm text-gray-600">Your current role has view-only access to admin management. Only Compliance Officers and Platform Admins can make changes.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Enhanced Admin List */}
                {adminsError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Admins</h3>
                    <p className="text-red-600 mb-4">There was an error fetching admin data.</p>
                    <button
                      onClick={() => refetchAdmins()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <AdminList 
                    admins={admins || []} 
                    isLoading={adminsLoading} 
                    refetch={refetchAdmins}
                    headerTitle="Current Administrators"
                  />
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <AdminRequestManager />
            )}
            
            {activeTab === 'audit' && (
              <AuditLog />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
