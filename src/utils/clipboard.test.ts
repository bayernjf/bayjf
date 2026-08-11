/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { copyToClipboard } from './clipboard';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('copyToClipboard', () => {
  it('uses navigator.clipboard.writeText when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const ok = await copyToClipboard('hello@example.com');
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello@example.com');
  });

  it('falls back to execCommand when clipboard API is missing', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand as typeof document.execCommand;

    const ok = await copyToClipboard('fallback-text');
    expect(ok).toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('returns false when both clipboard and fallback fail', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    const execCommand = vi.fn().mockImplementation(() => {
      throw new Error('not supported');
    });
    document.execCommand = execCommand as typeof document.execCommand;

    const ok = await copyToClipboard('nope');
    expect(ok).toBe(false);
  });
});
