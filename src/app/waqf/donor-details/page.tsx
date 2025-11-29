'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import type { Portfolio } from '@/types/portfolio';

interface DonorDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  idNumber?: string; // Optional national ID/passport
}

export default function DonorDetailsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [donorDetails, setDonorDetails] = useState<DonorDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    idNumber: '',
  });

  // Load portfolio from session storage
  useEffect(() => {
    try {
      const savedPortfolio = sessionStorage.getItem('portfolio');
      if (savedPortfolio) {
        const parsed = JSON.parse(savedPortfolio) as Portfolio;
        setPortfolio(parsed);
        
        // Pre-fill if donor details already exist
        if ((parsed as any).donorDetails) {
          setDonorDetails((parsed as any).donorDetails);
        }
        
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

  const handleInputChange = (field: keyof DonorDetails, value: string) => {
    setDonorDetails(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      donorDetails.fullName.trim() !== '' &&
      donorDetails.email.trim() !== '' &&
      donorDetails.phone.trim() !== '' &&
      donorDetails.address.trim() !== '' &&
      donorDetails.city.trim() !== '' &&
      donorDetails.state.trim() !== '' &&
      donorDetails.country.trim() !== '' &&
      donorDetails.postalCode.trim() !== ''
    );
  };

  const handleContinue = async () => {
    if (!isFormValid() || !portfolio) return;

    setIsSaving(true);

    try {
      // Save donor details to portfolio
      const updatedPortfolio = {
        ...portfolio,
        donorDetails,
        updatedAt: new Date().toISOString(),
      };

      sessionStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));

      // Navigate to sign deed
      router.push('/waqf/sign-deed');
    } catch (error) {
      console.error('Failed to save donor details:', error);
      alert('Failed to save details. Please try again.');
      setIsSaving(false);
    }
  };

  if (!portfolio || !user) {
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
              <p className="text-gray-600">Loading...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[900px] mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl shadow-lg">
                👤
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                  Donor Information
                </h1>
                <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">4</span>
                  Enter your details for the waqf deed
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/waqf/preview-impact')}
              variant="outline"
              className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
            >
              ← Back
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mx-auto px-6 lg:px-8 py-8 lg:py-10 space-y-6">
        {/* Information Notice */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border-2 border-blue-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
              📋
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Why We Need This Information</h3>
              <p className="text-sm text-gray-700 mb-3">
                Your details are required for the official waqf deed document, which is a legal Islamic endowment certificate.
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Legal record of the endowment (waqif identification)</li>
                <li>• Communication about your waqf impact and reports</li>
                <li>• Compliance with charitable regulations</li>
                <li>• Tax receipt generation (where applicable)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Personal Information</h2>
            <p className="text-sm text-gray-600">All fields marked with * are required</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                value={donorDetails.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full legal name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900"
                required
              />
              <p className="text-xs text-gray-500 mt-1">As it appears on your official documents</p>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={donorDetails.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={donorDetails.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                value={donorDetails.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="House number and street name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900"
                required
              />
            </div>

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  value={donorDetails.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Lagos"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                  State/Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  value={donorDetails.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Lagos State"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  value={donorDetails.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="100001"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="country"
                value={donorDetails.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Nigeria"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900"
                required
              />
            </div>

            {/* ID Number (Optional) */}
            <div>
              <label htmlFor="idNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                National ID / Passport Number (Optional)
              </label>
              <input
                type="text"
                id="idNumber"
                value={donorDetails.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                placeholder="For additional verification if needed"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">This may be required for tax receipt purposes in some jurisdictions</p>
            </div>

            {/* Privacy Notice */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Your Privacy is Protected</p>
                  <p className="text-xs text-gray-600">
                    Your personal information is encrypted and stored securely. We will never share your details 
                    with third parties without your explicit consent. This information is used solely for waqf 
                    administration and communication.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex items-center justify-between">
            <Button
              onClick={() => router.push('/waqf/preview-impact')}
              variant="outline"
              className="border-2 border-gray-300 hover:border-gray-400"
            >
              ← Back to Preview
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!isFormValid() || isSaving}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold shadow-lg disabled:shadow-none transition-all"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue to Deed Signing
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
