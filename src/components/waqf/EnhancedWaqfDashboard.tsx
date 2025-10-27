'use client';

import { useState } from 'react';
import type { WaqfProfile } from "@/types/waqfs";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Button } from "@/components/ui/button";
import { logger } from '@/lib/logger';
import { TranchesDisplay } from './TranchesDisplay';
import { calculateRevolvingBalance } from '@/lib/revolving-waqf-utils';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface EnhancedWaqfDashboardProps {
  profile: WaqfProfile;
  onAddFunds?: () => void;
  onDistribute?: () => void;
  onReturnTranche?: (trancheId: string) => void;
}

const COLORS = ['#2563eb', '#9333ea', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6', '#14b8a6'];

export function EnhancedWaqfDashboard({ profile, onAddFunds, onDistribute, onReturnTranche }: EnhancedWaqfDashboardProps) {
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);

  // Debug: Log the profile data
  logger.debug('🎯 EnhancedWaqfDashboard - Full Profile:', { data: profile });
  logger.debug('👤 Donor Info:', { data: profile.donor });
  logger.debug('💰 Financial:', { data: profile.financial });
  logger.debug('🎯 Selected Causes:', { data: profile.selectedCauses });
  logger.debug('📊 Cause Allocation:', { data: profile.causeAllocation });

  // Calculate financial metrics
  const waqfAsset = profile.waqfAsset ?? 0;
  const balance = profile.financial?.currentBalance ?? 0;
  const totalDonations = profile.financial?.totalDonations ?? 0;
  // For consumable waqfs, Total Asset should be totalDonations (initial + contributions)
  // For permanent/revolving, keep waqfAsset as the principal
  const totalDistributed = profile.financial?.totalDistributed ?? 0;
  const growthRate = profile.financial?.growthRate ?? 0;
  const totalInvestmentReturn = profile.financial?.totalInvestmentReturn ?? 0;
  // Convert waqfType to lowercase and handle PascalCase to snake_case conversion
  const normalizeWaqfType = (type: string): string => {
    const lower = type.toLowerCase();
    // Convert PascalCase to snake_case (e.g., "TemporaryConsumable" -> "temporary_consumable")
    return lower
      .replace(/temporaryconsumable/i, 'temporary_consumable')
      .replace(/temporaryrevolving/i, 'temporary_revolving');
  };
  
  const waqfType = normalizeWaqfType(profile.waqfType || (profile.isHybrid ? 'hybrid' : 'permanent'));
  
  // Calculate revolving balance breakdown if applicable (after waqfType is defined)
  const revolvingBalance = waqfType === 'temporary_revolving' ? calculateRevolvingBalance(profile) : null;

  logger.debug('💵 Calculated Metrics:', { waqfAsset, balance, totalDonations, totalDistributed, growthRate, totalInvestmentReturn });
  logger.debug('🔀 Is Hybrid:', { data: profile.isHybrid });
  logger.debug('🎯 Hybrid Allocations:', { data: profile.hybridAllocations });
  logger.debug('🔑 WaqfType Value:', { waqfType, rawWaqfType: profile.waqfType, isHybrid: profile.isHybrid });
  console.log('🔍 DEBUG - WaqfType:', waqfType, '| Raw:', profile.waqfType, '| Is Hybrid:', profile.isHybrid);

  // Prepare cause allocation data for pie chart
  const causeData = profile.selectedCauses?.map((causeId, index) => {
    const cause = profile.supportedCauses?.find(c => c.id === causeId);
    
    // For hybrid waqfs, show overall cause allocation (equal split if not specified)
    // Individual waqf type breakdowns will be shown in the details section
    const allocation = profile.causeAllocation?.[causeId] ?? (100 / profile.selectedCauses.length);
    
    // Get hybrid allocation details if available
    const hybridAllocation = profile.isHybrid && profile.hybridAllocations ? 
      profile.hybridAllocations.find(ha => ha.causeId === causeId) : null;
    
    return {
      id: causeId,
      name: cause?.name || 'Unknown Cause',
      icon: cause?.icon || '❤️',
      percentage: allocation,
      value: (totalDistributed * allocation) / 100,
      color: COLORS[index % COLORS.length],
      // Add hybrid allocation breakdown
      hybridBreakdown: hybridAllocation ? {
        permanent: hybridAllocation.allocations.permanent ?? 0,
        temporary_consumable: hybridAllocation.allocations.temporary_consumable ?? 0,
        temporary_revolving: hybridAllocation.allocations.temporary_revolving ?? 0
      } : null
    };
  }) || [];

  logger.debug('📈 Cause Data for Chart:', { data: causeData });

  // For hybrid waqfs, calculate waqf type allocation across all causes
  const waqfTypeAllocation = profile.isHybrid && profile.hybridAllocations ? (() => {
    const totals = { permanent: 0, temporary_consumable: 0, temporary_revolving: 0 };
    const count = profile.hybridAllocations.length;
    
    profile.hybridAllocations.forEach(allocation => {
      totals.permanent += allocation.allocations.permanent ?? 0;
      totals.temporary_consumable += allocation.allocations.temporary_consumable ?? 0;
      totals.temporary_revolving += allocation.allocations.temporary_revolving ?? 0;
    });
    
    // Calculate averages
    return [
      { 
        name: 'Permanent Waqf', 
        icon: '🏛️', 
        percentage: totals.permanent / count, 
        color: '#f59e0b',
        description: 'Principal preserved, returns distributed'
      },
      { 
        name: 'Consumable Waqf', 
        icon: '💸', 
        percentage: totals.temporary_consumable / count, 
        color: '#3b82f6',
        description: 'Funds fully distributed to causes'
      },
      { 
        name: 'Revolving Waqf', 
        icon: '🔄', 
        percentage: totals.temporary_revolving / count, 
        color: '#9333ea',
        description: 'Principal returned at maturity'
      }
    ].filter(item => item.percentage > 0);
  })() : null;

  logger.debug('📊 Waqf Type Allocation:', { data: waqfTypeAllocation });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div 
        className="rounded-2xl shadow-2xl p-6 md:p-8"
        style={{
          background: 'linear-gradient(to right, #2563eb, #9333ea, #ec4899)',
          minHeight: '180px'
        }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h1 
              className="text-2xl md:text-3xl font-bold mb-2"
              style={{ color: '#ffffff' }}
            >
              {profile?.donor?.name ? `${profile.donor.name}'s Waqf` : 
               profile?.donor?.email ? `${profile.donor.email.split('@')[0]}'s Waqf` : 
               'My Waqf Portfolio'}
            </h1>
            <p 
              className="text-sm md:text-base max-w-2xl mb-3"
              style={{ color: '#ffffff', opacity: 0.95 }}
            >
              {profile?.description || 'Perpetual Charitable Endowment - Building lasting impact through strategic giving'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}
              >
                {profile?.status === 'active' ? '✅ Active' : profile?.status === 'paused' ? '⏸️ Paused' : '❌ Inactive'}
              </span>
              {growthRate > 0 && (
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.3)', color: '#ffffff' }}
                >
                  📈 {formatPercentage(growthRate)} Growth
                </span>
              )}
              {/* Waqf Type Badge */}
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                style={{ backgroundColor: 'rgba(168, 85, 247, 0.3)', color: '#ffffff' }}
              >
                {waqfType === 'hybrid' ? '🔀 Hybrid Waqf' : 
                 waqfType === 'permanent' ? '🏛️ Permanent' :
                 waqfType === 'temporary_consumable' ? '💸 Consumable' :
                 waqfType === 'temporary_revolving' ? '🔄 Revolving' : '🎯 Waqf'}
              </span>
              {profile?.selectedCauses && profile.selectedCauses.length > 0 && (
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)', color: '#ffffff' }}
                >
                  🎯 {profile.selectedCauses.length} {profile.selectedCauses.length === 1 ? 'Cause' : 'Causes'}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {onAddFunds && (
              <Button
                onClick={onAddFunds}
                style={{ 
                  backgroundColor: '#ffffff', 
                  color: '#9333ea',
                  fontWeight: '600'
                }}
                className="hover:bg-gray-100 shadow-lg flex-1 md:flex-none"
              >
                💰 Add Funds
              </Button>
            )}
            {onDistribute && (
              <Button
                onClick={onDistribute}
                variant="outline"
                style={{
                  borderColor: '#ffffff',
                  borderWidth: '2px',
                  color: '#ffffff',
                  fontWeight: '600',
                  backgroundColor: 'transparent'
                }}
                className="hover:bg-white/10 flex-1 md:flex-none"
              >
                📤 Distribute
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Financial Cards Grid - Dynamic based on waqf type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Waqf Asset - Show for all types */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-2xl shadow-lg">
              {waqfType === 'permanent' ? '🏛️' : 
               waqfType === 'temporary_consumable' ? '💸' :
               waqfType === 'temporary_revolving' ? '🔄' : '🔀'}
            </div>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">
              {waqfType === 'permanent' ? 'Principal' :
               waqfType === 'temporary_consumable' ? 'Asset' :
               waqfType === 'temporary_revolving' ? 'Locked' : 'Mixed'}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-2">
            {waqfType === 'permanent' ? 'Initial Donation' :
             waqfType === 'temporary_consumable' ? 'Total Asset' :
             waqfType === 'temporary_revolving' ? 'Initial Principal' : 'Waqf Asset'}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(waqfType === 'temporary_consumable' ? totalDonations : waqfAsset)}
          </p>
          <p className="text-xs text-gray-500">
            {waqfType === 'permanent' ? 'Original endowment amount' :
             waqfType === 'temporary_consumable' ? 'Funds to be consumed' :
             waqfType === 'temporary_revolving' ? 'Initial locked amount' : 'Combined asset value'}
          </p>
        </div>

        {/* Card 2: Variable based on type */}
        {waqfType === 'permanent' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl shadow-lg">
                💵
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                +{profile.waqfAssets?.length || 0}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total Donations</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(totalDonations)}
            </p>
            <p className="text-xs text-gray-500">
              Ongoing contributions invested
            </p>
          </div>
        )}

        {waqfType === 'temporary_consumable' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-2xl shadow-lg">
                💰
              </div>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                Spending
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Funds Spent</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(totalDistributed)}
            </p>
            <p className="text-xs text-gray-500">
              {profile.consumableDetails?.endDate ? 
                `Until ${new Date(profile.consumableDetails.endDate).toLocaleDateString()}` : 
                'Total funds distributed'}
            </p>
          </div>
        )}

        {waqfType === 'temporary_revolving' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl shadow-lg">
                💵
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                Available
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Matured Balance</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(revolvingBalance?.maturedBalance || 0)}
            </p>
            <p className="text-xs text-gray-500">
              {revolvingBalance?.maturedTranches.length || 0} tranches ready to return
            </p>
          </div>
        )}

        {waqfType === 'hybrid' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl shadow-lg">
                💵
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                +{profile.waqfAssets?.length || 0}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total Donations</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(totalDonations)}
            </p>
            <p className="text-xs text-gray-500">
              Ongoing contributions invested
            </p>
          </div>
        )}

        {/* Card 3: Returns/Impact - Conditional rendering */}
        {waqfType === 'permanent' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
                📈
              </div>
              <button
                onClick={() => setShowBalanceDetails(!showBalanceDetails)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showBalanceDetails ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Investment Returns</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {showBalanceDetails ? formatCurrency(totalInvestmentReturn) : '••••••'}
            </p>
            <p className="text-xs text-gray-500">
              Total proceeds generated
            </p>
          </div>
        )}
        
        {waqfType === 'temporary_revolving' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
                🔒
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                Locked
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Locked Balance</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(revolvingBalance?.lockedBalance || 0)}
            </p>
            <p className="text-xs text-gray-500">
              {revolvingBalance?.lockedTranches.length || 0} tranches still maturing
            </p>
          </div>
        )}

        {waqfType === 'temporary_consumable' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg">
                ⏱️
              </div>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
                {profile.consumableDetails?.spendingSchedule || 'Phased'}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Remaining Balance</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-gray-500">
              Funds still to be distributed
            </p>
          </div>
        )}

        {waqfType === 'hybrid' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
                📈
              </div>
              <button
                onClick={() => setShowBalanceDetails(!showBalanceDetails)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showBalanceDetails ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total Returns</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {showBalanceDetails ? formatCurrency(totalInvestmentReturn) : '••••••'}
            </p>
            <p className="text-xs text-gray-500">
              Combined investment returns
            </p>
          </div>
        )}

        {/* Card 4: Distribution/Causes - Show for all */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
              🎁
            </div>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
              {causeData.length} {causeData.length === 1 ? 'cause' : 'causes'}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-2">
            {waqfType === 'permanent' ? 'Proceeds Distributed' :
             waqfType === 'temporary_consumable' ? 'Funds Allocated' :
             waqfType === 'temporary_revolving' ? 'Returns Distributed' : 'Total Distributed'}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(totalDistributed)}
          </p>
          <p className="text-xs text-gray-500">
            {waqfType === 'permanent' ? 'Investment returns to causes' :
             waqfType === 'temporary_consumable' ? 'Funds given to causes' :
             waqfType === 'temporary_revolving' ? 'Returns given to causes' : 'Across all waqf types'}
          </p>
        </div>
      </div>

      {/* Cause Allocation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {profile.isHybrid ? 'Waqf Type Distribution' : 'Cause Distribution'}
            </h3>
            {profile.isHybrid && (
              <p className="text-sm text-gray-600">
                Average allocation across waqf types
              </p>
            )}
          </div>

          {(profile.isHybrid ? waqfTypeAllocation : causeData)?.length > 0 ? (
            <div className="flex items-center justify-center py-4">
              <div style={{ width: '350px', height: '350px' }}>
                <Pie
                  data={{
                    labels: profile.isHybrid 
                      ? (waqfTypeAllocation?.map(w => w.name) || [])
                      : causeData.map(c => c.name),
                    datasets: [
                      {
                        label: 'Allocation',
                        data: profile.isHybrid 
                          ? (waqfTypeAllocation?.map(w => w.percentage) || [])
                          : causeData.map(c => c.percentage),
                        backgroundColor: profile.isHybrid 
                          ? (waqfTypeAllocation?.map(w => w.color) || [])
                          : causeData.map(c => c.color),
                        borderColor: '#ffffff',
                        borderWidth: 2,
                        hoverBorderWidth: 3,
                        hoverOffset: 8,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    layout: {
                      padding: {
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10,
                      },
                    },
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 12,
                          font: {
                            size: 11,
                            weight: 500,
                            family: 'system-ui, -apple-system, sans-serif',
                          },
                          usePointStyle: true,
                          pointStyle: 'circle',
                          boxWidth: 8,
                          boxHeight: 8,
                          generateLabels: (chart) => {
                            const data = chart.data;
                            if (data.labels && data.datasets.length) {
                              return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i] as number;
                                const item = profile.isHybrid ? waqfTypeAllocation?.[i] : causeData[i];
                                return {
                                  text: `${item?.icon || ''} ${label} (${formatPercentage(value)})`,
                                  fillStyle: Array.isArray(data.datasets[0].backgroundColor) 
                                    ? (data.datasets[0].backgroundColor[i] as string)
                                    : (data.datasets[0].backgroundColor as string),
                                  hidden: false,
                                  index: i,
                                };
                              });
                            }
                            return [];
                          },
                        },
                      },
                      tooltip: {
                        enabled: true,
                        callbacks: {
                          title: function(context) {
                            const index = context[0].dataIndex;
                            if (profile.isHybrid) {
                              const waqfType = waqfTypeAllocation?.[index];
                              return `${waqfType?.icon || ''} ${context[0].label}`;
                            } else {
                              const cause = causeData[index];
                              return `${cause?.icon || ''} ${context[0].label}`;
                            }
                          },
                          label: function(context) {
                            const value = context.parsed || 0;
                            if (profile.isHybrid) {
                              const waqfType = waqfTypeAllocation?.[context.dataIndex];
                              return [
                                `Allocation: ${formatPercentage(value)}`,
                                waqfType?.description || ''
                              ];
                            }
                            return `Allocation: ${formatPercentage(value)}`;
                          },
                        },
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        titleFont: {
                          size: 13,
                          weight: 'bold' as const,
                        },
                        bodyFont: {
                          size: 12,
                        },
                        padding: 10,
                        displayColors: true,
                        boxPadding: 6,
                        cornerRadius: 6,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                      },
                    },
                  } as ChartOptions<'pie'>}
                />
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-6xl mb-4">📊</p>
                <p className="text-sm">No allocations yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Cause Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Supported Causes
            </h3>
            <p className="text-sm text-gray-600">
              Detailed breakdown of your charitable impact
            </p>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {causeData.length > 0 ? (
              causeData.map((cause, index) => (
                <div
                  key={cause.id}
                  className="p-4 rounded-xl border-2 hover:shadow-md transition-all duration-200"
                  style={{ borderColor: cause.color + '40', backgroundColor: cause.color + '08' }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: cause.color + '20' }}
                    >
                      {cause.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900 truncate">
                          {cause.name}
                        </h4>
                        <span
                          className="px-2 py-1 rounded-lg text-xs font-bold ml-2 flex-shrink-0"
                          style={{ backgroundColor: cause.color + '20', color: cause.color }}
                        >
                          {formatPercentage(cause.percentage)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${cause.percentage}%`,
                              backgroundColor: cause.color
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            Allocated: {formatCurrency(cause.value)}
                          </span>
                          <span className="font-semibold" style={{ color: cause.color }}>
                            {formatPercentage(cause.percentage)} of total
                          </span>
                        </div>
                        
                        {/* Hybrid Allocation Breakdown */}
                        {profile.isHybrid && cause.hybridBreakdown && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Waqf Type Distribution:</p>
                            <div className="space-y-1.5">
                              {cause.hybridBreakdown.permanent > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span className="text-gray-600">Permanent</span>
                                  </span>
                                  <span className="font-semibold text-amber-600">
                                    {formatPercentage(cause.hybridBreakdown.permanent)}
                                  </span>
                                </div>
                              )}
                              {cause.hybridBreakdown.temporary_consumable > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    <span className="text-gray-600">Consumable</span>
                                  </span>
                                  <span className="font-semibold text-blue-600">
                                    {formatPercentage(cause.hybridBreakdown.temporary_consumable)}
                                  </span>
                                </div>
                              )}
                              {cause.hybridBreakdown.temporary_revolving > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    <span className="text-gray-600">Revolving</span>
                                  </span>
                                  <span className="font-semibold text-purple-600">
                                    {formatPercentage(cause.hybridBreakdown.temporary_revolving)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">🎯</p>
                <p className="text-sm">No causes selected yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Selected Causes Count */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🎯</span>
              <p className="text-3xl font-bold text-gray-900">
                {causeData.length}
              </p>
            </div>
            <p className="text-sm text-gray-600 font-medium">Selected Causes</p>
            <p className="text-xs text-gray-500 mt-1">
              {causeData.length === 0 ? 'No causes yet' : `Supporting ${causeData.length} ${causeData.length === 1 ? 'cause' : 'causes'}`}
            </p>
          </div>

          {/* Total Contributions */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">💵</span>
              <p className="text-3xl font-bold text-gray-900">
                {profile.waqfAssets?.length || 0}
              </p>
            </div>
            <p className="text-sm text-gray-600 font-medium">Contributions</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(totalDonations)} donated
            </p>
          </div>

          {/* Distribution Rate */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <p className="text-3xl font-bold text-gray-900">
                {totalDonations > 0 ? formatPercentage((totalDistributed / totalDonations) * 100) : '0.0%'}
              </p>
            </div>
            <p className="text-sm text-gray-600 font-medium">Distribution Rate</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(totalDistributed)} distributed
            </p>
          </div>

          {/* Year Established */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">📅</span>
              <p className="text-3xl font-bold text-gray-900">
                {profile.createdAt ? new Date(profile.createdAt).getFullYear() : '—'}
              </p>
            </div>
            <p className="text-sm text-gray-600 font-medium">Year Established</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.createdAt 
                ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'Not set'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tranches Display for Revolving Waqfs */}
      {waqfType === 'temporary_revolving' && (
        <div className="mt-6">
          <TranchesDisplay waqf={profile} onReturnTranche={onReturnTranche} />
        </div>
      )}
    </div>
  );
}
