# Multi-Gateway Payment Integration Guide

## Overview

The Waqf Protocol supports multiple payment gateway providers, allowing donors to choose their preferred payment method and ensuring high availability through automatic fallback mechanisms.

## Supported Payment Gateways

### Current Support
1. **Stripe** - Global coverage, cards, bank transfers
2. **PayPal** - Global, widely trusted
3. **Flutterwave** - Africa-focused, mobile money
4. **Paystack** - Africa-focused, excellent for Nigerian market
5. **Razorpay** - India-focused, UPI, cards
6. **Square** - US-focused, POS integration

### Regional Recommendations
- **Nigeria**: Paystack → Flutterwave → Stripe
- **Kenya**: Flutterwave → Paystack → Stripe  
- **Ghana**: Paystack → Flutterwave → Stripe
- **South Africa**: Paystack → Stripe → PayPal
- **India**: Razorpay → Stripe → PayPal
- **Middle East (SA/AE)**: Stripe → PayPal
- **USA**: Stripe → PayPal → Square
- **Europe/UK**: Stripe → PayPal
- **Default**: Stripe → PayPal → Flutterwave

## Architecture

### Key Components

1. **IPaymentGateway** - Interface all gateways must implement
2. **PaymentGatewayManager** - Routes payments to appropriate gateways
3. **Gateway Implementations** - Specific provider integrations
4. **Configuration System** - Manages API keys and settings

### Features

✅ **Automatic Gateway Selection** - Based on currency and geography  
✅ **Fallback Mechanism** - If primary gateway fails, automatically tries alternatives  
✅ **Fee Calculation** - Transparent cost breakdown per gateway  
✅ **Currency Support** - USD, EUR, GBP, NGN, KES, GHS, ZAR, INR, SAR, AED  
✅ **Payment Methods** - Cards, bank transfers, mobile money, wallets  
✅ **Verification & Refunds** - Full transaction lifecycle support  

## Setup Instructions

### 0. Crypto Polyfill (Important!)

The project includes a crypto polyfill (`src/lib/crypto-polyfill.ts`) that ensures cryptographic operations work in both browser and Node.js environments. This is essential for:

- Generating UUIDs in server-side contexts
- Payment transaction IDs
- SubtleCrypto operations (hashing, signing, etc.)

**Usage:**
```typescript
import { randomUUID, sha256, sha256Hex } from '@/lib/crypto-polyfill';

// Generate a UUID (works in browser and Node.js)
const id = randomUUID();

// Hash data using SHA-256
const hash = await sha256('sensitive data');
const hexHash = await sha256Hex('sensitive data');
```

The polyfill automatically detects your environment:
- **Browser**: Uses `window.crypto` (Web Crypto API)
- **Node.js 15-18**: Uses `crypto.webcrypto`
- **Node.js 19+**: Uses native `crypto` module
- **Older Node.js**: Provides fallback implementations

### 1. Install Dependencies

```bash
# For Stripe
npm install @stripe/stripe-js stripe

# For PayPal
npm install @paypal/checkout-server-sdk

# For Flutterwave
npm install flutterwave-node-v3

# For Paystack
npm install paystack

# For Razorpay
npm install razorpay
```

### 2. Environment Variables

Create a `.env.local` file:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Flutterwave
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-...
FLUTTERWAVE_SECRET_KEY=FLWSECK-...

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Square
NEXT_PUBLIC_SQUARE_APPLICATION_ID=...
SQUARE_ACCESS_TOKEN=...
```

### 3. Initialize Payment Manager

```typescript
// lib/payment/init.ts
import { paymentManager } from './gateway-manager';
import { StripeGateway } from './gateways/stripe-gateway';
import { PaystackGateway } from './gateways/paystack-gateway';
// ... import other gateways

