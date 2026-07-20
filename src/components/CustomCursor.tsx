/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], .interactive';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: -100, y: -100 });
  const visibleRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine) and (min-width: 768px)');
    if (!finePointer.matches) return;

    const deactivateCustomCursor = () => {
      document.documentElement.classList.remove('custom-cursor-active');
      visibleRef.current = false;
      setIsVisible(false);
    };

    const renderPosition = () => {
      const cursor = cursorRef.current;
      if (cursor) {
        const { x, y } = pointerRef.current;
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        document.documentElement.classList.add('custom-cursor-active');
      }
      frameRef.current = null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(renderPosition);
      }
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target;
      const hovered = target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));
      setIsHovered((current) => current === hovered ? current : hovered);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.addEventListener('mouseleave', deactivateCustomCursor);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('mouseleave', deactivateCustomCursor);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      deactivateCustomCursor();
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      id="custom-cursor"
      aria-hidden="true"
      className={`custom-cursor fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform ${
        isVisible ? 'is-visible' : ''
      }`}
    >
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,background-color,border-color] duration-150 ${
          isHovered
            ? 'w-10 h-10 bg-transparent border border-[#54615b] dark:border-[#d7e6dd]'
            : 'w-3 h-3 border border-transparent bg-[#54615b] dark:bg-[#bbcac2]'
        }`}
      />
    </div>
  );
}
