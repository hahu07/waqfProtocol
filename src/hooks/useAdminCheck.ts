import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export const useAdminCheck = () => {
  const { user, isAdmin: authIsAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Don't redirect if we've already redirected or if still loading
    if (hasRedirected.current || authLoading) return;

    if (!user) {
      // Redirect unauthenticated users to auth page
      hasRedirected.current = true;
      router.push('/auth');
    } else if (!authIsAdmin) {
      // In development mode, check for role override before redirecting
      const devModeRole = typeof window !== 'undefined' && process.env.NODE_ENV === 'development'
        ? localStorage.getItem('devModeRole') as 'admin' | 'user' | null
        : null;
      
      // Only redirect if not overridden to admin in dev mode
      if (devModeRole !== 'admin') {
        hasRedirected.current = true;
        router.push('/waqf');
      }
    }
  }, [user, authIsAdmin, authLoading, router]);

  return { 
    isAdmin: authIsAdmin, 
    isLoading: authLoading 
  };
};
