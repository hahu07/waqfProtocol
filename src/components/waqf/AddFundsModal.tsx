'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import type { WaqfProfile } from '@/types/waqfs';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, customAllocations?: { [causeId: string]: number }, lockPeriodMonths?: number) => void;
  waqf: WaqfProfile;
}

interface CauseDistribution {
  causeId: string;
  causeName: string;
  percentage: number;
  amount: number;
  icon: string;
  allocation: {
    permanent: number;
    consumable: number;
    revolving: number;
  };
}

export function AddFundsModal({ isOpen, onClose, onSubmit, waqf }: AddFundsModalProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDistribution, setShowDistribution] = useState(true); // Show by default
  const [useCustomAllocation, setUseCustomAllocation] = useState(true); // Enable by default for better UX
  const [customPercentages, setCustomPercentages] = useState<{ [causeId: string]: number }>({});
  // Optional per-contribution lock period (defaults to waqf-level lock period if available)
  const [lockPeriodMonths, setLockPeriodMonths] = useState<number>(
    waqf.revolvingDetails?.lockPeriodMonths || 12
  );

  // Calculate how new funds will be distributed across causes
  const causeDistributions = useMemo((): CauseDistribution[] => {
    const amountNum = parseFloat(amount) || 0;
    if (amountNum === 0) return [];
    
    return (waqf.supportedCauses || []).map(cause => {
      // Use custom percentage if custom allocation is enabled, otherwise use existing portfolio allocation
      const percentage = useCustomAllocation 
        ? (customPercentages[cause.id] ?? waqf.causeAllocation?.[cause.id] ?? 0)
        : (waqf.causeAllocation?.[cause.id] || 0);
      const causeAmount = (amountNum * percentage) / 100;
      
      // Get hybrid allocation for this cause if it exists
      const hybridAlloc = waqf.hybridAllocations?.find(h => h.causeId === cause.id);
      const allocs = hybridAlloc?.allocations as any;
      
      return {
        causeId: cause.id,
        causeName: cause.name,
        percentage,
        amount: causeAmount,
        icon: cause.icon || '🎯',
        allocation: {
          permanent: allocs?.Permanent || allocs?.permanent || 0,
          consumable: allocs?.TemporaryConsumable || allocs?.temporary_consumable || 0,
          revolving: allocs?.TemporaryRevolving || allocs?.temporary_revolving || 0,
        },
      };
    }).filter(d => useCustomAllocation || d.amount > 0); // Show all causes in custom mode
  }, [amount, waqf, useCustomAllocation, customPercentages]);
  
  // Calculate total custom allocation percentage
  const totalCustomPercentage = useMemo(() => {
    if (!useCustomAllocation) return 100;
    return Object.values(customPercentages).reduce((sum, val) => sum + val, 0);
  }, [customPercentages, useCustomAllocation]);
  
  const isAllocationValid = !useCustomAllocation || Math.abs(totalCustomPercentage - 100) < 0.01;

  // Initialize custom percentages from existing portfolio allocation
  useEffect(() => {
    if (isOpen && waqf.supportedCauses) {
      const initialPercentages: { [causeId: string]: number } = {};
      waqf.supportedCauses.forEach(cause => {
        initialPercentages[cause.id] = waqf.causeAllocation?.[cause.id] || 0;
      });
      setCustomPercentages(initialPercentages);
    }
  }, [isOpen, waqf]);
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setIsSubmitting(false);
      setUseCustomAllocation(true); // Reset to true (our new default)
      setShowDistribution(true);
      setLockPeriodMonths(waqf.revolvingDetails?.lockPeriodMonths || 12);
    } else {
      setShowDistribution(true); // Show distribution by default when opening
      setUseCustomAllocation(true); // Ensure it's enabled when opening
      setLockPeriodMonths(waqf.revolvingDetails?.lockPeriodMonths || 12);
    }
  }, [isOpen, waqf]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('❌ Please enter a valid amount greater than 0');
      return;
    }
    
    if (amountNum < 10) {
      alert('❌ Minimum amount is $10');
      return;
    }
    
    if (!isAllocationValid) {
      alert(`❌ Allocation must total 100% (currently ${totalCustomPercentage.toFixed(1)}%)`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass custom allocations if custom mode is enabled
      const allocations = useCustomAllocation ? customPercentages : undefined;
      await onSubmit(amountNum, allocations, waqf.revolvingDetails ? lockPeriodMonths : undefined);
      onClose();
    } catch (error) {
      console.error('Error submitting funds:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div 
          className="p-6 rounded-t-2xl"
          style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">💰 Top Up Portfolio</h2>
              <p className="text-sm text-white opacity-90">
                {waqf.isHybrid 
                  ? `Add funds to ${waqf.supportedCauses?.length || 0} causes` 
                  : 'Contribute to your waqf portfolio'}
              </p>
            </div>
            {waqf.isHybrid && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
                Hybrid Portfolio
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total Contribution Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-semibold">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                min="10"
                step="10"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg font-semibold"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">Minimum: $10</p>
              {causeDistributions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowDistribution(!showDistribution)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  {showDistribution ? '▼ Hide' : '▶ Show'} distribution
                </button>
              )}
            </div>
          </div>

          {/* Custom Allocation Toggle */}
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomAllocation}
                onChange={(e) => setUseCustomAllocation(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-700">
                  Customize allocation for this contribution
                </span>
                <p className="text-xs text-gray-500">
                  {useCustomAllocation 
                    ? 'Use sliders below to allocate funds across causes' 
                    : 'Funds will follow your existing portfolio allocation'}
                </p>
              </div>
            </label>
          </div>
          
          {/* Cause Distribution Preview */}
          {showDistribution && causeDistributions.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>📊</span> Fund Distribution Across Causes
                </h3>
                {useCustomAllocation && (
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    isAllocationValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    Total: {totalCustomPercentage.toFixed(1)}%
                  </span>
                )}
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {causeDistributions.map(dist => (
                  <div key={dist.causeId} className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                          {dist.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900">
                            {dist.causeName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {(customPercentages[dist.causeId] || 0).toFixed(1)}% of contribution
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-purple-600">
                          ${dist.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Allocation Slider */}
                    {useCustomAllocation && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            value={customPercentages[dist.causeId] || 0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setCustomPercentages(prev => ({
                                ...prev,
                                [dist.causeId]: val
                              }));
                            }}
                            min="0"
                            max="100"
                            step="0.5"
                            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #9333ea 0%, #9333ea ${customPercentages[dist.causeId] || 0}%, #e5e7eb ${customPercentages[dist.causeId] || 0}%, #e5e7eb 100%)`
                            }}
                          />
                          <input
                            type="number"
                            value={customPercentages[dist.causeId] || 0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setCustomPercentages(prev => ({
                                ...prev,
                                [dist.causeId]: Math.max(0, Math.min(100, val))
                              }));
                            }}
                            min="0"
                            max="100"
                            step="0.5"
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:outline-none text-center font-semibold"
                          />
                          <span className="text-xs text-gray-600 font-semibold">%</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Show waqf type allocation if hybrid */}
                    {waqf.isHybrid && (dist.allocation.permanent > 0 || dist.allocation.consumable > 0 || dist.allocation.revolving > 0) && (
                      <div className="flex gap-2 text-xs">
                        {dist.allocation.permanent > 0 && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                            🏛️ {dist.allocation.permanent.toFixed(0)}% Permanent
                          </span>
                        )}
                        {dist.allocation.consumable > 0 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                            🎁 {dist.allocation.consumable.toFixed(0)}% Consumable
                          </span>
                        )}
                        {dist.allocation.revolving > 0 && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                            🔄 {dist.allocation.revolving.toFixed(0)}% Revolving
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">ℹ️ Note:</span> {useCustomAllocation 
                    ? 'Use the sliders or input fields to adjust allocation. Total must equal 100%.' 
                    : 'Funds are distributed proportionally based on your existing portfolio allocation.'}
                </p>
              </div>
            </div>
          )}

          {/* Summary */}
          {amount && parseFloat(amount) >= 10 && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>📋</span> Contribution Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Contribution Amount:</span>
                  <span className="font-bold text-gray-900">
                    ${parseFloat(amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Current Portfolio Value:</span>
                  <span className="font-semibold text-gray-900">
                    ${waqf.financial.currentBalance.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-purple-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-semibold">New Portfolio Value:</span>
                    <span className="text-xl font-black text-purple-600">
                      ${(waqf.financial.currentBalance + parseFloat(amount)).toLocaleString()}
                    </span>
                  </div>
                </div>
                {causeDistributions.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-600">
                      Distributed across <span className="font-semibold">{causeDistributions.length} cause{causeDistributions.length > 1 ? 's' : ''}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
            style={{ borderColor: '#9333ea', color: '#9333ea' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) < 10 || !isAllocationValid || isSubmitting}
            className="flex-1"
            style={{ 
              background: 'linear-gradient(to right, #2563eb, #9333ea)',
              border: 'none',
              opacity: (!amount || parseFloat(amount) < 10 || !isAllocationValid || isSubmitting) ? 0.5 : 1
            }}
          >
            {isSubmitting ? '⏳ Processing...' : isAllocationValid ? '✅ Add Funds' : '⚠️ Invalid Allocation'}
          </Button>
        </div>
      </div>
    </div>
  );
}
