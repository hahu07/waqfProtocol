'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { CauseMarketplace } from '@/components/portfolio/CauseMarketplace';
import { PortfolioSidebar } from '@/components/portfolio/PortfolioSidebar';
import { listActiveCauses } from '@/lib/cause-utils';
import { createEmptyPortfolio, addCauseToPortfolio, removeCauseFromPortfolio } from '@/lib/portfolio-utils';
import type { Portfolio } from '@/types/portfolio';
import type { Cause } from '@/types/waqfs';
import { logger } from '@/lib/logger';

export default function BuildPortfolioPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [portfolio, setPortfolio] = useState<Portfolio>(createEmptyPortfolio(user?.key));
  const [causes, setCauses] = useState<Cause[]>([]);
  const [isLoadingCauses, setIsLoadingCauses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load causes
  useEffect(() => {
    const loadCauses = async () => {
      if (!user) {
        console.log('BuildPortfolio - No user yet, skipping cause load');
        return;
      }

      try {
        console.log('BuildPortfolio - Loading causes for user:', user.key);
        setIsLoadingCauses(true);
        const activeCauses = await listActiveCauses();
        console.log('BuildPortfolio - Loaded causes:', activeCauses);
        setCauses(activeCauses);
        logger.info('Loaded causes for portfolio builder', { count: activeCauses.length });
      } catch (err) {
        console.error('BuildPortfolio - Error loading causes:', err);
        logger.error('Error loading causes', err);
        setError('Failed to load causes. Please refresh the page.');
      } finally {
        setIsLoadingCauses(false);
      }
    };

    loadCauses();
  }, [user]);

  // Handle cause selection
  const handleCauseToggle = (cause: Cause) => {
    const isSelected = portfolio.items.some(item => item.cause.id === cause.id);

    if (isSelected) {
      setPortfolio(removeCauseFromPortfolio(portfolio, cause.id));
      logger.info('Removed cause from portfolio', { causeId: cause.id, causeName: cause.name });
    } else {
      setPortfolio(addCauseToPortfolio(portfolio, cause));
      logger.info('Added cause to portfolio', { causeId: cause.id, causeName: cause.name });
    }
  };

  // Handle total amount update
  const handleUpdateTotalAmount = (amount: number) => {
    setPortfolio(prev => ({
      ...prev,
      totalAmount: amount
    }));
    logger.info('Updated total portfolio amount', { amount });
  };

  // Handle continue to allocation
  const handleContinue = () => {
    if (portfolio.items.length === 0) {
      alert('⚠️ Please select at least one cause to continue.');
      return;
    }

    if (portfolio.totalAmount < 100) {
      alert('⚠️ Please enter a total amount of at least $100 to continue.');
      return;
    }

    // Deduplicate portfolio items before saving (defensive programming)
    const seenIds = new Set<string>();
    const deduplicatedItems = portfolio.items.filter(item => {
      if (seenIds.has(item.cause.id)) {
        console.warn('Duplicate cause detected in portfolio, removing:', item.cause.id, item.cause.name);
        return false;
      }
      seenIds.add(item.cause.id);
      return true;
    });
    
    const cleanedPortfolio = {
      ...portfolio,
      items: deduplicatedItems
    };
    
    logger.info('Saving portfolio to session storage', { 
      causeCount: cleanedPortfolio.items.length,
      totalAmount: cleanedPortfolio.totalAmount,
      causeIds: cleanedPortfolio.items.map(item => item.cause.id)
    });

    // Save portfolio to session storage
    sessionStorage.setItem('portfolio', JSON.stringify(cleanedPortfolio));
    
    // Navigate to allocation designer
    router.push('/waqf/design-allocation');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to build your charitable portfolio.
          </p>
          <Button
            onClick={() => router.push('/waqf')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                🎯
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                  Build Your Portfolio
                </h1>
                <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">1</span>
                  Select causes that matter to you
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/waqf')}
              variant="outline"
              className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
            >
              ← Back
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Cause Marketplace - 8 columns */}
          <div className="lg:col-span-8">
            <CauseMarketplace
              causes={causes}
              selectedCauseIds={portfolio.items.map(item => item.cause.id)}
              onCauseToggle={handleCauseToggle}
              isLoading={isLoadingCauses}
              error={error}
            />
          </div>

          {/* Portfolio Sidebar - 4 columns */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <PortfolioSidebar
                portfolio={portfolio}
                onRemoveCause={(causeId) => setPortfolio(removeCauseFromPortfolio(portfolio, causeId))}
                onUpdateTotalAmount={handleUpdateTotalAmount}
                onContinue={handleContinue}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {portfolio.items.length} {portfolio.items.length === 1 ? 'cause' : 'causes'} selected
            </span>
            <Button
              onClick={handleContinue}
              disabled={portfolio.items.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Continue →
            </Button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '25%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

