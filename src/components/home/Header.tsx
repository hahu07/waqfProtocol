'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Header() {
  const { isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const navLinks = [
    { href: '/causes', label: 'Causes' },
    { href: '/#features', label: 'Features' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/#testimonials', label: 'Testimonials' },
    { href: '/team', label: 'Team' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-lg' 
          : 'bg-white/95 backdrop-blur-sm shadow-sm'
      } border-b border-gray-200/50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div 
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                style={{ background: 'linear-gradient(to bottom right, #2563eb, #9333ea)' }}
              >
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span 
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                style={{
                  background: 'linear-gradient(to right, #2563eb, #9333ea)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                WaqfProtocol
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50" style={{ color: '#374151' }}>
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                  style={{ color: '#374151' }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth?mode=signin">
                  <Button variant="ghost" className="font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200" style={{ color: '#374151' }}>
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth?mode=signup">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md animate-fadeInUp">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            
            <div className="pt-4 space-y-2 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full font-medium text-gray-700 hover:text-blue-600 hover:border-blue-600" style={{ color: '#374151' }}>
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full font-medium text-gray-700 hover:text-red-600 hover:border-red-600"
                    style={{ color: '#374151' }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth?mode=signin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full font-medium text-gray-700 hover:text-blue-600 hover:border-blue-600" style={{ color: '#374151' }}>
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                      style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
