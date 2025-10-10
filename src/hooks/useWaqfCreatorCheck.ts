import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * Hook to check if user is a waqf creator (non-admin user)
 * Redirects admin users to admin dashboard
 * Redirects unauthenticated users to auth page
 */
export const useWaqfCreatorCheck = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Don't redirect if we've already redirected or if still loading
    if (hasRedirected.current || authLoading) return;

    if (!user) {
      // Redirect unauthenticated users to auth page
      hasRedirected.current = true;
      router.push('/auth');
    } else if (isAdmin) {
      // In development mode, check for role override before redirecting
      const devModeRole = typeof window !== 'undefined' && process.env.NODE_ENV === 'development'
        ? localStorage.getItem('devModeRole') as 'admin' | 'user' | null
        : null;
      
      // Only redirect if not overridden to user in dev mode
      if (devModeRole !== 'user') {
        hasRedirected.current = true;
        router.push('/admin');
      }
    }
  }, [user, isAdmin, authLoading, router]);

  return { 
    isWaqfCreator: !isAdmin && !!user, 
    isLoading: authLoading 
  };
};
