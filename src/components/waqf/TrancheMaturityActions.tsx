'use client';

import { useState } from 'react';
import type {
  ContributionTranche,
  ExpirationAction,
  WaqfProfile,
  SpendingSchedule,
} from '@/types/waqfs';
import {
  rolloverTranche,
  convertTrancheToPermanent,
  convertTrancheToConsumable,
  returnTranche,
} from '@/lib/api/tranche-operations';
import { logger } from '@/lib/logger';

interface TrancheMaturityActionsProps {
  waqf: WaqfProfile;
  tranche: ContributionTranche;
  onActionComplete: () => void;
}

export function TrancheMaturityActions({
  waqf,
  tranche,
  onActionComplete,
}: TrancheMaturityActionsProps) {
  const [selectedAction, setSelectedAction] = useState<ExpirationAction>(
    tranche.expirationPreference?.action || 'refund'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Rollover options
  const [rolloverMonths, setRolloverMonths] = useState(
    tranche.expirationPreference?.rolloverMonths || waqf.revolvingDetails?.lockPeriodMonths || 12
  );

  // Consumable conversion options
  const [consumableSchedule, setConsumableSchedule] = useState<SpendingSchedule>(
    tranche.expirationPreference?.consumableSchedule || 'phased'
  );
  const [consumableDuration, setConsumableDuration] = useState(
    tranche.expirationPreference?.consumableDuration || 12
  );

  const handleExecuteAction = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      let result;

      switch (selectedAction) {
        case 'refund':
          logger.info('Executing refund action', { trancheId: tranche.id });
          result = await returnTranche(waqf.id, tranche.id);
          break;

        case 'rollover':
          logger.info('Executing rollover action', {
            trancheId: tranche.id,
            rolloverMonths,
          });
          result = await rolloverTranche(
            waqf.id,
            tranche.id,
            rolloverMonths,
            waqf.selectedCauses[0] // Use first cause or allow selection
          );
          break;

        case 'convert_permanent':
          logger.info('Executing convert to permanent action', {
            trancheId: tranche.id,
          });
          result = await convertTrancheToPermanent(waqf.id, tranche.id, {
            assetAllocation: '60% Sukuk, 40% Equity',
            expectedAnnualReturn: 7.0,
            distributionFrequency: 'quarterly',
          });
          break;

        case 'convert_consumable':
          logger.info('Executing convert to consumable action', {
            trancheId: tranche.id,
            consumableSchedule,
            consumableDuration,
          });
          
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + consumableDuration);
          
          result = await convertTrancheToConsumable(waqf.id, tranche.id, {
            spendingSchedule: consumableSchedule,
            startDate: new Date().toISOString(),
            endDate: endDate.toISOString(),
          });
          break;

        default:
          throw new Error('Invalid action selected');
      }

      if (result.success) {
        setShowConfirmation(false);
        onActionComplete();
      } else {
        setError(result.error || 'Action failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Failed to execute maturity action', { error: message });
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Matured Tranche Action
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Choose what to do with this matured tranche ({formatAmount(tranche.amount)})
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Action Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Refund Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedAction === 'refund'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 hover:border-blue-300'
            }`}
            onClick={() => setSelectedAction('refund')}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                checked={selectedAction === 'refund'}
                onChange={() => setSelectedAction('refund')}
                className="w-4 h-4"
              />
              <h4 className="font-semibold text-gray-900 dark:text-white">💰 Refund</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Return principal to donor
            </p>
          </div>

          {/* Rollover Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedAction === 'rollover'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 hover:border-purple-300'
            }`}
            onClick={() => setSelectedAction('rollover')}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                checked={selectedAction === 'rollover'}
                onChange={() => setSelectedAction('rollover')}
                className="w-4 h-4"
              />
              <h4 className="font-semibold text-gray-900 dark:text-white">🔄 Rollover</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Extend lock period
            </p>
          </div>

          {/* Convert to Permanent Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedAction === 'convert_permanent'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 hover:border-green-300'
            }`}
            onClick={() => setSelectedAction('convert_permanent')}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                checked={selectedAction === 'convert_permanent'}
                onChange={() => setSelectedAction('convert_permanent')}
                className="w-4 h-4"
              />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                🏛️ Convert to Permanent
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create perpetual endowment
            </p>
          </div>

          {/* Convert to Consumable Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedAction === 'convert_consumable'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-300 hover:border-orange-300'
            }`}
            onClick={() => setSelectedAction('convert_consumable')}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                checked={selectedAction === 'convert_consumable'}
                onChange={() => setSelectedAction('convert_consumable')}
                className="w-4 h-4"
              />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                ⚡ Convert to Consumable
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Spend over time
            </p>
          </div>
        </div>

        {/* Action-specific Options */}
        {selectedAction === 'rollover' && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rollover Period (months)
            </label>
            <input
              type="number"
              min="1"
              max="240"
              value={rolloverMonths}
              onChange={(e) => setRolloverMonths(parseInt(e.target.value) || 12)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              New maturity: {new Date(Date.now() + rolloverMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>
        )}

        {selectedAction === 'convert_consumable' && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Spending Schedule
              </label>
              <select
                value={consumableSchedule}
                onChange={(e) => setConsumableSchedule(e.target.value as SpendingSchedule)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="immediate">Immediate</option>
                <option value="phased">Phased</option>
                <option value="milestone-based">Milestone-Based</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (months)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={consumableDuration}
                onChange={(e) => setConsumableDuration(parseInt(e.target.value) || 12)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={() => setShowConfirmation(true)}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isProcessing ? 'Processing...' : 'Execute Action'}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Action
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to{' '}
              <span className="font-semibold">
                {selectedAction === 'refund' && 'refund'}
                {selectedAction === 'rollover' && `rollover for ${rolloverMonths} months`}
                {selectedAction === 'convert_permanent' && 'convert to permanent waqf'}
                {selectedAction === 'convert_consumable' && 'convert to consumable waqf'}
              </span>
              {' '}this tranche of {formatAmount(tranche.amount)}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
