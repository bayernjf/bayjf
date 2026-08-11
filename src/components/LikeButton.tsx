/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useReducedMotion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useLike } from '../context/LikeContext';
import { useLanguage } from '../context/LanguageContext';

interface LikeButtonProps {
  projectId: string;
  source: string;
  className?: string;
}

export default function LikeButton({ projectId, source, className }: LikeButtonProps) {
  const { isLiked, toggle } = useLike();
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const liked = isLiked(projectId);

  const label = liked ? t('like.liked') : t('like.notLiked');

  return (
    <button
      type="button"
      onClick={() => toggle(projectId, source)}
      aria-pressed={liked}
      aria-label={label}
      title={label}
      className={`interactive relative inline-flex items-center justify-center rounded-full p-2 transition-colors duration-200 ${
        liked
          ? 'text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300'
          : 'text-ink-soft/60 dark:text-mist/60 hover:text-ink dark:hover:text-paper'
      } ${className ?? ''}`}
    >
      <motion.span
        initial={false}
        animate={liked && !reduceMotion ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        className="inline-flex"
      >
        <Heart size={16} className={liked ? 'fill-current' : ''} />
      </motion.span>
    </button>
  );
}