export function initializePaymentGateways() {
  // Register Stripe
  const stripeGateway = new StripeGateway(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    process.env.STRIPE_SECRET_KEY
  );
  
  paymentManager.registerGateway(stripeGateway, {
    provider: 'stripe',
    enabled: true,
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    secretKey: process.env.STRIPE_SECRET_KEY,
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'INR', 'SAR', 'AED'],
    supportedMethods: ['card', 'bank_transfer'],
    fees: { percentage: 2.9, fixed: 0.30 }
  });

  // Register Paystack
  const paystackGateway = new PaystackGateway(
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    process.env.PAYSTACK_SECRET_KEY
  );
  
  paymentManager.registerGateway(paystackGateway, {
    provider: 'paystack',
    enabled: true,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'USD'],
    supportedMethods: ['card', 'bank_transfer', 'mobile_money'],
    fees: { percentage: 1.5, fixed: 100 } // 1.5% + NGN 100
  });

  // Set fallback order
  paymentManager.setFallbackOrder(['stripe', 'paystack', 'flutterwave']);
}
```

### 4. Usage in Components

```typescript
// components/DonationModal.tsx
import { paymentManager } from '@/lib/payment/gateway-manager';

export function DonationModal({ waqfId, amount, currency }) {
  const [selectedGateway, setSelectedGateway] = useState<PaymentProvider>();
  const [loading, setLoading] = useState(false);

  // Get available gateways for the currency
  const availableGateways = paymentManager.getGatewaysForCurrency(currency);
  
  // Get recommended gateway
  const recommendedGateway = paymentManager.getRecommendedGateway(
    currency, 
    userCountry
  );

  const handlePayment = async () => {
    setLoading(true);
    try {
      const result = await paymentManager.processPayment(
        {
          id: crypto.randomUUID(),
          amount,
          currency,
          description: `Donation to Waqf ${waqfId}`,
          customerEmail: user.email,
          metadata: { waqfId, userId: user.id }
        },
        selectedGateway || recommendedGateway,
        userCountry
      );

      if (result.success) {
        // Record donation in database
        await recordDonation({
          waqfId,
          amount: result.amount,
          currency: result.currency,
          transactionId: result.transactionId,
          provider: result.provider,
          status: result.status
        });
        
        alert('✅ Donation successful! Thank you!');
      } else {
        alert(`❌ Payment failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Select Payment Method</h2>
      
      {/* Gateway Selection */}
      <div className="gateway-selector">
        {availableGateways.map(gateway => {
          const config = paymentManager.getConfig(gateway);
          const fees = paymentManager.calculateFees(amount, gateway);
          const total = amount + fees;
          
          return (
            <button
              key={gateway}
              onClick={() => setSelectedGateway(gateway)}
              className={selectedGateway === gateway ? 'selected' : ''}
            >
              <span>{gateway}</span>
              {gateway === recommendedGateway && <span>⭐ Recommended</span>}
              <span className="fees">
                Fee: {currency} {fees.toFixed(2)} | 
                Total: {currency} {total.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>

      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : `Donate ${currency} ${amount}`}
      </button>
    </div>
  );
}
```

## API Routes (Backend)

### Stripe Example

```typescript
// app/api/payment/stripe/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, description, customerEmail, metadata } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      description,
      receipt_email: customerEmail,
      metadata,
      automatic_payment_methods: { enabled: true }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
```

## Testing

### Test Cards

**Stripe:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

**Paystack:**
- Success: `5078 5078 5078 5078 12`
- PIN: `1234` / OTP: `123456`

## Best Practices

1. **Always verify payments on the backend** - Never trust client-side confirmation alone
2. **Handle webhooks** - Set up webhook endpoints for payment status updates
3. **Log all transactions** - Keep audit trail for compliance
4. **Test in sandbox** - Use test keys before going live
5. **Handle failures gracefully** - Show user-friendly error messages
6. **Secure API keys** - Never expose secret keys in frontend code
7. **Calculate fees transparently** - Show users total cost including fees

## Security Considerations

- ✅ All payment processing happens server-side
- ✅ API keys stored in environment variables
- ✅ HTTPS required for production
- ✅ PCI compliance (handled by payment providers)
- ✅ Transaction verification before recording
- ✅ Webhook signature verification

## Troubleshooting

### Common Issues

1. **"Gateway not available"** - Check API keys are set correctly
2. **"Currency not supported"** - Use recommended gateway for that currency
3. **"Payment declined"** - Check card/account has sufficient funds
4. **Webhook not receiving** - Verify URL is publicly accessible

## Support

For payment integration support:
- Stripe: https://stripe.com/docs
- PayPal: https://developer.paypal.com
- Flutterwave: https://developer.flutterwave.com
- Paystack: https://paystack.com/docs
- Razorpay: https://razorpay.com/docs

---

**Last Updated**: October 2025  
**Version**: 1.0.0
