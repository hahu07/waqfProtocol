// src/components/admin/AdminList.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { removeAdmin, updateAdmin, type AdminPermission, type AdminRole } from '@/lib/admin-utils';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import type { AdminManagerProps } from './types';

const getRoleFromPermissions = (permissions: AdminPermission[]): AdminRole => {
  if (permissions.includes('platform_governance')) return 'platform_admin';
  if (permissions.includes('audit_compliance') && permissions.includes('financial_oversight')) return 'compliance_officer';
  if (permissions.includes('financial_oversight')) return 'finance_officer';
  if (permissions.includes('waqf_management')) return 'waqf_manager';
  if (permissions.includes('content_moderation')) return 'content_moderator';
  return 'support_agent';
};

export function AdminList({ admins, isLoading, headerTitle, refetch }: AdminManagerProps & { refetch?: () => void }) {
  const { user } = useAuth();
  const [adminToRemove, setAdminToRemove] = useState<string | null>(null);
  const [adminToEdit, setAdminToEdit] = useState<{userId: string; permissions: AdminPermission[]} | null>(null);

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user?.key) throw new Error('Not authenticated');
      await removeAdmin(userId, user.key);
    },
    onSuccess: () => {
      toast.success('Admin removed successfully');
      setAdminToRemove(null);
      refetch?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove admin');
    }
  });

  const editMutation = useMutation({
    mutationFn: async ({ userId, permissions }: {userId: string; permissions: AdminPermission[]}) => {
      if (!user?.key) throw new Error('Not authenticated');
      // Only pass permissions, don't change role automatically
      await updateAdmin(userId, user.key, undefined, permissions);
    },
    onSuccess: () => {
      toast.success('Permissions updated successfully');
      setAdminToEdit(null);
      refetch?.();
      // Activity is already logged by updateAdmin function in admin-utils.ts
    },
    onError: (error) => {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to update permissions',
        {
          duration: 5000,
          action: {
            label: 'Retry',
            onClick: () => {
              if (adminToEdit) {
                editMutation.mutate(adminToEdit);
              }
            }
          }
        }
      );
    }
  });

  if (isLoading) return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4" />
      <p className="text-gray-500 font-medium">Loading administrators...</p>
    </div>
  );
  
  if (!admins?.length) return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">👥</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Administrators Found</h3>
      <p className="text-gray-500">Add your first administrator to get started.</p>
    </div>
  );

  const activeAdmins = admins.filter(admin => !admin.data.deleted);

  return (
    <div className="space-y-6">
      {headerTitle && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{headerTitle}</h2>
          <div className="text-sm text-gray-500">
            {activeAdmins.length} active administrator{activeAdmins.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px] sm:min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 py-4">User ID</TableHead>
                <TableHead className="font-semibold text-gray-900 py-4">Name</TableHead>
                <TableHead className="font-semibold text-gray-900 py-4">Email</TableHead>
                <TableHead className="font-semibold text-gray-900 py-4">Permissions</TableHead>
                <TableHead className="font-semibold text-gray-900 py-4">Added On</TableHead>
                <TableHead className="font-semibold text-gray-900 py-4 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeAdmins.map((admin, index) => (
                <TableRow key={admin.key} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-mono text-sm py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {(admin.data.name || admin.key).charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{admin.key.substring(0, 12)}...</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm py-4 font-medium">
                    {admin.data.name || 'Unnamed Admin'}
                  </TableCell>
                  <TableCell className="text-sm py-4 text-gray-600">
                    {admin.data.email || 'No email provided'}
                  </TableCell>
                  <TableCell className="text-sm py-4">
                    <div className="flex flex-wrap gap-1">
                      {admin.data.permissions.map((p) => {
                        const isHighLevel = p === 'platform_governance';
                        const isFinancial = p === 'financial_oversight' || p === 'audit_compliance';
                        const isWaqfCore = p === 'waqf_management' || p === 'cause_management';
                        
                        return (
                          <Badge 
                            key={p} 
                            className={`text-xs font-medium ${
                              isHighLevel 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0' 
                                : isFinancial
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0'
                                : isWaqfCore
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0'
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}
                          >
                            {isHighLevel && '🏛️ '}
                            {isFinancial && '💰 '}
                            {isWaqfCore && '🕌 '}
                            {p === 'content_moderation' && '🛡️ '}
                            {p === 'user_support' && '🎧 '}
                            {p === 'system_administration' && '⚙️ '}
                            {p.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm py-4 text-gray-600">
                    {new Date(admin.data.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium"
                        onClick={() => {
                          const foundAdmin = admins.find(a => a.key === admin.key);
                          if (foundAdmin) {
                            setAdminToEdit({
                              userId: foundAdmin.key,
                              permissions: foundAdmin.data.permissions
                            });
                          }
                        }}
                      >
                        ✏️ Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 font-medium"
                        onClick={() => setAdminToRemove(admin.key)}
                      >
                        🗑️ Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit admin dialog */}
      {adminToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Administrator</h3>
                <button
                  onClick={() => setAdminToEdit(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Administrator ID</div>
                  <div className="font-mono text-sm font-medium">{adminToEdit.userId}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {['user_support', 'content_moderation', 'waqf_management', 'cause_management', 'financial_oversight', 'audit_compliance', 'system_administration', 'platform_governance'].map((permission) => {
                      const isChecked = adminToEdit.permissions.includes(permission as AdminPermission);
                      const isHighLevel = permission === 'platform_governance';
                      const isFinancial = permission === 'financial_oversight' || permission === 'audit_compliance';
                      const isWaqfCore = permission === 'waqf_management' || permission === 'cause_management';
                      
                      const getPermissionLabel = (perm: string) => {
                        switch(perm) {
                          case 'user_support': return 'User Support & Assistance';
                          case 'content_moderation': return 'Content Moderation';
                          case 'waqf_management': return 'Waqf Endowment Management';
                          case 'cause_management': return 'Charitable Cause Management';
                          case 'financial_oversight': return 'Financial Oversight & Reports';
                          case 'audit_compliance': return 'Audit & Compliance Monitoring';
                          case 'system_administration': return 'System Administration';
                          case 'platform_governance': return 'Platform Governance (Full Access)';
                          default: return perm.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                        }
                      };
                      
                      return (
                        <div key={permission} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          isChecked 
                            ? isHighLevel
                              ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                              : isFinancial
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                              : isWaqfCore
                              ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                              : 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200'
                        }`}>
                          <input
                            type="checkbox"
                            id={`edit-${permission}`}
                            checked={isChecked}
                            onChange={(e) => {
                              const newPermissions = e.target.checked
                                ? [...adminToEdit.permissions, permission as AdminPermission]
                                : adminToEdit.permissions.filter(p => p !== permission);
                              setAdminToEdit({
                                ...adminToEdit,
                                permissions: newPermissions
                              });
                            }}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor={`edit-${permission}`} className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                            {isHighLevel && '🏛️'}
                            {isFinancial && '💰'}
                            {isWaqfCore && '🕌'}
                            {permission === 'content_moderation' && '🛡️'}
                            {permission === 'user_support' && '🎧'}
                            {permission === 'system_administration' && '⚙️'}
                            <span>{getPermissionLabel(permission)}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline"
                  onClick={() => setAdminToEdit(null)}
                  disabled={editMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => editMutation.mutate(adminToEdit)}
                  loading={editMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  disabled={adminToEdit.permissions.length === 0}
                >
                  {editMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    'Update Permissions'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Remove confirmation dialog */}
      {adminToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Confirm Removal</h3>
                <button
                  onClick={() => setAdminToRemove(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-600 text-lg">⚠️</span>
                    <span className="font-semibold text-red-800">Warning</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Are you sure you want to remove this administrator? This action cannot be undone.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Administrator ID:</div>
                  <div className="font-mono text-sm font-medium">{adminToRemove}</div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setAdminToRemove(null)}
                  disabled={removeMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => removeMutation.mutate(adminToRemove)}
                  loading={removeMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {removeMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Removing...
                    </span>
                  ) : (
                    'Remove Administrator'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}