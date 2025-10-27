# Production Improvements - Quick Reference

## 🚀 Quick Start

### 1. Validate User Input
```typescript
import { waqfProfileSchema, validateData, formatZodErrors } from '@/schemas';

const result = validateData(waqfProfileSchema, formData);
if (!result.success) {
  const errors = formatZodErrors(result.errors!);
  toast.error(errors.join(', '));
  return;
}
// Use result.data (validated & type-safe)
```

### 2. Log Events
```typescript
import { logger } from '@/lib/logger';

// ❌ Don't use console.log
console.log('Payment processed', data);

// ✅ Use logger instead
logger.payment.info('Payment processed', { amount, provider });
logger.error('Operation failed', error, { context });
```

### 3. Wrap Error-Prone Code
```typescript
import { PaymentErrorBoundary } from '@/components/error-boundary';

// Wrap payment/critical components
<PaymentErrorBoundary onError={(error) => trackError(error)}>
  <PaymentForm />
</PaymentErrorBoundary>
```

### 4. Access Environment Variables
```typescript
import { getEnv, isProduction } from '@/lib/env-validation';

// ❌ Don't access directly
const key = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

// ✅ Use validated env
const env = getEnv();
const key = env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

if (isProduction()) {
  // Production-only code
}
```

---

## 📋 Available Schemas

```typescript
import {
  // Core Data
  waqfProfileSchema,        // Waqf creation/update
  donationSchema,           // Donation data
  causeSchema,              // Cause data
  
  // Financial
  financialMetricsSchema,   // Financial tracking
  paymentIntentSchema,      // Payment intents
  paymentResultSchema,      // Payment results
  
  // Admin
  adminSchema,              // Admin users
  adminRequestSchema,       // Admin requests
  allocationSchema,         // Fund allocations
  
  // Supporting
  donorProfileSchema,       // Donor info
  temporaryWaqfDetailsSchema, // Temporary waqf
} from '@/schemas';
```

---

## 🎯 Logger Methods

```typescript
import { logger } from '@/lib/logger';

// General logging
logger.debug('Verbose info');      // Dev only
logger.info('General info');       // Dev only
logger.warn('Warning');            // All envs
logger.error('Error', error);      // All envs + monitoring

// Specialized loggers
logger.payment.info('Payment info');
logger.payment.error('Payment error', error);

logger.auth.info('Auth info');
logger.auth.error('Auth error', error);

logger.waqf.info('Waqf info');
logger.waqf.error('Waqf error', error);

logger.api.info('API info');
logger.api.error('API error', error);
```

---

## 🛡️ Security Headers (Automatic)

All routes automatically include:
- ✅ XSS Protection
- ✅ Clickjacking Protection  
- ✅ MIME Sniffing Protection
- ✅ HTTPS Enforcement
- ✅ Content Security Policy

No action needed - configured in `next.config.mjs`.

---

## 🔍 Common Patterns

### Form Validation
```typescript
const handleSubmit = async (formData: unknown) => {
  // Validate input
  const result = validateData(waqfProfileSchema, formData);
  
  if (!result.success) {
    const errors = formatZodErrors(result.errors!);
    setFormErrors(errors);
    return;
  }
  
  // Safe to use validated data
  const waqf = result.data;
  
  try {
    logger.waqf.info('Creating waqf', { name: waqf.name });
    await createWaqf(waqf);
    logger.waqf.info('Waqf created successfully', { id: waqf.id });
  } catch (error) {
    logger.waqf.error('Failed to create waqf', error as Error, { name: waqf.name });
    toast.error('Failed to create waqf');
  }
};
```

### Payment Processing
```typescript
<PaymentErrorBoundary>
  <PaymentComponent
    onProcess={async (intent) => {
      // Validate payment intent
      const result = validateData(paymentIntentSchema, intent);
      if (!result.success) {
        throw new Error('Invalid payment data');
      }
      
      logger.payment.info('Processing payment', { 
        amount: result.data.amount,
        currency: result.data.currency 
      });
      
      try {
        const paymentResult = await processPayment(result.data);
        logger.payment.info('Payment successful', { 
          transactionId: paymentResult.transactionId 
        });
        return paymentResult;
      } catch (error) {
        logger.payment.error('Payment failed', error as Error, { 
          amount: result.data.amount 
        });
        throw error;
      }
    }}
  />
</PaymentErrorBoundary>
```

### API Call with Error Handling
```typescript
const fetchData = async () => {
  try {
    logger.api.info('Fetching waqfs');
    const data = await fetch('/api/waqfs');
    logger.api.info('Waqfs fetched', { count: data.length });
    return data;
  } catch (error) {
    logger.api.error('Failed to fetch waqfs', error as Error);
    throw error;
  }
};
```

---

## 📦 File Locations

```
src/
├── lib/
│   ├── logger.ts                  # Import logger from here
│   └── env-validation.ts          # Import env utils from here
├── schemas/
│   └── index.ts                   # Import schemas from here
└── components/
    └── error-boundary/
        └── index.ts               # Import error boundaries from here
```

---

## 🎨 TypeScript Tips

```typescript
// Infer types from schemas
import { WaqfProfileInput, DonationInput } from '@/schemas';

// Use inferred types
const createWaqf = (data: WaqfProfileInput) => {
  // data is fully typed based on schema
};

// Validate and use
const result = validateData(waqfProfileSchema, rawData);
if (result.success) {
  // result.data is WaqfProfileInput type
  createWaqf(result.data);
}
```

---

## ⚡ Quick Commands

```bash
# Find remaining console.logs
grep -r "console\\.log" src/ --include="*.ts" --include="*.tsx"

# Check for console.errors
grep -r "console\\.error" src/ --include="*.ts" --include="*.tsx"

# Lint
npm run lint

# Build
npm run build

# Start production
npm start

# Check headers
curl -I http://localhost:3000
```

---

## 📖 Full Documentation

- **Complete Guide**: `PRODUCTION_IMPROVEMENTS.md`
- **Implementation Summary**: `IMPROVEMENTS_SUMMARY.md`  
- **This Quick Ref**: `QUICK_REFERENCE.md`

---

## 💡 Pro Tips

1. **Always validate external data** (user input, API responses)
2. **Use logger for all diagnostic output** (never console.log in production code)
3. **Wrap critical flows in error boundaries** (especially payments)
4. **Access env through validation** (catches config errors early)
5. **Test with invalid data** (ensure validation catches errors)

---

**Created**: 2025-10-24  
**Quick Access**: Keep this file open while developing! 📌
