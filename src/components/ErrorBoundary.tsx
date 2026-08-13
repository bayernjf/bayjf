/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof window !== 'undefined') {
      console.error('[ErrorBoundary] caught render error:', error, info.componentStack);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div
        role="alert"
        className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-6 py-20 text-center"
      >
        <p className="font-sans text-lg font-medium text-ink dark:text-paper">
          This section hit a rendering error.
        </p>
        <p className="font-sans text-sm text-ink-soft/70 dark:text-mist/70 max-w-md">
          Try reloading the page. If it keeps happening, the error has been logged to the
          browser console.
        </p>
        <button
          type="button"
          onClick={this.reset}
          className="interactive mt-2 px-5 py-2 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink font-sans text-xs uppercase tracking-widest font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
