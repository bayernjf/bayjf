/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { createRef } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LanguageProvider } from '../context/LanguageContext';
import { ToastProvider } from '../context/ToastContext';
import SocialTreeModal from './SocialTreeModal';

function renderModal(overrides: Partial<ComponentProps<typeof SocialTreeModal>> = {}) {
  const props: ComponentProps<typeof SocialTreeModal> = {
    open: true,
    originEl: null,
    onClose: vi.fn(),
    onHome: vi.fn(),
    logoButtonRef: createRef<HTMLButtonElement>(),
    ...overrides,
  };

  render(
    <LanguageProvider>
      <ToastProvider>
        <SocialTreeModal {...props} />
      </ToastProvider>
    </LanguageProvider>
  );

  return props;
}

describe('SocialTreeModal', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders the title and social entries when open', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Find me elsewhere')).toBeTruthy();
    expect(screen.getByText('GitHub')).toBeTruthy();
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Copy email')).toBeTruthy();
    expect(screen.getByText('Back to Home')).toBeTruthy();
  });

  it('does not render when closed', () => {
    renderModal({ open: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('calls onClose when the overlay is clicked', () => {
    const props = renderModal();
    const overlay = screen.getByRole('dialog').parentElement as HTMLElement;
    fireEvent.click(overlay);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('copies the email to the clipboard on copy click', async () => {
    const props = renderModal();
    fireEvent.click(screen.getByText('Copy email'));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('b4yernjf@gmail.com');
    });
  });

  it('invokes onHome when the back-to-home entry is clicked', () => {
    const props = renderModal();
    fireEvent.click(screen.getByText('Back to Home'));
    expect(props.onHome).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });
});
