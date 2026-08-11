/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NavTabProps {
  label: string;
  tooltip: string;
  href: string;
  id?: string;
  isActive: boolean;
  onClick: (e: ReactMouseEvent<HTMLAnchorElement>) => void;
}

/**
 * 导航标签：hover 时显示 tooltip。
 *
 * 仅保留 tooltip，不含其他动效。
 */
export default function NavTab({ label, tooltip, href, id, isActive, onClick }: NavTabProps) {
  const [hovered, setHovered] = useState(false);
  const tabRef = useRef<HTMLAnchorElement>(null);

  return (
    <a
      ref={tabRef}
      id={id}
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative font-sans text-[13px] tracking-tight transition-all duration-200 py-1 hover:text-ink dark:hover:text-paper active:scale-[0.98] ${
        isActive
          ? 'text-ink dark:text-paper font-medium'
          : 'text-ink-soft dark:text-mist font-normal'
      }`}
    >
      {label}

      {/* Tooltip（hover 时显示） */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-0.5 rounded-md bg-ink/90 dark:bg-paper/90 text-paper dark:text-ink text-[10px] tracking-tight whitespace-nowrap backdrop-blur-sm"
            role="tooltip"
          >
            {tooltip}
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
}
