# Crypto Polyfill - Quick Reference Card

## 🚀 Quick Start

```typescript
import { randomUUID } from '@/lib/crypto-polyfill';

const id = randomUUID();
```

## 📚 Common Use Cases

### 1. Generate IDs
```typescript
import { randomUUID } from '@/lib/crypto-polyfill';

const waqfId = randomUUID();
const donationId = randomUUID();
const transactionId = randomUUID();
```

### 2. Hash Data (SHA-256)
```typescript
import { sha256Hex } from '@/lib/crypto-polyfill';

// Hash a string
const hash = await sha256Hex('my data');

// Hash payment data
const paymentData = JSON.stringify({
  amount: 100,
  currency: 'USD',
  timestamp: Date.now()
});
const signature = await sha256Hex(paymentData);
```

### 3. Generate Random Tokens
```typescript
import { randomString } from '@/lib/crypto-polyfill';

const apiKey = randomString(32);     // 32 character hex string
const sessionToken = randomString(64); // 64 character hex string
```

### 4. Random Bytes
```typescript
import { getRandomValues } from '@/lib/crypto-polyfill';

const buffer = new Uint8Array(16);
getRandomValues(buffer);
// buffer now contains 16 cryptographically secure random bytes
```

### 5. Advanced Crypto (SubtleCrypto)
```typescript
import { getSubtleCrypto } from '@/lib/crypto-polyfill';

const subtle = getSubtleCrypto();

// Hash data
const hash = await subtle.digest('SHA-256', data);

// Sign data
const signature = await subtle.sign(algorithm, key, data);

// Verify signature
const isValid = await subtle.verify(algorithm, key, signature, data);
```

## 🔧 API at a Glance

| Function | Returns | Description |
|----------|---------|-------------|
| `randomUUID()` | `string` | Generate UUID v4 |
| `randomString(length)` | `string` | Generate random hex string |
| `getRandomValues(array)` | `array` | Fill array with random bytes |
| `sha256(data)` | `Promise<ArrayBuffer>` | SHA-256 hash as buffer |
| `sha256Hex(data)` | `Promise<string>` | SHA-256 hash as hex string |
| `getSubtleCrypto()` | `SubtleCrypto` | Get SubtleCrypto interface |
| `getCrypto()` | `Crypto` | Get full Crypto interface |

## ✅ Where to Use

- ✅ Generating Waqf IDs
- ✅ Creating donation records
- ✅ Payment transaction IDs
- ✅ Session tokens
- ✅ API keys
- ✅ Webhook signatures
- ✅ Data integrity hashes
- ✅ Any cryptographic operation

## 🌍 Environment Support

| Environment | Status | Notes |
|-------------|--------|-------|
| Browser | ✅ | Uses `window.crypto` |
| Node.js 19+ | ✅ | Uses native `crypto` |
| Node.js 15-18 | ✅ | Uses `crypto.webcrypto` |
| Node.js <15 | ✅ | Uses polyfill |
| SSR | ✅ | Works seamlessly |
| API Routes | ✅ | Works seamlessly |
| Web Workers | ✅ | Uses `self.crypto` |

## 🔒 Security Notes

- ✅ All random generation is cryptographically secure
- ✅ UUID generation follows RFC 4122 v4 standard
- ✅ Hashing follows W3C Web Crypto API standards
- ⚠️ Never log or expose cryptographic keys

## 📖 Full Documentation

- `src/lib/crypto-polyfill.README.md` - Complete guide
- `CRYPTO_POLYFILL_IMPLEMENTATION.md` - Implementation details
- `test-crypto-polyfill.js` - Validation script

## 🐛 Troubleshooting

**Error: "No crypto implementation available"**
- Ensure Node.js 14+ or modern browser
- Check that `crypto` module is available

**Error: "Buffer is not defined"**
- Don't use Node.js Buffer in browser code
- Use TypedArray instead (Uint8Array, etc.)

**TypeScript errors**
- Update `tsconfig.json` to include proper lib targets
- Ensure `"lib": ["ES2020", "DOM"]` is present

## 🧪 Testing

```bash
# Run validation script
node test-crypto-polyfill.js

# Should see:
# ✅ crypto module loaded
# ✅ randomUUID() available
# ✅ Valid UUID generated
# ✅ Hash generated
# ✅ Random bytes generated
```

## 💡 Migration Tips

**Before:**
```typescript
const id = crypto.randomUUID();
const hash = await crypto.subtle.digest('SHA-256', data);
```

**After:**
```typescript
import { randomUUID, getSubtleCrypto } from '@/lib/crypto-polyfill';

const id = randomUUID();
const subtle = getSubtleCrypto();
const hash = await subtle.digest('SHA-256', data);
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-11  
**Status**: ✅ Production Ready
