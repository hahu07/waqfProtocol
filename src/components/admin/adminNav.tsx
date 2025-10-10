// components/AdminNav.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaChartLine, FaBullseye, FaChartBar, FaUsers, FaCog, FaHome, FaBell, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

export const AdminNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: FaChartLine },
    { href: '/admin/causes', label: 'Causes', icon: FaBullseye },
    { href: '/admin/reports', label: 'Reports', icon: FaChartBar },
    { href: '/admin/users', label: 'Users', icon: FaUsers },
    { href: '/admin/settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed, #9333ea)' }}>
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Waqf Admin</h1>
                <p className="text-xs text-gray-500 font-medium">Management Portal</p>
              </div>
            </Link>
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes className="w-5 h-5 text-gray-700" /> : <FaBars className="w-5 h-5 text-gray-700" />}
            </button>
            
            {/* Desktop nav */}
            <div className="hidden md:flex gap-1 ml-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative group ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    style={isActive ? { background: 'linear-gradient(135deg, #2563eb, #7c3aed, #9333ea)' } : {}}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'}`} />
                    <span className="hidden lg:inline">{item.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-t-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <FaBell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm text-gray-800 font-medium">New waqf created</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <FaUserCircle className="w-6 h-6 text-gray-600" />
              <span className="hidden sm:inline text-sm font-medium text-gray-700">Admin</span>
            </button>

            {/* Home Button */}
            <button 
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-white rounded-lg transition-all duration-200 hover:shadow-md"
              style={{
                background: 'transparent',
                border: '1px solid #e5e7eb'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #9333ea)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
              onClick={() => router.push('/')}
            >
              <FaHome className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={isActive ? { background: 'linear-gradient(135deg, #2563eb, #7c3aed, #9333ea)' } : {}}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
