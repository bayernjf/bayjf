/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';

export type NavEffectMode = 'spring' | 'goo';

interface NavTabProps {
  label: string;
  tooltip: string;
  href: string;
  id?: string;
  isActive: boolean;
  effectMode: NavEffectMode;
  onClick: (e: ReactMouseEvent<HTMLAnchorElement>) => void;
}

/**
 * 导航标签：hover 时显示 tooltip，底部有水珠动效。
 *
 * effectMode='spring'：Motion 弹簧物理光斑跟随鼠标，有惯性滞后。
 * effectMode='goo'：SVG feGaussianBlur 滤镜，多圆点粘连如水银。
 *
 * prefers-reduced-motion 时两个模式都降级为纯 CSS hover 颜色变化。
 */
export default function NavTab({ label, tooltip, href, id, isActive, effectMode, onClick }: NavTabProps) {
  const [hovered, setHovered] = useState(false);
  const tabRef = useRef<HTMLAnchorElement>(null);

  // 0-100 百分比，表示鼠标在标签内的水平位置
  const xPercent = useMotionValue(50);
  const xSpring = useSpring(xPercent, { stiffness: 320, damping: 28, mass: 0.5 });

  // goo 模式直接用 state（无弹簧物理）
  const [gooX, setGooX] = useState(50);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    xPercent.set(percent);
    if (effectMode === 'goo') setGooX(percent);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    xPercent.set(50);
    setGooX(50);
  };

  const showEffect = !reducedMotion && hovered;

  return (
    <a
      ref={tabRef}
      id={id}
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className={`relative font-sans text-[13px] tracking-tight transition-all duration-200 py-1 hover:text-ink dark:hover:text-paper active:scale-[0.98] ${
        isActive
          ? 'text-ink dark:text-paper font-medium'
          : 'text-ink-soft dark:text-mist font-normal'
      }`}
    >
      {label}

      {/* Tooltip（两模式共用） */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2.5 py-1 rounded-md bg-ink/90 dark:bg-paper/90 text-paper dark:text-ink text-[11px] tracking-tight whitespace-nowrap backdrop-blur-sm"
            role="tooltip"
          >
            {tooltip}
          </motion.span>
        )}
      </AnimatePresence>

      {/* spring 模式：弹簧光斑 */}
      {effectMode === 'spring' && showEffect && (
        <motion.div
          className="pointer-events-none absolute -bottom-0.5 h-[3px] rounded-full bg-sage dark:bg-mint"
          style={{
            left: useTransform(xSpring, (v) => `${v}%`),
            translateX: '-50%',
            width: useTransform(xSpring, [0, 50, 100], [8, 36, 8]),
            opacity: useTransform(xSpring, [0, 8, 92, 100], [0, 1, 1, 0]),
          }}
        />
      )}

      {/* goo 模式：SVG 粘连水珠 */}
      {effectMode === 'goo' && showEffect && (
        <svg
          className="pointer-events-none absolute -bottom-1 left-0 w-full h-5 overflow-visible"
          style={{ filter: 'url(#nav-goo-filter)' }}
        >
          <circle r="5" cx={`${gooX}%`} cy="8" fill="var(--color-sage)" className="dark:fill-[var(--color-mint)]" />
          <circle r="3" cx={`${gooX - 10}%`} cy="8" fill="var(--color-sage)" className="dark:fill-[var(--color-mint)]" opacity="0.7" />
          <circle r="3" cx={`${gooX + 10}%`} cy="8" fill="var(--color-sage)" className="dark:fill-[var(--color-mint)]" opacity="0.7" />
        </svg>
      )}
    </a>
  );
}
