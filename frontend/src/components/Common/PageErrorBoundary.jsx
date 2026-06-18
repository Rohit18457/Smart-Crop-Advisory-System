/**
 * Page-Level Error Boundary
 * ==========================
 * Wraps individual pages to catch rendering errors without
 * crashing the entire application. Falls back to a friendly
 * error message with a retry button.
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[PageErrorBoundary] ${this.props.pageName || 'Page'} error:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="card max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-surface-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-surface-500 mb-6">
              {this.props.pageName
                ? `The ${this.props.pageName} page encountered an error.`
                : 'This page encountered an error.'}
              {' '}Please try again.
            </p>
            <button
              onClick={this.handleRetry}
              className="btn-primary inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
