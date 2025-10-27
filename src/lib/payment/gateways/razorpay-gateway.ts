import type { 
  IPaymentGateway, 
  PaymentIntent, 
  PaymentResult, 
  PaymentProvider,
  PaymentCurrency,
  PaymentMethod
} from '../types';
import { logger } from '@/lib/logger';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: {
    description: string;
    metadata?: {
      payment_id?: string;
    };
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: (response: RazorpayErrorResponse) => void): void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

/**
 * Razorpay Payment Gateway
 * 
 * Supports: Cards, UPI, NetBanking, Wallets, EMI
 * Coverage: India (primary market)
 * Best for: Indian market with strong local payment method support
 * 
 * Setup:
 * 1. Create account at https://dashboard.razorpay.com
 * 2. Get Key ID and Key Secret from Settings > API Keys
 * 3. Set NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local
 * 4. Set RAZORPAY_KEY_SECRET in .env.local (server-side only)
 */
export class RazorpayGateway implements IPaymentGateway {
  readonly provider: PaymentProvider = 'razorpay';
  readonly name: string = 'Razorpay';
  readonly supportedCurrencies: PaymentCurrency[] = ['INR'];
  readonly supportedMethods: PaymentMethod[] = ['card', 'bank_transfer', 'wallet'];
  
  private keyId: string;
  private initialized: boolean = false;
  private isDemoMode: boolean;

  constructor(keyId: string) {
    this.keyId = keyId;
    this.isDemoMode = !keyId || keyId === 'demo' || keyId.startsWith('rzp_test_');
    
    if (this.isDemoMode) {
      logger.debug('⚠️ Razorpay running in DEMO mode');
    }
  }

  async initialize(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Razorpay can only be initialized in browser');
      }

      if (this.isDemoMode) {
        this.initialized = true;
        logger.debug('✅ Razorpay initialized (Demo Mode)');
        return;
      }

      await this.loadRazorpayScript();
      this.initialized = true;
      logger.debug('✅ Razorpay initialized (Production Mode)');
    } catch (error) {
      logger.error('❌ Razorpay initialization failed', error instanceof Error ? error : { error });
      throw error;
    }
  }

  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      
      document.head.appendChild(script);
    });
  }

  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('Razorpay gateway not initialized');
    }

    try {
      logger.debug('💳 Processing Razorpay payment:', {
        amount: intent.amount,
        currency: intent.currency,
        mode: this.isDemoMode ? 'DEMO' : 'PRODUCTION'
      });

      if (this.isDemoMode) {
        return this.simulatePayment(intent);
      }

      return await this.processProductionPayment(intent);

    } catch (error) {
      logger.error('Razorpay payment error', error instanceof Error ? error : { error });
      return {
        success: false,
        transactionId: '',
        provider: 'razorpay',
        status: 'failed',
        amount: intent.amount,
        currency: intent.currency,
        error: error instanceof Error ? error.message : 'Razorpay payment failed',
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
        transactionId: `RAZORPAY-DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        provider: 'razorpay',
        status: 'completed',
        amount: intent.amount,
        currency: intent.currency,
        timestamp: new Date().toISOString(),
        metadata: {
          demo: true,
          provider: 'razorpay',
          paymentMethod: 'upi'
        }
      };
    } else {
      return {
        success: false,
        transactionId: '',
        provider: 'razorpay',
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
      const Razorpay = window.Razorpay;
      
      if (!Razorpay) {
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }

      // Razorpay expects amount in paise (smallest currency unit)
      // For INR: 1 INR = 100 paise
      const amountInPaise = Math.round(intent.amount * 100);

      const options = {
        key: this.keyId,
        amount: amountInPaise,
        currency: intent.currency,
        name: 'Waqf Protocol',
        description: intent.description || 'Charitable donation',
        image: 'https://yourlogo.com/logo.png', // Add your logo URL
        order_id: '', // This should be generated by your backend
        handler: (response: RazorpayResponse) => {
          logger.debug('Razorpay callback', { response });
          
          resolve({
            success: true,
            transactionId: response.razorpay_payment_id,
            provider: 'razorpay',
            status: 'completed',
            amount: intent.amount,
            currency: intent.currency,
            timestamp: new Date().toISOString(),
            metadata: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }
          });
        },
        prefill: {
          name: intent.metadata?.donorName || '',
          email: intent.customerEmail || '',
          contact: ''
        },
        notes: {
          purpose: intent.metadata?.purpose || 'donation',
          waqfId: intent.metadata?.waqfId || '',
          waqfName: intent.metadata?.waqfName || ''
        },
        theme: {
          color: '#2563eb' // Your brand color
        },
        modal: {
          ondismiss: () => {
            resolve({
              success: false,
              transactionId: '',
              provider: 'razorpay',
              status: 'cancelled',
              amount: intent.amount,
              currency: intent.currency,
              error: 'Payment cancelled by user',
              timestamp: new Date().toISOString()
            });
          }
        }
      };

      const rzp = new Razorpay(options);
      
      rzp.on('payment.failed', (response: RazorpayErrorResponse) => {
        logger.error('Razorpay payment failed', { response });
        resolve({
          success: false,
          transactionId: response.error.metadata?.payment_id || '',
          provider: 'razorpay',
          status: 'failed',
          amount: intent.amount,
          currency: intent.currency,
          error: response.error.description || 'Payment failed',
          timestamp: new Date().toISOString()
        });
      });

      rzp.open();
    });
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('Razorpay gateway not initialized');
    }

    if (this.isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        transactionId,
        provider: 'razorpay',
        status: 'completed',
        amount: 0,
        currency: 'INR',
        timestamp: new Date().toISOString()
      };
    }

    throw new Error('Production verification requires backend implementation');
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('Razorpay gateway not initialized');
    }

    try {
      logger.debug('💰 Processing Razorpay refund:', { transactionId, amount });
      
      if (this.isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          transactionId: `REFUND-${transactionId}`,
          provider: 'razorpay',
          status: 'refunded',
          amount: amount || 0,
          currency: 'INR',
          timestamp: new Date().toISOString()
        };
      }

      // Production refund requires backend API call
      throw new Error('Production refund requires backend implementation');
      
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        provider: 'razorpay',
        status: 'failed',
        amount: amount || 0,
        currency: 'INR',
        error: error instanceof Error ? error.message : 'Refund failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getPaymentDetails(transactionId: string): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('Razorpay gateway not initialized');
    }

    if (this.isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        transactionId,
        provider: 'razorpay',
        status: 'completed',
        amount: 0,
        currency: 'INR',
        timestamp: new Date().toISOString()
      };
    }

    throw new Error('Production payment details require backend implementation');
  }

  isAvailable(): boolean {
    return this.initialized;
  }
}
