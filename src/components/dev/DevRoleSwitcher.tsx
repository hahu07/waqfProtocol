// src/components/dev/DevRoleSwitcher.tsx (Development Only)
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import type { AdminRole } from '@/lib/admin-utils';

const DEV_ROLES: { role: AdminRole; label: string; description: string }[] = [
  { 
    role: 'platform_admin', 
    label: '🏛️ Platform Admin', 
    description: 'Full access + approve admin requests'
  },
  { 
    role: 'compliance_officer', 
    label: '🛡️ Compliance Officer', 
    description: 'Create admin requests + approve causes'
  },
  { 
    role: 'waqf_manager', 
    label: '🕌 Waqf Manager', 
    description: 'Create/edit causes + manage waqfs'
  },
  { 
    role: 'finance_officer', 
    label: '💰 Finance Officer', 
    description: 'Financial reports + audit access'
  },
  { 
    role: 'content_moderator', 
    label: '🛡️ Content Moderator', 
    description: 'Content moderation + user support'
  },
  { 
    role: 'support_agent', 
    label: '🎧 Support Agent', 
    description: 'Basic user support only'
  }
];

export function DevRoleSwitcher() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<AdminRole>('platform_admin');
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  useEffect(() => {
    // Load saved role from localStorage
    const savedRole = localStorage.getItem('dev-role-override') as AdminRole;
    if (savedRole) {
      setSelectedRole(savedRole);
    }
  }, []);

  const handleRoleSwitch = async (role: AdminRole) => {
    setSelectedRole(role);
    // Update user's role in localStorage for testing
    localStorage.setItem('dev-role-override', role);
    setIsOpen(false);
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all';
    toast.textContent = `Switched to ${DEV_ROLES.find(r => r.role === role)?.label}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 2000);
    
    // Trigger a page refresh to apply role changes
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const clearOverride = () => {
    localStorage.removeItem('dev-role-override');
    setSelectedRole('platform_admin');
    setIsOpen(false);
    window.location.reload();
  };

  const currentRoleInfo = DEV_ROLES.find(r => r.role === selectedRole);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Minimized View */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-2 rounded-lg shadow-lg font-medium text-sm transition-all"
          title="Development Role Switcher"
        >
          🧪 {currentRoleInfo?.label}
        </button>
      )}

      {/* Expanded View */}
      {isOpen && (
        <div className="bg-white border-2 border-yellow-400 rounded-lg shadow-xl p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-yellow-800">
              🧪 DEV MODE - Role Switcher
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-lg"
            >
              ✕
            </button>
          </div>
          
          <div className="text-xs text-gray-600 mb-3">
            Current User: {user?.key?.substring(0, 12)}...
          </div>

          <div className="space-y-2 mb-4">
            {DEV_ROLES.map(({ role, label, description }) => (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedRole === role
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-900'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-gray-500 mt-1">{description}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearOverride}
              className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded font-medium transition-colors"
            >
              Clear Override
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs rounded font-medium transition-colors"
            >
              Close
            </button>
          </div>

          <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
            💡 <strong>Tip:</strong> This override affects permission checks. Page will refresh when switching roles.
          </div>
        </div>
      )}
    </div>
  );
}