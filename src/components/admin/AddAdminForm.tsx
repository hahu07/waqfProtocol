'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthProvider';
import { addAdmin, type AdminPermission, type AdminRole } from '@/lib/admin-utils';
import { Button } from '@/components/ui/button';
import { CustomDialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const permissionOptions: { id: AdminPermission; label: string }[] = [
  { id: 'user_support', label: 'User Support & Assistance' },
  { id: 'content_moderation', label: 'Content Moderation' },
  { id: 'waqf_management', label: 'Waqf Endowment Management' },
  { id: 'cause_management', label: 'Charitable Cause Management' },
  { id: 'cause_approval', label: 'Approve/Reject Charitable Causes' },
  { id: 'financial_oversight', label: 'Financial Oversight & Reports' },
  { id: 'audit_compliance', label: 'Audit & Compliance Monitoring' },
  { id: 'admin_request_creation', label: 'Create Admin Add/Remove Requests' },
  { id: 'admin_request_approval', label: 'Approve/Reject Admin Requests' },
  { id: 'system_administration', label: 'System Administration' },
  { id: 'platform_governance', label: 'Platform Governance (Full Access)' }
];

interface AddAdminFormProps {
  currentUserId?: string;
}

export function AddAdminForm({ currentUserId }: AddAdminFormProps) {
  const { user } = useAuth();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<AdminPermission[]>(['user_support']);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const queryClient = useQueryClient();
  
  // Auto-populate user ID from current user
  useEffect(() => {
    if (user?.key && !userId) {
      setUserId(user.key);
    }
  }, [user?.key, userId]);

  const getRoleFromPermissions = (perms: AdminPermission[]): AdminRole => {
    if (perms.includes('platform_governance')) return 'platform_admin';
    if (perms.includes('audit_compliance') && (perms.includes('financial_oversight') || perms.includes('admin_request_creation'))) return 'compliance_officer';
    if (perms.includes('financial_oversight') && !perms.includes('admin_request_creation')) return 'finance_officer';
    if (perms.includes('waqf_management') || perms.includes('cause_management')) return 'waqf_manager';
    if (perms.includes('content_moderation')) return 'content_moderator';
    return 'support_agent';
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('Not authenticated');
      const role = getRoleFromPermissions(permissions);
      await addAdmin(
        userId, 
        currentUserId, 
        role, 
        email, 
        name, 
        `Direct admin addition by Platform Admin - Role: ${role}`,
        permissions
      );
    },
    onSuccess: () => {
      setSuccess(`${name || userId} added as admin successfully`);
      setUserId('');
      setName('');
      setEmail('');
      setPermissions(['user_support']);
      setOpenConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (error: Error) => {
      setError(error.message);
      setOpenConfirm(false);
    }
  });

  const togglePermission = (permission: AdminPermission, checked: boolean) => {
    setPermissions(prev =>
      checked
        ? [...prev, permission]
        : prev.filter(p => p !== permission)
    );
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">➕</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Add New Administrator</h2>
          <p className="text-sm text-gray-600 mt-1">Grant administrative privileges to a new user</p>
        </div>
      </div>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          setSuccess('');
          setOpenConfirm(true);
        }} 
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="userId" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <span>🆔</span> User ID (Internet Identity)
            </Label>
            <Input
              id="userId"
              value={userId}
              readOnly
              className="w-full h-12 px-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Auto-populated from your current Internet Identity</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <span>💼</span> Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter full name"
              className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>📧</span> Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter email address"
            className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
          />
          <p className="text-xs text-gray-500">Will be used for notifications and account recovery</p>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>🔐</span> Permissions
          </Label>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {permissionOptions.map((option) => {
                const isChecked = permissions.includes(option.id);
                const isHighLevel = option.id === 'platform_governance';
                const isFinancial = option.id === 'financial_oversight' || option.id === 'audit_compliance';
                const isWaqfCore = option.id === 'waqf_management' || option.id === 'cause_management' || option.id === 'cause_approval';
                const isAdminRequest = option.id === 'admin_request_creation' || option.id === 'admin_request_approval';
                
                return (
                  <div key={option.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-sm ${
                    isChecked 
                      ? isHighLevel 
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                        : isFinancial
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                        : isWaqfCore
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                        : isAdminRequest
                        ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200'
                        : 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}>
                    <Checkbox
                      id={option.id}
                      checked={isChecked}
                      onChange={(e) => 
                        togglePermission(option.id, e.target.checked)
                      }
                      className="w-5 h-5"
                    />
                    <Label htmlFor={option.id} className={`text-sm font-medium cursor-pointer flex items-center gap-2 ${
                      isChecked ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {isHighLevel && '🏛️'}
                      {isFinancial && '💰'}
                      {isWaqfCore && '🕌'}
                      {isAdminRequest && '📝'}
                      {option.id === 'content_moderation' && '🛡️'}
                      {option.id === 'user_support' && '🎧'}
                      {option.id === 'system_administration' && '⚙️'}
                      <span className="ml-1">{option.label}</span>
                    </Label>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              🏛️ Platform Governance grants complete administrative control over the Waqf platform
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            loading={mutation.isPending} 
            className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={!userId.trim() || !name.trim() || !email.trim() || permissions.length === 0}
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>👥</span>
                Add Administrator
              </span>
            )}
          </Button>
        </div>

        <CustomDialog 
          isOpen={openConfirm} 
          onClose={() => setOpenConfirm(false)}
          title="Confirm Admin Privileges"
          className="max-w-[95vw] sm:max-w-md"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-800 font-medium mb-2">
                Confirm Admin Privileges for:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Name:</span>
                  <span className="text-sm font-semibold text-gray-900">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Email:</span>
                  <span className="text-sm text-gray-700">{email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">User ID:</span>
                  <span className="text-sm font-mono text-gray-600">{userId}</span>
                </div>
              </div>
            </div>
            
            {permissions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Granted Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {permissions.map(p => {
                    const isPlatformGovernance = p === 'platform_governance';
                    return (
                      <span key={p} className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isPlatformGovernance 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isPlatformGovernance && '🏛️ '}{permissionOptions.find(o => o.id === p)?.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setOpenConfirm(false)}
                loading={false}
              >
                Cancel
              </Button>
              <Button 
                loading={mutation.isPending}
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Confirming...
                  </span>
                ) : 'Confirm'}
              </Button>
            </div>
          </div>
        </CustomDialog>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">⚠️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Success</p>
              <p className="text-sm text-green-600">{success}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}