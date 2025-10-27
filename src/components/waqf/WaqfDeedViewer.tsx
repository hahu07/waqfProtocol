'use client';

import { useState } from 'react';
import type { WaqfProfile } from '@/types/waqfs';

interface WaqfDeedViewerProps {
  isOpen: boolean;
  onClose: () => void;
  waqf: WaqfProfile;
}

export function WaqfDeedViewer({ isOpen, onClose, waqf }: WaqfDeedViewerProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Get the deed content
      const deedContent = document.getElementById('deed-content');
      if (!deedContent) return;

      // Use browser's print functionality to save as PDF
      window.print();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #deed-content, #deed-content * {
            visibility: visible;
          }
          #deed-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white no-print">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-1">📜 Waqf Deed</h2>
                <p className="text-blue-100 text-sm">Signed Islamic Endowment Agreement</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div id="deed-content" className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
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
                I, <span className="font-bold text-gray-900">{waqf.donor.name}</span>, hereby declare and establish 
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
                  <div className="font-bold text-gray-900">{waqf.name}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Endowment Amount</div>
                  <div className="font-bold text-gray-900 text-xl">${waqf.waqfAsset.toLocaleString()}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:col-span-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Waqf Type</div>
                  <div className="font-semibold text-gray-900">{getWaqfTypeDescription(waqf.waqfType)}</div>
                </div>
              </div>
            </div>

            {/* Donor Information */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-lg border-b pb-2">👤 Waqif (Donor) Information</h4>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
                <div><span className="text-gray-600">Name:</span> <span className="font-semibold text-gray-900">{waqf.donor.name}</span></div>
                <div><span className="text-gray-600">Email:</span> <span className="font-semibold text-gray-900">{waqf.donor.email}</span></div>
                {waqf.donor.phone && <div><span className="text-gray-600">Phone:</span> <span className="font-semibold text-gray-900">{waqf.donor.phone}</span></div>}
                {waqf.donor.address && <div><span className="text-gray-600">Address:</span> <span className="font-semibold text-gray-900">{waqf.donor.address}</span></div>}
              </div>
            </div>

            {/* Beneficiaries */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-lg border-b pb-2">🎯 Beneficiaries & Allocation</h4>
              <div className="space-y-2">
                {waqf.isHybrid && waqf.hybridAllocations ? (
                  // Hybrid allocation - show detailed breakdown
                  waqf.hybridAllocations.map((allocation) => {
                    const cause = waqf.supportedCauses.find(c => c.id === allocation.causeId);
                    return (
                      <div key={allocation.causeId} className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-lg p-4 border border-gray-300">
                        <div className="font-semibold text-gray-900 mb-3">{cause?.name || allocation.causeId}</div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          {allocation.allocations.permanent && allocation.allocations.permanent > 0 && (
                            <div className="bg-green-100 rounded p-2">
                              <div className="text-xs text-green-700 font-medium">🏛️ Permanent</div>
                              <div className="text-green-900 font-bold">{allocation.allocations.permanent}%</div>
                            </div>
                          )}
                          {allocation.allocations.temporary_consumable && allocation.allocations.temporary_consumable > 0 && (
                            <div className="bg-blue-100 rounded p-2">
                              <div className="text-xs text-blue-700 font-medium">⚡ Consumable</div>
                              <div className="text-blue-900 font-bold">{allocation.allocations.temporary_consumable}%</div>
                            </div>
                          )}
                          {allocation.allocations.temporary_revolving && allocation.allocations.temporary_revolving > 0 && (
                            <div className="bg-purple-100 rounded p-2">
                              <div className="text-xs text-purple-700 font-medium">🔄 Revolving</div>
                              <div className="text-purple-900 font-bold">{allocation.allocations.temporary_revolving}%</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Non-hybrid allocation - show causes
                  waqf.supportedCauses.map((cause) => (
                    <div key={cause.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900">{cause.name}</div>
                        <div className="text-blue-600 font-bold">
                          {Math.round(100 / waqf.supportedCauses.length)}%
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Purpose */}
            {waqf.description && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 text-lg border-b pb-2">📝 Purpose & Description</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{waqf.description}</p>
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
            {waqf.deedDocument && (
              <div className="space-y-4 border-t-2 border-gray-300 pt-6">
                <h4 className="font-bold text-gray-900 text-lg">✍️ Digital Signature</h4>
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-green-900">Deed Signed & Agreed</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    This deed has been digitally signed and agreed to by the Waqif in accordance with all stated terms and conditions.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <div className="font-semibold text-gray-900">Date of Execution:</div>
                    <div>{formatDate(waqf.deedDocument.signedAt)}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Digital Signature:</div>
                    <div className="font-mono">{waqf.deedDocument.donorSignature}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Document Version:</div>
                    <div>{waqf.deedDocument.documentVersion}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Document ID:</div>
                    <div className="font-mono text-xs">{waqf.id}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3 no-print">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className={`flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                isGeneratingPDF
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105'
              }`}
            >
              {isGeneratingPDF ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                '📥 Download PDF'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
