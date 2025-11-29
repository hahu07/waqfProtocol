'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CausesModal } from './causesModal';
import { WaqfDeedModal } from './WaqfDeedModal';
import type { WaqfProfile, Cause } from '@/types/waqfs';
import { WaqfType } from '@/types/waqfs';
import { logger } from '@/lib/logger';
import { calculateMaturityDate } from '@/lib/maturity-tracker';


interface WaqfFormData {
  name: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorAddress: string;
  description: string;
  waqfAsset: number;
  selectedCauseIds: string[];
  waqfType: 'permanent' | 'temporary_consumable' | 'temporary_revolving' | 'hybrid';
  isHybrid: boolean;
  
  // Hybrid allocations
  hybridAllocations: {
    [causeId: string]: {
      permanent: number;
      temporary_consumable: number;
      temporary_revolving: number;
    }
  };
  
  // Consumable waqf details
  consumableDetails?: {
    spendingSchedule: 'immediate' | 'phased' | 'milestone-based' | 'ongoing';
    startDate?: string;
    endDate?: string;
    targetAmount?: number;
    targetBeneficiaries?: number;
    minimumMonthlyDistribution?: number;
  };
  
  // Revolving waqf details
  revolvingDetails?: {
    lockPeriodMonths: number;
    maturityDate: string;
    principalReturnMethod: 'lump_sum' | 'installments';
    earlyWithdrawalAllowed: boolean;
  };
  
  // Investment strategy
  investmentStrategy?: {
    assetAllocation: string;
    expectedAnnualReturn: number;
    distributionFrequency: 'monthly' | 'quarterly' | 'annually';
  };
}

interface WaqfFormProps {
  initialData?: WaqfProfile;
  availableCauses: Cause[];
  isLoadingCauses?: boolean;
  causesError: Error | null;
  userId: string;
  onSubmit: (data: Omit<WaqfProfile, 'id'>) => void;
}

