// src/lib/crypto-global-shim.ts
/**
 * Global Crypto Shim
 * 
 * This MUST be imported before any @dfinity or @junobuild imports.
 * It ensures that `global.crypto` is available for libraries that expect it.
 * 
 * @see https://github.com/dfinity/agent-js/issues/422
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Check if we're in Node.js
const isNode = typeof process !== 'undefined' && 
               process.versions != null && 
               process.versions.node != null;

/**
 * Ensure global.crypto is available
 * This is needed for @dfinity/auth-client and other libraries
 */
if (isBrowser) {
  // Browser environment - ensure global.crypto points to window.crypto
  if (typeof window !== 'undefined' && window.crypto) {
    // Make sure crypto is available on globalThis
    if (typeof globalThis !== 'undefined' && !globalThis.crypto) {
      (globalThis as typeof globalThis & { crypto: Crypto }).crypto = window.crypto;
    }
    
    // Make sure crypto is available on global (for compatibility)
    if (typeof global !== 'undefined' && !(global as typeof globalThis & { crypto?: Crypto }).crypto) {
      (global as typeof global & { crypto: Crypto }).crypto = window.crypto;
    }
  }
} else if (isNode) {
  // Node.js environment - polyfill crypto for SSR
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    
    // Create a Web Crypto API compatible interface
    const webcrypto = nodeCrypto.webcrypto || {
      // Use native randomUUID if available (Node.js 14.17+)
      randomUUID: nodeCrypto.randomUUID || (() => {
        const bytes = nodeCrypto.randomBytes(16);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = bytes.toString('hex');
        return [
          hex.substring(0, 8),
          hex.substring(8, 12),
          hex.substring(12, 16),
          hex.substring(16, 20),
          hex.substring(20, 32)
        ].join('-');
      }),
      
      getRandomValues: <T extends ArrayBufferView | null>(array: T): T => {
        if (!array) return array;
        const typedArray = array as ArrayBufferView;
        const buffer = Buffer.from(
          typedArray.buffer,
          typedArray.byteOffset,
          typedArray.byteLength
        );
        nodeCrypto.randomFillSync(buffer);
        return array;
      },
      
      subtle: nodeCrypto.subtle || {
        async digest(algorithm: unknown, data: unknown) {
          const algo = typeof algorithm === 'string' ? algorithm : (algorithm as { name: string }).name;
          const hashAlgo = (algo as string).replace('-', '').toLowerCase();
          const hash = nodeCrypto.createHash(hashAlgo);
          const dataBuffer = data instanceof ArrayBuffer ? Buffer.from(data) : Buffer.from(data as Uint8Array);
          hash.update(dataBuffer);
          return hash.digest().buffer;
        },
        
        async sign(algorithm: unknown, key: unknown, data: unknown) {
          const algo = typeof algorithm === 'string' ? algorithm : (algorithm as { name: string }).name;
          const sign = nodeCrypto.createSign(algo as string);
          const dataBuffer = data instanceof ArrayBuffer ? Buffer.from(data) : Buffer.from(data as Uint8Array);
          sign.update(dataBuffer);
          const keyData = (key as { key?: string | Buffer } | string | Buffer);
          const actualKey = typeof keyData === 'object' && 'key' in keyData ? keyData.key : keyData;
          const signature = sign.sign(actualKey as string | Buffer);
          return signature.buffer;
        },
        
        async verify(algorithm: unknown, key: unknown, signature: unknown, data: unknown) {
          const algo = typeof algorithm === 'string' ? algorithm : (algorithm as { name: string }).name;
          const verify = nodeCrypto.createVerify(algo as string);
          const dataBuffer = data instanceof ArrayBuffer ? Buffer.from(data) : Buffer.from(data as Uint8Array);
          verify.update(dataBuffer);
          const keyData = (key as { key?: string | Buffer } | string | Buffer);
          const actualKey = typeof keyData === 'object' && 'key' in keyData ? keyData.key : keyData;
          const signatureBuffer = signature instanceof ArrayBuffer ? Buffer.from(signature) : Buffer.from(signature as Uint8Array);
          return verify.verify(actualKey as string | Buffer, signatureBuffer);
        },
        
        // Stubs for other methods (will throw if used during SSR)
        async generateKey() {
          throw new Error('generateKey not available during SSR - use client-side only');
        },
        async deriveKey() {
          throw new Error('deriveKey not available during SSR - use client-side only');
        },
        async deriveBits() {
          throw new Error('deriveBits not available during SSR - use client-side only');
        },
        async encrypt() {
          throw new Error('encrypt not available during SSR - use client-side only');
        },
        async decrypt() {
          throw new Error('decrypt not available during SSR - use client-side only');
        },
        async importKey() {
          throw new Error('importKey not available during SSR - use client-side only');
        },
        async exportKey() {
          throw new Error('exportKey not available during SSR - use client-side only');
        },
        async wrapKey() {
          throw new Error('wrapKey not available during SSR - use client-side only');
        },
        async unwrapKey() {
          throw new Error('unwrapKey not available during SSR - use client-side only');
        }
      }
    };
    
    // Set on globalThis (preferred in modern environments)
    if (typeof globalThis !== 'undefined' && !globalThis.crypto) {
      (globalThis as typeof globalThis & { crypto: typeof webcrypto }).crypto = webcrypto;
    }
    
    // Set on global (for older Node.js compatibility)
    if (typeof global !== 'undefined' && !(global as typeof global & { crypto?: typeof webcrypto }).crypto) {
      (global as typeof global & { crypto: typeof webcrypto }).crypto = webcrypto;
    }
    
    // Silent success - no logs in production
  } catch (error) {
    // Silent error handling - crypto will be polyfilled elsewhere if needed
    // Note: Cannot use logger here as this runs before logger initialization
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('⚠️ Failed to initialize crypto shim:', error);
    }
  }
}

/**
 * Verify that crypto is available
 */
export function verifyCrypto(): boolean {
  const hasCrypto = (
    (typeof globalThis !== 'undefined' && (globalThis as typeof globalThis & { crypto?: Crypto }).crypto) ||
    (typeof global !== 'undefined' && (global as typeof global & { crypto?: Crypto }).crypto) ||
    (typeof window !== 'undefined' && window.crypto)
  );
  
  if (!hasCrypto) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('❌ Crypto is not available!');
    }
    return false;
  }
  
  return true;
}

// Auto-verify on import - immediate for browser
if (typeof window !== 'undefined') {
  // Immediate setup in browser
  if (verifyCrypto()) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('✅ Global crypto verified and available');
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('❌ Failed to initialize crypto in browser!');
    }
  }
}

// Named export instead of default export
export const cryptoShim = { verifyCrypto };
