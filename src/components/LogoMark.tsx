/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useId } from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export default function LogoMark({ size = 26, className }: LogoMarkProps) {
  const uid = useId().replace(/:/g, '');
  const bgId = `bayBg-${uid}`;
  const inkId = `bayInk-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#12354f" />
          <stop offset="100%" stopColor="#08131d" />
        </linearGradient>
        <linearGradient id={inkId} x1="8" y1="8" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="60%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill={`url(#${bgId})`} />
      <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" fill="none" className="stroke-ink/15 dark:stroke-white/10" />
      <g fill="none" stroke={`url(#${inkId})`} strokeWidth="3.4" strokeLinecap="round">
        <path d="M11.5 6.5 C 11 13, 11 19, 10 22.6 C 9.2 25.4, 5.6 26.2, 4.4 24" />
        <path d="M11.3 9.5 C 16.5 7.3, 22.5 7.5, 27.3 9.8" />
        <path d="M11.2 15 C 15.5 13.6, 20 13.8, 23.8 15.6" opacity="0.55" />
      </g>
    </svg>
  );
}
