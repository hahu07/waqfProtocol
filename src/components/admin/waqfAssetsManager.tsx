'use client';

import React, { useEffect, useState } from 'react';
import { useWaqf } from '@/providers/WaqfProvider';
import type { WaqfProfile } from '@/types/waqfs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import { logger } from '@/lib/logger';

type WaqfStats = {
  totalWaqfs: number;
  totalAssets: number;
  activeWaqfs: number;
  pausedWaqfs: number;
  completedWaqfs: number;
  averageAssetValue: number;
};

export const WaqfAssetsManager: React.FC = () => {
  const { getPaginatedWaqfs, loading } = useWaqf();
  const [waqfs, setWaqfs] = useState<WaqfProfile[]>([]);
  const [filteredWaqfs, setFilteredWaqfs] = useState<WaqfProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'completed' | 'terminated'>('all');
  const [stats, setStats] = useState<WaqfStats>({
    totalWaqfs: 0,
    totalAssets: 0,
    activeWaqfs: 0,
    pausedWaqfs: 0,
    completedWaqfs: 0,
    averageAssetValue: 0
  });

  // Fetch all waqfs
  useEffect(() => {
    const fetchWaqfs = async () => {
      try {
        logger.debug('Fetching all waqfs...');
        const result = await getPaginatedWaqfs({ limit: 1000 });
        setWaqfs(result);
        setFilteredWaqfs(result);
        
        // Calculate stats
        const totalAssets = result.reduce((sum, w) => sum + (w.waqfAsset || 0), 0);
        const activeCount = result.filter(w => w.status === 'active').length;
        const pausedCount = result.filter(w => w.status === 'paused').length;
        const completedCount = result.filter(w => w.status === 'completed').length;
        
        setStats({
          totalWaqfs: result.length,
          totalAssets,
          activeWaqfs: activeCount,
          pausedWaqfs: pausedCount,
          completedWaqfs: completedCount,
          averageAssetValue: result.length > 0 ? totalAssets / result.length : 0
        });
        
        logger.debug(`Fetched ${result.length} waqfs`);
      } catch (error) {
        logger.error('Error fetching waqfs', error);
      }
    };
    
    fetchWaqfs();
  }, [getPaginatedWaqfs]);

  // Filter waqfs based on search and status
  useEffect(() => {
    let filtered = waqfs;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(w => w.status === statusFilter);
    }
    
    setFilteredWaqfs(filtered);
  }, [searchTerm, statusFilter, waqfs]);

  const formatCurrency = (amount: number, currency: 'NGN' | 'USD' = 'NGN') => {
    if (currency === 'NGN') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const convertToUSD = (amountNGN: number, exchangeRate: number = 1650) => {
    return amountNGN / exchangeRate;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'terminated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWaqfTypeLabel = (waqf: WaqfProfile) => {
    if (waqf.isHybrid) return 'Hybrid';
    switch (waqf.waqfType) {
      case 'permanent': return 'Permanent';
      case 'temporary_consumable': return 'Consumable';
      case 'temporary_revolving': return 'Revolving';
      default: return waqf.waqfType;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          
          {/* Stats Skeleton */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
          
          {/* Table Skeleton */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Waqf Assets Under Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all waqf endowments</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FaDownload className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Total Waqfs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalWaqfs}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.activeWaqfs} active</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏛️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Total Assets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalAssets)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ≈ {formatCurrency(convertToUSD(stats.totalAssets), 'USD')} USD
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Avg Asset Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.averageAssetValue)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ≈ {formatCurrency(convertToUSD(stats.averageAssetValue), 'USD')} USD
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Status Breakdown</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-700">✅ {stats.activeWaqfs} Active</p>
                  <p className="text-sm text-gray-700">⏸️ {stats.pausedWaqfs} Paused</p>
                  <p className="text-sm text-gray-700">✓ {stats.completedWaqfs} Completed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, donor, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waqfs Table */}
      <Card>
        <CardHeader className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Waqf List ({filteredWaqfs.length})
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          {filteredWaqfs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Waqfs Found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No waqfs have been created yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Waqf Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Donor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Asset Value</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWaqfs.map((waqf) => (
                    <tr key={waqf.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-900">{waqf.name}</p>
                          <p className="text-xs text-gray-500 mt-1">ID: {waqf.id.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900">{waqf.donor.name}</p>
                          <p className="text-xs text-gray-500">{waqf.donor.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="font-medium">
                          {getWaqfTypeLabel(waqf)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(waqf.waqfAsset)}</p>
                        <p className="text-xs text-gray-500">
                          ≈ {formatCurrency(convertToUSD(waqf.waqfAsset), 'USD')}
                        </p>
                        {waqf.financial?.currentBalance !== undefined && (
                          <p className="text-xs text-gray-600 mt-1">
                            Balance: {formatCurrency(waqf.financial.currentBalance)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(waqf.status)}`}>
                          {waqf.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-gray-600">
                        {new Date(waqf.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
