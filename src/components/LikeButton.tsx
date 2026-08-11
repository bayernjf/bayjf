/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useLike } from '../context/LikeContext';
import { useLanguage } from '../context/LanguageContext';

interface LikeButtonProps {
  projectId: string;
  source: string;
  className?: string;
  enlarged?: boolean;
}

// Hover effects cycle in order: 0 heartbeat, 1 soft rose halo, 2 ripple ring, 3 tilt wobble
const HOVER_EFFECTS = 4;

// Global hover-effect cycle shared by every LikeButton instance on the page.
let globalHoverTick = -1;

// Custom heart-shaped cursor shown while hovering the like button.
const HEART_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='21' height='21' viewBox='0 0 32 29.6'%3E%3Cpath fill='%23f43f5e' fill-opacity='0.55' d='M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z'/%3E%3C/svg%3E\") 10 10, pointer";

export default function LikeButton({ projectId, source, className, enlarged = false }: LikeButtonProps) {
  const { isLiked, toggle } = useLike();
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const liked = isLiked(projectId);

  const [hovered, setHovered] = useState(false);
  const [hoverTick, setHoverTick] = useState(0);
  const [hoverEffect, setHoverEffect] = useState(0);

  const label = liked ? t('like.liked') : t('like.notLiked');

  const enlargedClass = enlarged ? 'p-3' : 'p-2';
  const effectIndex = hoverEffect;

  // Heart transform driven by the cycling hover effect (effects 0 & 3 move the heart)
  let heartAnimate: { scale?: number | number[]; rotate?: number | number[] } = { scale: 1, rotate: 0 };
  let heartTransition: { duration: number; ease: 'easeOut' | 'easeInOut' } = { duration: 0.3, ease: 'easeOut' };
  if (hovered && !reduceMotion) {
    if (effectIndex === 0) {
      heartAnimate = { scale: [1, 1.18, 1, 1.18, 1] };
      heartTransition = { duration: 0.7, ease: 'easeInOut' };
    } else if (effectIndex === 3) {
      heartAnimate = { rotate: [0, -14, 14, -8, 0] };
      heartTransition = { duration: 0.5, ease: 'easeInOut' };
    }
  }

  // Decorative layer behind the heart (effects 1 & 2)
  let decorInitial = { opacity: 0, scale: 0.5 };
  let decorAnimate = { opacity: 0, scale: 0.5 };
  let decorClass = 'bg-rose-500/10';
  if (hovered && !reduceMotion) {
    if (effectIndex === 1) {
      decorInitial = { opacity: 0, scale: 0.4 };
      decorAnimate = { opacity: 1, scale: 1 };
      decorClass = 'bg-rose-500/10';
    } else if (effectIndex === 2) {
      decorInitial = { opacity: 0.7, scale: 0.5 };
      decorAnimate = { opacity: 0, scale: 1.6 };
      decorClass = 'border-2 border-rose-400/60';
    }
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        toggle(projectId, source);
      }}
      onMouseEnter={() => {
        if (!reduceMotion) {
          globalHoverTick = (globalHoverTick + 1) % (HOVER_EFFECTS * 1024);
          setHoverEffect(((globalHoverTick % HOVER_EFFECTS) + HOVER_EFFECTS) % HOVER_EFFECTS);
          setHoverTick((tick) => tick + 1);
        }
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      aria-pressed={liked}
      aria-label={label}
      style={{ cursor: HEART_CURSOR }}
      className={`interactive relative inline-flex items-center justify-center rounded-full transition-colors duration-200 ${enlargedClass} ${
        liked
          ? 'text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300'
          : 'text-ink-soft/60 dark:text-mist/60 hover:text-ink dark:hover:text-paper'
      } ${className ?? ''}`}
    >
      <motion.span
        key={`decor-${hoverTick}`}
        initial={decorInitial}
        animate={decorAnimate}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={`pointer-events-none absolute inset-0 rounded-full ${decorClass}`}
      />
      <motion.span
        key={`heart-${hoverTick}`}
        initial={false}
        animate={heartAnimate}
        transition={heartTransition}
        className="inline-flex"
      >
        <motion.span
          initial={false}
          animate={liked && !reduceMotion ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          className="inline-flex"
        >
          <Heart size={enlarged ? 24 : 16} className={liked ? 'fill-current' : ''} />
        </motion.span>
      </motion.span>
    </button>
  );
}
