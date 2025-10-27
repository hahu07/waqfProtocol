'use client';

/**
 * Global Error Boundary
 * 
 * Catches JavaScript errors anywhere in the component tree,
 * logs the error, and displays a fallback UI.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to monitoring service
    logger.error('Global error boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'GlobalErrorBoundary',
    });

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error monitoring service (Sentry, etc.)
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg
                    className="h-12 w-12 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Something went wrong
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We&apos;re sorry, but something unexpected happened. Our team has been notified
                    and we&apos;re working to fix the issue.
                  </p>

                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="mb-6 p-4 bg-red-50 rounded-md">
                      <h3 className="text-sm font-semibold text-red-800 mb-2">
                        Error Details (Development Only)
                      </h3>
                      <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-x-auto">
                        {this.state.error.toString()}
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={this.handleReset}
                      className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => window.location.href = '/'}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Go to Home
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mt-6">
                    If this problem persists, please contact our support team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
