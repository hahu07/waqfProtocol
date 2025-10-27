'use client';

// CRITICAL: Import crypto shim FIRST, before any @dfinity/@junobuild imports
import '@/lib/crypto-global-shim';

import React from 'react';
import { 
  createContext, 
  useContext, 
  useEffect, 
  useMemo, 
  useState 
} from 'react';
import { 
  initSatellite, 
  onAuthStateChange, 
  signIn, 
  signOut, 
  type User
} from '@junobuild/core';
import { logger } from '@/lib/logger';

interface ExtendedUser extends User {
  groups?: string[];
  roles?: string[];
}

const ADMIN_GROUP = process.env.NEXT_PUBLIC_ADMIN_GROUP || 'admin';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: Error | undefined;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  toggleAuthMode: () => void;
  isSignUpMode: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const checkIsAdmin = (user: User | null): boolean => {
  if (!user) return false;
  
  // In development mode, check for role override
  if (process.env.NODE_ENV === 'development') {
    const devModeRole = typeof window !== 'undefined' 
      ? localStorage.getItem('devModeRole') as 'admin' | 'user' | null
      : null;
    if (devModeRole === 'admin') {
      return true;
    }
    if (devModeRole === 'user') {
      return false;
    }
  }
  
  try {
    // Check if user is the owner (satellite owner has admin access)
    if (user.owner) {
      return true;
    }
    
    const extendedUser = user as ExtendedUser;
    return !!extendedUser.groups?.includes(ADMIN_GROUP) || 
           !!extendedUser.roles?.includes('admin');
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const initialize = async () => {
      try {
        // Ensure crypto is available before initializing Juno
        if (typeof window !== 'undefined') {
          const maxAttempts = 50; // 5 seconds max
          let attempts = 0;
          
          while (!window.crypto && attempts < maxAttempts) {
            logger.auth.info('Waiting for crypto to be available...');
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          
          if (!window.crypto) {
            throw new Error('Crypto not available after waiting');
          }
          
          logger.auth.info('Crypto is ready');
        }
        
        const satelliteId = process.env.NEXT_PUBLIC_JUNO_SATELLITE_ID;
        
        logger.auth.info('Initializing Juno Satellite...');
        logger.debug('Satellite ID (raw):', { data: satelliteId });
        
        if (!satelliteId) {
          throw new Error('NEXT_PUBLIC_JUNO_SATELLITE_ID is not defined in environment variables');
        }
        
        // Clean up the satellite ID: remove quotes and trim whitespace
        const cleanSatelliteId = satelliteId.replace(/"/g, '').trim();
        logger.debug('Satellite ID (cleaned):', { data: cleanSatelliteId });
        
        if (!cleanSatelliteId) {
          throw new Error('NEXT_PUBLIC_JUNO_SATELLITE_ID is empty after cleaning');
        }
        
        await initSatellite({
          satelliteId: cleanSatelliteId,
          workers: { auth: true },
        });
        
        logger.auth.info('Juno Satellite initialized successfully');
        setIsInitialized(true);
        
        unsubscribe = onAuthStateChange((user) => setUser(user ?? null));
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize satellite');
        logger.auth.error('Failed to initialize Juno Satellite', error);
        
        // More detailed error message
        let errorMessage = 'Failed to initialize satellite';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        setError(new Error(`Initialization failed: ${errorMessage}`));
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
    
    return () => {
      unsubscribe?.();
    };
  }, []);

  const toggleAuthMode = () => {
    setIsSignUpMode(prev => !prev);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: checkIsAdmin(user),
    isLoading,
    isInitialized,
    error,
    isSignUpMode,
    toggleAuthMode,
    signIn: async () => {
      // Check if satellite is initialized before attempting sign-in
      if (!isInitialized) {
        const err = new Error('Satellite not initialized yet. Please wait a moment and try again.');
        setError(err);
        throw err;
      }
      
      try {
        setIsLoading(true);
        setError(undefined);
        // Internet Identity authentication with custom domain option
        await signIn({ 
          internet_identity: {
            options: {
              domain: "id.ai"
            }
          } 
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Sign-in with Internet Identity failed'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    signOut: async () => {
      try {
        setIsLoading(true);
        await signOut();
        setUser(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Sign-out failed'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
  }), [user, isLoading, isInitialized, error, isSignUpMode]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
