'use client';

import Link from 'next/link';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Create Your Waqf',
      description: 'Set up your perpetual endowment in minutes using our intuitive platform.',
      icon: '📝',
      gradient: 'linear-gradient(135deg, #2563eb, #9333ea)'
    },
    {
      number: '02',
      title: 'Fund with Crypto',
      description: 'Securely deposit your cryptocurrency assets to the blockchain-based waqf.',
      icon: '💰',
      gradient: 'linear-gradient(135deg, #9333ea, #4338ca)'
    },
    {
      number: '03',
      title: 'Set Preferences',
      description: 'Choose your allocation strategy and select causes that matter to you.',
      icon: '⚙️',
      gradient: 'linear-gradient(135deg, #4338ca, #2563eb)'
    },
    {
      number: '04',
      title: 'Track Impact',
      description: 'Monitor your waqf performance and see your charitable impact in real-time.',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #2563eb, #9333ea, #4338ca)'
    }
  ];

  return (
    <section id="how-it-works" className="py-16" style={{ background: 'linear-gradient(to bottom, #eff6ff, #312e81)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 animate-fadeInUp">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-700">
              <span className="mr-2">🚀</span>
              Simple Process
            </span>
          </div>
          
          <h2 className="text-2xl md:text-2xl font-bold mb-6">
         <span 
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block animate-fadeInUp"
              style={{ 
                animationDelay: '200ms',
                background: 'linear-gradient(to right, #2563eb, #9333ea)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              How It Works
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            Create your sustainable charity in four simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Connecting Line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-transparent -ml-4" />
              )}

              {/* Step Card */}
              <div className="relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 min-h-[280px] flex flex-col">
                {/* Step Number Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg" style={{ background: step.gradient }}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-5xl mb-4">{step.icon}</div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 animate-fadeInUp">
          <Link 
            href="/auth?mode=signup"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </section>
  );
}
