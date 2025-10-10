"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FaMosque, FaChartLine, FaHandHoldingHeart, FaHome, FaSignOutAlt, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

export function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/waqf', label: 'My Waqf', icon: FaMosque },
    { href: '/waqf/reports', label: 'Reports', icon: FaChartLine },
    { href: '/waqf/impact', label: 'Impact', icon: FaHandHoldingHeart },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/waqf" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}>
                <FaMosque className="text-white w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Waqf Portal</h1>
                <p className="text-xs text-gray-500 font-medium">Your Endowment Dashboard</p>
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
                    style={isActive ? { background: 'linear-gradient(to right, #2563eb, #9333ea)'  } : {}}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-t-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User Profile */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                <FaUserCircle className="w-6 h-6 text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {user.key.slice(0, 8)}...
                </span>
              </div>

              {/* Home Button */}
              <button 
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-white rounded-lg transition-all duration-200 hover:shadow-md"
                style={{
                  background: 'transparent',
                  border: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #9333ea';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                onClick={() => router.push('/')}
              >
                <FaHome className="w-4 h-4" />
                Home
              </button>

              {/* Sign Out Button - Desktop */}
              <button
                onClick={signOut}
                style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' } }
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-white rounded-lg transition-all duration-200 hover:shadow-md border border-red-200 hover:bg-red-600 hover:border-transparent"
              >
                <FaSignOutAlt className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="space-y-2 px-2">
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
                  style={isActive ? { background: 'linear-gradient(to right, #2563eb, #9333ea)' } : {}}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  {item.label}
                </Link>
              );
            })}
            
            {user && (
              <>
                <div className="h-px bg-gray-200 my-2" />
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 w-full"
                >
                  <FaHome className="w-5 h-5 text-gray-600" />
                  Home
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 w-full"
                  style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
