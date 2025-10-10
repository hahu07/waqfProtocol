'use client';

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
  const [error, setError] = useState<Error | undefined>();
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const initialize = async () => {
      try {
        const satelliteId = process.env.NEXT_PUBLIC_JUNO_SATELLITE_ID;
        
        if (!satelliteId) {
          throw new Error('NEXT_PUBLIC_JUNO_SATELLITE_ID is not defined');
        }
        
        await initSatellite({
          satelliteId: satelliteId.replace(/"/g, ''), // Remove any quotes
          workers: { auth: true },
        });
        
        unsubscribe = onAuthStateChange((user) => setUser(user ?? null));
      } catch (err) {
        console.error('Failed to initialize Juno:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize satellite'));
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
    error,
    isSignUpMode,
    toggleAuthMode,
    signIn: async () => {
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
  }), [user, isLoading, error, isSignUpMode]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
