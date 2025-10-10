'use client';

import { AuthSection } from '@/components/auth/AuthSection';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function AuthPageContent() {
  const { isSignUpMode, toggleAuthMode } = useAuth();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  useEffect(() => {
    if (mode === 'signup' && !isSignUpMode) toggleAuthMode();
    else if (mode === 'signin' && isSignUpMode) toggleAuthMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
              <span className="text-3xl">🔒</span>
              {/* <MdSecurity className="w-9 h-9" style={{ color: 'white' }} /> */}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span 
                className="inline-block"
                style={{
                  background: 'linear-gradient(to right, #2563eb, #1d4ed8, #9333ea)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Waqf Protocol
              </span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              Secure, anonymous authentication powered by Internet Identity
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Auth Card */}
            <Card className="p-6 sm:p-8 lg:p-10 space-y-6 backdrop-blur-sm bg-white/90 border border-gray-200/50 shadow-xl">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {isSignUpMode ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-600">
                  {isSignUpMode 
                    ? 'Get started with secure authentication' 
                    : 'Sign in to access your account'}
                </p>
              </div>

              <AuthSection />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/95 text-gray-600 font-medium">
                    {isSignUpMode ? 'Already have an account?' : 'New to Waqf Protocol?'}
                  </span>
                </div>
              </div>

              <button 
                onClick={toggleAuthMode} 
                className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
              >
                {isSignUpMode ? 'Sign In Instead' : 'Create New Account'}
              </button>
            </Card>

            {/* Info Card */}
            <div className="space-y-6">
              <Card className="p-6 sm:p-8 backdrop-blur-sm bg-gradient-to-br from-blue-50/90 to-purple-50/90 border border-gray-200/50 shadow-xl">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                  Why Internet Identity?
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🔒</span>
                      {/* <MdSecurity className="w-6 h-6" style={{ color: 'white' }} /> */}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Anonymous Authentication</h4>
                      <p className="text-sm text-gray-600">
                        No personal information required. Your identity remains completely private and secure on the blockchain.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🔐</span>
                      {/* <MdLock className="w-6 h-6" style={{ color: 'white' }} /> */}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Blockchain Security</h4>
                      <p className="text-sm text-gray-600">
                        Built on Internet Computer Protocol with cryptographic security. No passwords to remember or lose.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Trust Indicators */}
              <Card className="p-6 backdrop-blur-sm bg-white/80 border border-gray-200/50 shadow-lg">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    {/* <MdCheckCircle className="w-4 h-4" style={{ color: '#059669' }} /> */}
                    <span>No passwords</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Decentralized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Privacy-first</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
