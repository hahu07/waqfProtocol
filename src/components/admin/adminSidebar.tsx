// components/admin/AdminSidebar.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

// src/components/admin/adminSidebar.tsx
const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/causes', label: 'Cause Management', icon: '🎯' },
  { href: '/admin/waqf', label: 'Waqf Management', icon: '💰' },
  { href: '/admin/reports', label: 'Reports', icon: '📈' },
  { href: '/admin/users', label: 'User Management', icon: '👥' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' }
];

interface AdminSidebarProps {
  className?: string;
}

export const AdminSidebar = ({ className }: AdminSidebarProps) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setMobileOpen(true)}
        className="sm:hidden fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-40"
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div className={`fixed sm:static inset-0 z-50 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'} transition-transform duration-300 ease-in-out ${className}`}>
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r dark:border-gray-700 min-h-screen">
          <div className="flex justify-end p-2 sm:hidden">
            <button 
              onClick={() => setMobileOpen(false)}
              className="p-2 text-gray-500"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium min-h-[48px] transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};