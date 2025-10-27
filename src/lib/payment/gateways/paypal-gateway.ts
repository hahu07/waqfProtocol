import type { 
  IPaymentGateway, 
  PaymentIntent, 
  PaymentResult, 
  PaymentProvider,
  PaymentCurrency,
  PaymentMethod
} from '../types';
import { logger } from '@/lib/logger';

// PayPal SDK types
interface PayPalSDK {
  Buttons: (options: Record<string, unknown>) => {
    render: (container: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    paypal?: PayPalSDK;
  }
}

/**
 * PayPal Payment Gateway
 * 
 * Supports: Credit/Debit Cards, PayPal Balance, Bank Accounts
 * Coverage: Global (200+ countries)
 * 
 * Setup:
 * 1. Create account at https://developer.paypal.com
 * 2. Get Client ID and Secret from Dashboard
 * 3. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID in .env.local
 * 4. Set PAYPAL_CLIENT_SECRET in .env.local (server-side only)
 */
export class PayPalGateway implements IPaymentGateway {
  readonly provider: PaymentProvider = 'paypal';
  readonly name: string = 'PayPal';
  readonly supportedCurrencies: PaymentCurrency[] = ['USD', 'EUR', 'GBP'];
  readonly supportedMethods: PaymentMethod[] = ['card', 'wallet'];
  
  private clientId: string;
  private initialized: boolean = false;
  private paypal: PayPalSDK | null = null;
  private isDemoMode: boolean;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.isDemoMode = !clientId || clientId === 'demo' || clientId.startsWith('sb-');
    
    if (this.isDemoMode) {
      logger.debug('⚠️ PayPal running in DEMO mode');
    }
  }

  async initialize(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('PayPal can only be initialized in browser');
      }

      if (this.isDemoMode) {
        // Demo mode - no actual SDK needed
        this.initialized = true;
        logger.debug('✅ PayPal initialized (Demo Mode)');
        return;
      }

      await this.loadPayPalScript();
      this.initialized = true;
      logger.debug('✅ PayPal initialized (Production Mode)');
    } catch (error) {
      logger.error('❌ PayPal initialization failed', error instanceof Error ? error : { error });
      throw error;
    }
  }

  private loadPayPalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.paypal) {
        this.paypal = window.paypal;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&currency=USD&intent=capture`;
      script.async = true;
      script.setAttribute('data-sdk-integration-source', 'button-factory');
      
      script.onload = () => {
        this.paypal = window.paypal || null;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load PayPal SDK'));
      };
      
      document.head.appendChild(script);
    });
  }

  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('PayPal gateway not initialized');
    }

    try {
      logger.debug('💳 Processing PayPal payment:', {
        amount: intent.amount,
        currency: intent.currency,
        mode: this.isDemoMode ? 'DEMO' : 'PRODUCTION'
      });

      if (this.isDemoMode) {
        // Demo mode - simulate payment
        return this.simulatePayment(intent);
      }

      // Production mode - actual PayPal integration
      // Note: This requires server-side order creation
      // In production, you'd call your backend API here
      return await this.processProductionPayment(intent);

    } catch (error) {
      logger.error('PayPal payment error', error instanceof Error ? error : { error });
      return {
        success: false,
        transactionId: '',
        provider: 'paypal',
        status: 'failed',
        amount: intent.amount,
        currency: intent.currency,
        error: error instanceof Error ? error.message : 'PayPal payment failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async simulatePayment(intent: PaymentIntent): Promise<PaymentResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Demo: 95% success rate
    const success = Math.random() > 0.05;
    
    if (success) {
      return {
        success: true,
        transactionId: `PAYPAL-DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        provider: 'paypal',
        status: 'completed',
        amount: intent.amount,
        currency: intent.currency,
        timestamp: new Date().toISOString(),
        metadata: {
          demo: true,
          provider: 'paypal'
        }
      };
    } else {
      return {
        success: false,
        transactionId: '',
        provider: 'paypal',
        status: 'failed',
        amount: intent.amount,
        currency: intent.currency,
        error: 'Payment declined (Demo simulation)',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async processProductionPayment(intent: PaymentIntent): Promise<PaymentResult> {
    // In production, this would:
    // 1. Call your backend API to create PayPal order
    // 2. Get order ID from backend
    // 3. Use PayPal SDK to render payment buttons
    // 4. Capture payment when user approves
    // 5. Return transaction details
    
    throw new Error('Production PayPal integration requires backend implementation. See documentation.');
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('PayPal gateway not initialized');
    }

    if (this.isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        transactionId,
        provider: 'paypal',
        status: 'completed',
        amount: 0,
        currency: 'USD',
        timestamp: new Date().toISOString()
      };
    }

    throw new Error('Production verification requires backend implementation');
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('PayPal gateway not initialized');
    }

    try {
      logger.debug('💰 Processing PayPal refund:', { transactionId, amount });
      
      if (this.isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          transactionId: `REFUND-${transactionId}`,
          provider: 'paypal',
          status: 'refunded',
          amount: amount || 0,
          currency: 'USD',
          timestamp: new Date().toISOString()
        };
      }

      // Production refund would call backend API
      throw new Error('Production refund requires backend implementation');
      
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        provider: 'paypal',
        status: 'failed',
        amount: amount || 0,
        currency: 'USD',
        error: error instanceof Error ? error.message : 'Refund failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getPaymentDetails(transactionId: string): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('PayPal gateway not initialized');
    }

    if (this.isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        transactionId,
        provider: 'paypal',
        status: 'completed',
        amount: 0,
        currency: 'USD',
        timestamp: new Date().toISOString()
      };
    }

    throw new Error('Production payment details require backend implementation');
  }

  isAvailable(): boolean {
    return this.initialized;
  }
}
