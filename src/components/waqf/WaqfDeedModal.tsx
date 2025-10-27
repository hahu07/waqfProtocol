'use client';

import { useState } from 'react';

interface WaqfDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: () => void;
  waqfData: {
    name: string;
    waqfAsset: number;
    waqfType: string;
    donorName: string;
    donorEmail: string;
    donorPhone: string;
    donorAddress: string;
    description: string;
    selectedCauses: string[];
    causeAllocation: Record<string, number>;
    isHybrid?: boolean;
    hybridAllocations?: Record<string, {
      permanent: number;
      temporary_consumable: number;
      temporary_revolving: number;
    }>;
  };
  isSubmitting: boolean;
}

export function WaqfDeedModal({
  isOpen,
  onClose,
  onSign,
  waqfData,
  isSubmitting
}: WaqfDeedModalProps) {
  const [hasAgreed, setHasAgreed] = useState(false);
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (!isOpen) return null;

  const getWaqfTypeDescription = (type: string) => {
    switch(type) {
      case 'permanent':
        return 'Permanent Waqf - The principal amount shall be preserved in perpetuity, with only returns distributed to beneficiaries.';
      case 'temporary_consumable':
        return 'Temporary Consumable Waqf - Both principal and returns may be spent over the specified time period.';
      case 'temporary_revolving':
        return 'Temporary Revolving Waqf - The principal shall be returned to the donor after the specified period, with returns distributed during the term.';
      case 'hybrid':
        return 'Hybrid Waqf - A combination of different waqf models as specified in the allocation.';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-1">📜 Waqf Deed</h2>
              <p className="text-blue-100 text-sm">Islamic Endowment Agreement</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Bismillah */}
          <div className="text-center">
            <p className="text-2xl font-arabic mb-2">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
            <p className="text-sm text-gray-600 italic">In the Name of Allah, the Most Gracious, the Most Merciful</p>
          </div>

          {/* Document Title */}
          <div className="border-b-2 border-gray-300 pb-4">
            <h3 className="text-2xl font-bold text-center text-gray-900">WAQF DECLARATION & DEED</h3>
            <p className="text-center text-gray-600 mt-2">Perpetual Charitable Endowment</p>
          </div>

          {/* Declaration */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 mb-3 text-lg">📋 Declaration of Intent</h4>
            <p className="text-gray-700 leading-relaxed">
              I, <span className="font-bold text-gray-900">{waqfData.donorName}</span>, hereby declare and establish 
              this Waqf (Islamic endowment) in accordance with Islamic Shariah principles, for the sake of Allah (SWT), 
              seeking His pleasure and the betterment of humanity.
            </p>
          </div>

          {/* Waqf Details */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-lg border-b pb-2">📊 Endowment Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Waqf Name</div>
                <div className="font-bold text-gray-900">{waqfData.name}</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Endowment Amount</div>
                <div className="font-bold text-gray-900 text-xl">${waqfData.waqfAsset.toLocaleString()}</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:col-span-2">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Waqf Type</div>
                <div className="font-semibold text-gray-900">{getWaqfTypeDescription(waqfData.waqfType)}</div>
              </div>
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-lg border-b pb-2">👤 Waqif (Donor) Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
              <div><span className="text-gray-600">Name:</span> <span className="font-semibold text-gray-900">{waqfData.donorName}</span></div>
              <div><span className="text-gray-600">Email:</span> <span className="font-semibold text-gray-900">{waqfData.donorEmail}</span></div>
              <div><span className="text-gray-600">Phone:</span> <span className="font-semibold text-gray-900">{waqfData.donorPhone}</span></div>
              <div><span className="text-gray-600">Address:</span> <span className="font-semibold text-gray-900">{waqfData.donorAddress}</span></div>
            </div>
          </div>

          {/* Beneficiaries */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-lg border-b pb-2">🎯 Beneficiaries & Allocation</h4>
            <div className="space-y-2">
              {waqfData.isHybrid && waqfData.hybridAllocations ? (
                // Hybrid allocation - show detailed breakdown
                Object.entries(waqfData.hybridAllocations).map(([causeId, allocation]) => {
                  const causeName = waqfData.selectedCauses.find(c => c === causeId) || causeId;
                  return (
                    <div key={causeId} className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-lg p-4 border border-gray-300">
                      <div className="font-semibold text-gray-900 mb-3">{causeName}</div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-green-100 rounded p-2">
                          <div className="text-xs text-green-700 font-medium">🏛️ Permanent</div>
                          <div className="text-green-900 font-bold">{allocation.permanent}%</div>
                        </div>
                        <div className="bg-blue-100 rounded p-2">
                          <div className="text-xs text-blue-700 font-medium">⚡ Consumable</div>
                          <div className="text-blue-900 font-bold">{allocation.temporary_consumable}%</div>
                        </div>
                        <div className="bg-purple-100 rounded p-2">
                          <div className="text-xs text-purple-700 font-medium">🔄 Revolving</div>
                          <div className="text-purple-900 font-bold">{allocation.temporary_revolving}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Non-hybrid allocation - show simple percentages
                Object.entries(waqfData.causeAllocation).map(([causeId, percentage]) => (
                  <div key={causeId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">{causeId}</div>
                      <div className="text-blue-600 font-bold">{percentage}%</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Purpose */}
          {waqfData.description && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-lg border-b pb-2">📝 Purpose & Description</h4>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 leading-relaxed">{waqfData.description}</p>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="space-y-4 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 text-lg">⚖️ Terms & Conditions</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm leading-relaxed">
              <li>This Waqf is established in accordance with Islamic Shariah principles.</li>
              <li>The endowment is irrevocable and perpetual (or as specified by the waqf type).</li>
              <li>The Waqif relinquishes all ownership rights to the endowed assets.</li>
              <li>The designated causes/beneficiaries shall receive benefits as allocated.</li>
              <li>The platform administrators shall act as Mutawallis (trustees) for proper management.</li>
              <li>All proceeds shall be used exclusively for the stated charitable purposes.</li>
              <li>This deed is executed with the full consent and understanding of the Waqif.</li>
              <li>The Waqif confirms that the funds are from halal (permissible) sources.</li>
            </ol>
          </div>

          {/* Signature Section */}
          <div className="space-y-4 border-t-2 border-gray-300 pt-6">
            <h4 className="font-bold text-gray-900 text-lg">✍️ Digital Signature & Agreement</h4>
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 focus:ring-4 focus:ring-blue-100 rounded"
                  disabled={isSubmitting}
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">
                    I hereby agree and affirm:
                  </div>
                  <p className="text-sm text-gray-700">
                    I have read, understood, and agree to all terms and conditions stated in this Waqf Deed. 
                    I declare that I am establishing this endowment with full knowledge, free will, and sound mind, 
                    seeking the pleasure of Allah (SWT).
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <div className="font-semibold text-gray-900">Date of Execution:</div>
                <div>{currentDate}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Digital Signature:</div>
                <div className="font-mono">{waqfData.donorName}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={onSign}
            disabled={!hasAgreed || isSubmitting}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
              !hasAgreed || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              '✍️ Sign & Submit Waqf'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
