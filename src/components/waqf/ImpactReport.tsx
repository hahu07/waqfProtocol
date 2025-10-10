import React, { useState } from 'react';
import type { Waqf } from '@/types/waqfs';

interface ImpactReportProps {
  waqf: Waqf;
}

export const ImpactReport = React.memo(({ waqf }: ImpactReportProps) => {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const impactMetrics = waqf.data.financial?.impactMetrics;
  
  const metrics = [
    {
      key: 'causes',
      label: 'Causes Supported',
      value: waqf.data.supportedCauses.length.toString(),
      icon: '🌱',
      gradient: 'from-white to-blue-50',
      bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      textColor: 'text-white'
    },
    {
      key: 'beneficiaries',
      label: 'Beneficiaries Reached',
      value: impactMetrics?.beneficiariesSupported?.toLocaleString() ?? 'N/A',
      icon: '👥',
      gradient: 'from-white to-purple-50',
      bgColor: 'bg-gradient-to-br from-purple-500 to-blue-600',
      textColor: 'text-white'
    },
    {
      key: 'projects',
      label: 'Projects Funded',
      value: impactMetrics?.projectsCompleted?.toString() ?? 'N/A',
      icon: '🎯',
      gradient: 'from-white to-indigo-50',
      bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-700',
      textColor: 'text-white'
    },
    {
      key: 'completion',
      label: 'Completion Rate',
      value: impactMetrics?.completionRate ? `${Math.round(impactMetrics.completionRate * 100)}%` : 'N/A',
      icon: '✨',
      gradient: 'from-white to-purple-50',
      bgColor: 'bg-gradient-to-br from-purple-600 to-blue-600',
      textColor: 'text-white'
    }
  ];
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h4 className="text-lg font-bold text-white sm:text-xl">Impact Summary</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {metrics.map((metric) => (
          <div 
            key={metric.key}
            className={`relative overflow-hidden rounded-xl ${metric.bgColor} shadow-xl hover:shadow-2xl transition-all duration-300 ${
              activeCard === metric.key ? 'scale-95' : 'hover:scale-105 hover:-translate-y-1'
            }`}
            onTouchStart={() => setActiveCard(metric.key)}
            onTouchEnd={() => setActiveCard(null)}
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{metric.icon}</span>
                  <p className="text-xs font-medium text-white/90 uppercase tracking-wide">
                    {metric.label}
                  </p>
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${metric.textColor}`}>
                {metric.value}
              </p>
            </div>
            
            {/* Decorative corner elements */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
            <div className="absolute -left-4 -top-4 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
          </div>
        ))}
      </div>
      
      {/* Summary footer */}
      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl border border-green-100">
        <div className="flex items-center gap-2 text-sm text-green-900 dark:text-green-800">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Tracking real-world impact across communities.</span>
        </div>
      </div>
    </div>
  );
});
