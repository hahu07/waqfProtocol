// components/admin/adminManage.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { listAdmins, addAdmin, hasPermission, type AdminPermission, type AdminRole } from '@/lib/admin-utils';
import { AdminList } from './AdminList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const PERMISSIONS: AdminPermission[] = [
  'user_support',
  'content_moderation', 
  'waqf_management',
  'cause_management',
  'financial_oversight',
  'system_administration',
  'audit_compliance',
  'platform_governance'
];

const ROLES: AdminRole[] = [
  'support_agent',
  'content_moderator',
  'waqf_manager', 
  'finance_officer',
  'compliance_officer',
  'platform_admin'
];

export function AdminManage() {
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('support_agent');
  
  const { data: admins, isLoading, refetch } = useQuery({
    queryKey: ['admins'],
    queryFn: listAdmins
  });

  const addAdminMutation = useMutation({
    mutationFn: async () => {
      // Note: In real implementation, get current user ID from auth context
      await addAdmin(userId, 'current-admin-id', selectedRole, email, name);
    },
    onSuccess: () => {
      toast.success('Admin added successfully');
      setUserId('');
      setEmail('');
      setName('');
      refetch();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Admins</h1>
      
      {/* Add Admin Form */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add New Admin</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
          </div>
          
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter admin name"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <Label htmlFor="role">Admin Role</Label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Role automatically determines permissions
            </p>
          </div>
          
          <Button
            onClick={() => addAdminMutation.mutate()}
            disabled={!userId || !name || !email || addAdminMutation.isPending}
            loading={addAdminMutation.isPending}
          >
            {addAdminMutation.isPending ? 'Adding...' : 'Add Admin'}
          </Button>
        </div>
      </div>
      
      {/* Admin List */}
      <div className="border rounded-lg p-6">
        <AdminList headerTitle="Current Admins" admins={admins} isLoading={isLoading} />
      </div>
    </div>
  );
}