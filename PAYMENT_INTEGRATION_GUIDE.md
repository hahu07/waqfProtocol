# Payment Integration Guide

## Overview
The Waqf Protocol payment system is built with a flexible, multi-gateway architecture that supports multiple payment providers and automatically routes payments to the best available gateway.

---

## 🏗️ Architecture

### Payment Gateway Manager
Central system that:
- Manages multiple payment providers (Stripe, PayPal, Flutterwave, etc.)
- Automatically selects the best gateway based on currency and region
- Handles fallback when a payment fails
- Calculates processing fees
- Provides unified API for all providers

### Payment Flow
```
User → Payment Page → Gateway Manager → Selected Provider → Payment Processing → Success/Failure
```

---

## 📄 Payment Page (`/waqf/payment`)

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | ✅ | Payment amount |
| `currency` | string | ❌ | Currency code (default: USD) |
| `purpose` | string | ❌ | create_waqf \| add_funds \| donation |
| `waqfId` | string | ❌ | Waqf ID (for donations/add funds) |
| `waqfName` | string | ❌ | Waqf name (for display) |
| `donorName` | string | ❌ | Donor's name |
| `donorEmail` | string | ❌ | Donor's email |

### Example Usage

#### 1. Create Waqf Payment
```typescript
router.push(`/waqf/payment?amount=1000&purpose=create_waqf&currency=USD`);
```

#### 2. Add Funds to Existing Waqf
```typescript
router.push(`/waqf/payment?amount=500&purpose=add_funds&waqfId=${waqfId}&waqfName=${encodeURIComponent(waqfName)}`);
```

#### 3. Make a Donation
```typescript
router.push(`/waqf/payment?amount=100&purpose=donation&waqfId=${waqfId}&donorName=${encodeURIComponent(donorName)}&donorEmail=${email}`);
```

---

## 💳 Supported Payment Providers

### Currently Implemented
- ✅ **Stripe** - Cards, Bank Transfer, Wallets

### Ready to Add
- 🔄 **PayPal** - Digital wallets
- 🔄 **Flutterwave** - African markets
- 🔄 **Paystack** - African markets
- 🔄 **Razorpay** - Indian market
- 🔄 **Square** - US market

---

## 🌍 Regional Recommendations

The system automatically recommends the best payment gateway based on the user's location:

| Region | Preferred Gateways |
|--------|-------------------|
| 🇳🇬 Nigeria | Paystack → Flutterwave → Stripe |
| 🇰🇪 Kenya | Flutterwave → Paystack → Stripe |
| 🇬🇭 Ghana | Paystack → Flutterwave → Stripe |
| 🇿🇦 South Africa | Paystack → Stripe → PayPal |
| 🇮🇳 India | Razorpay → Stripe → PayPal |
| 🇸🇦 Saudi Arabia | Stripe → PayPal |
| 🇦🇪 UAE | Stripe → PayPal |
| 🇺🇸 USA | Stripe → PayPal → Square |
| 🇬🇧 UK | Stripe → PayPal |
| 🌐 Other | Stripe → PayPal → Flutterwave |

---

## 💰 Fee Structure

### Stripe Fees
- **Percentage**: 2.9%
- **Fixed**: $0.30

### Fee Calculation Example
```
Amount: $100.00
Fee: ($100 × 2.9%) + $0.30 = $3.20
Total: $103.20
```

---

## 🔧 Integration Steps

### Step 0: Install Required Dependencies

Before using the payment system, install the necessary packages:

```bash
npm install @stripe/stripe-js
```

This package is required for Stripe payment gateway integration.

### Step 1: From Waqf Creation Form
```typescript
// In your waqf creation component
const handleCreateWaqf = async (waqfData) => {
  // Save waqf data to temp storage or state
  sessionStorage.setItem('pendingWaqf', JSON.stringify(waqfData));
  
  // Redirect to payment
  router.push(`/waqf/payment?amount=${waqfData.waqfAsset}&purpose=create_waqf&waqfName=${encodeURIComponent(waqfData.name)}`);
};
```

### Step 2: Handle Payment Success
```typescript
// After successful payment, the page redirects with success params
useEffect(() => {
  const created = searchParams.get('created');
  const paymentSuccess = searchParams.get('payment');
  
  if (created === 'true' && paymentSuccess === 'success') {
    // Complete waqf creation
    const pendingWaqf = JSON.parse(sessionStorage.getItem('pendingWaqf') || '{}');
    await finalizeWaqfCreation(pendingWaqf);
    sessionStorage.removeItem('pendingWaqf');
    
    // Show success message
    toast.success('Waqf created successfully!');
  }
}, [searchParams]);
```

