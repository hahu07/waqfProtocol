// Payment Gateway Manager - Handles multiple payment providers

import type { 
  PaymentProvider, 
  PaymentCurrency, 
  PaymentConfig, 
  PaymentIntent,
  PaymentResult,
  IPaymentGateway 
} from './types';
import { logger } from '../logger';

/**
 * Payment Gateway Manager
 * Handles routing payments to appropriate gateways based on:
 * - User selection
 * - Currency
 * - Geographic location
 * - Gateway availability
 */
export class PaymentGatewayManager {
  private gateways: Map<PaymentProvider, IPaymentGateway> = new Map();
  private configs: Map<PaymentProvider, PaymentConfig> = new Map();
  private fallbackOrder: PaymentProvider[] = [];

  /**
   * Register a payment gateway
   */
  registerGateway(gateway: IPaymentGateway, config: PaymentConfig): void {
    if (!config.enabled) {
      logger.payment.warn(`Gateway ${config.provider} is disabled`);
      return;
    }

    this.gateways.set(config.provider, gateway);
    this.configs.set(config.provider, config);
    
    logger.payment.info(`Registered payment gateway: ${config.provider}`);
  }

  /**
   * Get all available (enabled) gateways
   */
  getAvailableGateways(): PaymentProvider[] {
    // Return all registered gateways (they're registered only if enabled)
    return Array.from(this.gateways.keys());
  }

  /**
   * Get gateways that support a specific currency
   */
  getGatewaysForCurrency(currency: PaymentCurrency): PaymentProvider[] {
    return this.getAvailableGateways().filter(provider => {
      const config = this.configs.get(provider);
      return config?.supportedCurrencies.includes(currency) ?? false;
    });
  }

  /**
   * Get recommended gateway for a currency and optional country
   */
  getRecommendedGateway(currency: PaymentCurrency, country?: string): PaymentProvider | null {
    // Regional recommendations
    const regionalPreferences: Record<string, PaymentProvider[]> = {
      NG: ['paystack', 'flutterwave', 'stripe'], // Nigeria
      KE: ['flutterwave', 'paystack', 'stripe'], // Kenya
      GH: ['paystack', 'flutterwave', 'stripe'], // Ghana
      ZA: ['paystack', 'stripe', 'paypal'], // South Africa
      IN: ['razorpay', 'stripe', 'paypal'], // India
      SA: ['stripe', 'paypal'], // Saudi Arabia
      AE: ['stripe', 'paypal'], // UAE
      US: ['stripe', 'paypal', 'square'], // USA
      GB: ['stripe', 'paypal'], // UK
      default: ['stripe', 'paypal', 'flutterwave']
    };

    const preferences = country ? (regionalPreferences[country] || regionalPreferences.default) : regionalPreferences.default;
    
    // Find first available gateway that supports the currency
    for (const provider of preferences) {
      const config = this.configs.get(provider);
      const gateway = this.gateways.get(provider);
      
      if (gateway && config?.supportedCurrencies.includes(currency)) {
        return provider;
      }
    }

    // Fallback: return any available gateway that supports the currency
    const supportedGateways = this.getGatewaysForCurrency(currency);
    return supportedGateways[0] || null;
  }

  /**
   * Process a payment with automatic gateway selection
   */
  async processPayment(
    intent: PaymentIntent,
    preferredProvider?: PaymentProvider,
    country?: string
  ): Promise<PaymentResult> {
    let provider = preferredProvider;

    // If no provider specified, get recommended one
    if (!provider) {
      provider = this.getRecommendedGateway(intent.currency, country) ?? undefined;
    }

    if (!provider) {
      throw new Error(`No payment gateway available for currency ${intent.currency}`);
    }

    const gateway = this.gateways.get(provider);
    if (!gateway) {
      throw new Error(`Payment gateway ${provider} is not available`);
    }

    try {
      logger.payment.info(`Processing payment with ${provider}`, { provider, amount: intent.amount, currency: intent.currency });
      const result = await gateway.createPayment(intent);
      
      // Log successful transaction
      logger.payment.info('Payment successful', { provider, transactionId: result.transactionId, amount: result.amount });
      
      return result;
    } catch (error) {
      logger.payment.error(`Payment failed with ${provider}`, error as Error, { provider, amount: intent.amount });
      
      // Attempt fallback if available
      if (this.fallbackOrder.length > 0) {
        logger.payment.info('Attempting fallback payment...');
        return this.attemptFallbackPayment(intent, provider);
      }
      
      throw error;
    }
  }

  /**
   * Attempt payment with fallback gateways
   */
  private async attemptFallbackPayment(
    intent: PaymentIntent,
    failedProvider: PaymentProvider
  ): Promise<PaymentResult> {
    const availableGateways = this.getGatewaysForCurrency(intent.currency)
      .filter(p => p !== failedProvider);

    for (const provider of availableGateways) {
      try {
        const gateway = this.gateways.get(provider);
        if (gateway) {
          logger.payment.info(`Trying fallback gateway: ${provider}`);
          return await gateway.createPayment(intent);
        }
      } catch (error) {
        logger.payment.error(`Fallback failed with ${provider}`, error as Error);
        continue;
      }
    }

    throw new Error('All payment gateways failed');
  }

  /**
   * Refund a payment
   */
  async refundPayment(transactionId: string, provider: PaymentProvider, amount?: number): Promise<PaymentResult> {
    const gateway = this.gateways.get(provider);
    if (!gateway) {
      throw new Error(`Gateway ${provider} not found`);
    }
    return gateway.refundPayment(transactionId, amount);
  }

  /**
   * Get gateway configuration
   */
  getConfig(provider: PaymentProvider): PaymentConfig | undefined {
    return this.configs.get(provider);
  }

  /**
   * Get gateway instance
   */
  getGateway(provider: PaymentProvider): IPaymentGateway | undefined {
    return this.gateways.get(provider);
  }

  /**
   * Set fallback order for gateway failures
   */
  setFallbackOrder(order: PaymentProvider[]): void {
    this.fallbackOrder = order;
  }

  /**
   * Calculate total fees for a payment
   */
  calculateFees(amount: number, provider: PaymentProvider): number {
    const config = this.configs.get(provider);
    if (!config?.fees) return 0;

    const percentageFee = (amount * config.fees.percentage) / 100;
    const fixedFee = config.fees.fixed || 0;
    
    return percentageFee + fixedFee;
  }
}

// Singleton instance
export const paymentManager = new PaymentGatewayManager();
