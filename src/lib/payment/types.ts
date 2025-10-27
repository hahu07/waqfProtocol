// Payment gateway types and interfaces

export type PaymentProvider = 'stripe' | 'paypal' | 'flutterwave' | 'paystack' | 'razorpay' | 'square';

export type PaymentCurrency = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'KES' | 'GHS' | 'ZAR' | 'INR' | 'SAR' | 'AED';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export type PaymentMethod = 'card' | 'bank_transfer' | 'mobile_money' | 'wallet' | 'crypto' | 'paypal' | 'ussd' | 'upi' | 'netbanking';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: PaymentCurrency;
  description?: string;
  metadata?: Record<string, unknown>;
  customerId?: string;
  customerEmail?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: PaymentCurrency;
  error?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface PaymentConfig {
  provider: PaymentProvider;
  enabled: boolean;
  publicKey: string;
  secretKey?: string; // Only for server-side
  supportedCurrencies: PaymentCurrency[];
  supportedMethods: PaymentMethod[];
  webhookUrl?: string;
  fees?: {
    percentage: number;
    fixed?: number;
  };
}

export interface IPaymentGateway {
  readonly provider: PaymentProvider;
  readonly name: string;
  readonly supportedCurrencies: PaymentCurrency[];
  readonly supportedMethods: PaymentMethod[];
  
  /**
   * Initialize the payment gateway
   */
  initialize(): Promise<void>;
  
  /**
   * Create a payment intent
   */
  createPayment(intent: PaymentIntent): Promise<PaymentResult>;
  
  /**
   * Verify a payment
   */
  verifyPayment(transactionId: string): Promise<PaymentResult>;
  
  /**
   * Process a refund
   */
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResult>;
  
  /**
   * Get payment details
   */
  getPaymentDetails(transactionId: string): Promise<PaymentResult>;
  
  /**
   * Check if gateway is available
   */
  isAvailable(): boolean;
}

export interface PaymentGatewayFactory {
  createGateway(config: PaymentConfig): IPaymentGateway;
  getAvailableGateways(): PaymentProvider[];
  getRecommendedGateway(currency: PaymentCurrency, country?: string): PaymentProvider;
}
