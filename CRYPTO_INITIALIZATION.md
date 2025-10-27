# Crypto Initialization for @dfinity/@junobuild

## Problem

The `@dfinity/auth-client` library (used by `@junobuild/core`) requires `crypto` to be available globally in the browser before it loads. Without proper initialization, you'll see errors like:

```
_getEffectiveCrypto
ECDSAKeyIdentity.generate
AuthClient.create
```

## Solution - Multi-Layer Crypto Initialization

We've implemented a **3-layer defense** to ensure crypto is always available:

### Layer 1: Public Script (Earliest - Before React)

**File**: `public/crypto-init.js`

This JavaScript file runs **before React hydration** using Next.js Script component:

```tsx
<Script
  src="/crypto-init.js"
  strategy="beforeInteractive"
/>
```

**What it does:**
- Loads before React hydration (via `beforeInteractive` strategy)
- Sets `globalThis.crypto = window.crypto`
- Sets `global.crypto = window.crypto`
- Verifies crypto is available
- Avoids hydration errors by using Next.js Script component

### Layer 2: Root Layout Import (Early - App Initialization)

**File**: `src/app/layout.tsx`

```typescript
// CRITICAL: Import crypto shim FIRST
import '@/lib/crypto-global-shim';
```

**What it does:**
- Runs when the Next.js app initializes
- Provides Node.js polyfill for SSR
- Ensures crypto is available during server-side rendering
- Re-enforces browser crypto availability

### Layer 3: AuthProvider Import (Before Auth Libraries)

**File**: `src/components/auth/AuthProvider.tsx`

```typescript
// CRITICAL: Import crypto shim FIRST
import '@/lib/crypto-global-shim';
```

**What it does:**
- Ensures crypto is available before `@junobuild/core` initializes
- Final safety net before auth client creation

## File Structure

```
waqfProtocol/
├── public/
│   └── crypto-init.js                  ← Layer 1: Early browser init
├── src/
│   ├── lib/
│   │   ├── crypto-global-shim.ts       ← Core shim implementation
│   │   └── crypto-polyfill.ts          ← UUID/crypto utilities
│   ├── app/
│   │   └── layout.tsx                  ← Layer 2: Root import + Script
│   └── components/
│       ├── CryptoInitializer.tsx       ← Client-side initializer
│       └── auth/
│           └── AuthProvider.tsx        ← Layer 3: Auth import
└── next.config.mjs                     ← Webpack crypto config
```

## How It Works

### Browser Environment

1. **Page Load** → `crypto-init.js` runs
   - Sets up `globalThis.crypto` and `global.crypto`
   
2. **React Hydration** → `layout.tsx` imports shim
   - Re-verifies crypto is available
   - Logs confirmation
   
3. **Auth Initialization** → `AuthProvider.tsx` imports shim
   - Final check before `@junobuild/core` loads
   
4. **@dfinity/auth-client** → Uses global crypto
   - `ECDSAKeyIdentity.generate()` succeeds
   - `AuthClient.create()` succeeds

### Node.js/SSR Environment

1. **Server Render** → `crypto-global-shim.ts` loads
   - Detects Node.js environment
   - Uses `require('crypto')` to get Node.js crypto module
   - Creates Web Crypto API compatible interface
   - Sets `globalThis.crypto` and `global.crypto`

2. **@dfinity Libraries** → Use polyfilled crypto
   - SSR components don't break
   - Build process succeeds

## Webpack Configuration

**File**: `next.config.mjs`

```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false, // Use browser's native crypto
    };
  }
  return config;
}
```

**Purpose:**
- Tells Webpack not to polyfill `crypto` module in browser
- Allows browser to use native `window.crypto`
- Prevents bundle bloat from Node.js crypto polyfills

## Verification

### Browser Console

After the page loads, you should see:

```
✅ Crypto initialized successfully
✅ Global crypto shim initialized for Node.js (if in dev server)
✅ Global crypto verified and available
```

### Code Verification

You can verify crypto is available anywhere in your code:

```typescript
import { verifyCrypto } from '@/lib/crypto-global-shim';

if (verifyCrypto()) {
  console.log('Crypto is ready!');
}
```

### Manual Test

Open browser console and run:

```javascript
// Should all return true
console.log('window.crypto:', !!window.crypto);
console.log('globalThis.crypto:', !!globalThis.crypto);
console.log('global.crypto:', !!global.crypto);
console.log('crypto.randomUUID:', typeof crypto.randomUUID === 'function');
```

## Troubleshooting

### Error: "crypto is not defined"

**Solution 1**: Ensure `crypto-init.js` is loaded
```html
<!-- Check your HTML source -->
<script src="/crypto-init.js"></script>
```

**Solution 2**: Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

**Solution 3**: Verify script order
The crypto-init.js must be the FIRST script in `<head>`.

### Error: "_getEffectiveCrypto"

This means the crypto shim loaded too late. Ensure:

1. ✅ `crypto-init.js` exists in `public/` directory
2. ✅ `<script src="/crypto-init.js">` is in `<head>`
3. ✅ No other scripts load before crypto-init.js
4. ✅ Crypto shim imported first in layout.tsx
5. ✅ Crypto shim imported first in AuthProvider.tsx

### Error: "randomUUID is not a function"

Your browser might be too old. Crypto.randomUUID() requires:
- Chrome 92+
- Firefox 95+
- Safari 15.4+
- Edge 92+

**Solution**: Update browser or use a polyfill for older browsers.

### SSR Errors

If you see crypto errors during build or SSR:

**Solution**: Ensure `crypto-global-shim.ts` is imported in `layout.tsx`:

```typescript
import '@/lib/crypto-global-shim';
```

This provides the Node.js polyfill needed for SSR.

## Advanced: Custom Crypto Operations

If you need to use crypto directly in your code:

```typescript
import { randomUUID, sha256Hex } from '@/lib/crypto-polyfill';

// Generate UUID
const id = randomUUID();

// Hash data
const hash = await sha256Hex('my data');
```

These utilities work in both browser and Node.js environments.

## Testing

### Manual Test Script

Create a test page to verify crypto:

```typescript
// app/test-crypto/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function TestCrypto() {
  const [results, setResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setResults({
      'window.crypto': !!window.crypto,
      'globalThis.crypto': !!globalThis.crypto,
      'crypto.randomUUID': typeof crypto.randomUUID === 'function',
      'Can generate UUID': (() => {
        try {
          crypto.randomUUID();
          return true;
        } catch {
          return false;
        }
      })()
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Crypto Test</h1>
      {Object.entries(results).map(([key, value]) => (
        <div key={key} className="mb-2">
          {value ? '✅' : '❌'} {key}
        </div>
      ))}
    </div>
  );
}
```

Visit `/test-crypto` to see results.

## References

- [MDN: Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [@dfinity/agent-js Issues #422](https://github.com/dfinity/agent-js/issues/422)
- [Next.js Polyfills](https://nextjs.org/docs/architecture/supported-browsers#polyfills)

## Summary

✅ **3-Layer Protection**
1. Public script (earliest)
2. Root layout import (SSR + app init)
3. AuthProvider import (before auth libraries)

✅ **Works Everywhere**
- Browser ✅
- Node.js SSR ✅
- Next.js Dev Server ✅
- Production Build ✅

✅ **No Breaking Changes**
- Existing code continues to work
- Libraries get crypto automatically

---

**Status**: ✅ Production Ready  
**Last Updated**: 2025-10-11  
**Version**: 1.0.0
