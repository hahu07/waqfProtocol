'use client';

import { Dialog, DialogTitle } from '@headlessui/react';
import { useState, useMemo } from 'react';
import { FaTimes, FaChartBar, FaDollarSign, FaUsers, FaHandHoldingHeart, FaArrowUp, FaArrowDown, FaTrophy, FaDownload } from 'react-icons/fa';
import type { WaqfProfile } from '@/types/waqfs';

interface CausesAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  waqfs: { key: string; data: WaqfProfile }[];
}

interface CauseMetrics {
  causeId: string;
  causeName: string;
  totalAllocated: number;
  totalDistributed: number;
  beneficiaries: number;
  waqfsSupporting: number;
  averageAllocation: number;
  completionRate: number;
}

export function CausesAnalyticsModal({ isOpen, onClose, waqfs }: CausesAnalyticsModalProps) {
  const [sortBy, setSortBy] = useState<'totalAllocated' | 'beneficiaries' | 'waqfsSupporting'>('totalAllocated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate cause metrics from all waqfs
  const causeMetrics = useMemo(() => {
    const metricsMap = new Map<string, CauseMetrics>();

    waqfs.forEach(waqf => {
      waqf.data.supportedCauses?.forEach(cause => {
        const existing = metricsMap.get(cause.id) || {
          causeId: cause.id,
          causeName: cause.name,
          totalAllocated: 0,
          totalDistributed: 0,
          beneficiaries: 0,
          waqfsSupporting: 0,
          averageAllocation: 0,
          completionRate: 0,
        };

        const allocation = waqf.data.causeAllocation?.[cause.id] || 0;
        const amountAllocated = (waqf.data.financial.currentBalance * allocation) / 100;

        existing.totalAllocated += amountAllocated;
        existing.totalDistributed += amountAllocated * 0.7; // Mock distribution
        existing.beneficiaries += Math.floor(amountAllocated / 100); // Mock beneficiaries
        existing.waqfsSupporting += 1;

        metricsMap.set(cause.id, existing);
      });
    });

    // Calculate averages and completion rates
    const metrics = Array.from(metricsMap.values()).map(metric => ({
      ...metric,
      averageAllocation: metric.waqfsSupporting > 0 ? metric.totalAllocated / metric.waqfsSupporting : 0,
      completionRate: metric.totalAllocated > 0 ? (metric.totalDistributed / metric.totalAllocated) * 100 : 0,
    }));

    // Sort metrics
    return metrics.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [waqfs, sortBy, sortOrder]);

  const totalMetrics = useMemo(() => ({
    totalCauses: causeMetrics.length,
    totalAllocated: causeMetrics.reduce((sum, c) => sum + c.totalAllocated, 0),
    totalDistributed: causeMetrics.reduce((sum, c) => sum + c.totalDistributed, 0),
    totalBeneficiaries: causeMetrics.reduce((sum, c) => sum + c.beneficiaries, 0),
    averageCompletion: causeMetrics.length > 0 
      ? causeMetrics.reduce((sum, c) => sum + c.completionRate, 0) / causeMetrics.length 
      : 0,
  }), [causeMetrics]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Cause Name', 'Total Allocated', 'Total Distributed', 'Beneficiaries', 'Waqfs Supporting', 'Completion Rate'],
      ...causeMetrics.map(c => [
        c.causeName,
        c.totalAllocated.toFixed(2),
        c.totalDistributed.toFixed(2),
        c.beneficiaries.toString(),
        c.waqfsSupporting.toString(),
        `${c.completionRate.toFixed(1)}%`,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `causes-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FaChartBar className="text-white w-6 h-6" />
                </div>
                <div>
                  <DialogTitle as="h2" className="text-2xl font-bold text-white flex items-center gap-3">
                    Causes Analytics
                  </DialogTitle>
                  <p className="text-sm text-white/90 mt-1">
                    Comprehensive performance metrics across all causes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="px-4 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <FaDownload className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
                  aria-label="Close"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-5 shadow-xl hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1 duration-300 border border-white/10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                      <FaHandHoldingHeart className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2.5 py-1 bg-white/20 rounded-lg">
                      <span className="text-xs text-white/90 font-bold">ACTIVE</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/80 font-semibold uppercase tracking-wider mb-1">Total Causes</p>
                    <p className="text-3xl font-black text-white">{totalMetrics.totalCauses}</p>
                    <p className="text-xs text-white/70 mt-1">Supported globally</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-5 shadow-xl hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1 duration-300 border border-white/10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                      <FaDollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2.5 py-1 bg-green-400/30 rounded-lg">
                      <span className="text-xs text-white font-bold">+100%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/80 font-semibold uppercase tracking-wider mb-1">Total Allocated</p>
                    <p className="text-3xl font-black text-white">
                      ${totalMetrics.totalAllocated.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-white/70 mt-1">Across all causes</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-5 shadow-xl hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1 duration-300 border border-white/10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                      <FaChartBar className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2.5 py-1 bg-purple-400/30 rounded-lg">
                      <span className="text-xs text-white font-bold">LIVE</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/80 font-semibold uppercase tracking-wider mb-1">Distributed</p>
                    <p className="text-3xl font-black text-white">
                      ${totalMetrics.totalDistributed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-white/70 mt-1">To beneficiaries</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-700 to-blue-600 rounded-xl p-5 shadow-xl hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1 duration-300 border border-white/10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                      <FaUsers className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2.5 py-1 bg-blue-400/30 rounded-lg">
                      <span className="text-xs text-white font-bold">+{totalMetrics.totalBeneficiaries > 0 ? '25%' : '0%'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/80 font-semibold uppercase tracking-wider mb-1">Beneficiaries</p>
                    <p className="text-3xl font-black text-white">
                      {totalMetrics.totalBeneficiaries.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/70 mt-1">Lives impacted</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-700 to-purple-700 rounded-xl p-5 shadow-xl hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1 duration-300 border border-white/10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                      <FaTrophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2.5 py-1 bg-yellow-400/30 rounded-lg">
                      <span className="text-xs text-white font-bold">★ HIGH</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/80 font-semibold uppercase tracking-wider mb-1">Avg Completion</p>
                    <p className="text-3xl font-black text-white">
                      {totalMetrics.averageCompletion.toFixed(1)}%
                    </p>
                    <p className="text-xs text-white/70 mt-1">Performance rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-6">
            {causeMetrics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b-2 border-purple-700">
                        Cause Name
                      </th>
                      <th 
                        className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider border-b-2 border-purple-700 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('totalAllocated')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Total Allocated
                          {sortBy === 'totalAllocated' && (
                            sortOrder === 'desc' ? <FaArrowDown className="w-3 h-3" /> : <FaArrowUp className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider border-b-2 border-purple-700">
                        Distributed
                      </th>
                      <th 
                        className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider border-b-2 border-purple-700 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('beneficiaries')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Beneficiaries
                          {sortBy === 'beneficiaries' && (
                            sortOrder === 'desc' ? <FaArrowDown className="w-3 h-3" /> : <FaArrowUp className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider border-b-2 border-purple-700 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('waqfsSupporting')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Waqfs
                          {sortBy === 'waqfsSupporting' && (
                            sortOrder === 'desc' ? <FaArrowDown className="w-3 h-3" /> : <FaArrowUp className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider border-b-2 border-purple-700">
                        Completion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {causeMetrics.map((cause, index) => (
                      <tr 
                        key={cause.causeId} 
                        className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:bg-gray-800 transition-all border-b border-gray-100 dark:border-gray-700"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                              {index + 1}
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {cause.causeName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                          ${cause.totalAllocated.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          ${cause.totalDistributed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {cause.beneficiaries.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {cause.waqfsSupporting}
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 shadow-inner">
                              <div 
                                className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 h-2.5 rounded-full transition-all shadow-sm"
                                style={{ width: `${Math.min(cause.completionRate, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400 w-12 text-right">
                              {cause.completionRate.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 px-6">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center shadow-xl">
                    <FaHandHoldingHeart className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  No Causes Data
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-6">
                  No cause data available yet. Create waqfs with supported causes to see analytics.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Tip:</span> Add causes to waqfs to track impact
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
