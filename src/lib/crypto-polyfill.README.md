# Crypto Polyfill

This module provides a unified cryptographic interface that works seamlessly in both browser and Node.js environments.

## Problem Solved

The standard Web Crypto API (`crypto.randomUUID()`, `crypto.subtle`, etc.) is available in browsers but not always available in Node.js environments, especially during:
- Server-side rendering (SSR)
- API routes
- Build processes
- Testing environments

This causes errors like:
```
ReferenceError: crypto is not defined
Global crypto was not available and none was provided
```

## Solution

Our polyfill automatically detects the environment and provides the appropriate crypto implementation:

| Environment | Implementation |
|------------|----------------|
| Browser | `window.crypto` (Web Crypto API) |
| Web Workers | `self.crypto` |
| Node.js 19+ | Native `crypto` module |
| Node.js 15-18 | `crypto.webcrypto` |
| Node.js <15 | Custom polyfill using `crypto` primitives |

## Usage

### Basic UUID Generation

```typescript
import { randomUUID } from '@/lib/crypto-polyfill';

// Works everywhere - browser, server, API routes
const id = randomUUID();
console.log(id); // "550e8400-e29b-41d4-a716-446655440000"
```

### Hashing (SHA-256)

```typescript
import { sha256, sha256Hex } from '@/lib/crypto-polyfill';

// Hash as ArrayBuffer
const hashBuffer = await sha256('my secret data');

// Hash as hex string (more common)
const hashHex = await sha256Hex('my secret data');
console.log(hashHex); // "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
```

### Random Values

```typescript
import { getRandomValues } from '@/lib/crypto-polyfill';

const array = new Uint8Array(16);
getRandomValues(array);
console.log(array); // [123, 45, 67, 89, ...]
```

### Random String Generation

```typescript
import { randomString } from '@/lib/crypto-polyfill';

const token = randomString(32);
console.log(token); // "a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8"
```

### Advanced SubtleCrypto Operations

```typescript
import { getSubtleCrypto } from '@/lib/crypto-polyfill';

const subtle = getSubtleCrypto();

// Generate a key
const key = await subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);

// Encrypt data
const encrypted = await subtle.encrypt(
  { name: 'AES-GCM', iv: new Uint8Array(12) },
  key,
  new TextEncoder().encode('sensitive data')
);
```

## Migration Guide

### Before (Browser-only code)
```typescript
// This breaks in Node.js/SSR
const id = crypto.randomUUID();
const hash = await crypto.subtle.digest('SHA-256', data);
```

### After (Universal code)
```typescript
import { randomUUID, getSubtleCrypto } from '@/lib/crypto-polyfill';

// Works everywhere
const id = randomUUID();
const subtle = getSubtleCrypto();
const hash = await subtle.digest('SHA-256', data);
```

## Where It's Used

This polyfill is already integrated throughout the codebase:

- ✅ `src/lib/waqf-utils.ts` - Waqf ID generation
- ✅ `src/lib/cause-utils.ts` - Cause ID generation
- ✅ `src/hooks/useWaqfData.ts` - Data fetching with UUIDs
- ✅ Payment gateway implementations - Transaction IDs
- ✅ Any other module that needs crypto operations

## Security Notes

⚠️ **Important Security Considerations:**

1. **Use for appropriate purposes**: This polyfill is suitable for generating IDs, hashing, and basic crypto operations.

2. **Not for production encryption**: For complex encryption/decryption, use Node.js 15+ with full SubtleCrypto support.

3. **Cryptographically secure**: All random number generation uses cryptographically secure sources:
   - Browser: `window.crypto.getRandomValues()`
   - Node.js: `crypto.randomBytes()` / `crypto.getRandomValues()`

4. **UUID compliance**: Generated UUIDs follow RFC 4122 v4 standard.

5. **No key exposure**: Never log or expose cryptographic keys in plain text.

## Testing

The polyfill works in all testing environments:

```typescript
// Jest test example
import { randomUUID, sha256Hex } from '@/lib/crypto-polyfill';

describe('Crypto Polyfill', () => {
  it('generates valid UUIDs', () => {
    const id = randomUUID();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('hashes consistently', async () => {
    const hash1 = await sha256Hex('test');
    const hash2 = await sha256Hex('test');
    expect(hash1).toBe(hash2);
  });
});
```

## API Reference

### `randomUUID(): string`
Generates a random UUID v4.

### `getRandomValues<T>(array: T): T`
Fills the provided typed array with cryptographically strong random values.

### `sha256(data: string | BufferSource): Promise<ArrayBuffer>`
Hashes data using SHA-256, returns ArrayBuffer.

### `sha256Hex(data: string | BufferSource): Promise<string>`
Hashes data using SHA-256, returns hex string.

### `randomString(length?: number): string`
Generates a random hex string of specified length (default: 32).

### `getSubtleCrypto(): SubtleCrypto`
Returns the SubtleCrypto interface for advanced operations.

### `getCrypto(): CryptoInterface`
Returns the full Crypto interface (low-level access).

## Troubleshooting

### "No crypto implementation available"
**Solution**: Ensure you're using Node.js 14+ or a modern browser.

### "Buffer is not defined" (in browser)
**Solution**: Don't use Node.js-specific Buffer in browser code. The polyfill handles this internally.

### TypeScript errors with SubtleCrypto
**Solution**: The polyfill includes proper TypeScript definitions. Update your tsconfig.json:
```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

## References

- [MDN: Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [MDN: SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [RFC 4122 - UUID Specification](https://tools.ietf.org/html/rfc4122)

---

**Last Updated**: October 2025  
**Version**: 1.0.0
