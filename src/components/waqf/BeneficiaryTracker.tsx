'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WaqfProfile } from '@/types/waqfs';
import { updateWaqf } from '@/lib/waqf-utils';
import { getCompletionStatus } from '@/lib/consumable-contribution-handler';
import { logger } from '@/lib/logger';

interface BeneficiaryTrackerProps {
  waqf: WaqfProfile;
  userId: string;
  onUpdate?: () => void;
}

export function BeneficiaryTracker({ waqf, userId, onUpdate }: BeneficiaryTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [beneficiaryCount, setBeneficiaryCount] = useState(
    waqf.financial.impactMetrics?.beneficiariesSupported || 0
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const currentCount = waqf.financial.impactMetrics?.beneficiariesSupported || 0;
  const targetCount = waqf.consumableDetails?.targetBeneficiaries;
  
  // Calculate progress
  const progress = targetCount ? (currentCount / targetCount) * 100 : 0;

  const handleUpdate = async () => {
    if (beneficiaryCount === currentCount) {
      setIsEditing(false);
      return;
    }

    try {
      setIsUpdating(true);

      const updatedFinancial = {
        ...waqf.financial,
        impactMetrics: {
          ...waqf.financial.impactMetrics,
          beneficiariesSupported: beneficiaryCount,
          projectsCompleted: waqf.financial.impactMetrics?.projectsCompleted || 0
        }
      };

      // Check if target has been reached
      const completionStatus = getCompletionStatus({
        ...waqf,
        financial: updatedFinancial
      });

      const updateData: Partial<WaqfProfile> = {
        financial: updatedFinancial,
        status: completionStatus.isCompleted ? 'completed' : waqf.status
      };

      await updateWaqf(waqf.id, updateData, userId, userId);

      logger.info('Beneficiary count updated', {
        waqfId: waqf.id,
        oldCount: currentCount,
        newCount: beneficiaryCount,
        isCompleted: completionStatus.isCompleted
      });

      if (completionStatus.isCompleted) {
        alert('🎉 Congratulations! Target beneficiaries reached. Waqf marked as completed.');
      }

      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      logger.error('Error updating beneficiary count', error);
      alert('Failed to update beneficiary count');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!waqf.consumableDetails?.targetBeneficiaries) {
    // No target set, just show current count
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Beneficiaries Supported</h3>
            <p className="text-sm text-gray-600">Track people helped by this waqf</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">👥</span>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="beneficiaries">Number of Beneficiaries</Label>
              <Input
                id="beneficiaries"
                type="number"
                min="0"
                value={beneficiaryCount}
                onChange={(e) => setBeneficiaryCount(parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? 'Updating...' : 'Save'}
              </Button>
              <Button
                onClick={() => {
                  setBeneficiaryCount(currentCount);
                  setIsEditing(false);
                }}
                variant="outline"
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {currentCount.toLocaleString()}
            </p>
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              ✏️ Update Count
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Has target - show progress
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Beneficiaries Target</h3>
          <p className="text-sm text-gray-600">Track progress toward goal</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-2xl">🎯</span>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="beneficiaries">Current Beneficiaries</Label>
            <Input
              id="beneficiaries"
              type="number"
              min="0"
              max={targetCount}
              value={beneficiaryCount}
              onChange={(e) => setBeneficiaryCount(parseInt(e.target.value) || 0)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Target: {targetCount.toLocaleString()} beneficiaries
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Updating...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setBeneficiaryCount(currentCount);
                setIsEditing(false);
              }}
              variant="outline"
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {currentCount.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">
                of {targetCount.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {progress.toFixed(1)}% of target reached
            </p>
          </div>

          {/* Status Badge */}
          {progress >= 100 ? (
            <div className="bg-green-100 border border-green-200 rounded-lg p-3 text-center">
              <span className="text-green-800 font-semibold">
                🎉 Target Reached!
              </span>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <span className="text-blue-800 font-medium">
                {(targetCount - currentCount).toLocaleString()} more to reach goal
              </span>
            </div>
          )}

          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            ✏️ Update Count
          </Button>
        </div>
      )}
    </div>
  );
}
