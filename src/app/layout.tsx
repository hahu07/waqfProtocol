// app/layout.tsx
'use client';

// CRITICAL: Import crypto shim FIRST to ensure global.crypto is available
import '@/lib/crypto-global-shim';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { Inter, Roboto_Mono } from 'next/font/google';
import { AuthProvider } from '../components/auth/AuthProvider';
import { WaqfProvider } from '../providers/WaqfProvider';
import { CryptoInitializer } from '@/components/CryptoInitializer';
import { Toaster } from 'react-hot-toast';
import { ScrollProgress } from '@/components/home/ScrollProgress';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { DevModeSwitcher } from '@/components/DevModeSwitcher';
import { GlobalErrorBoundary } from '@/components/error-boundary';
import { logger } from '@/lib/logger';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  
  // Hide header/footer in admin and waqf dashboards only
  const hideHeaderFooter = pathname?.startsWith('/admin') || 
                           pathname?.startsWith('/waqf');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={`${inter.className} font-sans antialiased text-gray-900`} suppressHydrationWarning>
        {/* Early crypto initialization script - loads before React hydration */}
        <Script
          src="/crypto-init.js"
          strategy="beforeInteractive"
          onLoad={() => logger.info('Crypto init script loaded')}
        />
        <CryptoInitializer />
        <GlobalErrorBoundary>
          <AuthProvider>
            <WaqfProvider>
              <div className="min-h-screen flex flex-col">
                <ScrollProgress />
                {!hideHeaderFooter && <Header />}
                <main className="flex-1">
                  {isHydrated ? children : <div id="root-loading">{children}</div>}
                </main>
                {!hideHeaderFooter && <Footer />}
                <DevModeSwitcher />
              </div>
            </WaqfProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}