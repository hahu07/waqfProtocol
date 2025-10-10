import React, { useState } from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Waqf } from '@/types/waqfs';

interface ContributionsReportProps {
  waqf: Waqf;
}

export const ContributionsReport = React.memo(({ waqf }: ContributionsReportProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-gradient-to-br from-blue-600 to-indigo-600',
          text: 'text-white/90',
          icon: '✅',
          textColor: 'text-white'
        };
      case 'pending':
        return {
          bg: 'bg-gradient-to-br from-purple-600 to-blue-700',
          text: 'text-white/90',
          icon: '⏳',
          textColor: 'text-white'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-indigo-600 to-purple-700',
          text: 'text-white/90',
          icon: '❌',
          textColor: 'text-white'
        };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-lg font-bold text-white sm:text-xl">Contribution History</h4>
      </div>
      
      <div className="space-y-3">
        {waqf.data.waqfAssets.length > 0 ? (
          waqf.data.waqfAssets.map((donation, index) => {
            const statusStyle = getStatusColor(donation.status);
            return (
              <div
                key={index}
                className={`relative overflow-hidden rounded-xl ${statusStyle.bg} shadow-xl hover:shadow-2xl transition-all duration-300 ${
                  activeIndex === index ? 'scale-95' : 'hover:scale-105 hover:-translate-y-1'
                }`}
                onTouchStart={() => setActiveIndex(index)}
                onTouchEnd={() => setActiveIndex(null)}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{statusStyle.icon}</span>
                        <p className="text-xs font-medium text-white/90 uppercase tracking-wide">
                          {formatDate(donation.date)}
                        </p>
                      </div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl sm:text-3xl font-bold ${statusStyle.textColor}`}>
                        {formatCurrency(donation.amount)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative corner elements */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
                <div className="absolute -left-4 -top-4 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600 font-medium">No contributions yet</p>
            <p className="text-gray-500 text-sm mt-1">Your contribution history will appear here</p>
          </div>
        )}
      </div>
      
      {/* Summary footer */}
      {waqf.data.waqfAssets.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-800">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Total Contributions: {waqf.data.waqfAssets.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
