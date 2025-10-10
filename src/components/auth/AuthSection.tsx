"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdSecurity } from 'react-icons/md';

export const AuthSection = () => {
  const { isAuthenticated, isAdmin, isLoading, signIn, signOut, user } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSigningInWithII, setIsSigningInWithII] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isHoveringII, setIsHoveringII] = useState(false);

  // Redirect after successful authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const redirectPath = isAdmin ? '/admin' : '/waqf';
      router.push(redirectPath);
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  const handleSignOut = async () => {
    setError(null);
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign out');
      setError(error);
      toast.error(error.message, {
        description: 'Please try again',
        action: {
          label: 'Retry',
          onClick: () => handleSignOut(),
        },
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSignInWithII = async () => {
    setError(null);
    setIsSigningInWithII(true);
    try {
      await signIn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign in with Internet Identity');
      setError(error);
      toast.error(error.message, {
        description: 'Please try again',
        action: {
          label: 'Retry',
          onClick: () => handleSignInWithII(),
        },
      });
    } finally {
      setIsSigningInWithII(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-blue-600" />
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}
      
      {isAuthenticated ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Authenticated as <span className="font-mono font-semibold">{user?.key}</span>
            </p>
          </div>
          <Button 
            onClick={handleSignOut} 
            className="w-full bg-gray-900 hover:bg-gray-800"
            variant="default"
            loading={isSigningOut}
          >
            {isSigningOut ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                <span>Signing out...</span>
              </div>
            ) : 'Sign Out'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Button 
            onClick={handleSignInWithII} 
            onMouseEnter={() => setIsHoveringII(true)}
            onMouseLeave={() => setIsHoveringII(false)}
            className="w-full shadow-lg hover:shadow-xl transition-all duration-200"
            style={{
              background: isHoveringII 
                ? 'linear-gradient(to right, #1d4ed8, #1e40af)' 
                : 'linear-gradient(to right, #2563eb, #1d4ed8)',
              color: 'blue',
              border: 'none',
              minHeight: '44px',
              padding: '12px 16px'
            }}
            variant={null as any}
            loading={isSigningInWithII}
          >
            {isSigningInWithII ? (
              <div className="flex items-center justify-center gap-2" style={{ color: 'white' }}>
                <Spinner className="h-4 w-4 text-white" />
                <span style={{ color: 'white' }}>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2" style={{ color: 'white' }}>
                <MdSecurity 
                  className="h-5 w-5" 
                  style={{ 
                    color: 'white',
                    fill: 'white',
                    opacity: 1,
                    display: 'inline-block'
                  }} 
                />
                <span className="font-semibold" style={{ color: 'white' }}>Continue with Internet Identity</span>
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
