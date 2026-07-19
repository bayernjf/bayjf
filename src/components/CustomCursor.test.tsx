import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CustomCursor from './CustomCursor';

describe('CustomCursor', () => {
  it('moves on an animation frame and expands over interactive elements', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      media: '(pointer: fine) and (min-width: 768px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);

    const { container } = render(
      <>
        <CustomCursor />
        <button type="button">Action</button>
      </>,
    );
    const cursor = container.querySelector<HTMLElement>('#custom-cursor')!;

    act(() => {
      window.dispatchEvent(new MouseEvent('pointermove', { clientX: 120, clientY: 80 }));
    });
    expect(cursor.style.transform).toBe('');
    frames.shift()?.(performance.now());
    expect(cursor.style.transform).toBe('translate3d(120px, 80px, 0)');
    expect(cursor).toHaveClass('opacity-100');

    fireEvent.pointerOver(container.querySelector('button')!);
    expect(cursor.firstElementChild).toHaveClass('w-10', 'h-10');
  });
});
