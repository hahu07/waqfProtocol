'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { listCauses, listActiveCauses } from '@/lib/cause-utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Cause } from '@/types/waqfs';

export default function DebugCausesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [allCauses, setAllCauses] = useState<Cause[]>([]);
  const [activeCauses, setActiveCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCauses = async () => {
    if (!user) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const all = await listCauses();
      const active = await listActiveCauses();
      
      setAllCauses(all);
      setActiveCauses(active);
      
      console.log('All causes:', all);
      console.log('Active causes:', active);
      console.log('All causes count:', all.length);
      console.log('Active causes count:', active.length);
    } catch (err) {
      console.error('Error loading causes:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCauses();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to debug causes.</p>
          <Button onClick={() => router.push('/waqf')} className="w-full">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🔍 Debug Causes
              </h1>
              <p className="text-gray-600">
                View all causes in the database and check their status
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={loadCauses} disabled={loading} variant="outline">
                {loading ? '🔄 Loading...' : '🔄 Refresh'}
              </Button>
              <Button onClick={() => router.push('/admin')} variant="outline">
                ← Back to Admin
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800 font-medium">❌ Error: {error}</p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-3xl font-bold text-blue-900">{allCauses.length}</div>
              <div className="text-sm font-medium text-blue-700">Total Causes</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-3xl font-bold text-green-900">{activeCauses.length}</div>
              <div className="text-sm font-medium text-green-700">Active Causes (Shown in Marketplace)</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
              <div className="text-4xl mb-2">⏳</div>
              <div className="text-3xl font-bold text-orange-900">{allCauses.length - activeCauses.length}</div>
              <div className="text-sm font-medium text-orange-700">Inactive/Pending Causes</div>
            </div>
          </div>
        </div>

        {/* All Causes Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📋 All Causes ({allCauses.length})
          </h2>
          
          {allCauses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg">No causes found in database</p>
              <Button 
                onClick={() => router.push('/admin/seed-test-causes')}
                className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                🌱 Seed Test Causes
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Icon</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">isActive</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Impact</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Shown?</th>
                  </tr>
                </thead>
                <tbody>
                  {allCauses.map((cause) => {
                    const isShown = cause.isActive && cause.status === 'approved';
                    return (
                      <tr key={cause.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-3xl">{cause.icon}</td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{cause.name}</div>
                          <div className="text-xs text-gray-500">{cause.id}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            cause.status === 'approved' 
                              ? 'bg-green-100 text-green-700'
                              : cause.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {cause.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            cause.isActive 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {cause.isActive ? 'true' : 'false'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {cause.categoryId || cause.category || 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-gray-900">
                            {cause.impactScore || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {isShown ? (
                            <span className="text-2xl">✅</span>
                          ) : (
                            <span className="text-2xl">❌</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Causes Only */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ✅ Active Causes (Shown in Marketplace) ({activeCauses.length})
          </h2>
          
          {activeCauses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Causes</h3>
              <p className="text-gray-600 mb-4">
                Causes must have <code className="bg-gray-100 px-2 py-1 rounded">status: 'approved'</code> AND <code className="bg-gray-100 px-2 py-1 rounded">isActive: true</code> to appear in the marketplace.
              </p>
              {allCauses.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 max-w-2xl mx-auto">
                  <p className="text-yellow-800 font-medium mb-2">
                    💡 You have {allCauses.length} cause(s) in the database, but none are active.
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Check the table above to see why they're not showing.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCauses.map((cause) => (
                <div key={cause.id} className="border-2 border-green-200 rounded-xl p-6 bg-gradient-to-br from-green-50 to-white">
                  <div className="text-4xl mb-3">{cause.icon}</div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{cause.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-700">{cause.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Active:</span>
                      <span className="font-semibold text-green-700">{cause.isActive ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Impact:</span>
                      <span className="font-semibold text-gray-900">{cause.impactScore}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            🔧 Debug Info (Check Browser Console)
          </h2>
          <div className="bg-gray-800 rounded-xl p-4 overflow-x-auto">
            <pre className="text-green-400 text-xs">
              {JSON.stringify({ 
                totalCauses: allCauses.length,
                activeCauses: activeCauses.length,
                causes: allCauses.map(c => ({
                  id: c.id,
                  name: c.name,
                  status: c.status,
                  isActive: c.isActive,
                  categoryId: c.categoryId,
                  category: c.category
                }))
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

