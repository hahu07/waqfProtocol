'use client';

/**
 * CryptoInitializer Component
 * 
 * This component ensures crypto is available globally BEFORE any other
 * client-side code runs. It must be rendered at the root of the app.
 * 
 * This approach avoids hydration errors by running entirely client-side.
 */

import { useEffect } from 'react';

// Import the shim to trigger its initialization
import '@/lib/crypto-global-shim';
import { logger } from '@/lib/logger';

export function CryptoInitializer() {
  useEffect(() => {
    // This runs on mount, but the import above runs immediately on module load
    // which is even earlier than useEffect
    
    // Verify crypto is available
    const hasCrypto = (
      (typeof globalThis !== 'undefined' && (globalThis as typeof window & { crypto?: Crypto }).crypto) ||
      (typeof window !== 'undefined' && window.crypto)
    );
    
    if (!hasCrypto) {
      logger.error('❌ Crypto initialization failed!');
    }
  }, []);
  
  // This component doesn't render anything
  return null;
}
