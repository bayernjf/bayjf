/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useSpring, type MotionValue } from 'motion/react';
import type { NavEffectMode } from './NavTab';

interface NavWaterTrailProps {
  /** 鼠标在 nav 容器内相对于左边缘的 X（px），由 Header 的 onMouseMove 写入 */
  pointerX: MotionValue<number>;
  /** 鼠标是否位于 nav 区域（控制显隐） */
  visible: boolean;
  /** spring：单颗弹簧光斑；goo：多圆点粘连成液体尾迹 */
  mode: NavEffectMode;
  /** prefers-reduced-motion 时返回 null，完全不渲染动效 */
  reducedMotion: boolean;
}

/**
 * 导航栏共享的"水珠流动"层。
 *
 * 关键点：所有 Hook（useSpring）都在组件顶层无条件调用，不再像旧版 NavTab 那样
 * 把 useTransform 放进条件渲染的 JSX 里——那会违反 React Rules of Hooks，在 hover
 * 时直接崩溃（Rendered more hooks than during the previous render）。
 *
 * goo 模式：主水珠 + 3 颗延迟跟随的拖尾水珠，配合 Header 里定义的 #nav-goo-filter
 * （feGaussianBlur + feColorMatrix），重叠时粘连成水银尾迹。
 * spring 模式：仅主水珠用弹簧物理跟随，带惯性滞后。
 *
 * 水平位置通过 motion.g 的 style.x（支持 MotionValue）平移实现，避免把 MotionValue
 * 传给 SVG 的 cx 属性（类型不允许）。
 */
export default function NavWaterTrail({ pointerX, visible, mode, reducedMotion }: NavWaterTrailProps) {
  // 主水珠：跟手、响应快
  const main = useSpring(pointerX, { stiffness: 550, damping: 40, mass: 0.6 });
  // 三颗拖尾：刚度/阻尼依次降低，形成滞后尾迹
  const t1 = useSpring(pointerX, { stiffness: 320, damping: 32, mass: 0.7 });
  const t2 = useSpring(pointerX, { stiffness: 190, damping: 26, mass: 0.8 });
  const t3 = useSpring(pointerX, { stiffness: 110, damping: 22, mass: 0.9 });

  if (reducedMotion) return null;

  const dropletProps = {
    fill: 'var(--color-sage)',
    className: 'dark:fill-[var(--color-mint)]',
  } as const;

  return (
    <motion.svg
      className="pointer-events-none absolute inset-x-0 -bottom-1 h-6 w-full overflow-visible"
      style={{ filter: 'url(#nav-goo-filter)' }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      aria-hidden="true"
    >
      {mode === 'goo' ? (
        <>
          <motion.g style={{ x: t3 }}>
            <circle r="4" cy="10" opacity="0.5" {...dropletProps} />
          </motion.g>
          <motion.g style={{ x: t2 }}>
            <circle r="4.5" cy="10" opacity="0.65" {...dropletProps} />
          </motion.g>
          <motion.g style={{ x: t1 }}>
            <circle r="5" cy="10" opacity="0.8" {...dropletProps} />
          </motion.g>
          <motion.g style={{ x: main }}>
            <circle r="6" cy="10" {...dropletProps} />
          </motion.g>
        </>
      ) : (
        <motion.g style={{ x: main }}>
          <circle r="5" cy="10" {...dropletProps} />
        </motion.g>
      )}
    </motion.svg>
  );
}
