/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import BlurUpImage from './BlurUpImage';
import { useLanguage } from '../context/LanguageContext';
import { Project } from '../types';
import { playBlindBoxOpenSound } from '../utils/sound';

interface BlindBoxCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  index?: number;
  onRevealChange?: (revealed: boolean) => void;
}

// Deterministic burst particles spreading from the center seam on open.
const BURST = Array.from({ length: 10 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 10 + (i % 2 ? 0.18 : 0);
  const dist = 34 + (i % 3) * 10;
  return {
    id: i,
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    size: 5 + (i % 3) * 3,
    delay: 0.02 + (i % 4) * 0.02,
  };
});

/**
 * A "blind box" wrapper for a project card. The whole card is wrapped by a
 * sealed box whose two halves split open from the center seam on hover /
 * focus, sliding up and down to reveal the project underneath. When the
 * pointer leaves (or focus is lost) the box seals shut again — it can be
 * opened and closed repeatedly.
 *
 * On touch devices and when reduced-motion is requested, the wrapper stays
 * open so content is always accessible.
 */
export default function BlindBoxCard({ project, onOpen, index = 0, onRevealChange }: BlindBoxCardProps) {
  const { language } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  // Detect touch-only devices (no reliable hover) → always revealed.
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: none)');
    setIsTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const alwaysRevealed = isTouch || !!prefersReducedMotion;

  // "hovered" drives the open/close of the box for pointer + keyboard users.
  // When alwaysRevealed (touch / reduced motion) the box stays open.
  const [hovered, setHovered] = useState(false);
  const revealed = alwaysRevealed || hovered;

  useEffect(() => {
    onRevealChange?.(revealed);
  }, [revealed, onRevealChange]);

  // Play the open sound each time the box transitions from sealed → open.
  const wasRevealed = useRef(revealed);
  useEffect(() => {
    if (revealed && !wasRevealed.current && !alwaysRevealed) {
      playBlindBoxOpenSound();
    }
    wasRevealed.current = revealed;
  }, [revealed, alwaysRevealed]);

  // Cover seam sits at vertical center.
  const seamY = '50%';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 32, delay: index * 0.04 }}
      onClick={() => onOpen(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      className="group relative flex flex-col h-full bg-[#fbf9f7] dark:bg-[#161716] rounded-2xl border border-[#e4e2e0] dark:border-white/5 shadow-md hover:shadow-xl hover:border-[#54615b]/20 dark:hover:border-white/10 transition-[border-color,box-shadow,background-color] duration-300 overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-[#54615b]/40 outline-none"
      role="button"
      tabIndex={0}
      aria-label={project.title}
      aria-expanded={revealed}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(project);
        }
      }}
    >
      {/* Thumbnail / revealed project image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f5f3f1] dark:bg-[#1a1b1a] border-b border-[#e4e2e0] dark:border-white/5">
        <BlurUpImage
          src={project.image}
          alt={project.title}
          className={`transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-1 ${
            revealed ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-110'
          }`}
        />

        {/* Glassmorphic category overlay once revealed */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 flex items-end p-6">
          <div className="text-[#fbf9f7] translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <span className="font-sans text-[10px] font-bold tracking-widest uppercase bg-[#bbcac2]/80 backdrop-blur-md text-[#1b1c1b] px-2 py-1 rounded">
              {project.category}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-grow p-6 md:p-8">
        <span className="font-sans text-[10px] font-bold tracking-widest text-[#54615b] dark:text-[#bbcac2] mb-2 uppercase flex items-center justify-between">
          <span>{project.category}</span>
        </span>

        <h3 className="font-serif text-2xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7] mb-3 group-hover:text-[#54615b] dark:group-hover:text-[#bbcac2] transition-colors duration-300">
          {project.title}
        </h3>

        <p className="font-sans text-sm text-[#444748] dark:text-[#c4c7c7] mb-6 line-clamp-3 leading-relaxed flex-grow">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="font-sans text-[11px] bg-[#e4e2e0]/40 dark:bg-white/5 text-[#444748] dark:text-[#c4c7c7] px-2.5 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-[#e4e2e0]/40 dark:border-white/5">
          <span className="interactive inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#1b1c1b] dark:text-[#fbf9f7] group-hover:text-[#54615b] dark:group-hover:text-[#bbcac2] transition-colors">
            {language === 'en' ? 'VIEW CASE STUDY' : '查看案例研究'}
          </span>
        </div>
      </div>

      {/* ===== Blind box wrapper covering the ENTIRE card ===== */}
      {/* The wrapper is split into a top half and a bottom half that slide
          apart from the center seam on open, and back together on close. */}
      <div className="pointer-events-none absolute inset-0 z-50 flex flex-col">
        {/* Top half */}
        <motion.div
          data-blind-box="sealed"
          className="relative w-full overflow-hidden bg-gradient-to-b from-[#2b2f2d] via-[#1f2120] to-[#16181a]"
          style={{
            height: seamY,
            borderBottom: '1px solid rgba(187,202,194,0.35)',
            boxShadow: 'inset 0 12px 24px rgba(0,0,0,0.45)',
          }}
          initial={false}
          animate={{
            y: revealed ? '-100%' : '0%',
            opacity: revealed ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          aria-hidden={revealed}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#2b2f2d] via-[#1f2120] to-[#16181a]" />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(187,202,194,0.16),transparent_65%)]"
            animate={{ opacity: hovered && !alwaysRevealed ? [0.12, 0.3, 0.12] : 0.12 }}
            transition={{ duration: 1.4, repeat: hovered && !alwaysRevealed ? Infinity : 0 }}
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-6">
            <Sparkles size={28} className="text-[#bbcac2]" />
          </div>
        </motion.div>

        {/* Bottom half */}
        <motion.div
          data-blind-box="sealed"
          className="relative w-full overflow-hidden bg-gradient-to-t from-[#0f100f] via-[#1b1c1b] to-[#232524]"
          style={{
            height: seamY,
            borderTop: '1px solid rgba(187,202,194,0.35)',
            boxShadow: 'inset 0 -12px 24px rgba(0,0,0,0.45)',
          }}
          initial={false}
          animate={{
            y: revealed ? '100%' : '0%',
            opacity: revealed ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          aria-hidden={revealed}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f100f] via-[#1b1c1b] to-[#232524]" />
          <div className="absolute inset-x-0 top-0 flex flex-col items-center justify-start pt-6">
            <span className="font-serif text-4xl font-bold text-[#fbf9f7]">?</span>
          </div>
        </motion.div>
      </div>

      {/* Center seam glow + particles (fades out while open) */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[55] flex items-center justify-center"
        initial={false}
        animate={{ opacity: revealed ? 0 : 1 }}
        transition={{ duration: 0.3, delay: revealed ? 0.05 : 0 }}
      >
        {!revealed && (
          <div className="absolute left-0 right-0 h-px bg-[#bbcac2]/50" style={{ top: seamY }} />
        )}
        {BURST.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-[#fbf9f7] shadow-[0_0_8px_rgba(187,202,194,0.9)]"
            style={{
              width: p.size,
              height: p.size,
              left: '50%',
              top: seamY,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
            animate={
              revealed
                ? { opacity: [0, 1, 0], x: p.x, y: p.y, scale: [0.4, 1, 0.6] }
                : { opacity: 0 }
            }
            transition={{ duration: 0.85, delay: p.delay, ease: 'easeOut' }}
          />
        ))}
      </motion.div>

    </motion.div>
  );
}
