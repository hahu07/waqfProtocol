import type { 
  IPaymentGateway, 
  PaymentIntent, 
  PaymentResult, 
  PaymentProvider,
  PaymentCurrency,
  PaymentMethod
} from '../types';
import { logger } from '@/lib/logger';

interface FlutterwaveResponse {
  status: string;
  transaction_id: string;
  amount: number;
  currency: PaymentCurrency;
  flw_ref: string;
  tx_ref: string;
}

interface FlutterwaveCheckoutFn {
  (config: Record<string, unknown>): void;
}

declare global {
  interface Window {
    FlutterwaveCheckout?: FlutterwaveCheckoutFn;
  }
}

/**
 * Flutterwave Payment Gateway
 * 
 * Supports: Cards, Mobile Money, Bank Transfers, USSD
 * Coverage: Nigeria, Kenya, Ghana, South Africa, Uganda, Tanzania, Rwanda
 * Best for: African markets with strong mobile money support
 * 
 * Setup:
 * 1. Create account at https://dashboard.flutterwave.com
 * 2. Get Public and Secret keys from Settings
 * 3. Set NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY in .env.local
 * 4. Set FLUTTERWAVE_SECRET_KEY in .env.local (server-side only)
 */
export class FlutterwaveGateway implements IPaymentGateway {
  readonly provider: PaymentProvider = 'flutterwave';
  readonly name: string = 'Flutterwave';
  readonly supportedCurrencies: PaymentCurrency[] = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR'];
  readonly supportedMethods: PaymentMethod[] = ['card', 'bank_transfer', 'mobile_money'];
  
  private publicKey: string;
  private initialized: boolean = false;
  private isDemoMode: boolean;

  constructor(publicKey: string) {
    this.publicKey = publicKey;
    this.isDemoMode = !publicKey || publicKey === 'demo' || publicKey.includes('test');
    
    if (this.isDemoMode) {
      logger.debug('⚠️ Flutterwave running in DEMO mode');
    }
  }

  async initialize(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Flutterwave can only be initialized in browser');
      }

      if (this.isDemoMode) {
        this.initialized = true;
        logger.debug('✅ Flutterwave initialized (Demo Mode)');
        return;
      }

      await this.loadFlutterwaveScript();
      this.initialized = true;
      logger.debug('✅ Flutterwave initialized (Production Mode)');
    } catch (error) {
      logger.error('❌ Flutterwave initialization failed', error instanceof Error ? error : { error });
      throw error;
    }
  }

  private loadFlutterwaveScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.FlutterwaveCheckout) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Flutterwave SDK'));
      
      document.head.appendChild(script);
    });
  }

  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('Flutterwave gateway not initialized');
    }

    try {
      logger.debug('💳 Processing Flutterwave payment:', {
        amount: intent.amount,
        currency: intent.currency,
        mode: this.isDemoMode ? 'DEMO' : 'PRODUCTION'
      });

      if (this.isDemoMode) {
        return this.simulatePayment(intent);
      }

      return await this.processProductionPayment(intent);

    } catch (error) {
      logger.error('Flutterwave payment error', error instanceof Error ? error : { error });
      return {
        success: false,
        transactionId: '',
        provider: 'flutterwave',
        status: 'failed',
        amount: intent.amount,
        currency: intent.currency,
        error: error instanceof Error ? error.message : 'Flutterwave payment failed',
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
        transactionId: `FLW-DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        provider: 'flutterwave',
        status: 'completed',
        amount: intent.amount,
        currency: intent.currency,
        timestamp: new Date().toISOString(),
        metadata: {
          demo: true,
          provider: 'flutterwave',
          paymentMethod: 'card' // or 'mobile_money', 'bank_transfer'
        }
      };
    } else {
      return {
        success: false,
        transactionId: '',
        provider: 'flutterwave',
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
      const FlutterwaveCheckout = window.FlutterwaveCheckout;
      
      if (!FlutterwaveCheckout) {
        reject(new Error('Flutterwave SDK not loaded'));
        return;
      }

      // Configuration for Flutterwave modal
      const config = {
        public_key: this.publicKey,
        tx_ref: `FLW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: intent.amount,
        currency: intent.currency,
        payment_options: 'card,mobilemoney,ussd,banktransfer',
        customer: {
          email: intent.customerEmail || 'customer@example.com',
          name: intent.metadata?.donorName || 'Customer',
        },
        customizations: {
          title: intent.description || 'Waqf Protocol',
          description: 'Payment for charitable donation',
          logo: 'https://yourlogo.com/logo.png', // Add your logo URL
        },
        callback: (response: FlutterwaveResponse) => {
          logger.debug('Flutterwave callback', { response });
          
          if (response.status === 'successful') {
            resolve({
              success: true,
              transactionId: response.transaction_id,
              provider: 'flutterwave',
              status: 'completed',
              amount: response.amount,
              currency: response.currency,
              timestamp: new Date().toISOString(),
              metadata: {
                flw_ref: response.flw_ref,
                tx_ref: response.tx_ref
              }
            });
          } else {
            resolve({
              success: false,
              transactionId: response.transaction_id || '',
              provider: 'flutterwave',
              status: 'failed',
              amount: response.amount || 0,
              currency: (response.currency as PaymentCurrency) || 'USD',
              error: 'Payment was not successful',
              timestamp: new Date().toISOString()
            });
          }
        },
        onclose: () => {
          resolve({
            success: false,
            transactionId: '',
            provider: 'flutterwave',
            status: 'cancelled',
            amount: intent.amount,
            currency: intent.currency,
            error: 'Payment cancelled by user',
            timestamp: new Date().toISOString()
          });
        },
      };

      // Open Flutterwave payment modal
      FlutterwaveCheckout(config);
    });
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    if (!this.initialized) {
      throw new Error('Flutterwave gateway not initialized');
    }

    if (this.isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        transactionId,
        provider: 'flutterwave',
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
      throw new Error('Flutterwave gateway not initialized');
    }

    try {
      logger.debug('💰 Processing Flutterwave refund:', { transactionId, amount });
      
      if (this.isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          transactionId: `REFUND-${transactionId}`,
          provider: 'flutterwave',
          status: 'refunded',
          amount: amount || 0,
          currency: 'USD',
          timestamp: new Date().toISOString()
        };
      }

      // Production refund requires backend API call
      throw new Error('Production refund requires backend implementation');
      
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        provider: 'flutterwave',
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
      throw new Error('Flutterwave gateway not initialized');
    }

    if (this.isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        transactionId,
        provider: 'flutterwave',
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
