import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackRender?: (props: { error: Error; resetErrorBoundary: () => void }) => ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackRender && this.state.error) {
        return this.props.fallbackRender({
          error: this.state.error,
          resetErrorBoundary: this.resetErrorBoundary
        });
      }
      
      return this.props.fallback || (
        <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg">
          <h2 className="text-sm sm:text-base font-bold">Something went wrong</h2>
          <p className="text-xs sm:text-sm mt-1">{this.state.error?.message}</p>
          <button 
            onClick={this.resetErrorBoundary}
            className="mt-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700/40"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;