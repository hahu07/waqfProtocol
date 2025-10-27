# Payment Flow Integration Updates

## Overview
This document describes the changes made to integrate the payment flow into the waqf creation and add funds processes.

## Required Dependencies

The following NPM package must be installed for the payment system to work:

```bash
npm install @stripe/stripe-js
```

This package provides the client-side Stripe integration for secure payment processing.

## Changes Made

### 1. WaqfForm Component (`src/components/waqf/WaqfForm.tsx`)

**Changes:**
- Added `useRouter` import from `next/navigation`
- Modified `handleSubmit` function to distinguish between create and edit modes:
  - **Edit Mode**: When `initialData` with an `id` exists, the form submits directly to `onSubmit` without payment (no payment required for editing)
  - **Create Mode**: When creating a new waqf:
    - Form data is validated
    - Data is stored in `sessionStorage` as `waqfFormData`
    - User is redirected to `/waqf/payment` with query parameters including:
      - `amount`: waqf asset amount
      - `currency`: USD
      - `purpose`: create_waqf
      - `waqfName`: name of the waqf
      - `donorName`: donor's name
      - `donorEmail`: donor's email

**Flow:**
```
User fills form → Validates → Stores in sessionStorage → Redirects to payment page
```

### 2. Waqf Page (`src/app/waqf/page.tsx`)

**Changes:**
- Updated the `onAddFunds` handler in `EnhancedWaqfDashboard`:
  - Prompts user for amount to add (minimum $10)
  - Validates the amount
  - Redirects to `/waqf/payment` with query parameters:
    - `amount`: amount to add
    - `currency`: USD
    - `purpose`: add_funds
    - `waqfId`: ID of the waqf
    - `waqfName`: name of the waqf
    - `donorName`: donor's name
    - `donorEmail`: donor's email

**Flow:**
```
User clicks "Add Funds" → Enters amount → Validates → Redirects to payment page
```

### 3. Payment Page (`src/app/waqf/payment/page.tsx`)

**Major Updates:**

#### Imports Added:
- `createWaqf, getWaqf` from `@/lib/waqf-utils`
- `WaqfProfile, Cause` types from `@/types/waqfs`
- `listActiveCauses` from `@/lib/cause-utils`

#### Payment Processing Logic:

**For `create_waqf` Purpose:**
1. Retrieves stored form data from `sessionStorage`
2. Fetches active causes to populate `supportedCauses`
3. Constructs complete `WaqfProfile` object
4. Creates waqf in database using `createWaqf()`
5. Records initial donation/payment transaction
6. Clears `sessionStorage`
7. Redirects to `/waqf?created=true&payment=success`

**For `add_funds` Purpose:**
1. Records donation transaction
2. Fetches current waqf data
3. Updates financial data:
   - Increments `totalDonations`
   - Increments `currentBalance`
4. Saves updated waqf
5. Redirects to `/waqf?payment=success&transaction={transactionId}`

**For `donation` Purpose:**
1. Records donation transaction
2. Redirects to `/waqf?payment=success`

## Payment Flow Diagrams

### Create Waqf Flow
```
┌─────────────────┐
│  User fills     │
│  WaqfForm       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Form validates │
│  and stores     │
│  in session     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redirect to    │
│  /waqf/payment  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User enters    │
│  payment info   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Payment        │
│  processed      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Waqf created   │
│  in database    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Donation       │
│  recorded       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redirect to    │
│  /waqf success  │
└─────────────────┘
```

### Add Funds Flow
```
┌─────────────────┐
│  User clicks    │
│  "Add Funds"    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prompt for     │
│  amount         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validate       │
│  amount (≥$10)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redirect to    │
│  /waqf/payment  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User enters    │
│  payment info   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Payment        │
│  processed      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Waqf financial │
│  data updated   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Donation       │
│  recorded       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redirect to    │
│  /waqf success  │
└─────────────────┘
```

## Key Features

### Session Storage Usage
- **Purpose**: Temporarily store form data during payment redirect
- **Key**: `waqfFormData`
- **Cleared**: After successful waqf creation
- **Contains**:
  - name
  - description
  - waqfAsset
  - donorName
  - donorEmail
  - donorPhone
  - donorAddress
  - selectedCauseIds
  - userId

### Payment Query Parameters
The following query parameters are passed to the payment page:

| Parameter | Purpose | Example |
|-----------|---------|---------|
| amount | Payment amount | 1000 |
| currency | Payment currency | USD |
| purpose | Payment purpose | create_waqf, add_funds, donation |
| waqfId | Existing waqf ID | uuid |
| waqfName | Waqf name | "My Charitable Waqf" |
| donorName | Donor name | "John Doe" |
| donorEmail | Donor email | "john@example.com" |

### Error Handling
- Form validation errors shown before redirect
- Payment initialization errors displayed on payment page
- Waqf creation errors caught and displayed
- Session storage fallback if data missing
- Financial update errors logged but don't block payment success

## Testing Checklist

- [ ] Create new waqf redirects to payment page
- [ ] Payment page displays correct amount
- [ ] Payment processes successfully (demo mode)
- [ ] Waqf is created in database after payment
- [ ] User redirected back to waqf page with success message
- [ ] Add Funds button prompts for amount
- [ ] Add Funds redirects to payment page with correct waqfId
- [ ] Payment updates waqf financial data
- [ ] Donation is recorded in transactions
- [ ] Edit waqf does NOT redirect to payment (direct update)
- [ ] Session storage is cleared after successful creation
- [ ] Error messages are user-friendly

## Future Enhancements
1. Add support for multiple payment providers (PayPal, local payment methods)
2. Implement installment/recurring payment options
3. Add payment receipt generation and email
4. Implement refund/cancellation flow
5. Add payment history page
6. Support multiple currencies with conversion
7. Add payment analytics and reporting
8. Implement saved payment methods

## Notes
- Edit mode bypasses payment (only for creating new waqfs)
- Minimum add funds amount is $10
- Session storage is browser-specific (won't work across devices)
- Payment gateway is currently in demo/test mode
- All amounts are in USD by default
