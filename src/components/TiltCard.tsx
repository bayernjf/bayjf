/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, type PointerEvent, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  type HTMLMotionProps,
} from 'motion/react';

type TiltCardProps = Omit<
  HTMLMotionProps<'div'>,
  'style' | 'onPointerMove' | 'onPointerLeave' | 'ref'
> & {
  children: ReactNode;
};

const MAX_TILT_DEG = 5;

/**
 * Apple TV / Apple Card style tilt: the card follows the pointer with a subtle
 * 3D rotation and a soft light glare, then springs back to rest on leave.
 * Content stays fully visible — the effect only adds depth.
 *
 * Motion values never trigger React re-renders; springs keep the motion
 * interruptible. Reduced-motion users and non-mouse pointers get a static card.
 */
export default function TiltCard({ children, className, ...motionProps }: TiltCardProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Normalized pointer position (0..1), center = 0.5
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  // Critically-damped feel: snappy but no bounce (Apple's default UI spring)
  const springConfig = { stiffness: 300, damping: 30, mass: 0.6 };
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [MAX_TILT_DEG, -MAX_TILT_DEG]), springConfig);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-MAX_TILT_DEG, MAX_TILT_DEG]), springConfig);
  const glareX = useSpring(useTransform(pointerX, [0, 1], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(pointerY, [0, 1], [0, 100]), springConfig);

  const glareOpacity = useSpring(useMotionValue(0), { stiffness: 320, damping: 32 });
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.22), transparent 55%)`;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
    glareOpacity.set(1);
  };

  const handlePointerLeave = () => {
    // Spring back to rest from the live on-screen value — interruptible by design
    pointerX.set(0.5);
    pointerY.set(0.5);
    glareOpacity.set(0);
  };

  return (
    <motion.div
      ref={ref}
      {...motionProps}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: 1000,
      }}
      className={className}
    >
      {children}
      {/* Light glare following the pointer */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 rounded-[inherit]"
        style={{ background: glareBackground, opacity: glareOpacity }}
      />
    </motion.div>
  );
}
