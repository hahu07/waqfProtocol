'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { WaqfFeatures } from '@/components/home/WaqfFeatures';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Testimonials } from '@/components/home/Testimonials';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Redirect based on user role
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/waqf');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return <div className="bg-gray-50" />;
  }

  return (
    <>
      <HeroSection />
      
      {/* Features Section */}
      <WaqfFeatures />
      
      {/* How It Works section */}
      <HowItWorks />
      
      {/* Testimonials Section */}
      <Testimonials />
    </>
  );
}
