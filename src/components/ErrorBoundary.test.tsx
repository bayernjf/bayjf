import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

function Boom(): React.ReactElement {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>safe content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('safe content')).toBeTruthy();
  });

  it('renders the default fallback and recovers on retry', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Conditional({ fail }: { fail: boolean }) {
      if (fail) return <Boom />;
      return <div>recovered</div>;
    }
    const { rerender } = render(
      <ErrorBoundary>
        <Conditional fail={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(spy).toHaveBeenCalled();

    rerender(
      <ErrorBoundary>
        <Conditional fail={false} />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(screen.getByText('recovered')).toBeTruthy();
    spy.mockRestore();
  });

  it('supports a custom fallback render prop', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={(err) => <span>custom: {err.message}</span>}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('custom: boom')).toBeTruthy();
    vi.restoreAllMocks();
  });
});
