// Stripe Payment Gateway Implementation

import type { IPaymentGateway, PaymentIntent, PaymentResult, PaymentCurrency, PaymentMethod } from '../types';
import type { Stripe } from '@stripe/stripe-js';
import { logger } from '@/lib/logger';

export class StripeGateway implements IPaymentGateway {
  readonly provider = 'stripe' as const;
  readonly name = 'Stripe';
  readonly supportedCurrencies: PaymentCurrency[] = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'INR', 'SAR', 'AED'];
  readonly supportedMethods: PaymentMethod[] = ['card', 'bank_transfer', 'wallet'];

  private publicKey: string;
  private secretKey?: string;
  private stripe: Stripe | null = null;
  private initialized = false;

  constructor(publicKey: string, secretKey?: string) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load Stripe.js dynamically
      if (typeof window !== 'undefined') {
        const stripeModule = await import('@stripe/stripe-js');
        this.stripe = await stripeModule.loadStripe(this.publicKey);
        this.initialized = true;
        logger.debug('✅ Stripe initialized');
      }
    } catch (error) {
      logger.error('❌ Failed to initialize Stripe', error instanceof Error ? error : { error });
      throw error;
    }
  }

  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // In production, this would call your backend API
      // which then calls Stripe API with the secret key
      const response = await fetch('/api/payment/stripe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intent)
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();

      // Confirm payment with Stripe.js
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }
      
      const result = await this.stripe.confirmCardPayment(data.clientSecret, {
        payment_method: data.paymentMethodId
      });

      if (result.error) {
        return {
          success: false,
          transactionId: data.paymentIntentId,
          provider: this.provider,
          status: 'failed',
          amount: intent.amount,
          currency: intent.currency,
          error: result.error.message,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        transactionId: result.paymentIntent.id,
        provider: this.provider,
        status: 'completed',
        amount: intent.amount,
        currency: intent.currency,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Stripe payment error', error instanceof Error ? error : { error });
      throw error;
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`/api/payment/stripe/verify/${transactionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      return await response.json();
    } catch (error) {
      logger.error('Stripe verification error', error instanceof Error ? error : { error });
      throw error;
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payment/stripe/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, amount })
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      return await response.json();
    } catch (error) {
      logger.error('Stripe refund error', error instanceof Error ? error : { error });
      throw error;
    }
  }

  async getPaymentDetails(transactionId: string): Promise<PaymentResult> {
    return this.verifyPayment(transactionId);
  }

  isAvailable(): boolean {
    return this.initialized && !!this.publicKey;
  }
}
