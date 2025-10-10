'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';

export function DevModeSwitcher() {
  const { user, isAdmin } = useAuth();
  const [devMode, setDevMode] = useState(false);
  const [overrideRole, setOverrideRole] = useState<'admin' | 'user' | null>(null);

  // Only show in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Load dev mode state from localStorage
    const savedDevMode = localStorage.getItem('devMode') === 'true';
    const savedOverride = localStorage.getItem('devModeRole') as 'admin' | 'user' | null;
    setDevMode(savedDevMode);
    setOverrideRole(savedOverride);
  }, []);

  const toggleDevMode = () => {
    const newDevMode = !devMode;
    setDevMode(newDevMode);
    localStorage.setItem('devMode', String(newDevMode));
    
    if (!newDevMode) {
      // Clear override when disabling dev mode
      setOverrideRole(null);
      localStorage.removeItem('devModeRole');
    }
  };

  const switchRole = (role: 'admin' | 'user') => {
    setOverrideRole(role);
    localStorage.setItem('devModeRole', role);
    // Reload to apply the role change
    window.location.reload();
  };

  const clearOverride = () => {
    setOverrideRole(null);
    localStorage.removeItem('devModeRole');
    window.location.reload();
  };

  if (!isDevelopment || !user) return null;

  // Determine actual role based on isAdmin from auth context
  const actualRole = isAdmin ? 'admin' : 'user';
  const displayRole = overrideRole || actualRole;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-yellow-500 text-black rounded-lg shadow-2xl border-2 border-yellow-600">
        {!devMode ? (
          <button
            onClick={toggleDevMode}
            className="px-4 py-2 text-sm font-mono font-bold hover:bg-yellow-400 rounded-lg transition-colors"
            title="Enable Dev Mode Dashboard Switcher"
          >
            🛠️ DEV
          </button>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold">🛠️ DEV MODE</span>
              <button
                onClick={toggleDevMode}
                className="text-xs hover:bg-yellow-400 px-2 py-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs font-mono">
                <div><strong>Actual Role:</strong> {actualRole}</div>
                {overrideRole && (
                  <div className="text-red-700">
                    <strong>Override:</strong> {overrideRole}
                  </div>
                )}
                <div><strong>Current View:</strong> {displayRole}</div>
              </div>
              
              <div className="flex flex-col gap-2 pt-2 border-t border-yellow-600">
                <Button
                  onClick={() => switchRole('admin')}
                  disabled={displayRole === 'admin'}
                  size="sm"
                  className={`text-xs font-mono ${
                    displayRole === 'admin' 
                      ? 'bg-green-600 hover:bg-green-600' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {displayRole === 'admin' ? '✓ ' : ''}Admin Dashboard
                </Button>
                
                <Button
                  onClick={() => switchRole('user')}
                  disabled={displayRole === 'user'}
                  size="sm"
                  className={`text-xs font-mono ${
                    displayRole === 'user' 
                      ? 'bg-green-600 hover:bg-green-600' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {displayRole === 'user' ? '✓ ' : ''}Waqf Dashboard
                </Button>
                
                {overrideRole && (
                  <Button
                    onClick={clearOverride}
                    size="sm"
                    variant="outline"
                    className="text-xs font-mono border-yellow-700 hover:bg-yellow-400"
                  >
                    Reset to Actual Role
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