### Step 3: Add Donation Button
```typescript
// In waqf detail page
<Button onClick={() => {
  router.push(`/waqf/payment?amount=100&purpose=donation&waqfId=${waqf.id}&waqfName=${encodeURIComponent(waqf.name)}`);
}}>
  Donate Now
</Button>
```

---

## 🔐 Security Features

### Payment Page Security
- ✅ PCI DSS Compliant
- ✅ SSL/TLS Encryption
- ✅ Tokenized card data
- ✅ No card details stored
- ✅ Secure payment gateway integration
- ✅ Transaction verification
- ✅ Fraud detection (provider-level)

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...  # Server-side only
```

---

## 📊 Payment Tracking

### After Successful Payment
The system automatically:
1. Records the donation in the database
2. Updates waqf financial metrics
3. Generates transaction ID
4. Sends confirmation (future: email)
5. Updates impact metrics
6. Logs activity

### Transaction Data Stored
```typescript
{
  waqfId: string;
  amount: number;
  currency: string;
  date: string;
  donorName: string;
  transactionId: string;
  status: 'completed' | 'pending' | 'failed';
  provider: 'stripe' | 'paypal' | ...;
}
```

---

## 🎨 UI Features

### Payment Page Design
- 🎨 Brand colors (blue & purple gradient)
- 📱 Fully responsive
- 🌐 Supports multiple providers
- 💳 Clean card input forms
- 📊 Clear payment summary
- ✨ Loading states
- ✅ Success animation
- ❌ Error handling
- 🔄 Real-time fee calculation

### User Experience
- Step-by-step payment flow
- Clear pricing breakdown
- Security badges
- Provider selection
- Instant feedback
- Smooth redirects

---

## 🧪 Testing

### Test Mode
Use Stripe test keys for development:
```env
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

### Test Card Numbers
| Card | Number | CVC | Expiry |
|------|--------|-----|--------|
| Success | 4242 4242 4242 4242 | Any 3 digits | Any future date |
| Decline | 4000 0000 0000 0002 | Any 3 digits | Any future date |
| Insufficient funds | 4000 0000 0000 9995 | Any 3 digits | Any future date |

---

## 🔄 Payment States

### State Flow
```
IDLE → PROCESSING → SUCCESS/FAILED → REDIRECT
```

### State Management
```typescript
const [isProcessing, setIsProcessing] = useState(false);
const [paymentSuccess, setPaymentSuccess] = useState(false);
const [paymentError, setPaymentError] = useState<string | null>(null);
```

---

## 📝 Future Enhancements

### Planned Features
- [ ] Email receipts
- [ ] PDF invoices
- [ ] Recurring donations
- [ ] Payment plans
- [ ] Multi-currency support
- [ ] Cryptocurrency payments
- [ ] Mobile money (M-Pesa, etc.)
- [ ] Bank transfer verification
- [ ] Payment history page
- [ ] Refund processing
- [ ] Dispute management

---

## 🚨 Error Handling

### Common Errors
```typescript
// Payment initialization failed
"Failed to initialize payment system"

// Payment processing failed
"Payment failed. Please try again."

// Gateway not available
"Payment gateway {provider} is not available"

// Insufficient funds
"Insufficient funds"

// Card declined
"Card was declined"
```

### Error Recovery
The system automatically:
1. Shows clear error message
2. Allows retry
3. Attempts fallback gateway (if configured)
4. Logs error for debugging

---

## 📞 Support

### For Developers
- Check console logs for detailed error messages
- Use browser DevTools Network tab to inspect API calls
- Enable Stripe Dashboard for transaction monitoring

### For Users
- Contact support if payment fails repeatedly
- Check bank/card for authorization
- Verify internet connection
- Try alternative payment method

---

## ✅ Checklist for Going Live

- [ ] Replace test keys with production keys
- [ ] Enable webhook endpoints
- [ ] Set up payment monitoring
- [ ] Configure email notifications
- [ ] Test all payment flows
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Review security settings
- [ ] Set up backup payment gateway
- [ ] Test refund process
- [ ] Document support procedures

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Payment Gateway Manager Code](./src/lib/payment/gateway-manager.ts)
- [Payment Types](./src/lib/payment/types.ts)
- [Stripe Gateway Implementation](./src/lib/payment/gateways/stripe-gateway.ts)

---

*Last Updated: 2025-10-11*
*Status: Payment system ready for integration*
