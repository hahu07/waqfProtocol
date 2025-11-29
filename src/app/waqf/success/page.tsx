'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Portfolio } from '@/types/portfolio';
import { calculatePortfolioStats } from '@/lib/portfolio-utils';

export default function WaqfSuccessPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [waqfId, setWaqfId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedPortfolio = sessionStorage.getItem('portfolio');
      const savedWaqfId = sessionStorage.getItem('waqfId');
      
      if (savedPortfolio) {
        const parsed = JSON.parse(savedPortfolio) as Portfolio;
        setPortfolio(parsed);
        setWaqfId(savedWaqfId);
      } else {
        // No portfolio found, redirect back
        router.push('/waqf/build-portfolio');
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      router.push('/waqf/build-portfolio');
    }
  }, [router]);

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-6xl">⏳</div>
      </div>
    );
  }

  const stats = calculatePortfolioStats(portfolio);
  const deedReference = (portfolio as any).deedReference || 'N/A';
  const donorName = (portfolio as any).donorDetails?.fullName || 'Anonymous Donor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-6xl shadow-2xl animate-bounce">
            ✓
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Waqf Created Successfully!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            جَزَاكَ ٱللَّٰهُ خَيْرًا (Jazakallahu Khairan) - May Allah reward you with goodness
          </p>
          <p className="text-gray-600">
            Your perpetual charitable endowment has been established
          </p>
        </div>

        {/* Deed Reference */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Waqf Deed Reference</h2>
              <p className="text-sm text-gray-600">Keep this reference number for your records</p>
            </div>
            <div className="text-5xl">📜</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Reference Number</p>
            <p className="text-3xl font-black text-gray-900 font-mono">{deedReference}</p>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Waqf Portfolio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Total Portfolio</p>
              <p className="text-3xl font-black text-gray-900">${stats.totalAmount.toLocaleString()}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-2">Causes Supported</p>
              <p className="text-3xl font-black text-green-600">{stats.causeCount}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border-2 border-purple-200">
              <p className="text-sm text-gray-600 mb-2">Diversity Score</p>
              <p className="text-3xl font-black text-purple-600">{Math.round(stats.diversificationScore)}/100</p>
            </div>
          </div>

          {/* Waqf Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Waqf Type Allocation</h3>
            
            {stats.permanentPercentage > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <p className="font-semibold text-gray-900">Permanent Waqf</p>
                    <p className="text-sm text-gray-600">${stats.permanentAmount.toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-blue-600">{Math.round(stats.permanentPercentage)}%</span>
              </div>
            )}

            {stats.consumablePercentage > 0 && (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <p className="font-semibold text-gray-900">Consumable Waqf</p>
                    <p className="text-sm text-gray-600">${stats.consumableAmount.toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-green-600">{Math.round(stats.consumablePercentage)}%</span>
              </div>
            )}

            {stats.revolvingPercentage > 0 && (
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <p className="font-semibold text-gray-900">Revolving Waqf</p>
                    <p className="text-sm text-gray-600">${stats.revolvingAmount.toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-purple-600">{Math.round(stats.revolvingPercentage)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Beneficiary Causes */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Beneficiary Causes</h2>
          <div className="space-y-3">
            {portfolio.items.map(item => (
              <div key={item.cause.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.cause.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{item.cause.name}</p>
                    <p className="text-sm text-gray-600">{item.cause.category}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-900">${item.totalAmount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border-2 border-amber-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📋</span> What Happens Next?
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl flex-shrink-0">✓</span>
              <span>Your waqf deed has been digitally signed and recorded</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 text-xl flex-shrink-0">📧</span>
              <span>You will receive a confirmation email with your deed document</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 text-xl flex-shrink-0">📊</span>
              <span>Regular impact reports will be sent according to your preferences</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-600 text-xl flex-shrink-0">🌱</span>
              <span>Your charitable endowment is now active and generating ongoing rewards (sadaqah jariyah)</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => {
              // Clear session storage before creating another
              sessionStorage.removeItem('portfolio');
              sessionStorage.removeItem('waqfId');
              router.push('/waqf/build-portfolio');
            }}
            variant="outline"
            className="flex-1 py-6 text-lg border-2 border-gray-300 hover:border-gray-400"
          >
            ➕ Create Another Waqf
          </Button>
          <Button
            onClick={() => {
              // Clear session storage
              sessionStorage.removeItem('portfolio');
              sessionStorage.removeItem('waqfId');
              router.push('/waqf');
            }}
            className="flex-1 py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl"
          >
            Go to Dashboard →
          </Button>
        </div>

        {/* Donor Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Created by: {donorName}</p>
          <p className="mt-1">Date: {new Date((portfolio as any).signedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}
