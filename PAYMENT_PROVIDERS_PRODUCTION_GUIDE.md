# Payment Providers Production Deployment Guide

This guide walks you through setting up each payment provider for production use.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Stripe Setup](#stripe-setup)
- [PayPal Setup](#paypal-setup)
- [Flutterwave Setup](#flutterwave-setup)
- [Paystack Setup](#paystack-setup)
- [Razorpay Setup](#razorpay-setup)
- [Testing](#testing)
- [Going Live](#going-live)

---

## Prerequisites

Before setting up any payment provider:

1. **Business Registration**: Have a registered business/organization
2. **Bank Account**: Active business bank account
3. **Business Documents**: Tax ID, business license, incorporation documents
4. **Website**: Live, secure website with SSL certificate
5. **Terms & Privacy**: Published terms of service and privacy policy

---

## Stripe Setup

### 1. Create Stripe Account
- Visit: https://dashboard.stripe.com/register
- Choose your country
- Enter business details
- Verify your email

### 2. Get API Keys
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

### 3. Configure Environment Variables
```env
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
```

### 4. Activate Your Account
1. Go to: https://dashboard.stripe.com/settings/account
2. Complete business verification
3. Add bank account for payouts
4. Set up tax information

### 5. Configure Webhooks (Production)
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy webhook signing secret to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### 6. Test Mode vs Live Mode
- **Test Mode**: Use test keys (`pk_test_`, `sk_test_`)
  - Test card: 4242 4242 4242 4242
- **Live Mode**: Use live keys (`pk_live_`, `sk_live_`)
  - Real transactions, real money

### Fees
- 2.9% + $0.30 per successful card charge
- 0.8% for ACH transfers

---

## PayPal Setup

### 1. Create PayPal Business Account
- Visit: https://www.paypal.com/business
- Click "Sign Up"
- Choose "Business Account"
- Complete verification

### 2. Get API Credentials
1. Go to: https://developer.paypal.com/dashboard
2. Log in with your PayPal account
3. Go to **Apps & Credentials**
4. Under **REST API apps**, create new app
5. Copy **Client ID** and **Secret**

### 3. Configure Environment Variables
```env
# Sandbox (Test)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=sb-your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-secret

# Production
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_CLIENT_SECRET=your-live-secret
```

### 4. Configure Webhooks
1. In your app settings, go to **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/webhooks/paypal`
3. Select events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`

### 5. Switch to Live
1. Toggle from "Sandbox" to "Live" in dashboard
2. Complete business verification
3. Link bank account
4. Update environment variables with live credentials

### Fees
- 2.9% + $0.30 per transaction (domestic)
- International fees vary by country

---

## Flutterwave Setup

### 1. Create Flutterwave Account
- Visit: https://dashboard.flutterwave.com/signup
- Choose your country (Nigeria, Kenya, Ghana, etc.)
- Enter business details
- Verify email

### 2. Complete KYC
1. Upload business documents
2. Verify business address
3. Add business bank account
4. Wait for approval (1-3 business days)

### 3. Get API Keys
1. Go to: https://dashboard.flutterwave.com/settings/apis
2. Copy **Public Key** (`FLWPUBK-test` or `FLWPUBK-`)
3. Copy **Secret Key** (`FLWSECK-test` or `FLWSECK-`)

### 4. Configure Environment Variables
```env
# Test
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-test-your-key
FLUTTERWAVE_SECRET_KEY=FLWSECK-test-your-key

# Live
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-your-live-key
FLUTTERWAVE_SECRET_KEY=FLWSECK-your-live-key
```

### 5. Configure Webhooks
1. Go to: Settings > Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/flutterwave`
3. Copy webhook secret hash
4. Add to environment:
   ```env
   FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-hash
   ```

### 6. Enable Payment Methods
1. Go to: Settings > Payment Methods
2. Enable:
   - Cards
   - Mobile Money (MTN, Airtel, etc.)
   - Bank Transfer
   - USSD

### 7. Go Live
1. Complete all verification requirements
2. Switch from Test to Live mode
3. Update API keys in environment

### Fees
- Cards: 1.4% capped at NGN 2,000
- Mobile Money: 1.4%
- Bank Transfer: Flat fee varies by country

---

## Paystack Setup

### 1. Create Paystack Account
- Visit: https://dashboard.paystack.com/signup
- Currently available in: Nigeria, Ghana, South Africa, Kenya
- Enter business details

### 2. Complete Business Verification
1. Submit business documents
2. Verify business address
3. Add settlement bank account
4. Complete director verification

### 3. Get API Keys
1. Go to: Settings > API Keys & Webhooks
2. Copy **Public Key** (`pk_test_` or `pk_live_`)
3. Copy **Secret Key** (`sk_test_` or `sk_live_`)

### 4. Configure Environment Variables
```env
# Test
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key
PAYSTACK_SECRET_KEY=sk_test_your_key

# Live
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_key
PAYSTACK_SECRET_KEY=sk_live_your_key
```

### 5. Configure Webhooks
1. Go to: Settings > API Keys & Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
3. Copy webhook secret
4. Add to environment:
   ```env
   PAYSTACK_WEBHOOK_SECRET=your-webhook-secret
   ```

### 6. Enable Payment Channels
1. Go to: Settings > Payment Channels
2. Enable:
   - Card payments
   - Bank transfer
   - USSD
   - Mobile Money

### 7. Go Live
1. Request "Go Live" activation
2. Wait for approval (1-2 business days)
3. Switch to live keys

### Fees (Nigeria)
- Local Cards: 1.5% capped at NGN 2,000
- International Cards: 3.9%
- Bank Transfer: Flat N 50

---

## Razorpay Setup

### 1. Create Razorpay Account
- Visit: https://dashboard.razorpay.com/signup
- Only available in India
- Enter business details

### 2. Complete KYC
1. Upload PAN card
2. Upload business proof (GST/Certificate of Incorporation)
3. Add bank account details
4. Complete PENNY drop verification

### 3. Get API Keys
1. Go to: Settings > API Keys
2. Generate keys
3. Copy **Key ID** (`rzp_test_` or `rzp_live_`)
4. Copy **Key Secret**

### 4. Configure Environment Variables
```env
# Test
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret

# Live
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
```

### 5. Configure Webhooks
1. Go to: Settings > Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events:
   - `payment.authorized`
   - `payment.failed`
   - `refund.created`
4. Copy webhook secret:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
   ```

### 6. Enable Payment Methods
1. Go to: Settings > Payment Methods
2. Enable:
   - Cards
   - UPI
   - Net Banking
   - Wallets (Paytm, PhonePe, etc.)
   - EMI

### 7. Activate Account
1. Complete all KYC requirements
2. Request activation
3. Wait for approval (24-48 hours)
4. Switch to live mode

### Fees
- Domestic Cards: 2%
- UPI: Free (merchant MDR not applicable)
- Net Banking: ₹3-5 per transaction
- International Cards: 3%

---

## Testing

### Test Cards

#### Stripe
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995

#### PayPal
- Use PayPal Sandbox accounts
- Create test buyer and seller accounts

#### Flutterwave
- **Test Card**: 5531 8866 5214 2950
- **CVV**: 564
- **Exp**: Any future date
- **PIN**: 3310
- **OTP**: 12345

#### Paystack
- **Test Card**: 5060 6666 6666 6666 6666
- **CVV**: Any 3 digits
- **Exp**: Any future date
- **PIN**: 1234
- **OTP**: 123456

#### Razorpay
- **Test Card**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Exp**: Any future date

---

## Going Live

### Pre-Launch Checklist

- [ ] All payment providers verified and activated
- [ ] Live API keys configured in production `.env`
- [ ] Webhooks configured for all providers
- [ ] SSL certificate installed (HTTPS)
- [ ] Terms of service published
- [ ] Privacy policy published
- [ ] Refund policy published
- [ ] Test transactions completed successfully
- [ ] Error handling tested
- [ ] Email notifications configured
- [ ] Customer support channels set up
- [ ] PCI compliance reviewed
- [ ] Data backup systems in place

### Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use HTTPS** for all payment pages
3. **Validate all webhooks** using signatures
4. **Implement rate limiting** to prevent abuse
5. **Log all transactions** for audit trail
6. **Encrypt sensitive data** at rest
7. **Use environment variables** for all credentials
8. **Implement CSP headers** to prevent XSS
9. **Regular security audits**
10. **Keep dependencies updated**

### Compliance

- **PCI DSS**: Required for handling card data
- **GDPR**: If serving EU customers
- **SOC 2**: For enterprise customers
- **Local regulations**: Check your country's requirements

### Monitoring

Set up monitoring for:
- Payment success/failure rates
- Average transaction time
- Error rates by provider
- Refund rates
- Chargeback rates
- Gateway downtime

### Support Contacts

- **Stripe**: https://support.stripe.com
- **PayPal**: https://www.paypal.com/merchantsupport
- **Flutterwave**: support@flutterwave.com
- **Paystack**: support@paystack.com
- **Razorpay**: support@razorpay.com

---

## Quick Reference

| Provider | Best For | Coverage | Demo Mode | Fees |
|----------|----------|----------|-----------|------|
| Stripe | Global, cards | 200+ countries | ✅ Yes | 2.9% + $0.30 |
| PayPal | PayPal users | 200+ countries | ✅ Yes | 2.9% + $0.30 |
| Flutterwave | Africa, mobile money | 15+ African countries | ✅ Yes | 1.4% |
| Paystack | Nigeria primary | Nigeria, Ghana, SA, Kenya | ✅ Yes | 1.5% |
| Razorpay | India, UPI | India only | ✅ Yes | 2% |

---

**Last Updated**: January 2025
**Status**: ✅ All providers implemented and tested
