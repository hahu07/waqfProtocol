// src/components/admin/settingManager.tsx
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import type { AdminManagerProps } from './types';
import { useState } from 'react';
import { FaCog, FaBell, FaSave, FaGlobe, FaLock, FaDatabase } from 'react-icons/fa';

export function SettingManager({ 
  showHeader = true,
  headerTitle = 'System Settings'
}: AdminManagerProps) {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState({
    siteName: 'Waqf Protocol',
    siteDescription: 'Blockchain-based charitable giving platform',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    enableNotifications: true,
    emailNotifications: true,
    pushNotifications: false,
    maxUploadSize: '10',
    language: 'en',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Here you would typically save to backend
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Admin privileges required to view this page</p>
        </div>
      </div>
    );
  }

  const settingsSections = [
    {
      title: 'General',
      icon: <FaCog className="w-5 h-5" />,
      gradient: 'linear-gradient(135deg, #2563eb, #9333ea)',
      fields: [
        { 
          key: 'siteName', 
          label: 'Site Name', 
          type: 'text',
          description: 'The name of your platform'
        },
        { 
          key: 'siteDescription', 
          label: 'Site Description', 
          type: 'textarea',
          description: 'A brief description of your platform'
        },
        { 
          key: 'maintenanceMode', 
          label: 'Maintenance Mode', 
          type: 'toggle',
          description: 'Put the site in maintenance mode'
        },
      ]
    },
    {
      title: 'Access Control',
      icon: <FaLock className="w-5 h-5" />,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      fields: [
        { 
          key: 'allowRegistration', 
          label: 'Allow Registration', 
          type: 'toggle',
          description: 'Allow new users to register'
        },
        { 
          key: 'requireEmailVerification', 
          label: 'Require Email Verification', 
          type: 'toggle',
          description: 'Require email verification for new accounts'
        },
      ]
    },
    {
      title: 'Notifications',
      icon: <FaBell className="w-5 h-5" />,
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      fields: [
        { 
          key: 'enableNotifications', 
          label: 'Enable Notifications', 
          type: 'toggle',
          description: 'Enable system notifications'
        },
        { 
          key: 'emailNotifications', 
          label: 'Email Notifications', 
          type: 'toggle',
          description: 'Send notifications via email'
        },
        { 
          key: 'pushNotifications', 
          label: 'Push Notifications', 
          type: 'toggle',
          description: 'Send browser push notifications'
        },
      ]
    },
    {
      title: 'Storage',
      icon: <FaDatabase className="w-5 h-5" />,
      gradient: 'linear-gradient(135deg, #9333ea, #4338ca)',
      fields: [
        { 
          key: 'maxUploadSize', 
          label: 'Max Upload Size (MB)', 
          type: 'number',
          description: 'Maximum file upload size in megabytes'
        },
      ]
    },
    {
      title: 'Localization',
      icon: <FaGlobe className="w-5 h-5" />,
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      fields: [
        { 
          key: 'language', 
          label: 'Default Language', 
          type: 'select',
          options: [
            { value: 'en', label: 'English' },
            { value: 'ar', label: 'Arabic' },
            { value: 'fr', label: 'French' },
          ],
          description: 'Default platform language'
        },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {headerTitle}
            </h1>
            <p className="text-gray-600">Configure platform settings and preferences</p>
          </div>
          <button
            onClick={handleSave}
            className={`px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 ${
              saved ? 'bg-green-600' : ''
            }`}
            style={!saved ? { background: 'linear-gradient(to right, #2563eb, #9333ea)' } : {}}
          >
            <FaSave className="w-4 h-4" />
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <div key={section.title} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Section Header */}
            <div 
              className="p-6 text-white"
              style={{ background: section.gradient }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
            </div>

            {/* Section Fields */}
            <div className="p-6 space-y-6">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <p className="text-xs text-gray-500">{field.description}</p>
                    </div>
                    {field.type === 'toggle' && (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[field.key as keyof typeof settings] as boolean}
                          onChange={(e) => setSettings({ ...settings, [field.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    )}
                  </div>
                  
                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={settings[field.key as keyof typeof settings] as string}
                      onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <textarea
                      value={settings[field.key as keyof typeof settings] as string}
                      onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={settings[field.key as keyof typeof settings] as string}
                      onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                  )}
                  
                  {field.type === 'select' && 'options' in field && field.options && (
                    <select
                      value={settings[field.key as keyof typeof settings] as string}
                      onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Configuration Note</h3>
            <p className="text-sm text-blue-800">
              Changes to settings will take effect immediately. Some settings may require users to log out and log back in to see the changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
