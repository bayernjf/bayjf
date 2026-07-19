/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('.interactive') ||
        target.closest('a') ||
        target.closest('button')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    const handleMouseEnterWindow = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      id="custom-cursor"
      className={`hidden md:block fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference transition-all duration-200 -translate-x-1/2 -translate-y-1/2 ${
        isHovered
          ? 'w-10 h-10 bg-transparent border border-[#d7e6dd]'
          : 'w-3 h-3 bg-[#54615b] dark:bg-[#bbcac2]'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    />
  );
}
