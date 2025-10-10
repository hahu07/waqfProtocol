'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [typedText, setTypedText] = useState('');
  const fullText = 'Through Waqf';

  // Add inline styles for animations with higher visibility
  const animationStyles = `
    @keyframes floatAnimation {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-40px); }
    }
    @keyframes moveXAnimation {
      0%, 100% { transform: translateX(0px); }
      50% { transform: translateX(60px); }
    }
    @keyframes moveYAnimation {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-50px); }
    }
    @keyframes rotateAnimation {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pulseAnimation {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes particleRiseAnimation {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 0.8; }
      100% { transform: translateY(-120px) translateX(30px); opacity: 0; }
    }
    @keyframes gridMoveAnimation {
      0% { transform: translate(0, 0); }
      100% { transform: translate(40px, 40px); }
    }
    @keyframes wiggleAnimation {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(10deg); }
      50% { transform: rotate(-10deg); }
      75% { transform: rotate(5deg); }
    }
    @keyframes orbitAnimation {
      0% { transform: rotate(0deg) translateX(80px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
    }
  `;
  
  const stats = [
    { value: '$2.5M+', label: 'Total Endowment', icon: '💰' },
    { value: '1,200+', label: 'Active Donors', icon: '👥' },
    { value: '50+', label: 'Global Causes', icon: '🌍' },
  ];

  // Typing effect
  useEffect(() => {
    setIsVisible(true);
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Inject animation styles */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden min-h-screen flex items-center" style={{ background: 'linear-gradient(to bottom right, #2563eb, #9333ea, #4338ca)' }}>
      {/* Continuous animated background elements */}
      <div className="absolute inset-0 opacity-60">
        {/* Large floating orbs - enhanced visibility */}
        <div 
          className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"
          style={{
            animation: 'floatAnimation 6s ease-in-out infinite',
            opacity: 0.7
          }}
        />
        <div 
          className="absolute top-40 right-10 w-[450px] h-[450px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"
          style={{
            animation: 'floatAnimation 8s ease-in-out infinite',
            animationDelay: '2s',
            animationDirection: 'reverse',
            opacity: 0.7
          }}
        />
        <div 
          className="absolute bottom-20 left-1/2 w-[400px] h-[400px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl"
          style={{
            animation: 'floatAnimation 10s ease-in-out infinite',
            animationDelay: '4s',
            opacity: 0.7
          }}
        />
        <div 
          className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl"
          style={{
            animation: 'moveXAnimation 12s ease-in-out infinite, moveYAnimation 8s ease-in-out infinite',
            animationDelay: '1s',
            opacity: 0.7
          }}
        />
        <div 
          className="absolute bottom-1/3 right-1/4 w-[320px] h-[320px] bg-green-400 rounded-full mix-blend-multiply filter blur-3xl"
          style={{
            animation: 'orbitAnimation 20s linear infinite',
            animationDelay: '3s',
            opacity: 0.7
          }}
        />
        <div 
          className="absolute top-1/3 right-1/3 w-[280px] h-[280px] bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl"
          style={{
            animation: 'pulseAnimation 4s ease-in-out infinite, floatAnimation 7s ease-in-out infinite',
            animationDelay: '5s',
            opacity: 0.8
          }}
        />
        <div 
          className="absolute bottom-1/2 left-1/3 w-[250px] h-[250px] bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl"
          style={{
            animation: 'floatAnimation 5s ease-in-out infinite, moveXAnimation 9s ease-in-out infinite',
            animationDelay: '6s',
            opacity: 0.7
          }}
        />
      </div>
      
      {/* Continuously floating geometric shapes - more visible */}
      <div className="absolute inset-0 pointer-events-none opacity-80">
        <div 
          className="absolute top-1/4 left-1/3 w-6 h-6 bg-white/40 rounded"
          style={{ animation: 'floatAnimation 6s ease-in-out infinite, rotateAnimation 20s linear infinite' }}
        />
        <div 
          className="absolute top-1/3 right-1/4 w-5 h-5 bg-yellow-300/50 rounded-full"
          style={{ animation: 'moveXAnimation 8s ease-in-out infinite, moveYAnimation 6s ease-in-out infinite', animationDelay: '2s' }}
        />
        <div 
          className="absolute bottom-1/4 left-1/4 w-7 h-7 bg-pink-300/45 rounded"
          style={{ animation: 'rotateAnimation 15s linear infinite, floatAnimation 5s ease-in-out infinite', animationDelay: '1s' }}
        />
        <div 
          className="absolute top-2/3 right-1/3 w-8 h-2 bg-white/30 rounded-full"
          style={{ animation: 'wiggleAnimation 4s ease-in-out infinite, moveXAnimation 10s ease-in-out infinite', animationDelay: '3s' }}
        />
        <div 
          className="absolute top-1/5 right-1/5 w-4 h-4 bg-blue-300/50 rounded-full"
          style={{ animation: 'pulseAnimation 2s ease-in-out infinite, floatAnimation 4s ease-in-out infinite', animationDelay: '4s' }}
        />
        <div 
          className="absolute bottom-1/3 right-2/3 w-5 h-5 bg-purple-300/45 rounded-full"
          style={{ animation: 'wiggleAnimation 3s ease-in-out infinite, moveYAnimation 7s ease-in-out infinite', animationDelay: '5s' }}
        />
        <div 
          className="absolute top-3/4 left-1/5 w-2 h-12 bg-gradient-to-b from-white/40 to-transparent rounded-full"
          style={{ animation: 'pulseAnimation 4s ease-in-out infinite, floatAnimation 6s ease-in-out infinite', animationDelay: '6s' }}
        />
        <div 
          className="absolute top-1/6 left-2/3 w-12 h-2 bg-gradient-to-r from-cyan-300/50 to-transparent rounded-full"
          style={{ animation: 'pulseAnimation 7s ease-in-out infinite, moveXAnimation 12s ease-in-out infinite', animationDelay: '7s' }}
        />
      </div>
      
      {/* Animated particles - more visible */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/60 rounded-full shadow-lg shadow-white/50"
            style={{
              left: `${10 + (i * 4.5) % 80}%`,
              top: `${15 + (i * 3.7) % 70}%`,
              animation: `particleRiseAnimation ${6 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Animated grid overlay - more visible */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            animation: 'gridMoveAnimation 20s linear infinite'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          {/* Badge with enhanced animation */}
          <div className={`inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8 transition-all duration-1000 transform ${
            isVisible ? 'animate-fadeInUp opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <span className="mr-2 animate-pulse">🌟</span>
            <span className="relative overflow-hidden">
              <span className="inline-block animate-slideInRight" style={{ animationDelay: '0.3s' }}>Blockchain-Powered Perpetual Charity</span>
            </span>
          </div>

          {/* Main Heading with staggered animation */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className={`inline-block transition-all duration-1000 transform ${
              isVisible ? 'animate-fadeInUp opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ animationDelay: '0.2s' }}>
              Sustainable Giving
            </span>
            <br />
            <span 
              className={`inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent transition-all duration-1000 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                background: 'linear-gradient(to right, #fbbf24, #d97706)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animationDelay: '0.4s'
              }}
            >
      
              {typedText}
              <span className={`inline-block w-1 h-12 md:h-16 lg:h-20 ml-2 ${
                typedText.length < fullText.length ? 'animate-pulse' : 'opacity-0'
              }`} style={{ backgroundColor: '#fbbf24' }} />
            </span>
          </h1>

          {/* Subtitle with delayed animation */}
          <p className={`text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed transition-all duration-1000 transform ${
            isVisible ? 'animate-fadeInUp opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ animationDelay: '0.6s' }}>
            <span className="inline-block animate-slideInUp" style={{ animationDelay: '0.8s' }}>Create perpetual charity that keeps giving across generations.</span><br className="sm:hidden" />
            <span className="inline-block animate-slideInUp" style={{ animationDelay: '1s' }}>Secure, transparent, and impactful.</span>
          </p>

          {/* CTA Buttons with staggered entrance */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ animationDelay: '1.2s' }}>
            <Link
              href="/auth?mode=signup"
              className={`group inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:shadow-3xl hover:scale-105 animate-slideInUp`}
              style={{ animationDelay: '1.4s' }}
            >
              <span className="mr-2 transition-transform duration-300 group-hover:scale-110">✨</span>
              Get Started Free
              <svg className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="#how-it-works"
              className={`group inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-500 border-2 border-white/30 hover:border-white/50 transform hover:-translate-y-2 hover:shadow-2xl animate-slideInUp`}
              style={{ animationDelay: '1.6s' }}
            >
              <svg className="mr-2 w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              See How It Works
            </Link>
          </div>

          {/* Stats with individual animations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transition-all duration-1000 transform hover:bg-white/15 hover:border-white/30 hover:-translate-y-2 hover:shadow-2xl cursor-pointer ${
                  isVisible ? 'animate-fadeInUp opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ animationDelay: `${1.8 + index * 0.2}s` }}
              >
                <div className="text-2xl mb-2 group-hover:animate-bounce transition-all duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-blue-100 font-medium group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave decoration with animation */}
      <div className="absolute bottom-0 left-0 right-0 animate-slideInUp" style={{ animationDelay: '2.5s' }}>
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#F9FAFB" />
        </svg>
      </div>
    </section>
    </>
  );
}
