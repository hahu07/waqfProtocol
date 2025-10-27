'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { WaqfProfile } from '@/types/waqfs';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, customLockPeriod?: number) => void;
  waqf: WaqfProfile;
}

export function AddFundsModal({ isOpen, onClose, onSubmit, waqf }: AddFundsModalProps) {
  const [amount, setAmount] = useState('');
  const [useCustomLockPeriod, setUseCustomLockPeriod] = useState(false);
  const [customLockPeriod, setCustomLockPeriod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalize waqf type for comparison
  const normalizeWaqfType = (type: string): string => {
    const lower = type.toLowerCase();
    return lower
      .replace(/temporaryrevolving/i, 'temporary_revolving')
      .replace(/temporaryconsumable/i, 'temporary_consumable');
  };
  
  const waqfType = normalizeWaqfType(waqf.waqfType || 'permanent');
  const isRevolving = waqfType === 'temporary_revolving';
  const defaultLockPeriod = waqf.revolvingDetails?.lockPeriodMonths || 12;
  
  console.log('🔍 AddFundsModal - Waqf Type Check:', {
    rawWaqfType: waqf.waqfType,
    normalizedWaqfType: waqfType,
    isRevolving,
    hasRevolvingDetails: !!waqf.revolvingDetails,
    lockPeriod: defaultLockPeriod
  });

  // Calculate maturity date
  const calculateMaturityDate = (lockMonths: number): Date => {
    const date = new Date();
    date.setMonth(date.getMonth() + lockMonths);
    return date;
  };

  const lockPeriod = useCustomLockPeriod && customLockPeriod 
    ? parseInt(customLockPeriod) 
    : defaultLockPeriod;

  const maturityDate = calculateMaturityDate(lockPeriod);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setUseCustomLockPeriod(false);
      setCustomLockPeriod('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

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

    if (useCustomLockPeriod) {
      const lockNum = parseInt(customLockPeriod);
      if (isNaN(lockNum) || lockNum < 1 || lockNum > 120) {
        alert('❌ Lock period must be between 1 and 120 months');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        amountNum,
        useCustomLockPeriod ? parseInt(customLockPeriod) : undefined
      );
      onClose();
    } catch (error) {
      console.error('Error submitting funds:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div 
          className="p-6 rounded-t-2xl"
          style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
        >
          <h2 className="text-2xl font-bold text-white mb-1">💰 Add Funds</h2>
          <p className="text-sm text-white opacity-90">
            {isRevolving 
              ? 'Add funds to your revolving waqf' 
              : 'Contribute to your waqf'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contribution Amount (USD)
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
            <p className="text-xs text-gray-500 mt-1">Minimum: $10</p>
          </div>

          {/* Revolving Waqf Specific Options */}
          {isRevolving && (
            <>
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  🔒 Lock Period Settings
                </h3>
                
                {/* Default Lock Period Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Default Lock Period: {defaultLockPeriod} months
                      </p>
                      <p className="text-xs text-blue-700">
                        Your funds will be locked and returned to you after the maturity date
                      </p>
                    </div>
                  </div>
                </div>

                {/* Custom Lock Period Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomLockPeriod}
                    onChange={(e) => setUseCustomLockPeriod(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Use custom lock period for this contribution
                  </span>
                </label>

                {/* Custom Lock Period Input */}
                {useCustomLockPeriod && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Lock Period (months)
                    </label>
                    <input
                      type="number"
                      value={customLockPeriod}
                      onChange={(e) => setCustomLockPeriod(e.target.value)}
                      placeholder={defaultLockPeriod.toString()}
                      min="1"
                      max="120"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Between 1 and 120 months (10 years)
                    </p>
                  </div>
                )}

                {/* Maturity Date Preview */}
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Estimated Maturity Date</p>
                      <p className="text-lg font-bold text-purple-900">
                        {maturityDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Locked for {lockPeriod} months
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Summary */}
          {amount && parseFloat(amount) >= 10 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    ${parseFloat(amount).toLocaleString()}
                  </span>
                </div>
                {isRevolving && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lock Period:</span>
                      <span className="font-semibold text-gray-900">
                        {lockPeriod} months
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Returns on:</span>
                      <span className="font-semibold text-gray-900">
                        {maturityDate.toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">New Balance:</span>
                    <span className="text-lg font-bold text-purple-600">
                      ${(waqf.financial.currentBalance + parseFloat(amount)).toLocaleString()}
                    </span>
                  </div>
                </div>
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
            disabled={!amount || parseFloat(amount) < 10 || isSubmitting}
            className="flex-1"
            style={{ 
              background: 'linear-gradient(to right, #2563eb, #9333ea)',
              border: 'none',
              opacity: (!amount || parseFloat(amount) < 10 || isSubmitting) ? 0.5 : 1
            }}
          >
            {isSubmitting ? '⏳ Processing...' : '✅ Add Funds'}
          </Button>
        </div>
      </div>
    </div>
  );
}
