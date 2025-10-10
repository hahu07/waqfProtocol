'use client';

export function Testimonials() {
  const testimonials = [
    {
      quote: "The easiest way to create sustainable charity with crypto assets. The platform is intuitive and the impact is measurable.",
      author: "Ibrahim Al-Rashid",
      role: "Waqf Donor",
      avatar: "👨‍💼",
      rating: 5,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      quote: "Transparent tracking gives me confidence in where my donation goes. I can see the real-time impact of my contributions.",
      author: "Aisha Muhammad",
      role: "Beneficiary",
      avatar: "👩‍💻",
      rating: 5,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      quote: "Blockchain technology ensures complete transparency and security. This is the future of charitable giving.",
      author: "Omar Hassan",
      role: "Community Leader",
      avatar: "👨‍🏫",
      rating: 5,
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section id="testimonials" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Animation */}
        <div className="text-center mb-16 animate-fadeInUp">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-700">
              <span className="mr-2">💬</span>
              Testimonials
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent inline-block animate-fadeInUp" style={{ animationDelay: '100ms' }}>
              What Our Community
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
              Says About Us
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            Join thousands of donors making a lasting impact
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative animate-fadeInUp"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              {/* Testimonial Card */}
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                {/* Quote Icon */}
                <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Rating Stars */}
                <div className="flex mb-4 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 flex-1 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center mt-auto pt-6 border-t border-gray-100">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-2xl mr-4 shadow-md`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                {/* Hover Gradient Border Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
          <p className="text-gray-600 mb-6 text-lg">
            Ready to make your impact?
          </p>
          <a
            href="/auth?mode=signup"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
          >
            Start Your Waqf Today
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
