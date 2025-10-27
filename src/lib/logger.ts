/**
 * Production-grade Logger
 * 
 * Provides structured logging with different levels and environment-aware behavior.
 * In production, logs are sent to monitoring services.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, data } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    
    return `${prefix} ${message}`;
  }

  /**
   * Send log to external monitoring service in production
   */
  private sendToMonitoring(entry: LogEntry): void {
    // TODO: Integrate with monitoring service (Sentry, Datadog, etc.)
    // Example: Sentry.captureMessage(entry.message, entry.level);
    
    if (entry.level === 'error' && entry.error) {
      // TODO: Sentry.captureException(entry.error);
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error,
    };

    // Always log errors, even in production
    if (level === 'error') {
      console.error(this.formatLog(entry), error || '');
      
      if (this.isProduction) {
        this.sendToMonitoring(entry);
      }
      return;
    }

    // In production, only log warnings and errors to console
    if (this.isProduction && (level === 'warn')) {
      console.warn(this.formatLog(entry));
      return;
    }

    // In development, log everything
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(this.formatLog(entry));
          break;
        case 'info':
          console.log(this.formatLog(entry));
          break;
        case 'warn':
          console.warn(this.formatLog(entry));
          break;
      }
    }
  }

  /**
   * Debug level - verbose information for debugging
   * Only shown in development
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  /**
   * Info level - general informational messages
   * Shown in development, suppressed in production
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  /**
   * Warning level - potentially harmful situations
   * Shown in all environments
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  /**
   * Error level - error events that might still allow the app to continue
   * Shown in all environments and sent to monitoring
   */
  error(message: string, error?: Error | Record<string, unknown>, data?: Record<string, unknown>): void {
    // Handle both Error objects and plain error data
    const errorObj = error instanceof Error ? error : undefined;
    const errorData = error instanceof Error ? data : error;
    
    this.log('error', message, errorData, errorObj);
  }

  /**
   * Payment-specific logging with additional context
   */
  payment = {
    info: (message: string, data?: Record<string, unknown>) => {
      this.info(`[PAYMENT] ${message}`, data);
    },
    error: (message: string, error?: Error, data?: Record<string, unknown>) => {
      this.error(`[PAYMENT] ${message}`, error, data);
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      this.warn(`[PAYMENT] ${message}`, data);
    },
  };

  /**
   * Authentication-specific logging
   */
  auth = {
    info: (message: string, data?: Record<string, unknown>) => {
      this.info(`[AUTH] ${message}`, data);
    },
    error: (message: string, error?: Error, data?: Record<string, unknown>) => {
      this.error(`[AUTH] ${message}`, error, data);
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      this.warn(`[AUTH] ${message}`, data);
    },
  };

  /**
   * Waqf-specific logging
   */
  waqf = {
    info: (message: string, data?: Record<string, unknown>) => {
      this.info(`[WAQF] ${message}`, data);
    },
    error: (message: string, error?: Error, data?: Record<string, unknown>) => {
      this.error(`[WAQF] ${message}`, error, data);
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      this.warn(`[WAQF] ${message}`, data);
    },
  };

  /**
   * API-specific logging
   */
  api = {
    info: (message: string, data?: Record<string, unknown>) => {
      this.info(`[API] ${message}`, data);
    },
    error: (message: string, error?: Error, data?: Record<string, unknown>) => {
      this.error(`[API] ${message}`, error, data);
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      this.warn(`[API] ${message}`, data);
    },
  };
}

// Export singleton instance
export const logger = new Logger();

// Named exports for convenience
export const { debug, info, warn, error } = logger;
