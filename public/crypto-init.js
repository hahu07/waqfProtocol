/**
 * Early Crypto Initialization Script
 * 
 * This script runs before React hydration to ensure crypto is available globally.
 * It's particularly important for @dfinity/auth-client and @junobuild/core.
 * 
 * Place this in <head> or load it as the first script in your app.
 */

(function() {
  'use strict';
  
  // Browser environment check
  if (typeof window === 'undefined') return;
  
  try {
    // Ensure globalThis.crypto is available
    if (typeof globalThis !== 'undefined' && window.crypto) {
      if (!globalThis.crypto) {
        globalThis.crypto = window.crypto;
      }
    }
    
    // Ensure global.crypto is available (for libraries that check global)
    if (typeof global === 'undefined') {
      window.global = window;
    }
    
    if (!window.global.crypto) {
      window.global.crypto = window.crypto;
    }
    
    // Verify crypto is available
    if (window.crypto && window.crypto.randomUUID) {
      console.log('✅ Crypto initialized successfully');
    } else {
      console.warn('⚠️ Crypto initialized but randomUUID not available');
    }
  } catch (error) {
    console.error('❌ Failed to initialize crypto:', error);
  }
})();
