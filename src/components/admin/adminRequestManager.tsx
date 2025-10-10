// components/admin/AdminRequestManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import type { AdminRequestDoc, AdminRole, AdminRequestStatus, AdminPermission } from '@/lib/admin-utils';
import { 
  listAdminRequests, 
  approveAdminRequest, 
  rejectAdminRequest,
  createAdminRequest,
  canCreateAdminRequests,
  canApproveAdminRequests
} from '@/lib/admin-utils';

interface AdminRequestFormData {
  targetUserId: string;
  targetUserEmail: string;
  targetUserName: string;
  targetRole: AdminRole;
  reason: string;
  type: 'add' | 'remove';
}

export function AdminRequestManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [requests, setRequests] = useState<AdminRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [formData, setFormData] = useState<AdminRequestFormData>({
    targetUserId: '',
    targetUserEmail: '',
    targetUserName: '',
    targetRole: 'support_agent',
    reason: '',
    type: 'add'
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const allRequests = await listAdminRequests();
      // Sort by most recent first
      allRequests.sort((a, b) => b.data.requestedAt - a.data.requestedAt);
      setRequests(allRequests);
    } catch (error) {
      console.error('Error loading admin requests:', error);
      setError('Failed to load admin requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (user?.key) {
        const hasCreatePermission = await canCreateAdminRequests(user.key);
        const hasApprovalPermission = await canApproveAdminRequests(user.key);
        setCanCreate(hasCreatePermission);
        setCanApprove(hasApprovalPermission);
      }
    };
    checkPermissions();
  }, [user]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.key) return;

    try {
      setProcessingId('creating');
      await createAdminRequest(
        user.key,
        formData.type,
        formData.targetUserId,
        formData.reason,
        formData.targetUserEmail,
        formData.targetUserName,
        formData.type === 'add' ? formData.targetRole : undefined
      );
      
      await loadRequests();
      setShowForm(false);
      setFormData({
        targetUserId: '',
        targetUserEmail: '',
        targetUserName: '',
        targetRole: 'support_agent',
        reason: '',
        type: 'add'
      });
    } catch (error) {
      console.error('Error creating admin request:', error);
      setError(error instanceof Error ? error.message : 'Failed to create request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (requestId: string, notes?: string) => {
    if (!user?.key) return;

    try {
      setProcessingId(requestId);
      await approveAdminRequest(requestId, user.key, notes);
      await loadRequests();
      // Invalidate the admin list cache to refresh the admin count and list
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    } catch (error) {
      console.error('Error approving request:', error);
      setError(error instanceof Error ? error.message : 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, notes: string) => {
    if (!user?.key || !notes.trim()) return;

    try {
      setProcessingId(requestId);
      await rejectAdminRequest(requestId, user.key, notes);
      await loadRequests();
      // Invalidate admin cache (mainly for consistency, rejection doesn't change admin list)
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError(error instanceof Error ? error.message : 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: AdminRequestStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: AdminRequestStatus) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Request Management</h1>
            <p className="text-gray-600">Two-stage admin approval workflow</p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
            >
              ✨ Create Admin Request
            </button>
          )}
        </div>
      </div>

      {/* Info Card - Workflow Explanation */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              🔐 Admin Management Workflow
            </h3>
            <div className="space-y-3">
              <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
                <h4 className="font-semibold text-gray-800 text-sm mb-2">📋 Two-Stage Approval Process:</h4>
                <ol className="text-xs text-gray-700 space-y-1 ml-2">
                  <li><strong>1.</strong> <span className="text-purple-600 font-semibold">Compliance Officers</span> create admin add/remove requests</li>
                  <li><strong>2.</strong> <span className="text-blue-600 font-semibold">Platform Admins</span> review and approve/reject requests</li>
                  <li><strong>3.</strong> Only approved requests execute admin changes</li>
                </ol>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
                <h4 className="font-semibold text-gray-800 text-sm mb-2">🔐 Permission Levels:</h4>
                <ul className="text-xs text-gray-700 space-y-1 ml-2">
                  <li>• <strong>Compliance Officer:</strong> Create admin requests only</li>
                  <li>• <strong>Platform Admin:</strong> Approve requests + direct admin access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold text-red-900 mb-1">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Admin Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {requests.map((request) => (
          <div key={request.key} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Request Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {request.data.type === 'add' ? '➕' : '➖'} {request.data.type === 'add' ? 'Add Admin' : 'Remove Admin'}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${getStatusColor(request.data.status)}`}>
                      {getStatusIcon(request.data.status)} {request.data.status.charAt(0).toUpperCase() + request.data.status.slice(1)}
                    </span>
                    {request.data.targetRole && (
                      <span className="text-xs px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">
                        {request.data.targetRole}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Target User:</strong> {request.data.targetUserName || request.data.targetUserId}</p>
                {request.data.targetUserEmail && (
                  <p><strong>Email:</strong> {request.data.targetUserEmail}</p>
                )}
                <p><strong>Requested:</strong> {new Date(request.data.requestedAt).toLocaleDateString()}</p>
                <p><strong>Reason:</strong> {request.data.reason}</p>
                {request.data.reviewedBy && (
                  <>
                    <p><strong>Reviewed by:</strong> {request.data.reviewedBy}</p>
                    <p><strong>Reviewed:</strong> {new Date(request.data.reviewedAt!).toLocaleDateString()}</p>
                    {request.data.reviewNotes && (
                      <p><strong>Notes:</strong> {request.data.reviewNotes}</p>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            {canApprove && request.data.status === 'pending' && (
              <div className="p-4 bg-gray-50 flex items-center gap-2">
                <button
                  onClick={() => handleApprove(request.key, 'Approved by Platform Admin')}
                  disabled={processingId === request.key}
                  className={`px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg font-semibold hover:bg-green-100 transition-colors text-sm ${
                    processingId === request.key ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {processingId === request.key ? '⏳ Processing...' : '✅ Approve'}
                </button>
                <button
                  onClick={() => {
                    const notes = prompt('Rejection reason (required):');
                    if (notes) handleReject(request.key, notes);
                  }}
                  disabled={processingId === request.key}
                  className={`px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold hover:bg-red-100 transition-colors text-sm ${
                    processingId === request.key ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {processingId === request.key ? '⏳ Processing...' : '❌ Reject'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #9333ea)' }}>
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Admin Requests</h3>
            <p className="text-gray-600 mb-6">No admin requests have been created yet</p>
            {canCreate && (
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
              >
                ✨ Create First Request
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create Admin Request</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'add' | 'remove' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="add">Add Admin</option>
                    <option value="remove">Remove Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <input
                    type="text"
                    value={formData.targetUserId}
                    onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="User ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                  <input
                    type="text"
                    value={formData.targetUserName}
                    onChange={(e) => setFormData({ ...formData, targetUserName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.targetUserEmail}
                    onChange={(e) => setFormData({ ...formData, targetUserEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="user@example.com"
                  />
                </div>

                {formData.type === 'add' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value as AdminRole })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="support_agent">Support Agent</option>
                      <option value="content_moderator">Content Moderator</option>
                      <option value="waqf_manager">Waqf Manager</option>
                      <option value="finance_officer">Finance Officer</option>
                      <option value="compliance_officer">Compliance Officer</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Justification for this admin request..."
                    rows={3}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={processingId === 'creating'}
                    className={`flex-1 py-3 text-white rounded-lg font-semibold transition-colors ${
                      processingId === 'creating' ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''
                    }`}
                    style={processingId !== 'creating' ? { background: 'linear-gradient(to right, #2563eb, #9333ea)' } : {}}
                  >
                    {processingId === 'creating' ? '⏳ Creating...' : '📝 Create Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}