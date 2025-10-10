'use client';

import Link from 'next/link';

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Dr. Ahmad Hassan",
      role: "Founder & CEO",
      image: "/api/placeholder/400/400",
      bio: "Islamic finance expert with 15+ years experience in fintech and blockchain technology.",
      specialties: ["Islamic Finance", "Blockchain", "Strategy"],
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Sarah Al-Zahra",
      role: "CTO & Co-Founder", 
      image: "/api/placeholder/400/400",
      bio: "Full-stack developer and blockchain architect passionate about decentralized solutions.",
      specialties: ["Blockchain Development", "Web3", "Architecture"],
      linkedin: "#",
      github: "#"
    },
    {
      name: "Mohammed Ibrahim",
      role: "Head of Islamic Jurisprudence",
      image: "/api/placeholder/400/400", 
      bio: "Islamic scholar specializing in contemporary financial jurisprudence and Shariah compliance.",
      specialties: ["Shariah Compliance", "Islamic Law", "Ethics"],
      linkedin: "#"
    },
    {
      name: "Fatima Khan",
      role: "Head of Product",
      image: "/api/placeholder/400/400",
      bio: "Product strategist with expertise in user experience and charitable giving platforms.",
      specialties: ["Product Strategy", "UX Design", "Analytics"],
      linkedin: "#",
      dribbble: "#"
    },
    {
      name: "Omar Ali",
      role: "Lead Developer",
      image: "/api/placeholder/400/400",
      bio: "Senior software engineer with deep expertise in Internet Computer and modern web technologies.",
      specialties: ["ICP Development", "TypeScript", "React"],
      linkedin: "#",
      github: "#"
    },
    {
      name: "Aisha Rahman",
      role: "Head of Community",
      image: "/api/placeholder/400/400",
      bio: "Community builder and social impact advocate focused on connecting global Muslim communities.",
      specialties: ["Community Building", "Social Impact", "Outreach"],
      linkedin: "#",
      twitter: "#"
    }
  ];

  const advisors = [
    {
      name: "Sheikh Dr. Abdullah Al-Mansouri",
      role: "Shariah Advisory Board",
      expertise: "Islamic Banking & Finance",
      description: "Former advisor to multiple Islamic financial institutions"
    },
    {
      name: "Prof. Lisa Chen",
      role: "Technology Advisor", 
      expertise: "Blockchain & DeFi",
      description: "MIT professor and blockchain research pioneer"
    },
    {
      name: "Yusuf Ahmed",
      role: "Business Advisor",
      expertise: "Fintech & Scaling",
      description: "Former VP at leading fintech companies"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20"
        style={{
          background: 'linear-gradient(to right, #2563eb, #9333ea)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-4"
                 style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              Meet Our Team
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'white' }}>
              The People Behind Waqf Protocol
            </h1>
            <p className="text-xl text-blue-50 max-w-3xl mx-auto" style={{ color: '#dbeafe' }}>
              A passionate team of technologists, Islamic scholars, and social impact advocates working together to revolutionize charitable giving
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Team Introduction */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission-Driven Team</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            We're a diverse team united by our commitment to making Islamic charitable giving more accessible, 
            transparent, and impactful through cutting-edge technology.
          </p>
        </div>

        {/* Core Team */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Core Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
                {/* Profile Image */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-blue-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                {/* Name and Role */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold">{member.role}</p>
                </div>

                {/* Bio */}
                <p className="text-gray-600 text-sm text-center mb-4 leading-relaxed">
                  {member.bio}
                </p>

                {/* Specialties */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.specialties.map((specialty, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-3">
                  {member.linkedin && (
                    <a href={member.linkedin} className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                      </svg>
                    </a>
                  )}
                  {member.twitter && (
                    <a href={member.twitter} className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center hover:bg-sky-200 transition-colors">
                      <svg className="w-4 h-4 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                  )}
                  {member.dribbble && (
                    <a href={member.dribbble} className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors">
                      <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM10 1.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0110 1.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM1.453 10.01v-.26c.94.01 4.521.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM10 18.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advisory Board */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Advisory Board</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {advisors.map((advisor, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-purple-600">
                    {advisor.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{advisor.name}</h3>
                  <p className="text-purple-600 font-semibold text-sm mb-2">{advisor.role}</p>
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                      {advisor.expertise}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{advisor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Culture */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values & Culture</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We believe in creating an inclusive environment where innovation thrives and every team member can contribute to our mission.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Purpose-Driven</h3>
              <p className="text-sm text-gray-600">Every decision is guided by our mission to maximize charitable impact</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Collaborative</h3>
              <p className="text-sm text-gray-600">We believe in the power of teamwork and diverse perspectives</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Innovative</h3>
              <p className="text-sm text-gray-600">Always exploring new technologies to solve complex problems</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Integrity</h3>
              <p className="text-sm text-gray-600">Maintaining the highest ethical standards in everything we do</p>
            </div>
          </div>
        </div>

        {/* Join Our Team */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-10 text-center shadow-sm">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-4">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              We're Hiring
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Join Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              We're always looking for passionate individuals who share our vision of revolutionizing charitable giving through technology
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                href="/careers"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white'
                }}
              >
                <span style={{ color: 'white', fontWeight: '600' }}>View Open Positions</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="mailto:careers@waqfprotocol.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Get in Touch</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}