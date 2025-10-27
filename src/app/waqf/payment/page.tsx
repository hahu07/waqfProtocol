'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { recordDonation, updateWaqf, createWaqf, getWaqf } from '@/lib/waqf-utils';
import { paymentManager } from '@/lib/payment/gateway-manager';
import { StripeGateway } from '@/lib/payment/gateways/stripe-gateway';
import { PayPalGateway } from '@/lib/payment/gateways/paypal-gateway';
import { FlutterwaveGateway } from '@/lib/payment/gateways/flutterwave-gateway';
import { PaystackGateway } from '@/lib/payment/gateways/paystack-gateway';
import { RazorpayGateway } from '@/lib/payment/gateways/razorpay-gateway';
import type { PaymentProvider, PaymentCurrency, PaymentIntent } from '@/lib/payment/types';
import type { WaqfProfile, Cause } from '@/types/waqfs';
import { listActiveCauses } from '@/lib/cause-utils';
import { logger } from '@/lib/logger';
import { canAcceptContribution } from '@/lib/consumable-contribution-handler';

type PaymentPurpose = 'create_waqf' | 'add_funds' | 'donation';

interface PaymentDetails {
  amount: number;
  currency: PaymentCurrency;
  purpose: PaymentPurpose;
  waqfId?: string;
  waqfName?: string;
  donorName?: string;
  donorEmail?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('stripe');
  const [availableProviders, setAvailableProviders] = useState<PaymentProvider[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Parse payment details from URL params
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: 0,
    currency: 'USD',
    purpose: 'create_waqf',
    waqfId: undefined,
    waqfName: undefined,
    donorName: undefined,
    donorEmail: undefined
  });
  
  // Card payment state (for Stripe/card payments)
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  
  // Initialize payment gateways
  useEffect(() => {
    const initializeGateways = async () => {
      try {
        const gateways = [];
        
        // 1. Initialize Stripe
        const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || 'pk_test_demo';
        const stripeGateway = new StripeGateway(stripePublicKey);
        paymentManager.registerGateway(stripeGateway, {
          provider: 'stripe',
          enabled: true,
          publicKey: stripePublicKey,
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'INR', 'SAR', 'AED'],
          supportedMethods: ['card', 'bank_transfer', 'wallet'],
          fees: { percentage: 2.9, fixed: 0.30 }
        });
        await stripeGateway.initialize();
        gateways.push('stripe');
        
        // 2. Initialize PayPal
        const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'demo';
        const paypalGateway = new PayPalGateway(paypalClientId);
        paymentManager.registerGateway(paypalGateway, {
          provider: 'paypal',
          enabled: true,
          publicKey: paypalClientId,
          supportedCurrencies: ['USD', 'EUR', 'GBP'],
          supportedMethods: ['paypal', 'card'],
          fees: { percentage: 2.9, fixed: 0.30 }
        });
        await paypalGateway.initialize();
        gateways.push('paypal');
        
        // 3. Initialize Flutterwave
        const flutterwavePublicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || 'demo';
        const flutterwaveGateway = new FlutterwaveGateway(flutterwavePublicKey);
        paymentManager.registerGateway(flutterwaveGateway, {
          provider: 'flutterwave',
          enabled: true,
          publicKey: flutterwavePublicKey,
          supportedCurrencies: ['NGN', 'KES', 'GHS', 'ZAR', 'USD'],
          supportedMethods: ['card', 'mobile_money', 'bank_transfer', 'ussd'],
          fees: { percentage: 1.4, fixed: 0 }
        });
        await flutterwaveGateway.initialize();
        gateways.push('flutterwave');
        
        // 4. Initialize Paystack
        const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'demo';
        const paystackGateway = new PaystackGateway(paystackPublicKey);
        paymentManager.registerGateway(paystackGateway, {
          provider: 'paystack',
          enabled: true,
          publicKey: paystackPublicKey,
          supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'USD'],
          supportedMethods: ['card', 'bank_transfer', 'mobile_money', 'ussd'],
          fees: { percentage: 1.5, fixed: 0 }
        });
        await paystackGateway.initialize();
        gateways.push('paystack');
        
        // 5. Initialize Razorpay
        const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'demo';
        const razorpayGateway = new RazorpayGateway(razorpayKeyId);
        paymentManager.registerGateway(razorpayGateway, {
          provider: 'razorpay',
          enabled: true,
          publicKey: razorpayKeyId,
          supportedCurrencies: ['INR'],
          supportedMethods: ['card', 'upi', 'netbanking', 'wallet'],
          fees: { percentage: 2.0, fixed: 0 }
        });
        await razorpayGateway.initialize();
        gateways.push('razorpay');
        
        // Get available gateways
        const available = paymentManager.getAvailableGateways();
        setAvailableProviders(available);
        
        // Set recommended gateway based on currency and region
        const recommended = paymentManager.getRecommendedGateway(
          paymentDetails.currency,
          'US' // In production, detect user's country
        );
        if (recommended) {
          setSelectedProvider(recommended);
        }
        
        setIsInitialized(true);
        logger.debug('✅ Payment gateways initialized:', { data: gateways });
      } catch (error) {
        logger.error('❌ Failed to initialize payment gateways', error instanceof Error ? error : { error });
        setPaymentError('Failed to initialize payment system');
      }
    };
    
    initializeGateways();
  }, [paymentDetails.currency]);
  
  // Parse URL parameters
  useEffect(() => {
    const amount = parseFloat(searchParams.get('amount') || '0');
    const currency = (searchParams.get('currency') || 'USD') as PaymentCurrency;
    const purpose = (searchParams.get('purpose') || 'create_waqf') as PaymentPurpose;
    const waqfId = searchParams.get('waqfId') || undefined;
    const waqfName = searchParams.get('waqfName') || undefined;
    const donorName = searchParams.get('donorName') || user?.key || undefined;
    const donorEmail = searchParams.get('donorEmail') || undefined;
    
    setPaymentDetails({
      amount,
      currency,
      purpose,
      waqfId,
      waqfName,
      donorName,
      donorEmail
    });
  }, [searchParams, user]);
  
  const handlePayment = async () => {
    if (!isInitialized) {
      setPaymentError('Payment system not initialized');
      return;
    }
    
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Create payment intent
      const intent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        description: `${getPurposeText()} - ${paymentDetails.waqfName || 'Waqf Protocol'}`,
        customerEmail: paymentDetails.donorEmail,
        metadata: {
          purpose: paymentDetails.purpose,
          waqfId: paymentDetails.waqfId,
          waqfName: paymentDetails.waqfName,
          donorName: paymentDetails.donorName
        }
      };
      
      // Process payment through gateway manager
      const result = await paymentManager.processPayment(intent, selectedProvider);
      
      if (!result.success) {
        throw new Error(result.error || 'Payment failed');
      }
      
      // Handle different payment purposes
      if (paymentDetails.purpose === 'create_waqf') {
        // Create new waqf after successful payment
        try {
          // Retrieve stored form data from session storage
          const storedFormData = sessionStorage.getItem('waqfFormData');
          
          if (!storedFormData) {
            throw new Error('Waqf form data not found. Please go back and fill the form again.');
          }
          
          const formData = JSON.parse(storedFormData);
          
          // Fetch active causes to populate supportedCauses
          const activeCauses = await listActiveCauses();
          const supportedCauses = formData.selectedCauseIds
            .map((id: string) => activeCauses.find((c: Cause) => c.id === id))
            .filter((c: Cause | undefined): c is Cause => c !== undefined);
          
          // Create the waqf profile
          const waqfProfile: Omit<WaqfProfile, 'id'> = {
            name: formData.name,
            description: formData.description,
            waqfAsset: formData.waqfAsset,
            waqfType: formData.waqfType || 'permanent',
            isHybrid: formData.isHybrid || false,
            hybridAllocations: formData.isHybrid && formData.hybridAllocations ? 
              Object.entries(formData.hybridAllocations).map(([causeId, allocation]) => {
                const alloc = allocation as {permanent: number; temporary_consumable: number; temporary_revolving: number};
                return {
                  causeId,
                  allocations: {
                    permanent: alloc.permanent || 0,
                    temporary_consumable: alloc.temporary_consumable || 0,
                    temporary_revolving: alloc.temporary_revolving || 0
                  }
                };
              }) : undefined,
            consumableDetails: formData.consumableDetails || undefined,
            revolvingDetails: formData.revolvingDetails || undefined,
            investmentStrategy: formData.investmentStrategy || undefined,
            donor: {
              name: formData.donorName,
              email: formData.donorEmail,
              phone: formData.donorPhone || '',
              address: formData.donorAddress || ''
            },
            selectedCauses: formData.selectedCauseIds,
            causeAllocation: {},
            waqfAssets: [],
            supportedCauses: supportedCauses,
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
            createdBy: user?.key || formData.userId || 'anonymous',
            createdAt: new Date().toISOString()
          };
          
          // Create the waqf in the database
          const waqfId = await createWaqf(waqfProfile, user?.key, user?.key);
          logger.debug('✅ Waqf created successfully with ID:', { data: waqfId });
          
          // Record the initial donation/payment
          await recordDonation({
            waqfId: waqfId,
            amount: paymentDetails.amount,
            currency: paymentDetails.currency,
            date: new Date().toISOString(),
            donorName: formData.donorName,
            transactionId: result.transactionId,
            status: 'completed'
          }, user?.key, user?.key);
          
          // Clear stored form data
          sessionStorage.removeItem('waqfFormData');
          
        } catch (error) {
          logger.error('❌ Error creating waqf', error instanceof Error ? error : { error });
          throw new Error(`Failed to create waqf: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else if (paymentDetails.waqfId) {
        // Record donation for existing waqf (add_funds or donation)
        await recordDonation({
          waqfId: paymentDetails.waqfId,
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          date: new Date().toISOString(),
          donorName: paymentDetails.donorName || 'Anonymous',
          transactionId: result.transactionId,
          status: 'completed'
        }, user?.key, user?.key);
        
        // Update waqf financial data if adding funds
        if (paymentDetails.purpose === 'add_funds') {
          try {
            // Fetch current waqf
            const currentWaqf = await getWaqf(paymentDetails.waqfId);
            
            if (currentWaqf) {
              // Update financial data
            // Validate contribution and get updated details
              const contributionResult = canAcceptContribution(currentWaqf, paymentDetails.amount);
              
              if (!contributionResult.accepted) {
                throw new Error(`Cannot accept contribution: ${contributionResult.reason}`);
              }
              
              // Prepare updated data
              const updateData: Partial<WaqfProfile> = {
                financial: contributionResult.updatedFinancial || {
                  ...currentWaqf.financial,
                  totalDonations: (currentWaqf.financial?.totalDonations || 0) + paymentDetails.amount,
                  currentBalance: (currentWaqf.financial?.currentBalance || 0) + paymentDetails.amount
                }
              };
              
              // If consumable waqf and details were updated (e.g., extended end date)
              if (contributionResult.updatedDetails) {
                updateData.consumableDetails = contributionResult.updatedDetails;
                logger.info('📅 Consumable waqf details updated', { 
                  waqfId: paymentDetails.waqfId,
                  oldEndDate: currentWaqf.consumableDetails?.endDate,
                  newEndDate: contributionResult.updatedDetails.endDate
                });
              }
              
              await updateWaqf(
                paymentDetails.waqfId, 
                updateData,
                user?.key,
                user?.key
              );
              
              logger.debug('💰 Funds added to waqf', { 
                waqfId: paymentDetails.waqfId, 
                amount: paymentDetails.amount,
                contributionAccepted: true,
                detailsUpdated: !!contributionResult.updatedDetails
              });
            }
          } catch (error) {
            logger.error('❌ Error updating waqf financials', error instanceof Error ? error : { error });
            // Don't throw - payment was successful, just log the error
          }
        }
      }
      
      setPaymentSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        if (paymentDetails.purpose === 'create_waqf') {
          router.push('/waqf?created=true&payment=success');
        } else if (paymentDetails.waqfId) {
          router.push(`/waqf?payment=success&transaction=${result.transactionId}`);
        } else {
          router.push('/waqf?payment=success');
        }
      }, 2000);
      
    } catch (error: unknown) {
      logger.error('Payment error', error instanceof Error ? error : { error });
      setPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getPurposeText = () => {
    switch (paymentDetails.purpose) {
      case 'create_waqf':
        return 'Create Waqf';
      case 'add_funds':
        return 'Add Funds';
      case 'donation':
        return 'Donation';
      default:
        return 'Payment';
    }
  };
  
  const getProviderInfo = (provider: PaymentProvider) => {
    const info = {
      stripe: { name: 'Stripe', icon: '💳', color: 'blue' },
      paypal: { name: 'PayPal', icon: '🅿️', color: 'indigo' },
      flutterwave: { name: 'Flutterwave', icon: '🦋', color: 'orange' },
      paystack: { name: 'Paystack', icon: '💠', color: 'cyan' },
      razorpay: { name: 'Razorpay', icon: '⚡', color: 'purple' },
      square: { name: 'Square', icon: '⬛', color: 'gray' }
    };
    return info[provider] || { name: provider, icon: '💳', color: 'blue' };
  };
  
  const calculateFees = () => {
    const fees = paymentManager.calculateFees(paymentDetails.amount, selectedProvider);
    return fees;
  };
  
  const totalAmount = paymentDetails.amount + calculateFees();
  
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/40 to-indigo-50/30 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md text-center border border-white/20">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-5xl">✅</span>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-green-400 rounded-full blur-2xl opacity-30 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-2">
            {paymentDetails.currency} ${paymentDetails.amount.toLocaleString()} has been processed
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Redirecting you back...
          </p>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/40 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">💳</span>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Complete Payment
              </h1>
              <p className="text-gray-600 mt-1">Secure payment processing</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Payment Provider Selection */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Select Payment Provider
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {availableProviders.map((provider) => {
                  const info = getProviderInfo(provider);
                  return (
                    <button
                      key={provider}
                      onClick={() => setSelectedProvider(provider)}
                      className={`group relative p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                        selectedProvider === provider
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-[1.02]'
                          : 'border-gray-200 hover:border-blue-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <span className="text-3xl transition-transform duration-200 group-hover:scale-110">{info.icon}</span>
                        <span className="text-sm font-semibold text-gray-900">{info.name}</span>
                        {selectedProvider === provider && (
                          <div className="absolute top-2 right-2">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {!isInitialized && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-blue-800 font-medium">Initializing secure payment system...</p>
                </div>
              )}
            </div>
            
            {/* Payment Details Form */}
            {selectedProvider === 'stripe' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Card Details
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                        maxLength={19}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <svg className="w-10 h-7" viewBox="0 0 48 32" fill="none">
                          <rect x="1" y="1" width="46" height="30" rx="3" fill="#667EEA" stroke="#5A67D8" strokeWidth="1.5"/>
                          <rect x="1" y="8" width="46" height="6" fill="#4C51BF"/>
                          <rect x="6" y="18" width="12" height="2" rx="1" fill="#E2E8F0"/>
                          <rect x="6" y="22" width="8" height="2" rx="1" fill="#E2E8F0"/>
                          <circle cx="38" cy="20" r="4" fill="#F6AD55" opacity="0.9"/>
                          <circle cx="42" cy="20" r="4" fill="#FC8181" opacity="0.9"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                          maxLength={4}
                        />
                        <button 
                          type="button" 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          title="CVV is the 3-digit code on the back of your card"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {paymentError && (
                  <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-800 font-medium">{paymentError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Payment Summary */}
          <div className="md:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Payment Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Purpose</span>
                  <span className="text-sm font-semibold text-gray-900">{getPurposeText()}</span>
                </div>
                
                {paymentDetails.waqfName && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Waqf</span>
                    <span className="text-sm font-semibold text-gray-900 truncate ml-2">{paymentDetails.waqfName}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Provider</span>
                  <span className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <span>{getProviderInfo(selectedProvider).icon}</span>
                    {getProviderInfo(selectedProvider).name}
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold text-gray-900">
                      {paymentDetails.currency} ${paymentDetails.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-semibold text-gray-900">
                      ${calculateFees().toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !isInitialized || paymentDetails.amount === 0}
                className="w-full py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing Payment...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Pay ${totalAmount.toFixed(2)}
                  </span>
                )}
              </Button>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-green-700">Secure payment encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-blue-700">PCI DSS compliant</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-purple-700">Instant confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
