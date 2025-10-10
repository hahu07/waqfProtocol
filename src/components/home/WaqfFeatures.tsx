'use client';

export function WaqfFeatures() {
  const features = [
    {
      title: 'Perpetual Charity',
      description: 'Your endowment continues giving forever, creating lasting impact across generations.',
      icon: '♾️',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Transparent Tracking',
      description: 'See exactly how your waqf is being used with real-time blockchain transparency.',
      icon: '👁️',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      title: 'Blockchain Secured',
      description: 'Tamper-proof records on the Internet Computer ensure complete security.',
      icon: '⛓️',
      gradient: 'from-indigo-500 to-blue-500',
      bgGradient: 'from-indigo-50 to-blue-50'
    },
    {
      title: 'Global Impact',
      description: 'Support causes worldwide with crypto, reaching communities everywhere.',
      icon: '🌍',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    }
  ];

  return (
    <section id="features" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 animate-fadeInUp">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-700">
              <span className="mr-2">✨</span>
              Our Features
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent inline-block animate-fadeInUp" style={{ animationDelay: '100ms' }}>
              Why Choose
            </span>
            <br />
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
              Waqf Protocol?
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            Discover the benefits of blockchain-powered perpetual charity
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Feature Card */}
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden h-full min-h-[240px] flex flex-col">
                {/* Background Gradient (subtle) */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                  {/* Icon with gradient background */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 transition-all duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed flex-1">
                    {feature.description}
                  </p>

                  {/* Hover indicator arrow */}
                  <div className="mt-4 flex items-center text-sm font-semibold text-gray-400 group-hover:text-gray-900 transition-colors duration-300">
                    <span>Learn more</span>
                    <svg 
                      className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
