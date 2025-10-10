import React, { useState } from 'react';
import { formatCurrency } from '@/utils/formatters';
import type { Waqf } from '@/types/waqfs';

interface FinancialReportProps {
  waqf: Waqf;
}

export const FinancialReport = React.memo(({ waqf }: FinancialReportProps) => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const metrics = [
    {
      key: 'totalDonations',
      label: 'Total Donations',
      value: formatCurrency(waqf.data.financial.totalDonations),
      icon: '💰',
      gradient: 'from-white to-blue-50',
      bgColor: 'bg-gradient-to-br from-blue-600 to-indigo-600',
      textColor: 'text-white'
    },
    {
      key: 'totalDistributed',
      label: 'Total Distributed',
      value: formatCurrency(waqf.data.financial.totalDistributed),
      icon: '📤',
      gradient: 'from-white to-purple-50',
      bgColor: 'bg-gradient-to-br from-purple-600 to-indigo-700',
      textColor: 'text-white'
    },
    {
      key: 'currentBalance',
      label: 'Current Balance',
      value: formatCurrency(waqf.data.financial.currentBalance),
      icon: '💵',
      gradient: 'from-white to-indigo-50',
      bgColor: 'bg-gradient-to-br from-indigo-600 to-purple-600',
      textColor: 'text-white'
    },
    {
      key: 'investmentReturn',
      label: 'Investment Return',
      value: formatCurrency(waqf.data.financial.totalInvestmentReturn),
      icon: '📈',
      gradient: 'from-white to-blue-50',
      bgColor: 'bg-gradient-to-br from-blue-700 to-purple-700',
      textColor: 'text-white'
    },
    {
      key: 'completionRate',
      label: 'Completion Rate',
      value: waqf.data.financial.impactMetrics?.completionRate 
        ? `${Math.round(waqf.data.financial.impactMetrics.completionRate * 100)}%` 
        : 'N/A',
      icon: '✅',
      gradient: 'from-white to-purple-50',
      bgColor: 'bg-gradient-to-br from-purple-700 to-blue-700',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-lg font-bold text-white sm:text-xl">Financial Summary</h4>
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
      <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-xl border border-purple-100">
        <div className="flex items-center gap-2 text-sm text-purple-900 dark:text-purple-800">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">All amounts are in USD. Data updated in real-time.</span>
        </div>
      </div>
    </div>
  );
});
