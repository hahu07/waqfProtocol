import type { 
  IPaymentGateway, 
  PaymentIntent, 
  PaymentResult, 
  PaymentProvider,
  PaymentCurrency,
  PaymentMethod
} from '../types';
import { logger } from '@/lib/logger';

interface PaystackResponse {
  status: string;
  reference: string;
  trans?: string;
  trxref?: string;
  amount?: number;
  currency?: PaymentCurrency;
}

interface PaystackHandler {
  openIframe(): void;
}

interface PaystackPopFn {
  setup(config: Record<string, unknown>): PaystackHandler;
}

declare global {
  interface Window {
    PaystackPop?: PaystackPopFn;
  }
}

/**
 * Paystack Payment Gateway
 * 
 * Supports: Cards, Bank Transfers, Mobile Money, USSD
 * Coverage: Nigeria, Ghana, South Africa, Kenya
 * Best for: Nigerian market (strongest presence)
 * 
 * Setup:
 * 1. Create account at https://dashboard.paystack.com
 * 2. Get Public and Secret keys from Settings > API Keys
 * 3. Set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in .env.local
 * 4. Set PAYSTACK_SECRET_KEY in .env.local (server-side only)
 */
export class PaystackGateway implements IPaymentGateway {
  readonly provider: PaymentProvider = 'paystack';
  readonly name: string = 'Paystack';
  readonly supportedCurrencies: PaymentCurrency[] = ['NGN', 'GHS', 'ZAR', 'USD'];
  readonly supportedMethods: PaymentMethod[] = ['card', 'bank_transfer', 'mobile_money'];
  
  private publicKey: string;
  private initialized: boolean = false;
  private isDemoMode: boolean;

  constructor(publicKey: string) {
    this.publicKey = publicKey;
    this.isDemoMode = !publicKey || publicKey === 'demo' || publicKey.includes('_test_');
    
    if (this.isDemoMode) {
      logger.debug('⚠️ Paystack running in DEMO mode');
    }
  }

  async initialize(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Paystack can only be initialized in browser');
      }

      if (this.isDemoMode) {
        this.initialized = true;
        logger.debug('✅ Paystack initialized (Demo Mode)');
        return;
      }

      await this.loadPaystackScript();
      this.initialized = true;
      logger.debug('✅ Paystack initialized (Production Mode)');
    } catch (error) {
      logger.error('❌ Paystack initialization failed', error instanceof Error ? error : { error });
      throw error;
    }
  }

  private loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack SDK'));
      
      document.head.appendChild(script);
    });
  }

  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('Paystack gateway not initialized');
    }

    try {
      logger.debug('💳 Processing Paystack payment:', {
        amount: intent.amount,
        currency: intent.currency,
        mode: this.isDemoMode ? 'DEMO' : 'PRODUCTION'
      });

      if (this.isDemoMode) {
        return this.simulatePayment(intent);
      }

      return await this.processProductionPayment(intent);

    } catch (error) {
      logger.error('Paystack payment error', error instanceof Error ? error : { error });
      return {
        success: false,
        transactionId: '',
        provider: 'paystack',
        status: 'failed',
        amount: intent.amount,
        currency: intent.currency,
        error: error instanceof Error ? error.message : 'Paystack payment failed',
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
        transactionId: `PAYSTACK-DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        provider: 'paystack',
        status: 'completed',
        amount: intent.amount,
        currency: intent.currency,
        timestamp: new Date().toISOString(),
        metadata: {
          demo: true,
          provider: 'paystack',
          paymentMethod: 'card'
        }
      };
    } else {
      return {
        success: false,
        transactionId: '',
        provider: 'paystack',
        status: 'failed',
        amount: intent.amount,
        currency: intent.currency,
        error: 'Payment declined (Demo simulation)',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async processProductionPayment(intent: PaymentIntent): Promise<PaymentResult> {
    return new Promise((resolve, reject) => {
      const PaystackPop = window.PaystackPop;
      
      if (!PaystackPop) {
        reject(new Error('Paystack SDK not loaded'));
        return;
      }

      // Paystack expects amount in kobo (smallest currency unit)
      // For Naira: 1 NGN = 100 kobo
      // For other currencies, multiply by 100
      const amountInMinorUnits = Math.round(intent.amount * 100);

      const handler = PaystackPop.setup({
        key: this.publicKey,
        email: intent.customerEmail || 'customer@example.com',
        amount: amountInMinorUnits,
        currency: intent.currency,
        ref: `PAYSTACK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Purpose',
              variable_name: 'purpose',
              value: intent.metadata?.purpose || 'donation'
            },
            {
              display_name: 'Donor Name',
              variable_name: 'donor_name',
              value: intent.metadata?.donorName || 'Anonymous'
            }
          ]
        },
        callback: (response: PaystackResponse) => {
          logger.debug('Paystack callback', { response });
          
          if (response.status === 'success') {
            resolve({
              success: true,
              transactionId: response.reference,
              provider: 'paystack',
              status: 'completed',
              amount: intent.amount,
              currency: intent.currency,
              timestamp: new Date().toISOString(),
              metadata: {
                paystack_ref: response.reference,
                trans: response.trans,
                trxref: response.trxref
              }
            });
          } else {
            resolve({
              success: false,
              transactionId: response.reference || '',
              provider: 'paystack',
              status: 'failed',
              amount: intent.amount,
              currency: intent.currency,
              error: 'Payment was not successful',
              timestamp: new Date().toISOString()
            });
          }
        },
        onClose: () => {
          resolve({
            success: false,
            transactionId: '',
            provider: 'paystack',
            status: 'cancelled',
            amount: intent.amount,
            currency: intent.currency,
            error: 'Payment cancelled by user',
            timestamp: new Date().toISOString()
          });
        },
      });

      // Open Paystack payment modal
      handler.openIframe();
    });
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('Paystack gateway not initialized');
    }

    if (this.isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        transactionId,
        provider: 'paystack',
        status: 'completed',
        amount: 0,
        currency: 'NGN',
        timestamp: new Date().toISOString()
      };
    }

    throw new Error('Production verification requires backend implementation');
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('Paystack gateway not initialized');
    }

    try {
      logger.debug('💰 Processing Paystack refund:', { transactionId, amount });
      
      if (this.isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          transactionId: `REFUND-${transactionId}`,
          provider: 'paystack',
          status: 'refunded',
          amount: amount || 0,
          currency: 'NGN',
          timestamp: new Date().toISOString()
        };
      }

      // Production refund requires backend API call
      throw new Error('Production refund requires backend implementation');
      
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        provider: 'paystack',
        status: 'failed',
        amount: amount || 0,
        currency: 'NGN',
        error: error instanceof Error ? error.message : 'Refund failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getPaymentDetails(transactionId: string): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('Paystack gateway not initialized');
    }

    if (this.isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        transactionId,
        provider: 'paystack',
        status: 'completed',
        amount: 0,
        currency: 'NGN',
        timestamp: new Date().toISOString()
      };
    }

    throw new Error('Production payment details require backend implementation');
  }

  isAvailable(): boolean {
    return this.initialized;
  }
}
