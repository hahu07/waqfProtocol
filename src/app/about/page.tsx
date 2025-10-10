'use client';

import { Card } from '@/components/ui/card';
import { MdSecurity, MdVisibility, MdAllInclusive, MdShield, MdShowChart, MdFavorite, MdHome } from 'react-icons/md';
import { FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg,  #2563eb, #9333ea, #4338ca 100%)', 
          color: 'white',
          paddingTop: '6rem',
          paddingBottom: '8rem'
        }}
      >
        {/* Decorative background elements */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)', borderRadius: '50%' }} />
        </div>

        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            {/* Icon */}
            <div 
              className="animate-float"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '5rem', 
                height: '5rem', 
                backgroundColor: 'rgba(255,255,255,0.15)', 
                borderRadius: '1rem', 
                marginBottom: '1.5rem',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
            >
              <MdHome style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
            </div>

            {/* Heading */}
            <h1 
              className="animate-slideInUp"
              style={{ 
                fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                fontWeight: 'bold', 
                marginBottom: '1.5rem',
                lineHeight: 1.1
              }}
            >
              About Waqf Protocol
            </h1>

            {/* Subtitle */}
            <p 
              className="animate-fadeInUp"
              style={{ 
                fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', 
                maxWidth: '48rem', 
                margin: '0 auto 3rem',
                opacity: 0.95,
                lineHeight: 1.6,
                animationDelay: '200ms'
              }}
            >
              Cash Waqf investment model: preserving capital while generating perpetual returns for charitable causes
            </p>

            {/* CTA Buttons */}
            <div 
              className="animate-fadeInUp"
              style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: '1rem', 
                justifyContent: 'center', 
                marginBottom: '4rem',
                flexWrap: 'wrap',
                animationDelay: '300ms'
              }}
            >
              <a
                href="/auth?mode=signup"
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem 2rem', 
                  backgroundColor: 'white', 
                  color: '#667eea', 
                  borderRadius: '0.5rem', 
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  textDecoration: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                }}
              >
                Get Started Free
                <svg style={{ marginLeft: '0.5rem', width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="#mission"
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem 2rem', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  borderRadius: '0.5rem', 
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  textDecoration: 'none',
                  border: '2px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <svg style={{ marginRight: '0.5rem', width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div 
              className="animate-fadeInUp"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '2rem', 
                maxWidth: '56rem', 
                margin: '0 auto',
                animationDelay: '400ms'
              }}
            >
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                  $2.5M+
                </div>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                  Investment Capital
                </div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                  100%
                </div>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                  Shariah-Compliant
                </div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                  ∞
                </div>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                  Perpetual Returns
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Waqf Protocol revolutionizes charitable giving through the cash Waqf model - your donations 
              are never spent directly on charity. Instead, they&apos;re invested in carefully vetted,
              Shariah-compliant income-generating ventures on the blockchain.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Only the profits and returns from these investments are distributed to your chosen causes, 
              ensuring your original contribution remains intact forever while generating perpetual 
              charitable impact across generations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
              <div className="text-4xl font-bold text-blue-700 mb-2">∞</div>
              <div className="text-sm font-semibold text-gray-800">Capital Preserved</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm">
              <div className="text-4xl font-bold text-purple-700 mb-2">100%</div>
              <div className="text-sm font-semibold text-gray-800">Shariah-Compliant</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
              <div className="text-4xl font-bold text-green-700 mb-2">50+</div>
              <div className="text-sm font-semibold text-gray-800">Investment Ventures</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-sm">
              <div className="text-4xl font-bold text-orange-700 mb-2">24/7</div>
              <div className="text-sm font-semibold text-gray-800">Profit Distribution</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ backgroundColor: '#f3f4f6', padding: '4rem 1rem' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Waqf Protocol?
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              We combine traditional Islamic cash Waqf principles with modern blockchain technology and Shariah-compliant investments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card 
              className="p-8 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animation: 'fadeInUp 0.6s ease-out', animationFillMode: 'both' }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #2563eb, #9333ea)' }}>
                <MdAllInclusive className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Perpetual Capital
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Your donations are never spent - they&apos;re invested in Shariah-compliant ventures,
                preserving capital while generating ongoing returns for charity.
              </p>
            </Card>

            <Card 
              className="p-8 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animation: 'fadeInUp 0.6s ease-out', animationFillMode: 'both' }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #9333ea, #4338ca)' }}>
                <MdShield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Shariah-Compliant
              </h3>
              <p className="text-gray-700 leading-relaxed">
                All investments follow strict Islamic financial principles, ensuring ethical 
                and halal wealth generation for charitable purposes.
              </p>
            </Card>

            <Card 
              className="p-8 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animation: 'fadeInUp 0.6s ease-out', animationFillMode: 'both' }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #2563eb, #4338ca)' }}>
                <MdVisibility className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Full Transparency
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Track every investment, return, and charitable distribution in real-time 
                through blockchain transparency and immutable records.
              </p>
            </Card>

            <Card 
              className="p-8 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animation: 'fadeInUp 0.6s ease-out', animationFillMode: 'both' }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #9333ea, #2563eb)' }}>
                <MdShowChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Allocation
              </h3>
              <p className="text-gray-700 leading-relaxed">
                AI-powered investment selection and profit distribution across your chosen 
                charitable causes based on performance and impact metrics.
              </p>
            </Card>

            <Card 
              className="p-8 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animation: 'fadeInUp 0.6s ease-out', animationFillMode: 'both' }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #4338ca, #9333ea)' }}>
                <MdFavorite className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Global Impact
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Support causes worldwide through diversified investment returns, 
                creating sustainable impact that grows over time.
              </p>
            </Card>

            <Card 
              className="p-8 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animation: 'fadeInUp 0.6s ease-out', animationFillMode: 'both' }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #2563eb, #9333ea, #4338ca)' }}>
                <MdSecurity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Blockchain Secured
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Built on Internet Computer Protocol with smart contracts ensuring 
                tamper-proof investment tracking and automated profit distribution.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)', padding: '4rem 1rem' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ background: 'linear-gradient(135deg, #2563eb, #9333ea)' }}>
                <MdAllInclusive className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Perpetual Endowment</h3>
              <p className="text-gray-700 leading-relaxed">
                Following the traditional Waqf principle of preserving capital forever 
                while using only the profits for charitable purposes.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ background: 'linear-gradient(135deg, #9333ea, #4338ca)' }}>
                <MdShield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Shariah Compliance</h3>
              <p className="text-gray-700 leading-relaxed">
                All investments strictly adhere to Islamic financial principles, 
                ensuring ethical and halal wealth generation.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ background: 'linear-gradient(135deg, #2563eb, #4338ca)' }}>
                <MdVisibility className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Transparency</h3>
              <p className="text-gray-700 leading-relaxed">
                Complete visibility into every investment, return, and charitable distribution 
                through blockchain technology and real-time reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1rem' }}>
        <div 
          className="animate-fadeIn"
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            padding: '4rem 2rem', 
            textAlign: 'center', 
            borderRadius: '1rem',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
            animation: 'fadeIn 1s ease-out'
          }}
        >
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Start Your Perpetual Charity
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '42rem', margin: '0 auto 2rem', opacity: 0.95 }}>
            Join the revolution of sustainable giving - create a Waqf that generates charitable impact forever
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/auth?mode=signup"
              className="hover-scale"
              style={{ 
                padding: '1rem 2rem', 
                backgroundColor: 'white', 
                color: '#667eea', 
                borderRadius: '0.75rem', 
                fontWeight: '600', 
                textDecoration: 'none', 
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Create Account
            </a>
            <a
              href="/auth?mode=signin"
              className="hover-scale"
              style={{ 
                padding: '1rem 2rem', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                border: '2px solid white', 
                borderRadius: '0.75rem', 
                fontWeight: '600', 
                textDecoration: 'none', 
                display: 'inline-block',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
            >
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'linear-gradient(135deg, #1e293b 0%, #4c1d95 100%)', color: 'white', padding: '3rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <MdHome className="w-8 h-8" />
              <span className="text-xl font-bold">Waqf Protocol</span>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="hover:text-blue-400 transition-colors" aria-label="GitHub">
                <FaGithub className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors" aria-label="Twitter">
                <FaTwitter className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors" aria-label="Discord">
                <FaDiscord className="w-6 h-6" />
              </a>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2025 Waqf Protocol. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
