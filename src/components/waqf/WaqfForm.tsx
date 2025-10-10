'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CausesModal } from './causesModal';
import type { WaqfProfile, Cause } from '@/types/waqfs';

interface BasicCause {
  id: string;
  name: string;
}

const convertBasicCauseToCause = (basicCause: BasicCause): Cause => ({
  id: basicCause.id,
  name: basicCause.name,
  description: '',
  icon: '❤️',
  category: 'general',
  isActive: true,
  sortOrder: 0,
  status: 'approved',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  followers: 0,
  fundsRaised: 0
});

interface WaqfFormData {
  name: string;
  donorName: string;
  donorEmail: string;
  description: string;
  waqfAsset: number;
  selectedCauseIds: string[];
}

interface WaqfFormProps {
  initialData?: WaqfProfile;
  availableCauses: BasicCause[];
  isLoadingCauses?: boolean;
  causesError: Error | null;
  onSubmit: (data: Omit<WaqfProfile, 'id'>) => void;
}

export function WaqfForm({ 
  initialData, 
  availableCauses,
  isLoadingCauses = false,
  causesError,
  onSubmit 
}: WaqfFormProps) {
  const [formData, setFormData] = useState<WaqfFormData>({
    name: initialData?.name || '',
    donorName: initialData?.donor.name || '',
    donorEmail: initialData?.donor.email || '',
    description: initialData?.description || '',
    waqfAsset: initialData?.waqfAsset || 0,
    selectedCauseIds: initialData?.selectedCauses || []
  });
  
  const [showCausesModal, setShowCausesModal] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    donorName?: string;
    donorEmail?: string;
    description?: string;
    waqfAsset?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    if (!formData.name.trim()) errors.name = 'Waqf name is required';
    if (!formData.donorName.trim()) errors.donorName = 'Donor name is required';
    if (!formData.donorEmail.trim()) {
      errors.donorEmail = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.donorEmail)) {
      errors.donorEmail = 'Please enter a valid email';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }
    if (formData.waqfAsset <= 0) {
      errors.waqfAsset = 'Waqf asset must be greater than 0';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    const waqfProfile: Omit<WaqfProfile, 'id'> = {
      name: formData.name,
      description: formData.description,
      waqfAsset: formData.waqfAsset,
      donor: {
        name: formData.donorName,
        email: formData.donorEmail,
        phone: '',
        address: ''
      },
      selectedCauses: formData.selectedCauseIds,
      causeAllocation: {},
      waqfAssets: [],
      supportedCauses: availableCauses
      .filter(c => formData.selectedCauseIds.includes(c.id))
      .map(convertBasicCauseToCause),
      financial: {
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
      createdBy: '',
      createdAt: new Date().toISOString()
    };
    
    onSubmit(waqfProfile);
    setIsSubmitting(false);
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

      {showCausesModal && (
        <CausesModal
          isOpen={showCausesModal}
          causes={availableCauses.map(convertBasicCauseToCause)}
          isLoading={isLoadingCauses}
          error={causesError}
          selected={formData.selectedCauseIds}
          onClose={() => setShowCausesModal(false)}
          onCauseSelect={(ids) => setFormData({...formData, selectedCauseIds: ids})}
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
              min="1"
              step="0.01"
              value={formData.waqfAsset}
              onChange={(e) => setFormData({...formData, waqfAsset: parseFloat(e.target.value) || 0})}
              className={`w-full text-sm sm:text-base ${formErrors.waqfAsset ? 'border-red-500' : ''}`}
              placeholder="Enter the principal endowment amount"
            />
            {formErrors.waqfAsset && (
              <p className="text-red-500 text-xs mt-1">{formErrors.waqfAsset}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              This principal amount will be preserved and invested. Only the investment returns will be distributed to your selected causes.
            </p>
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
            type="submit" 
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Submit Waqf</span>
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
    </div>
  );
}