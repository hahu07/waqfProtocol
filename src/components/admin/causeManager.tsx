// components/admin/CauseManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Cause, CauseDoc } from "@/types/waqfs";
import { CauseFormModal } from './causeFormModal';
import type { AdminManagerProps } from './types';
import { listCauses, createCause, updateCause, deleteCause, approveCause, rejectCause } from '@/lib/cause-utils';
import { canApproveCauses, canManageCauses } from '@/lib/admin-utils';
import ReactMarkdown from 'react-markdown';
import { logger } from '@/lib/logger';

export function CauseManager({ 
  showHeader = true,
  headerTitle = 'Cause Management'
}: AdminManagerProps) {
  const { isAdmin, user } = useAuth();
  const [causes, setCauses] = useState<CauseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCause, setEditingCause] = useState<CauseDoc | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [canApprove, setCanApprove] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const loadCauses = async () => {
    try {
      setLoading(true);
      setError(null);
      const causes = await listCauses();
      // Convert to CauseDoc format for compatibility
      const causeDocs: CauseDoc[] = causes.map(cause => ({
        key: cause.id,
        data: cause,
        created_at: BigInt(new Date(cause.createdAt).getTime() * 1000000),
        updated_at: BigInt(new Date(cause.updatedAt).getTime() * 1000000),
        version: BigInt(1)
      }));
      setCauses(causeDocs);
    } catch (error) {
      logger.error('Error loading causes', error instanceof Error ? error : { error });
      setError('Failed to load causes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCauses();
  }, []);

  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (user?.key) {
        const hasApprovalPermission = await canApproveCauses(user.key);
        const hasManagementPermission = await canManageCauses(user.key);
        setCanApprove(hasApprovalPermission);
        setCanManage(hasManagementPermission);
      }
    };
    checkPermissions();
  }, [user]);

  const handleSaveCause = async (causeData: Omit<Cause, 'createdAt' | 'updatedAt'>) => {
    try {
      const userId = user?.key || 'unknown';
      const userName = 'Admin'; // You could get this from user profile if available
      
      if (editingCause) {
        // Update existing cause
        await updateCause(editingCause.key, causeData, userId, userName);
      } else {
        // Create new cause
        await createCause(causeData, userId, userName);
      }

      await loadCauses();
      setShowForm(false);
      setEditingCause(null);
    } catch (error) {
      logger.error('Error saving cause', error instanceof Error ? error : { error });
    }
  };

  const handleDelete = async (key: string) => {
    try {
      setDeletingId(key);
      const userId = user?.key || 'unknown';
      const userName = 'Admin'; // You could get this from user profile if available
      await deleteCause(key, userId, userName);
      await loadCauses();
    } catch (error) {
      logger.error('Error deleting cause', error instanceof Error ? error : { error });
      setDeleteError('Failed to delete cause. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleApprove = async (key: string) => {
    try {
      setApprovingId(key);
      const userId = user?.key || 'unknown';
      const userName = 'Admin';
      await approveCause(key, userId, userName);
      await loadCauses();
    } catch (error) {
      logger.error('Error approving cause', error instanceof Error ? error : { error });
      setError('Failed to approve cause. Please try again.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (key: string) => {
    try {
      setRejectingId(key);
      const userId = user?.key || 'unknown';
      const userName = 'Admin';
      await rejectCause(key, userId, userName);
      await loadCauses();
    } catch (error) {
      logger.error('Error rejecting cause', error instanceof Error ? error : { error });
      setError('Failed to reject cause. Please try again.');
    } finally {
      setRejectingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Admin privileges required</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderEmptyState = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #9333ea)' }}>
          <span className="text-4xl">🎯</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Causes Yet</h3>
        <p className="text-gray-600 mb-6">Start by creating your first charitable cause</p>
        {canManage ? (
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
          >
            ✨ Create First Cause
          </button>
        ) : (
          <p className="text-gray-500 text-sm">
            🔒 Only Waqf Managers can create causes
          </p>
        )}
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-white rounded-xl shadow-lg border border-red-200 p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Causes</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={loadCauses}
          className="px-8 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
        >
          🔄 Retry
        </button>
      </div>
    </div>
  );

  const renderCausesList = () => (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Causes Management</h1>
            <p className="text-gray-600">Manage charitable causes and approve new submissions</p>
          </div>
          {canManage ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
            >
              ✨ Add New Cause
            </button>
          ) : (
            <div className="text-right">
              <p className="text-sm text-gray-500">🔒 Only Waqf Managers can create causes</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card - Visibility Requirements */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              📋 Public Visibility Requirements
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              <strong className="text-purple-600">NEW APPROVAL WORKFLOW:</strong> All causes now require approval before going public.
            </p>
            <div className="space-y-3">
              <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
                <h4 className="font-semibold text-gray-800 text-sm mb-2">📋 Cause Creation Process:</h4>
                <ol className="text-xs text-gray-700 space-y-1 ml-2">
                  <li><strong>1.</strong> <span className="text-purple-600 font-semibold">Waqf Managers</span> create causes (starts as <span className="px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">⏳ Pending</span>)</li>
                  <li><strong>2.</strong> <span className="text-blue-600 font-semibold">Compliance Officers</span> review and approve/reject</li>
                  <li><strong>3.</strong> Only <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">✅ Approved</span> + <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">✅ Active</span> appear publicly</li>
                </ol>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
                <h4 className="font-semibold text-gray-800 text-sm mb-2">🔐 Permission Levels:</h4>
                <ul className="text-xs text-gray-700 space-y-1 ml-2">
                  <li>• <strong>Waqf Manager:</strong> Create/edit causes only</li>
                  <li>• <strong>Compliance Officer:</strong> Approve/reject + change visibility</li>
                  <li>• <strong>Platform Admin:</strong> Full access to all functions</li>
                  <li>• <strong>Other Roles:</strong> View-only access</li>
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
      
      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold text-red-900 mb-1">Delete Error</p>
            <p className="text-sm text-red-700">{deleteError}</p>
          </div>
        </div>
      )}
      
      {/* Causes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {causes.map((cause) => (
          <div key={cause.key} className="group bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 flex flex-col">
            {/* Cover Image */}
            {cause.data.coverImage && (
              <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                <img 
                  src={cause.data.coverImage} 
                  alt={cause.data.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg">
                  <span className="text-3xl">{cause.data.icon}</span>
                </div>
                {/* Status Badges on Image */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-lg backdrop-blur-md ${
                    cause.data.isActive 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-gray-500/90 text-white'
                  }`}>
                    {cause.data.isActive ? '✅ Active' : '⏸️ Inactive'}
                  </span>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-lg backdrop-blur-md ${
                    cause.data.status === 'approved' ? 'bg-blue-500/90 text-white' :
                    cause.data.status === 'pending' ? 'bg-yellow-500/90 text-white' :
                    'bg-red-500/90 text-white'
                  }`}>
                    {cause.data.status === 'approved' ? '✔️ Approved' :
                     cause.data.status === 'pending' ? '⏳ Pending' :
                     '❌ Rejected'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100 flex-1">
              <div className="flex items-start gap-4 mb-4">
                {!cause.data.coverImage && (
                  <div className="relative">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                    >
                      {cause.data.icon}
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {cause.data.name}
                  </h3>
                  {!cause.data.coverImage && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-sm ${
                        cause.data.isActive 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {cause.data.isActive ? '✅ Active' : '⏸️ Inactive'}
                      </span>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-sm ${
                        cause.data.status === 'approved' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        cause.data.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {cause.data.status === 'approved' ? '✔️ Approved' :
                         cause.data.status === 'pending' ? '⏳ Pending' :
                         '❌ Rejected'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className={`text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none ${
                  expandedDescriptions.has(cause.key) ? '' : 'line-clamp-3'
                }`}>
                  <ReactMarkdown
                    components={{
                      img: ({node, ...props}) => (
                        <img {...props} className="rounded-lg max-w-full h-auto my-2" alt={props.alt || ''} />
                      ),
                      p: ({node, ...props}) => <p {...props} className="mb-2" />
                    }}
                  >
                    {cause.data.description}
                  </ReactMarkdown>
                </div>
                {cause.data.description.length > 150 && (
                  <button
                    onClick={() => {
                      setExpandedDescriptions(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(cause.key)) {
                          newSet.delete(cause.key);
                        } else {
                          newSet.add(cause.key);
                        }
                        return newSet;
                      });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs font-semibold mt-1 transition-colors"
                  >
                    {expandedDescriptions.has(cause.key) ? '▲ Show less' : '▼ Read more'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Financial & Waqf Info */}
            <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-blue-50/30 border-y border-gray-100 space-y-4">
              {/* Target Amount & Progress */}
              {cause.data.targetAmount && (() => {
                const currency = cause.data.primaryCurrency || 'NGN';
                const rate = cause.data.exchangeRateToUSD || 1650;
                const isUSD = currency === 'USD';
                
                // Get currency symbol
                const getCurrencySymbol = (curr: string) => {
                  switch(curr) {
                    case 'NGN': return '₦';
                    case 'EUR': return '€';
                    case 'GBP': return '£';
                    case 'SAR': return 'SR';
                    case 'AED': return 'د.إ';
                    default: return '$';
                  }
                };
                
                const symbol = getCurrencySymbol(currency);
                const targetPrimary = cause.data.targetAmount;
                const raisedPrimary = cause.data.fundsRaised || 0;
                const remainingPrimary = Math.max(0, targetPrimary - raisedPrimary);
                
                // Calculate USD equivalent if not already USD
                const targetUSD = isUSD ? targetPrimary : targetPrimary / rate;
                const raisedUSD = isUSD ? raisedPrimary : raisedPrimary / rate;
                const remainingUSD = isUSD ? remainingPrimary : remainingPrimary / rate;
                
                return (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">🎯 Funding Goal</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600">{symbol}{targetPrimary.toLocaleString()}</div>
                      {!isUSD && (
                        <div className="text-xs text-gray-500">${targetUSD.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${Math.min(100, ((cause.data.fundsRaised || 0) / cause.data.targetAmount) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
                      {Math.round(((cause.data.fundsRaised || 0) / cause.data.targetAmount) * 100)}%
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-500">Raised: </span>
                      <div className="font-bold text-green-600">
                        {symbol}{raisedPrimary.toLocaleString()}
                        {!isUSD && (
                          <div className="text-gray-500 font-normal">≈ ${raisedUSD.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500">Remaining: </span>
                      <div className="font-bold text-orange-600">
                        {symbol}{remainingPrimary.toLocaleString()}
                        {!isUSD && (
                          <div className="text-gray-500 font-normal">≈ ${remainingUSD.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
              
              {/* Supported Waqf Types */}
              {cause.data.supportedWaqfTypes && cause.data.supportedWaqfTypes.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">🏛️ Waqf Types</div>
                  <div className="flex flex-wrap gap-2">
                    {cause.data.supportedWaqfTypes.map((type: string) => (
                      <span 
                        key={type}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm border ${
                          type === 'permanent' ? 'bg-green-50 text-green-700 border-green-200' :
                          type === 'temporary_consumable' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {type === 'permanent' ? '💎 Permanent' :
                         type === 'temporary_consumable' ? '⚡ Consumable' :
                         '🔄 Revolving'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Card Footer */}
            <div className="p-5 bg-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">👥</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Followers</div>
                  <div className="text-sm font-bold text-gray-900">{cause.data.followers || 0}</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {canManage && (
                  <button
                    onClick={() => {
                      setEditingCause(cause);
                      setShowForm(true);
                    }}
                    className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all text-sm shadow-sm hover:shadow"
                  >
                    ✏️ Edit
                  </button>
                )}
                {canManage && (
                  <button
                    onClick={() => handleDelete(cause.key)}
                    disabled={deletingId === cause.key}
                    className={`px-4 py-2 bg-white border-2 border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 hover:border-red-400 transition-all text-sm shadow-sm hover:shadow ${
                      deletingId === cause.key ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {deletingId === cause.key ? '⏳ Deleting...' : '🗑️ Delete'}
                  </button>
                )}
                {canApprove && cause.data.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(cause.key)}
                      disabled={approvingId === cause.key}
                      className={`px-4 py-2 bg-green-500 border-2 border-green-600 text-white rounded-lg font-bold hover:bg-green-600 transition-all text-sm shadow-md hover:shadow-lg ${
                        approvingId === cause.key ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {approvingId === cause.key ? '⏳ Approving...' : '✅ Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(cause.key)}
                      disabled={rejectingId === cause.key}
                      className={`px-4 py-2 bg-orange-500 border-2 border-orange-600 text-white rounded-lg font-bold hover:bg-orange-600 transition-all text-sm shadow-md hover:shadow-lg ${
                        rejectingId === cause.key ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {rejectingId === cause.key ? '⏳ Rejecting...' : '❌ Reject'}
                    </button>
                  </>
                )}
                {!canManage && !canApprove && (
                  <div className="text-xs text-gray-500 italic p-2">
                    🔒 Viewing only - no edit permissions
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );

  return (
    <>
      {error && !loading ? renderErrorState() :
       !loading && causes.length === 0 ? renderEmptyState() :
       renderCausesList()}
      
      {showForm && (
        <CauseFormModal
          isOpen={showForm}
          cause={editingCause?.data}
          onSave={handleSaveCause}
          onClose={() => {
            setShowForm(false);
            setEditingCause(null);
          }}
        />
      )}
    </>
  );
}