export function WaqfForm({ 
  initialData, 
  availableCauses,
  isLoadingCauses = false,
  causesError,
  userId,
  onSubmit 
}: WaqfFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<WaqfFormData>({
    name: initialData?.name || '',
    donorName: initialData?.donor.name || '',
    donorEmail: initialData?.donor.email || '',
    donorPhone: initialData?.donor.phone || '',
    donorAddress: initialData?.donor.address || '',
    description: initialData?.description || '',
    waqfAsset: initialData?.waqfAsset || 0,
    selectedCauseIds: initialData?.selectedCauses || [],
    
    // Waqf type
    waqfType: initialData?.isHybrid ? 'hybrid' : (initialData?.waqfType || 'permanent') as 'permanent' | 'temporary_consumable' | 'temporary_revolving' | 'hybrid',
    isHybrid: initialData?.isHybrid || false,
    
    // Hybrid allocations
    hybridAllocations: initialData?.hybridAllocations?.reduce((acc, alloc) => ({
      ...acc,
      [alloc.causeId]: alloc.allocations
    }), {}) || {},
    
    // Consumable details
    consumableDetails: initialData?.consumableDetails || {
      spendingSchedule: 'phased',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    
    // Revolving details
    revolvingDetails: initialData?.revolvingDetails || {
      lockPeriodMonths: 12,
      maturityDate: calculateMaturityDate(12),
      principalReturnMethod: 'lump_sum',
      earlyWithdrawalAllowed: false
    },
    
    // Investment strategy
    investmentStrategy: initialData?.investmentStrategy || {
      assetAllocation: '60% Sukuk, 40% Equity',
      expectedAnnualReturn: 7.0,
      distributionFrequency: 'quarterly'
    }
  });
  
  const [showCausesModal, setShowCausesModal] = useState(false);
  const [showWaqfDeed, setShowWaqfDeed] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    donorName?: string;
    donorEmail?: string;
    donorPhone?: string;
    donorAddress?: string;
    description?: string;
    waqfAsset?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    
    // Validate waqf name
    if (!formData.name.trim()) {
      errors.name = 'Waqf name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Waqf name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      errors.name = 'Waqf name must be less than 100 characters';
    }
    
    // Validate donor name
    if (!formData.donorName.trim()) {
      errors.donorName = 'Donor name is required';
    } else if (formData.donorName.length < 2) {
      errors.donorName = 'Donor name must be at least 2 characters';
    }
    
    // Validate email
    if (!formData.donorEmail.trim()) {
      errors.donorEmail = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.donorEmail)) {
      errors.donorEmail = 'Please enter a valid email address';
    }
    
    // Validate phone (optional but must be valid if provided)
    if (formData.donorPhone.trim() && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.donorPhone)) {
      errors.donorPhone = 'Please enter a valid phone number';
    }
    
    // Validate description
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      errors.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }
    
    // Validate waqf asset
    if (formData.waqfAsset <= 0) {
      errors.waqfAsset = 'Waqf asset must be greater than 0';
    } else if (formData.waqfAsset < 100) {
      errors.waqfAsset = 'Waqf asset must be at least $100';
    } else if (formData.waqfAsset > 1000000000) {
      errors.waqfAsset = 'Waqf asset amount is too large';
    }
    
    // Validate causes selection
    if (formData.selectedCauseIds.length === 0) {
      alert('⚠️ Please select at least one charitable cause for your Waqf.');
      return false;
    }
    
    // Validate consumable waqf (UX-level validation only)
    // Note: Backend will enforce business rules as source of truth
    if (formData.waqfType === 'temporary_consumable' || formData.isHybrid) {
      if (formData.consumableDetails) {
        const details = formData.consumableDetails;
        
        // UX validation: Validate date format and logic if both are provided
        if (details.startDate && details.endDate) {
          const startDate = new Date(details.startDate);
          const endDate = new Date(details.endDate);
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            alert('⚠️ Please enter valid dates for consumable waqf.');
            return false;
          }
          
          if (endDate <= startDate) {
            alert('⚠️ End date must be after start date for consumable waqf.');
            return false;
          }
        }
        
        // Backend will validate schedule-specific requirements
        // Frontend only checks basic UX issues
      }
    }

    // Validate revolving waqf
    if (formData.waqfType === 'temporary_revolving' || formData.isHybrid) {
      if (formData.revolvingDetails) {
        if (formData.revolvingDetails.lockPeriodMonths < 1) {
          alert('⚠️ Lock period must be at least 1 month.');
          return false;
        }
        if (formData.revolvingDetails.lockPeriodMonths > 240) {
          alert('⚠️ Lock period cannot exceed 240 months (20 years).');
          return false;
        }
      }
    }

    // Validate hybrid allocations
    if (formData.isHybrid) {
      for (const causeId of formData.selectedCauseIds) {
        const allocation = formData.hybridAllocations[causeId];
        if (!allocation) {
          alert(`⚠️ Please set allocation percentages for all selected causes.`);
          return false;
        }
        
        const total = (allocation.permanent || 0) +
                      (allocation.temporary_consumable || 0) +
                      (allocation.temporary_revolving || 0);
        
        if (Math.abs(total - 100) > 0.01) {
          const cause = availableCauses.find(c => c.id === causeId);
          alert(`⚠️ Allocations for "${cause?.name}" must sum to 100% (currently ${total.toFixed(1)}%)`);
          return false;
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReviewAndSign = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!userId || userId.trim() === '') {
      alert('❌ You must be logged in to create a Waqf. Please log in and try again.');
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Show Waqf Deed modal
    setShowWaqfDeed(true);
  };

  // Map frontend waqfType to Rust enum format
  const mapWaqfTypeToRust = (type: string): string => {
    switch(type) {
      case 'permanent': return 'Permanent';
      case 'temporary_consumable': return 'TemporaryConsumable';
      case 'temporary_revolving': return 'TemporaryRevolving';
      case 'hybrid': return 'Hybrid';
      default: return type;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Generate deed document data
      const deedDocument = {
        signedAt: new Date().toISOString(),
        donorSignature: formData.donorName,
        documentVersion: '1.0'
      };
      
      // If this is an edit (initialData exists), call onSubmit directly without payment
      if (initialData && initialData.id) {
        const waqfProfile: Omit<WaqfProfile, 'id'> = {
          name: formData.name,
          description: formData.description,
          waqfAsset: formData.waqfAsset,
          waqfType: mapWaqfTypeToRust(formData.waqfType) as WaqfProfile['waqfType'],
          isHybrid: formData.isHybrid,
          hybridAllocations: formData.isHybrid ? Object.entries(formData.hybridAllocations).map(([causeId, allocation]) => ({
            causeId,
            allocations: {
              permanent: allocation.permanent,
              temporary_consumable: allocation.temporary_consumable,
              temporary_revolving: allocation.temporary_revolving
            }
          })) : undefined,
          consumableDetails: (formData.waqfType === 'temporary_consumable' || formData.isHybrid) ? formData.consumableDetails : undefined,
          revolvingDetails: (formData.waqfType === 'temporary_revolving' || formData.isHybrid) ? formData.revolvingDetails : undefined,
          investmentStrategy: formData.waqfType === 'permanent' ? formData.investmentStrategy : undefined,
          donor: {
            name: formData.donorName,
            email: formData.donorEmail,
            phone: formData.donorPhone,
            address: formData.donorAddress
          },
          selectedCauses: formData.selectedCauseIds,
          causeAllocation: {},
          waqfAssets: [],
          supportedCauses: availableCauses
            .filter(c => formData.selectedCauseIds.includes(c.id)),
          financial: initialData.financial || {
            totalDonations: 0,
            totalDistributed: 0,
            currentBalance: 0,
            investmentReturns: [],
            totalInvestmentReturn: 0,
            growthRate: 0,
            causeAllocations: {}
          },
          reportingPreferences: {
            frequency: 'yearly',
            reportTypes: ['financial'],
            deliveryMethod: 'email'
          },
          status: 'active',
          notifications: {
            contributionReminders: true,
            impactReports: true,
            financialUpdates: true
          },
          deedDocument: initialData.deedDocument || deedDocument,
          createdBy: userId || 'anonymous',
          createdAt: initialData.createdAt || new Date().toISOString()
        };
        
        await onSubmit(waqfProfile);
      } else {
        // For new waqf creation, submit directly with deed document
        const waqfProfile: Omit<WaqfProfile, 'id'> = {
          name: formData.name,
          description: formData.description,
          waqfAsset: formData.waqfAsset,
          waqfType: mapWaqfTypeToRust(formData.waqfType) as WaqfProfile['waqfType'],
          isHybrid: formData.isHybrid,
          hybridAllocations: formData.isHybrid ? Object.entries(formData.hybridAllocations).map(([causeId, allocation]) => ({
            causeId,
            allocations: {
              permanent: allocation.permanent,
              temporary_consumable: allocation.temporary_consumable,
              temporary_revolving: allocation.temporary_revolving
            }
          })) : undefined,
          consumableDetails: (formData.waqfType === 'temporary_consumable' || formData.isHybrid) ? formData.consumableDetails : undefined,
          revolvingDetails: (formData.waqfType === 'temporary_revolving' || formData.isHybrid) ? formData.revolvingDetails : undefined,
          investmentStrategy: formData.waqfType === 'permanent' ? formData.investmentStrategy : undefined,
          donor: {
            name: formData.donorName,
            email: formData.donorEmail,
            phone: formData.donorPhone,
            address: formData.donorAddress
          },
          selectedCauses: formData.selectedCauseIds,
          causeAllocation: {},
          waqfAssets: [],
          supportedCauses: availableCauses
            .filter(c => formData.selectedCauseIds.includes(c.id)),
          financial: {
            totalDonations: formData.waqfAsset,
            totalDistributed: 0,
            currentBalance: formData.waqfAsset,
            investmentReturns: [],
            totalInvestmentReturn: 0,
            growthRate: 0,
            causeAllocations: {}
          },
          reportingPreferences: {
            frequency: 'yearly',
            reportTypes: ['financial'],
            deliveryMethod: 'email'
          },
          status: 'active',
          notifications: {
            contributionReminders: true,
            impactReports: true,
            financialUpdates: true
          },
          deedDocument,
          createdBy: userId || 'anonymous',
          createdAt: new Date().toISOString()
        };
        
        await onSubmit(waqfProfile);
      }
    } catch (error) {
      logger.error('Form submission error', error instanceof Error ? error : { error });
      alert(`❌ Failed to submit waqf: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {causesError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Failed to load causes: {causesError.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold text-gray-900 dark:text-white">Charitable Causes</Label>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {formData.selectedCauseIds.length > 0 && (
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                {formData.selectedCauseIds.length} selected
              </span>
            )}
          </div>
        </div>
        
        {/* Enhanced Selected Causes Display */}
        <div className={`relative min-h-[80px] p-6 border-2 rounded-2xl transition-all duration-300 group ${
          formData.selectedCauseIds.length > 0 
            ? 'border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 shadow-sm hover:shadow-md' 
            : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
        }`}>
          {formData.selectedCauseIds.length > 0 ? (
            <div className="space-y-4">
              {/* Selected causes grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.selectedCauseIds.map(id => {
                  const cause = availableCauses.find(c => c.id === id);
                  return cause ? (
                    <div 
                      key={id} 
                      className="group/tag relative flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                    >
                      {/* Cause icon/indicator */}
                      <div className="flex-shrink-0 w-3 h-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"></div>
                      
                      {/* Cause name */}
                      <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                        {cause.name}
                      </span>
                      
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({
                            ...formData, 
                            selectedCauseIds: formData.selectedCauseIds.filter(causeId => causeId !== id)
                          });
                        }}
                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover/tag:opacity-100"
                        title="Remove cause"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center justify-between pt-3 border-t border-blue-200 dark:border-blue-700/50">
                <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">
                    {formData.selectedCauseIds.length} cause{formData.selectedCauseIds.length !== 1 ? 's' : ''} will receive support
                  </span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                  Ready to create Waqf
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              {/* Empty state icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mb-4 group-hover:from-blue-200 group-hover:to-purple-300 dark:group-hover:from-blue-800 dark:group-hover:to-purple-700 transition-all duration-300">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              
              {/* Empty state text */}
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No causes selected
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                Choose the charitable causes you want to support with your Waqf endowment
              </p>
              
              {/* Suggestion badges */}
              <div className="flex flex-wrap gap-2 mt-4 text-xs">
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  Education
                </span>
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  Healthcare
                </span>
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  Community
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Professional Action Button */}
        <div className="flex items-center gap-4">
          <button
            type="button" 
            style={{
              background: formData.selectedCauseIds.length > 0 
                ? 'transparent' 
                : 'linear-gradient(to right, #2563eb, #9333ea)'
            }}
            className={`group relative min-h-[52px] px-6 font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 ${
              formData.selectedCauseIds.length > 0 
                ? 'border-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20' 
                : 'text-white shadow-lg hover:shadow-xl'
            }`}
            onClick={() => setShowCausesModal(true)}
            onMouseEnter={(e) => {
              if (formData.selectedCauseIds.length === 0) {
                e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #7e22ce)';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.selectedCauseIds.length === 0) {
                e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #9333ea)';
              }
            }}
          >
            <div className="flex items-center space-x-3">
              {formData.selectedCauseIds.length > 0 ? (
                <>
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Selection ({formData.selectedCauseIds.length})</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Choose Charitable Causes</span>
                </>
              )}
            </div>
            
            {/* Button glow effect for default state */}
            {formData.selectedCauseIds.length === 0 && (
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"
                style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
              ></div>
            )}
          </button>
          
          {/* Quick actions when causes are selected */}
          {formData.selectedCauseIds.length > 0 && (
            <button
              type="button"
              onClick={() => setFormData({...formData, selectedCauseIds: []})}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Clear all selections"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear all</span>
            </button>
          )}
        </div>
        
        {/* Professional Helper Text */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                Maximize Your Waqf Impact
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Select multiple causes to create a diversified charitable portfolio. Your Waqf will generate ongoing returns to support these causes perpetually.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Waqf Type Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold text-gray-900 dark:text-white">Waqf Type</Label>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose how your contribution will be managed
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Permanent Waqf Card */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              formData.waqfType === 'permanent' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-300 hover:border-green-300'
            }`}
            onClick={() => setFormData({...formData, waqfType: 'permanent', isHybrid: false})}
          >
            <h4 className="font-bold text-lg mb-2">🏛️ Permanent Waqf</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Principal preserved forever. Only investment returns distributed to causes.
            </p>
            <div className="mt-3 text-xs text-green-600 dark:text-green-400 font-medium">
              ✓ Lasting legacy · ✓ Continuous impact · ✓ Perpetual rewards
            </div>
          </div>
          
          {/* Consumable Waqf Card */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              formData.waqfType === 'temporary_consumable' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 hover:border-blue-300'
            }`}
            onClick={() => setFormData({...formData, waqfType: 'temporary_consumable', isHybrid: false})}
          >
            <h4 className="font-bold text-lg mb-2">⚡ Consumable Waqf</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Principal + returns spent over time. Direct and immediate impact.
            </p>
            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
              ✓ Fast impact · ✓ Complete spending · ✓ Time-bound
            </div>
          </div>
          
          {/* Revolving Waqf Card */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              formData.waqfType === 'temporary_revolving' 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-300 hover:border-purple-300'
            }`}
            onClick={() => setFormData({...formData, waqfType: 'temporary_revolving', isHybrid: false})}
          >
            <h4 className="font-bold text-lg mb-2">🔄 Revolving Waqf</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Principal returned after term. Returns distributed to causes during lock period.
            </p>
            <div className="mt-3 text-xs text-purple-600 dark:text-purple-400 font-medium">
              ✓ Capital preserved · ✓ Term rewards · ✓ Principal returned
            </div>
          </div>
        </div>
        
        {/* Hybrid Option Toggle */}
        <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isHybrid}
              onChange={(e) => setFormData({
                ...formData, 
                isHybrid: e.target.checked,
                waqfType: e.target.checked ? 'hybrid' : 'permanent'
              })}
              className="w-5 h-5"
            />
            <div>
              <span className="font-semibold">Enable Hybrid Allocation</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Split your contribution across multiple waqf types for each cause
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Consumable Waqf Configuration */}
      {(formData.waqfType === 'temporary_consumable' || formData.isHybrid) && (
        <div className="space-y-4 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
            Consumable Waqf Configuration
          </h3>
          
          <div>
            <Label htmlFor="spendingSchedule">Spending Schedule</Label>
            <select
              id="spendingSchedule"
              value={formData.consumableDetails?.spendingSchedule || 'phased'}
              onChange={(e) => setFormData({
                ...formData,
                consumableDetails: {
                  ...formData.consumableDetails!,
                  spendingSchedule: e.target.value as 'immediate' | 'phased' | 'milestone-based' | 'ongoing'
                }
              })}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="immediate">Immediate - Spend as soon as possible</option>
              <option value="phased">Phased - Gradual spending over time</option>
              <option value="milestone-based">Milestone-Based - Spend upon milestones</option>
              <option value="ongoing">Ongoing - Continuous distribution (no end date)</option>
            </select>
          </div>
          
          {/* Time boundaries (optional for ongoing) */}
          {formData.consumableDetails?.spendingSchedule !== 'ongoing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  id="startDate"
                  value={formData.consumableDetails?.startDate || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    consumableDetails: {
                      ...formData.consumableDetails!,
                      startDate: e.target.value || undefined
                    }
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  id="endDate"
                  value={formData.consumableDetails?.endDate || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    consumableDetails: {
                      ...formData.consumableDetails!,
                      endDate: e.target.value || undefined
                    }
                  })}
                />
              </div>
            </div>
          )}
          
          {/* Target-based completion (optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetAmount">Target Amount (Optional)</Label>
              <Input
                type="number"
                id="targetAmount"
                min="0"
                step="100"
                placeholder="e.g., 50000"
                value={formData.consumableDetails?.targetAmount || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  consumableDetails: {
                    ...formData.consumableDetails!,
                    targetAmount: e.target.value ? parseFloat(e.target.value) : undefined
                  }
                })}
              />
              <p className="text-xs text-gray-500 mt-1">Complete when this amount is distributed</p>
            </div>
            
            <div>
              <Label htmlFor="targetBeneficiaries">Target Beneficiaries (Optional)</Label>
              <Input
                type="number"
                id="targetBeneficiaries"
                min="1"
                placeholder="e.g., 1000"
                value={formData.consumableDetails?.targetBeneficiaries || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  consumableDetails: {
                    ...formData.consumableDetails!,
                    targetBeneficiaries: e.target.value ? parseInt(e.target.value) : undefined
                  }
                })}
              />
              <p className="text-xs text-gray-500 mt-1">Complete when this many people helped</p>
            </div>
          </div>
          
          {/* Minimum monthly distribution */}
          {(formData.consumableDetails?.spendingSchedule === 'ongoing' || 
            formData.consumableDetails?.spendingSchedule === 'phased') && (
            <div>
              <Label htmlFor="minimumMonthlyDistribution">
                Minimum Monthly Distribution {formData.consumableDetails?.spendingSchedule === 'ongoing' ? '' : '(Optional)'}
              </Label>
              <Input
                type="number"
                id="minimumMonthlyDistribution"
                min="1"
                step="10"
                placeholder="e.g., 500"
                value={formData.consumableDetails?.minimumMonthlyDistribution || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  consumableDetails: {
                    ...formData.consumableDetails!,
                    minimumMonthlyDistribution: e.target.value ? parseFloat(e.target.value) : undefined
                  }
                })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum amount to distribute each month
              </p>
            </div>
          )}
          
          {/* Schedule explanation with practical examples */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-blue-200 dark:border-gray-600">
            {formData.consumableDetails?.spendingSchedule === 'immediate' && (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Immediate Distribution</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Funds distributed as quickly as possible to address urgent needs. Best for emergency relief and time-sensitive situations.
                    </p>
                    <div className="bg-white dark:bg-gray-900 rounded-md p-3 border border-blue-100 dark:border-gray-600">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">💡 Example Use Cases:</p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                        <li>• <strong>Emergency Relief:</strong> $50,000 for Gaza humanitarian crisis (3 months)</li>
                        <li>• <strong>Disaster Response:</strong> $30,000 for earthquake victims (immediate)</li>
                        <li>• <strong>Medical Emergency:</strong> $10,000 for urgent surgeries (1 month)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {formData.consumableDetails?.spendingSchedule === 'phased' && (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">📅</span>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Phased Distribution</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Funds distributed gradually over time at a steady monthly rate. Ideal for ongoing programs with predictable needs. Accepts additional contributions and automatically extends the timeline.
                    </p>
                    <div className="bg-white dark:bg-gray-900 rounded-md p-3 border border-blue-100 dark:border-gray-600">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">💡 Example Use Cases:</p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                        <li>• <strong>Orphan Support:</strong> $24,000 over 24 months = $1,000/month for ongoing care</li>
                        <li>• <strong>Food Program:</strong> $60,000 over 12 months = $5,000/month for meal distribution</li>
                        <li>• <strong>Teacher Salaries:</strong> $36,000 over 36 months = $1,000/month for educator support</li>
                      </ul>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-2 font-medium">
                        ✨ Can accept more donations anytime - timeline extends proportionally!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {formData.consumableDetails?.spendingSchedule === 'milestone-based' && (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Milestone-Based Distribution</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Funds released when specific achievements are completed. Perfect for project-based work where progress can be verified before releasing funds.
                    </p>
                    <div className="bg-white dark:bg-gray-900 rounded-md p-3 border border-blue-100 dark:border-gray-600">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">💡 Example Use Cases:</p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                        <li>• <strong>Water Well Project:</strong> $50,000 split across milestones:
                          <ul className="ml-3 mt-1 space-y-0.5">
                            <li>  - Foundation complete: $10,000</li>
                            <li>  - Well drilled: $20,000</li>
                            <li>  - System installed: $15,000</li>
                            <li>  - Testing done: $5,000</li>
                          </ul>
                        </li>
                        <li>• <strong>School Building:</strong> Funds released at construction phases (design, foundation, walls, roof)</li>
                        <li>• <strong>Medical Camp:</strong> Payment per milestone (setup, 100 patients, 500 patients, cleanup)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {formData.consumableDetails?.spendingSchedule === 'ongoing' && (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">♾️</span>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Ongoing Distribution</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Continuous distribution with no fixed end date. Distributes monthly until target is reached or funds are depleted. Perfect for long-term community programs that accept ongoing contributions.
                    </p>
                    <div className="bg-white dark:bg-gray-900 rounded-md p-3 border border-blue-100 dark:border-gray-600">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">💡 Example Use Cases:</p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                        <li>• <strong>Scholarship Fund:</strong> $100,000 at $2,000/month until 1,000 students helped</li>
                        <li>• <strong>Community Kitchen:</strong> $50,000 at $1,000/month feeding families indefinitely</li>
                        <li>• <strong>Healthcare Clinic:</strong> $200,000 at $5,000/month for ongoing medical services</li>
                      </ul>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-2 font-medium">
                        ✨ Always accepts donations - no end date! Continues until target met or manually stopped.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revolving Waqf Configuration */}
      {(formData.waqfType === 'temporary_revolving' || formData.isHybrid) && (
        <div className="space-y-4 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
            Revolving Waqf Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lockPeriod">Lock Period (months)</Label>
              <Input
                type="number"
                id="lockPeriod"
                min="1"
                max="240"
                value={formData.revolvingDetails?.lockPeriodMonths || 12}
                onChange={(e) => {
                  const months = parseInt(e.target.value);
                  const maturityDate = calculateMaturityDate(months);
                  
                  setFormData({
                    ...formData,
                    revolvingDetails: {
                      ...formData.revolvingDetails!,
                      lockPeriodMonths: months,
                      maturityDate: maturityDate
                    }
                  });
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Min: 1 month, Max: 240 months (20 years)
              </p>
            </div>
            
            <div>
              <Label htmlFor="returnMethod">Principal Return Method</Label>
              <select
                id="returnMethod"
                value={formData.revolvingDetails?.principalReturnMethod || 'lump_sum'}
                onChange={(e) => setFormData({
                  ...formData,
                  revolvingDetails: {
                    ...formData.revolvingDetails!,
                    principalReturnMethod: e.target.value as 'lump_sum' | 'installments'
                  }
                })}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="lump_sum">Lump Sum - Return all at maturity</option>
                <option value="installments">Installments - Return in portions</option>
              </select>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Maturity Date:</strong> {formData.revolvingDetails?.maturityDate ? 
                new Date(formData.revolvingDetails.maturityDate).toLocaleDateString() : 'Not set'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Your principal will be returned to you on this date. All investment returns 
              generated during the lock period will be distributed to your selected causes.
            </p>
          </div>

        </div>
      )}

      {/* Hybrid Allocation Interface */}
      {formData.isHybrid && formData.selectedCauseIds.length > 0 && (
        <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <h3 className="text-lg font-semibold">Hybrid Allocation per Cause</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            For each selected cause, specify how to split your contribution across waqf types.
            Percentages for each cause must sum to 100%.
          </p>
          
          {formData.selectedCauseIds.map(causeId => {
            const cause = availableCauses.find(c => c.id === causeId);
            
            // Initialize allocation if not exists
            if (!formData.hybridAllocations[causeId]) {
              const defaultAllocation = {
                permanent: 50,
                temporary_consumable: 25,
                temporary_revolving: 25
              };
              // Update state asynchronously to avoid render loop
              setTimeout(() => {
                setFormData(prev => ({
                  ...prev,
                  hybridAllocations: {
                    ...prev.hybridAllocations,
                    [causeId]: defaultAllocation
                  }
                }));
              }, 0);
            }
            
            const allocation = formData.hybridAllocations[causeId] || {
              permanent: 50,
              temporary_consumable: 25,
              temporary_revolving: 25
            };
            
            return (
              <div key={causeId} className="p-4 bg-white dark:bg-gray-800 rounded-lg space-y-3">
                <h4 className="font-semibold">{cause?.name}</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Permanent %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={allocation.permanent}
                      onChange={(e) => {
                        const newAllocation = {
                          ...formData.hybridAllocations,
                          [causeId]: {
                            ...allocation,
                            permanent: parseFloat(e.target.value) || 0
                          }
                        };
                        setFormData({...formData, hybridAllocations: newAllocation});
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label>Consumable %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={allocation.temporary_consumable}
                      onChange={(e) => {
                        const newAllocation = {
                          ...formData.hybridAllocations,
                          [causeId]: {
                            ...allocation,
                            temporary_consumable: parseFloat(e.target.value) || 0
                          }
                        };
                        setFormData({...formData, hybridAllocations: newAllocation});
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label>Revolving %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={allocation.temporary_revolving}
                      onChange={(e) => {
                        const newAllocation = {
                          ...formData.hybridAllocations,
                          [causeId]: {
                            ...allocation,
                            temporary_revolving: parseFloat(e.target.value) || 0
                          }
                        };
                        setFormData({...formData, hybridAllocations: newAllocation});
                      }}
                    />
                  </div>
                </div>
                
                {/* Validation Indicator */}
                {(() => {
                  const total = allocation.permanent + allocation.temporary_consumable + allocation.temporary_revolving;
                  const isValid = Math.abs(total - 100) < 0.01;
                  return (
                    <div className={`text-sm font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                      Total: {total.toFixed(1)}% {isValid ? '✓' : '⚠️ Must equal 100%'}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      {showCausesModal && (
        <CausesModal
          isOpen={showCausesModal}
          causes={availableCauses}
          isLoading={isLoadingCauses}
          error={causesError}
          selected={formData.selectedCauseIds}
          onClose={() => setShowCausesModal(false)}
          onCauseSelect={(ids) => {
            // Clean up hybrid allocations for deselected causes
            const cleanedAllocations = formData.isHybrid ? 
              Object.fromEntries(
                Object.entries(formData.hybridAllocations).filter(([causeId]) => ids.includes(causeId))
              ) : formData.hybridAllocations;
            
            setFormData({
              ...formData, 
              selectedCauseIds: ids,
              hybridAllocations: cleanedAllocations
            });
          }}
          selectedWaqfType={formData.waqfType === 'hybrid' ? null : formData.waqfType}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm sm:text-base">
              Waqf Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full text-sm sm:text-base ${formErrors.name ? 'border-red-500' : ''}`}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="waqfAsset" className="text-sm sm:text-base">
              Waqf Asset - Principal Amount ($)
            </Label>
            <Input
              id="waqfAsset"
              type="number"
              min="100"
              step="0.01"
              value={formData.waqfAsset}
              onChange={(e) => setFormData({...formData, waqfAsset: parseFloat(e.target.value) || 0})}
              className={`w-full text-sm sm:text-base ${formErrors.waqfAsset ? 'border-red-500' : formData.waqfAsset > 0 && formData.waqfAsset < 100 ? 'border-orange-400' : ''}`}
              placeholder="Minimum $100"
            />
            {formErrors.waqfAsset && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>❌</span> {formErrors.waqfAsset}
              </p>
            )}
            {formData.waqfAsset > 0 && formData.waqfAsset < 100 && !formErrors.waqfAsset && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                <span className="text-orange-600">⚠️</span>
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-orange-800 mb-1">Minimum Amount Not Met</p>
                  <p className="text-orange-700">
                    The minimum waqf asset is <strong>$100</strong>. You need <strong>${(100 - formData.waqfAsset).toFixed(2)}</strong> more to meet the requirement.
                  </p>
                </div>
              </div>
            )}
            {formData.waqfAsset >= 100 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <p className="text-xs text-green-700 font-medium">
                  Great! Your waqf asset meets the minimum requirement.
                </p>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">💰</span>
                <div className="flex-1 text-xs text-blue-700">
                  <p className="font-semibold mb-1">How it works:</p>
                  <p>This principal amount will be preserved and invested. Only the investment returns will be distributed to your selected charitable causes perpetually.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="donorName" className="text-sm sm:text-base">
              Donor Name
            </Label>
            <Input
              id="donorName"
              value={formData.donorName}
              onChange={(e) => setFormData({...formData, donorName: e.target.value})}
              className={`w-full text-sm sm:text-base ${formErrors.donorName ? 'border-red-500' : ''}`}
            />
            {formErrors.donorName && (
              <p className="text-red-500 text-xs mt-1">{formErrors.donorName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="donorEmail" className="text-sm sm:text-base">
              Donor Email
            </Label>
            <Input
              id="donorEmail"
              type="email"
              value={formData.donorEmail}
              onChange={(e) => setFormData({...formData, donorEmail: e.target.value})}
              className={`w-full text-sm sm:text-base ${formErrors.donorEmail ? 'border-red-500' : ''}`}
            />
            {formErrors.donorEmail && (
              <p className="text-red-500 text-xs mt-1">{formErrors.donorEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="donorPhone" className="text-sm sm:text-base">
              Donor Phone Number
            </Label>
            <Input
              id="donorPhone"
              type="tel"
              value={formData.donorPhone}
              onChange={(e) => setFormData({...formData, donorPhone: e.target.value})}
              className={`w-full text-sm sm:text-base ${formErrors.donorPhone ? 'border-red-500' : ''}`}
              placeholder="e.g., +1 (555) 123-4567"
            />
            {formErrors.donorPhone && (
              <p className="text-red-500 text-xs mt-1">{formErrors.donorPhone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="donorAddress" className="text-sm sm:text-base">
              Donor Address
            </Label>
            <Textarea
              id="donorAddress"
              value={formData.donorAddress}
              onChange={(e) => setFormData({...formData, donorAddress: e.target.value})}
              className={`w-full min-h-[80px] text-sm sm:text-base ${formErrors.donorAddress ? 'border-red-500' : ''}`}
              placeholder="Enter your full address"
            />
            {formErrors.donorAddress && (
              <p className="text-red-500 text-xs mt-1">{formErrors.donorAddress}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm sm:text-base">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`w-full min-h-[100px] text-sm sm:text-base ${formErrors.description ? 'border-red-500' : ''}`}
            />
            {formErrors.description && (
              <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleReviewAndSign}
            style={{
              background: isSubmitting 
                ? 'linear-gradient(to right, #93c5fd, #c4b5fd)' 
                : 'linear-gradient(to right, #2563eb, #9333ea)'
            }}
            className="group relative w-full sm:w-auto min-h-[48px] px-8 font-bold text-white rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
            disabled={isSubmitting}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #7e22ce)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #9333ea)';
              }
            }}
          >
            <div className="relative z-10 flex items-center justify-center space-x-2">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>📜 Review & Sign Agreement</span>
                </>
              )}
            </div>
            
            {/* Glow effect */}
            {!isSubmitting && (
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"
                style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
              ></div>
            )}
          </button>
        </div>
      </form>

      {/* Waqf Deed Modal */}
      <WaqfDeedModal
        isOpen={showWaqfDeed}
        onClose={() => {
          setShowWaqfDeed(false);
          setIsSubmitting(false);
        }}
        onSign={handleSubmit}
        waqfData={{
          name: formData.name,
          waqfAsset: formData.waqfAsset,
          waqfType: formData.waqfType,
          donorName: formData.donorName,
          donorEmail: formData.donorEmail,
          donorPhone: formData.donorPhone,
          donorAddress: formData.donorAddress,
          description: formData.description,
          selectedCauses: formData.selectedCauseIds.map(id => {
            const cause = availableCauses.find(c => c.id === id);
            return cause?.name || id;
          }),
          causeAllocation: formData.selectedCauseIds.reduce((acc, id) => {
            const cause = availableCauses.find(c => c.id === id);
            if (formData.isHybrid) {
              // For hybrid, show the sum of all allocation types
              const allocation = formData.hybridAllocations[id];
              const total = allocation ? 
                (allocation.permanent || 0) + 
                (allocation.temporary_consumable || 0) + 
                (allocation.temporary_revolving || 0) : 0;
              return { ...acc, [cause?.name || id]: Math.round(total) };
            } else {
              // For non-hybrid, distribute equally
              return { ...acc, [cause?.name || id]: Math.round(100 / formData.selectedCauseIds.length) };
            }
          }, {}),
          isHybrid: formData.isHybrid,
          hybridAllocations: formData.isHybrid ? Object.entries(formData.hybridAllocations)
            .filter(([causeId]) => formData.selectedCauseIds.includes(causeId))
            .reduce((acc, [causeId, allocation]) => {
              const cause = availableCauses.find(c => c.id === causeId);
              return { ...acc, [cause?.name || causeId]: allocation };
            }, {}) : undefined
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
