// src/lib/crypto-polyfill.ts
/**
 * Crypto Polyfill for Node.js and Browser Environments
 * 
 * Provides a unified crypto interface that works in:
 * - Browser (using Web Crypto API)
 * - Node.js (using built-in crypto module)
 * - Server-side rendering contexts
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
 */

// Type definitions for our crypto interface
interface CryptoInterface {
  randomUUID: () => string;
  subtle: SubtleCrypto | CryptoSubtle;
  getRandomValues: <T extends ArrayBufferView | null>(array: T) => T;
}

interface CryptoSubtle {
  encrypt(algorithm: AlgorithmIdentifier, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer>;
  decrypt(algorithm: AlgorithmIdentifier, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer>;
  sign(algorithm: AlgorithmIdentifier, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer>;
  verify(algorithm: AlgorithmIdentifier, key: CryptoKey, signature: BufferSource, data: BufferSource): Promise<boolean>;
  digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>;
  generateKey(algorithm: AlgorithmIdentifier, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey | CryptoKeyPair>;
  deriveKey(algorithm: AlgorithmIdentifier, baseKey: CryptoKey, derivedKeyType: AlgorithmIdentifier, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey>;
  deriveBits(algorithm: AlgorithmIdentifier, baseKey: CryptoKey, length: number): Promise<ArrayBuffer>;
  importKey(format: KeyFormat, keyData: BufferSource | JsonWebKey, algorithm: AlgorithmIdentifier, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey>;
  exportKey(format: 'jwk', key: CryptoKey): Promise<JsonWebKey>;
  exportKey(format: Exclude<KeyFormat, 'jwk'>, key: CryptoKey): Promise<ArrayBuffer>;
  wrapKey(format: KeyFormat, key: CryptoKey, wrappingKey: CryptoKey, wrapAlgorithm: AlgorithmIdentifier): Promise<ArrayBuffer>;
  unwrapKey(format: KeyFormat, wrappedKey: BufferSource, unwrappingKey: CryptoKey, unwrapAlgorithm: AlgorithmIdentifier, unwrappedKeyAlgorithm: AlgorithmIdentifier, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey>;
}

/**
 * Get the appropriate crypto implementation based on the environment
 */
function getCryptoImpl(): CryptoInterface {
  // Browser environment with Web Crypto API
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto as unknown as CryptoInterface;
  }
  
  // Web Worker environment
  if (typeof self !== 'undefined' && (self as typeof self & { crypto?: Crypto }).crypto) {
    return (self as typeof self & { crypto: Crypto }).crypto as unknown as CryptoInterface;
  }
  
  // Node.js environment
  if (typeof global !== 'undefined') {
    try {
      // Node.js 15+ has crypto.webcrypto
      const nodeCrypto = require('crypto');
      
      // Node.js 19+ has randomUUID directly
      if (nodeCrypto.randomUUID) {
        // Node.js 15-18 has webcrypto
        if (nodeCrypto.webcrypto) {
          return nodeCrypto.webcrypto as CryptoInterface;
        }
        
        // Node.js 19+ - create a compatible interface
        return {
          randomUUID: nodeCrypto.randomUUID.bind(nodeCrypto),
          subtle: nodeCrypto.subtle || nodeCrypto.webcrypto?.subtle,
          getRandomValues: <T extends ArrayBufferView | null>(array: T): T => {
            if (array) {
              nodeCrypto.getRandomValues(array);
            }
            return array;
          }
        } as CryptoInterface;
      }
      
      // Fallback for older Node.js versions - create polyfill
      return createNodeCryptoPolyfill(nodeCrypto);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load Node.js crypto module:', e);
    }
  }
  
  // Last resort fallback
  throw new Error('No crypto implementation available. Please use Node.js 15+ or a modern browser.');
}

/**
 * Create a crypto polyfill for older Node.js versions
 */
function createNodeCryptoPolyfill(nodeCrypto: typeof import('crypto')): CryptoInterface {
  return {
    randomUUID: () => {
      // Polyfill for randomUUID using Node.js crypto.randomBytes
      const bytes = nodeCrypto.randomBytes(16);
      
      // Set version (4) and variant bits according to RFC 4122
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
      
      // Convert to UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const hex = bytes.toString('hex');
      return [
        hex.substring(0, 8),
        hex.substring(8, 12),
        hex.substring(12, 16),
        hex.substring(16, 20),
        hex.substring(20, 32)
      ].join('-');
    },
    
    getRandomValues: <T extends ArrayBufferView | null>(array: T): T => {
      if (!array) return array;
      
      const typedArray = array as ArrayBufferView;
      // Handle both ArrayBuffer and SharedArrayBuffer
      const bufferSource = typedArray.buffer instanceof SharedArrayBuffer 
        ? Buffer.from(typedArray.buffer) 
        : Buffer.from(typedArray.buffer as ArrayBuffer, typedArray.byteOffset, typedArray.byteLength);
      nodeCrypto.randomFillSync(bufferSource);
      return array;
    },
    
    // Polyfill for SubtleCrypto methods
    subtle: {
      async digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer> {
        const algo = typeof algorithm === 'string' ? algorithm : (algorithm as { name: string }).name;
        const hashAlgo = (algo as string).replace('-', '').toLowerCase(); // SHA-256 -> sha256
        
        const hash = nodeCrypto.createHash(hashAlgo);
        const buffer = data instanceof ArrayBuffer ? Buffer.from(data) : Buffer.from(data as Uint8Array);
        hash.update(buffer);
        
        return hash.digest().buffer as ArrayBuffer;
      },
      
      async sign(algorithm: AlgorithmIdentifier, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer> {
        const algo = typeof algorithm === 'string' ? algorithm : (algorithm as { name: string }).name;
        const buffer = data instanceof ArrayBuffer ? Buffer.from(data) : Buffer.from(data as Uint8Array);
        
        // Note: This is a simplified implementation
        // In production, you'd need proper key handling
        const sign = nodeCrypto.createSign(algo as string);
        sign.update(buffer);
        
        // This assumes key has a proper format - you'd need to adapt based on your key type
        const keyData = key as unknown as { key?: string | Buffer } | string | Buffer;
        const actualKey = typeof keyData === 'object' && keyData && 'key' in keyData ? keyData.key : keyData;
        const signature = sign.sign(actualKey as string | Buffer);
        return signature.buffer as ArrayBuffer;
      },
      
      async verify(algorithm: AlgorithmIdentifier, key: CryptoKey, signature: BufferSource, data: BufferSource): Promise<boolean> {
        const algo = typeof algorithm === 'string' ? algorithm : (algorithm as { name: string }).name;
        const dataBuffer = data instanceof ArrayBuffer ? Buffer.from(data) : Buffer.from(data as Uint8Array);
        const signatureBuffer = signature instanceof ArrayBuffer ? Buffer.from(signature) : Buffer.from(signature as Uint8Array);
        
        const verify = nodeCrypto.createVerify(algo as string);
        verify.update(dataBuffer);
        
        const keyData = key as unknown as { key?: string | Buffer } | string | Buffer;
        const actualKey = typeof keyData === 'object' && keyData && 'key' in keyData ? keyData.key : keyData;
        return verify.verify(actualKey as string | Buffer, signatureBuffer);
      },
      
      async encrypt(algorithm: AlgorithmIdentifier, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer> {
        throw new Error('Encryption not implemented in polyfill. Please use Node.js 15+ with webcrypto.');
      },
      
      async decrypt(algorithm: AlgorithmIdentifier, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer> {
        throw new Error('Decryption not implemented in polyfill. Please use Node.js 15+ with webcrypto.');
      },
      
      async generateKey(algorithm: AlgorithmIdentifier, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey | CryptoKeyPair> {
        throw new Error('Key generation not implemented in polyfill. Please use Node.js 15+ with webcrypto.');
      },
      
      async deriveKey(algorithm: AlgorithmIdentifier, baseKey: CryptoKey, derivedKeyType: AlgorithmIdentifier, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey> {
        throw new Error('Key derivation not implemented in polyfill. Please use Node.js 15+ with webcrypto.');
      },
      
      async deriveBits(algorithm: AlgorithmIdentifier, baseKey: CryptoKey, length: number): Promise<ArrayBuffer> {
        throw new Error('Bit derivation not implemented in polyfill. Please use Node.js 15+ with webcrypto.');
      },
      
      async importKey(format: KeyFormat, keyData: BufferSource | JsonWebKey, algorithm: AlgorithmIdentifier, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey> {
        throw new Error('Key import not implemented in polyfill. Please use Node.js 15+ with webcrypto.');
      },
      
      async exportKey(format: KeyFormat, key: CryptoKey): Promise<ArrayBuffer | JsonWebKey> {
        throw new Error('Key export not implemented in polyfill. Please use Node.js 15+ with webcrypto.');
      },
      
      async wrapKey(format: KeyFormat, key: CryptoKey, wrappingKey: CryptoKey, wrapAlgorithm: AlgorithmIdentifier): Promise<ArrayBuffer> {
        throw new Error('Key wrapping not implemented in polyfill. Please use Node.js 15+ with webcrypto.');
      },
      
      async unwrapKey(format: KeyFormat, wrappedKey: BufferSource, unwrappingKey: CryptoKey, unwrapAlgorithm: AlgorithmIdentifier, unwrappedKeyAlgorithm: AlgorithmIdentifier, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey> {
        throw new Error('Key unwrapping not implemented in polyfill. Please use Node.js 15+ with webcrypto.');
      }
    } as CryptoSubtle
  };
}

// Export a singleton instance
let cryptoInstance: CryptoInterface | null = null;

/**
 * Get the crypto instance (singleton pattern)
 */
export function getCrypto(): CryptoInterface {
  if (!cryptoInstance) {
    cryptoInstance = getCryptoImpl();
  }
  return cryptoInstance;
}

/**
 * Generate a random UUID v4
 * Works in both browser and Node.js environments
 */
export function randomUUID(): string {
  return getCrypto().randomUUID();
}

/**
 * Generate cryptographically strong random values
 * Works in both browser and Node.js environments
 */
export function getRandomValues<T extends ArrayBufferView | null>(array: T): T {
  return getCrypto().getRandomValues(array);
}

/**
 * Get the SubtleCrypto interface for advanced crypto operations
 * Works in both browser and Node.js environments
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
 */
export function getSubtleCrypto(): SubtleCrypto | CryptoSubtle {
  return getCrypto().subtle;
}

/**
 * Hash data using SHA-256
 * Convenience wrapper around SubtleCrypto.digest
 */
export async function sha256(data: string | BufferSource): Promise<ArrayBuffer> {
  const subtle = getSubtleCrypto();
  const buffer = typeof data === 'string' 
    ? new TextEncoder().encode(data) 
    : data;
  return subtle.digest('SHA-256', buffer);
}

/**
 * Hash data using SHA-256 and return as hex string
 */
export async function sha256Hex(data: string | BufferSource): Promise<string> {
  const hashBuffer = await sha256(data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a random string of specified length
 * Uses cryptographically strong random values
 */
export function randomString(length: number = 32): string {
  const array = new Uint8Array(length);
  getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, length);
}

// Default export
export default {
  getCrypto,
  randomUUID,
  getRandomValues,
  getSubtleCrypto,
  sha256,
  sha256Hex,
  randomString
};
