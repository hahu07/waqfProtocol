/**
 * Environment Variable Validation
 * 
 * Validates all required environment variables at startup using Zod.
 * Prevents runtime errors from missing or invalid configuration.
 */

import { z } from 'zod';
import { logger } from './logger';

// ============================================
// ENVIRONMENT SCHEMA
// ============================================

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Juno Configuration
  NEXT_PUBLIC_JUNO_SATELLITE_ID: z.string().min(1, 'Juno Satellite ID is required'),

  // Admin Configuration (Optional)
  NEXT_PUBLIC_ADMIN_GROUP: z.string().optional(),

  // Payment Gateways - Public Keys (Optional)
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),

  // Payment Gateway Mode
  PAYMENT_MODE: z.enum(['test', 'production']).default('test'),

  // Server-side Payment Keys (Optional - only checked on server)
  STRIPE_SECRET_KEY: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  // Monitoring & Analytics (Optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_GA_TRACKING_ID: z.string().optional(),

  // Email Service (Optional)
  EMAIL_SERVICE_API_KEY: z.string().optional(),
  EMAIL_FROM_ADDRESS: z.string().email().optional(),

  // Feature Flags (Optional)
  NEXT_PUBLIC_ENABLE_TEMPORARY_WAQF: z.string().optional(),
  NEXT_PUBLIC_ENABLE_CRYPTO_PAYMENTS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

// ============================================
// VALIDATION FUNCTION
// ============================================

let validatedEnv: Env | null = null;

/**
 * Validate environment variables
 * Call this at app startup to ensure all required variables are present
 */
export function validateEnv(): Env {
  // Return cached result if already validated
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    logger.info('Validating environment variables...');

    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      const errors = result.error.issues.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      });

      logger.error('Environment validation failed', result.error);
      
      throw new Error(
        `Invalid environment variables:\n${errors.join('\n')}\n\n` +
        'Please check your .env.local file and ensure all required variables are set correctly.'
      );
    }

    validatedEnv = result.data;
    logger.info('Environment validation successful');

    // Log configuration summary (without sensitive data)
    logger.info('Configuration summary:', {
      nodeEnv: validatedEnv.NODE_ENV,
      satelliteId: validatedEnv.NEXT_PUBLIC_JUNO_SATELLITE_ID?.substring(0, 10) + '...',
      paymentMode: validatedEnv.PAYMENT_MODE,
      hasStripe: !!validatedEnv.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      hasPayPal: !!validatedEnv.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      hasFlutterwave: !!validatedEnv.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
      hasPaystack: !!validatedEnv.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      hasRazorpay: !!validatedEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      hasSentry: !!validatedEnv.NEXT_PUBLIC_SENTRY_DSN,
      hasAnalytics: !!validatedEnv.NEXT_PUBLIC_GA_TRACKING_ID,
    });

    // Production-specific validations
    if (validatedEnv.NODE_ENV === 'production') {
      validateProductionEnv(validatedEnv);
    }

    return validatedEnv;
  } catch (error) {
    logger.error('Failed to validate environment', error as Error);
    throw error;
  }
}

/**
 * Additional validation for production environment
 */
function validateProductionEnv(env: Env): void {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check if using test/demo keys in production
  if (env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.includes('test')) {
    warnings.push('Using Stripe test key in production');
  }

  if (env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.startsWith('sb-')) {
    warnings.push('Using PayPal sandbox credentials in production');
  }

  if (env.PAYMENT_MODE === 'test') {
    warnings.push('Payment mode is set to "test" in production environment');
  }

  // Recommend monitoring in production
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    warnings.push('Sentry DSN not configured - error monitoring recommended for production');
  }

  // Check for at least one payment gateway
  const hasAnyGateway = !!(
    env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
    env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ||
    env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
    env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  );

  if (!hasAnyGateway) {
    errors.push('No payment gateways configured - at least one is required for production');
  }

  // Log warnings
  if (warnings.length > 0) {
    logger.warn('Production environment warnings:', { warnings });
  }

  // Throw if there are critical errors
  if (errors.length > 0) {
    throw new Error(
      `Production validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}

/**
 * Get validated environment variables
 * Throws if not yet validated
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error('Environment not validated. Call validateEnv() first.');
  }
  return validatedEnv;
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if we're in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Check if we're in test mode
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test';
}

/**
 * Get payment mode
 */
export function getPaymentMode(): 'test' | 'production' {
  return getEnv().PAYMENT_MODE || 'test';
}

// ============================================
// AUTO-VALIDATE ON IMPORT (Browser-safe)
// ============================================

// Only auto-validate if we have access to process.env
// This prevents errors during SSR or in browser environments
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    // Log but don't throw during import - let the app handle it
    console.error('Environment validation failed during module initialization:', error);
  }
}
