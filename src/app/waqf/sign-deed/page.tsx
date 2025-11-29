'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useFetchWaqfData } from '@/hooks/useWaqfData';
import { Button } from '@/components/ui/button';
import { calculatePortfolioStats } from '@/lib/portfolio-utils';
import { getNextDeedReference, calculateManagementFees } from '@/lib/deed-utils';
import { savePortfolioAsWaqf } from '@/lib/portfolio-to-waqf';
import type { Portfolio } from '@/types/portfolio';

export default function SignDeedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createWaqf } = useFetchWaqfData();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [showSignatureConfirm, setShowSignatureConfirm] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load portfolio from session storage
  useEffect(() => {
    try {
      const savedPortfolio = sessionStorage.getItem('portfolio');
      if (savedPortfolio) {
        const parsed = JSON.parse(savedPortfolio) as Portfolio;
        setPortfolio(parsed);
        setLoadError(null);
      } else {
        setLoadError('No portfolio found');
        setTimeout(() => router.push('/waqf/build-portfolio'), 2000);
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setLoadError('Failed to load portfolio. Please try again.');
      setTimeout(() => router.push('/waqf/build-portfolio'), 2000);
    }
  }, [router]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!portfolio) return null;
    return calculatePortfolioStats(portfolio);
  }, [portfolio]);

  // Generate sequential deed reference number
  const [deedReference, setDeedReference] = useState<string>('');
  
  useEffect(() => {
    const generateReference = async () => {
      const ref = await getNextDeedReference();
      setDeedReference(ref);
    };
    generateReference();
  }, []);
  
  // Calculate management fees
  const managementFees = useMemo(() => {
    if (!stats) return null;
    return calculateManagementFees(
      stats.permanentAmount,
      stats.consumableAmount,
      stats.revolvingAmount
    );
  }, [stats]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSignDeed = async () => {
    if (!agreedToTerms || !portfolio || !user) return;

    setIsSigning(true);
    setSaveError(null);

    try {
      // Save signed deed metadata to portfolio
      const signedPortfolio = {
        ...portfolio,
        deedReference,
        signedAt: new Date().toISOString(),
        signedBy: user.key,
      };

      // Save to backend
      const result = await savePortfolioAsWaqf(
        signedPortfolio,
        user.key,
        createWaqf
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to save waqf');
      }

      // Save to sessionStorage for success page
      sessionStorage.setItem('portfolio', JSON.stringify(signedPortfolio));
      sessionStorage.setItem('waqfId', result.waqfId || '');

      // Show confirmation
      setShowSignatureConfirm(true);

      // Navigate to success page after brief delay
      setTimeout(() => {
        router.push('/waqf/success');
      }, 2000);
    } catch (error) {
      console.error('Failed to sign deed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign deed. Please try again.';
      setSaveError(errorMessage);
      alert(errorMessage);
      setIsSigning(false);
    }
  };

  if (!portfolio || !stats || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {loadError ? (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-gray-900 font-semibold text-lg mb-2">{loadError}</p>
              <p className="text-gray-600 text-sm">Redirecting you back...</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-600">Loading deed...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (showSignatureConfirm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-5xl shadow-2xl animate-bounce">
            ✓
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Deed Signed Successfully!</h2>
          <p className="text-gray-600 mb-2">Reference: {deedReference}</p>
          <p className="text-gray-600 text-sm">Waqf created successfully! Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-2xl shadow-lg">
                📜
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                  Sign Waqf Deed
                </h1>
                <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">5</span>
                  Review and sign your charitable endowment deed
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/waqf/donor-details')}
              variant="outline"
              className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
            >
              ← Back
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[900px] mx-auto px-6 lg:px-8 py-8 lg:py-10 space-y-6">
        {/* Important Notice */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border-2 border-amber-300 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
              ⚠️
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Important Legal Document</h3>
              <p className="text-sm text-gray-700 mb-3">
                This is a legally binding Islamic endowment (waqf) deed. Please read carefully before signing.
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Once signed, this deed establishes an irrevocable charitable endowment</li>
                <li>• Funds will be managed according to Islamic law (Shariah) principles</li>
                <li>• You will receive regular reports on the impact of your endowment</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Waqf Deed Document */}
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-300 overflow-hidden">
          {/* Document Header */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 border-b-4 border-amber-600">
            <div className="text-center">
              <div className="text-5xl mb-4">☪️</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">WAQF DEED</h2>
              <p className="text-sm text-gray-600 mb-3">Islamic Charitable Endowment Certificate</p>
              <div className="inline-block bg-white px-4 py-2 rounded-lg border-2 border-amber-500">
                <p className="text-xs text-gray-500">Reference Number</p>
                <p className="text-sm font-bold text-gray-900">{deedReference}</p>
              </div>
            </div>
          </div>

          {/* Document Body */}
          <div className="p-8 space-y-8">
            {/* Bismillah */}
            <div className="text-center">
              <p className="text-2xl font-serif text-gray-800 mb-2">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
              <p className="text-sm text-gray-600 italic">In the name of Allah, the Most Gracious, the Most Merciful</p>
            </div>

            {/* Preamble */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-200 pb-2">PREAMBLE</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                This Waqf Deed is executed on <strong>{currentDate}</strong> by the Waqif (Endower) whose particulars 
                are set out below, establishing a perpetual Islamic charitable endowment in accordance with the principles 
                of Shariah and Islamic jurisprudence.
              </p>
            </div>

            {/* Waqif Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-200 pb-2">WAQIF (ENDOWER) DETAILS</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                {(portfolio as any).donorDetails ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="font-semibold text-gray-600">Full Name:</span>
                      <span className="col-span-2 text-gray-900">{(portfolio as any).donorDetails.fullName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="font-semibold text-gray-600">Email:</span>
                      <span className="col-span-2 text-gray-900">{(portfolio as any).donorDetails.email}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="font-semibold text-gray-600">Phone:</span>
                      <span className="col-span-2 text-gray-900">{(portfolio as any).donorDetails.phone}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="font-semibold text-gray-600">Address:</span>
                      <span className="col-span-2 text-gray-900">
                        {(portfolio as any).donorDetails.address}, {(portfolio as any).donorDetails.city}, {(portfolio as any).donorDetails.state} {(portfolio as any).donorDetails.postalCode}, {(portfolio as any).donorDetails.country}
                      </span>
                    </div>
                    {(portfolio as any).donorDetails.idNumber && (
                      <div className="grid grid-cols-3 gap-4">
                        <span className="font-semibold text-gray-600">ID Number:</span>
                        <span className="col-span-2 text-gray-900">{(portfolio as any).donorDetails.idNumber}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="font-semibold text-gray-600">Name:</span>
                      <span className="col-span-2 text-gray-900">{user.key || 'Anonymous Donor'}</span>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-3 gap-4 border-t pt-2 mt-2">
                  <span className="font-semibold text-gray-600">Date of Execution:</span>
                  <span className="col-span-2 text-gray-900">{currentDate}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="font-semibold text-gray-600">Portfolio Value:</span>
                  <span className="col-span-2 text-gray-900 font-bold">${stats.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Waqf Property Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-200 pb-2">WAQF PROPERTY SPECIFICATION</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                The Waqif hereby dedicates the following property as waqf for charitable purposes:
              </p>
              
              <div className="space-y-3">
                {/* Waqf Type Breakdown */}
                {stats.permanentPercentage > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏛️</span>
                        <span className="font-bold text-gray-900">Permanent Waqf (Waqf Khairi)</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">${stats.permanentAmount.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Principal preserved in perpetuity. Only investment returns distributed to beneficiaries.
                    </p>
                  </div>
                )}

                {stats.consumablePercentage > 0 && (
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎁</span>
                        <span className="font-bold text-gray-900">Consumable Waqf</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">${stats.consumableAmount.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Entire amount to be spent on charitable purposes over time for immediate impact.
                    </p>
                  </div>
                )}

                {stats.revolvingPercentage > 0 && (
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔄</span>
                        <span className="font-bold text-gray-900">Revolving Waqf (Waqf Musytarak)</span>
                      </div>
                      <span className="text-lg font-bold text-purple-600">${stats.revolvingAmount.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Funds lent as Qard Hassan (benevolent loans), recovered, and redistributed cyclically.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Management Fees */}
            {managementFees && managementFees.totalFees > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-200 pb-2">MANAGEMENT FEES</h3>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  The following management fees shall be deducted to cover administration, investment management, 
                  Shariah compliance monitoring, and distribution of benefits:
                </p>
                
                <div className="space-y-3">
                  {stats.permanentPercentage > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm mb-1">Permanent Waqf Management Fee</p>
                          <p className="text-xs text-gray-600">
                            {managementFees.permanentFeePercentage}% annual fee for investment management and reporting
                          </p>
                        </div>
                        <span className="text-lg font-bold text-blue-600">${managementFees.permanentFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  )}

                  {stats.consumablePercentage > 0 && (
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm mb-1">Consumable Waqf Processing Fee</p>
                          <p className="text-xs text-gray-600">
                            {managementFees.consumableFeePercentage}% one-time fee for administration and distribution
                          </p>
                        </div>
                        <span className="text-lg font-bold text-green-600">${managementFees.consumableFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  )}

                  {stats.revolvingPercentage > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm mb-1">Revolving Waqf Management Fee</p>
                          <p className="text-xs text-gray-600">
                            {managementFees.revolvingFeePercentage}% annual fee for loan management and recovery
                          </p>
                        </div>
                        <span className="text-lg font-bold text-purple-600">${managementFees.revolvingFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-300 mt-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">Total Management Fees:</p>
                      <span className="text-xl font-black text-gray-900">${managementFees.totalFees.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      These fees ensure professional management, Shariah compliance, transparent reporting, and effective distribution to beneficiaries.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Beneficiary Causes */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-200 pb-2">BENEFICIARY CAUSES (MAWQUF ALAIH)</h3>
              <p className="text-sm text-gray-700 mb-4">
                The proceeds of this waqf shall benefit the following charitable causes:
              </p>
              <div className="space-y-2">
                {portfolio.items.map((item, index) => (
                  <div key={item.cause.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.cause.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.cause.name}</p>
                        <p className="text-xs text-gray-600">{item.cause.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">${item.totalAmount.toLocaleString()}</p>
                      <div className="flex gap-2 text-xs mt-1">
                        {item.allocation.permanent > 0 && (
                          <span className="text-blue-600">🏛️ {Math.round(item.allocation.permanent)}%</span>
                        )}
                        {item.allocation.temporary_consumable > 0 && (
                          <span className="text-green-600">🎁 {Math.round(item.allocation.temporary_consumable)}%</span>
                        )}
                        {item.allocation.temporary_revolving > 0 && (
                          <span className="text-purple-600">🔄 {Math.round(item.allocation.temporary_revolving)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-200 pb-2">TERMS AND CONDITIONS</h3>
              <div className="text-sm text-gray-700 space-y-3">
                <div>
                  <p className="font-semibold mb-1">1. Irrevocability</p>
                  <p className="text-xs leading-relaxed">
                    This waqf is irrevocable (lazim) and shall remain in perpetuity. The Waqif relinquishes all ownership rights 
                    over the endowed property upon execution of this deed.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">2. Management and Administration</p>
                  <p className="text-xs leading-relaxed">
                    The waqf shall be administered by the Platform in accordance with Shariah principles and best practices 
                    in endowment management. Regular reports shall be provided to the Waqif.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">3. Distribution of Benefits</p>
                  <p className="text-xs leading-relaxed">
                    Benefits shall be distributed to the designated causes in accordance with the allocation specified herein. 
                    For permanent waqf, only income/returns shall be distributed while preserving the principal.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">4. Shariah Compliance</p>
                  <p className="text-xs leading-relaxed">
                    All investments and distributions shall be made in accordance with Islamic law (Shariah), avoiding interest 
                    (riba), gambling (maisir), and prohibited (haram) activities.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">5. Modification of Beneficiaries</p>
                  <p className="text-xs leading-relaxed">
                    If any designated cause becomes inoperative or its purpose is fulfilled, the administrator may redirect 
                    benefits to similar charitable purposes (istibdal) in consultation with Shariah advisors.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">6. Rewards and Recognition</p>
                  <p className="text-xs leading-relaxed">
                    The Waqif shall receive ongoing rewards (thawab) from Allah (SWT) for the perpetual benefits generated 
                    by this endowment, as mentioned in the Hadith: "When a person dies, their deeds come to an end except 
                    for three: ongoing charity (sadaqah jariyah), beneficial knowledge, or righteous offspring who pray for them."
                  </p>
                </div>
              </div>
            </div>

            {/* Digital Signature Section */}
            <div className="border-t-2 border-gray-300 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">EXECUTION OF DEED</h3>
              
              <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-200 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                    <span className="font-semibold">I hereby declare that:</span>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• I have read and understood the entire contents of this Waqf Deed</li>
                      <li>• I am executing this deed of my own free will without coercion</li>
                      <li>• I understand that this endowment is irrevocable and perpetual</li>
                      <li>• I authorize the Platform to manage this waqf in accordance with Shariah principles</li>
                      <li>• I seek the pleasure of Allah (SWT) through this charitable act</li>
                    </ul>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-300">
                    <p className="text-xs text-gray-500 mb-1">Digital Signature</p>
                    <p className="text-sm font-bold text-gray-900">
                      {(portfolio as any).donorDetails?.fullName || user.key || 'Anonymous Donor'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{currentDate}</p>
                  </div>
                </div>
                <Button
                  onClick={handleSignDeed}
                  disabled={!agreedToTerms || isSigning}
                  className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 shadow-xl disabled:shadow-none transition-all"
                >
                  {isSigning ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ✍️ Sign Deed
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="bg-gray-100 p-6 border-t-2 border-gray-300 text-center">
            <p className="text-xs text-gray-500 mb-2">
              This is a digitally generated Waqf Deed governed by Islamic law (Shariah)
            </p>
            <p className="text-xs text-gray-400">
              Reference: {deedReference} | Generated: {currentDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
