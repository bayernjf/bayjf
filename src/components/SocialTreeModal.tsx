/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useRef, useState, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Github, Mail, Copy, Home, Check, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/clipboard';
import { trackEvent } from '../utils/analytics';

interface SocialTreeModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Logo element used as the genie origin; its rect drives the open animation. */
  originEl: HTMLElement | null;
  /** Called when the user requests close (Esc, overlay, button). */
  onClose: () => void;
  /** Navigate back to the home screen from inside the modal. */
  onHome: () => void;
  /** Logo button to restore focus to after closing. */
  logoButtonRef: React.RefObject<HTMLButtonElement>;
}

const EMAIL = 'b4yernjf@gmail.com';
const GITHUB = 'https://github.com/bayernjf';

// --- Genie open/close: shrink + fake rotation --------------------------------
// The card scales and spins out of the logo (and back into it on close).
// Transform-only, so everything stays on the compositor; a short motion-blur
// tween sells the speed. Open uses a spring for a natural overshoot, close a
// tween with easeIn for the accelerating "sucked in" feel.

function buildGenieFrames(offset: { x: number; y: number }) {
  const spin = offset.x < 0 ? -1 : 1;
  const ROLL = 36;

  return {
    initial: {
      // Fully opaque from the first frame: the card must be clearly visible
      // flying out of (and back into) the logo — no fading.
      opacity: 1,
      x: offset.x,
      y: offset.y,
      scale: 0.25,
      rotate: ROLL * spin,
      filter: 'blur(8px)',
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        stiffness: 260,
        damping: 12,
        mass: 0.9,
        filter: { type: 'tween' as const, duration: 0.3, ease: 'easeOut' as const },
      },
    },
    exit: {
      x: offset.x,
      y: offset.y,
      scale: 0.15,
      rotate: ROLL * spin,
      filter: 'blur(8px)',
      transition: { type: 'tween' as const, duration: 0.32, ease: 'easeIn' as const },
    },
  };
}

export default function SocialTreeModal({
  open,
  originEl,
  onClose,
  onHome,
  logoButtonRef,
}: SocialTreeModalProps) {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Portal + window access are client-only (Astro prerenders this island on the
  // server where `document`/`window` are undefined). Skip rendering until mounted.
  useEffect(() => setMounted(true), []);

  // Compute the delta between the logo origin and the viewport centre (the
  // card is flex-centred, so its centre matches the viewport centre).
  const getOriginOffset = () => {
    if (typeof window === 'undefined' || !originEl) return { x: 0, y: 0 };
    const r = originEl.getBoundingClientRect();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    return { x: r.left + r.width / 2 - cx, y: r.top + r.height / 2 - cy };
  };

  // Genie targets, recomputed only when the modal toggles or the logo moves.
  const genie = useMemo(() => {
    if (reduce || typeof window === 'undefined') return null;
    return buildGenieFrames(getOriginOffset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reduce, originEl]);

  // Focus management + scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = window.setTimeout(() => firstLinkRef.current?.focus(), 50);
    trackEvent('social_tree_open');
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Return focus to the logo button after close.
  useEffect(() => {
    if (!open) logoButtonRef.current?.focus();
  }, [open, logoButtonRef]);

  // Esc to close + simple Tab focus trap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleCopy = async (e: MouseEvent) => {
    e.preventDefault();
    const ok = await copyToClipboard(EMAIL);
    if (ok) {
      setCopied(true);
      showToast(
        language === 'en' ? 'Email copied to clipboard!' : '邮箱已复制到剪贴板！',
        'success'
      );
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      showToast(
        language === 'en' ? 'Failed to copy email.' : '复制邮箱失败。',
        'error'
      );
    }
  };

  const handleClick = (target: string) => (e: MouseEvent) => {
    e.preventDefault();
    trackEvent('social_tree_click', { target });
    if (target === 'home') {
      onHome();
      onClose();
      return;
    }
    if (target === 'email') {
      window.location.href = `mailto:${EMAIL}`;
      onClose();
      return;
    }
    if (target === 'github') {
      window.open(GITHUB, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  const items = [
    {
      target: 'github',
      icon: <Github size={18} />,
      label: 'GitHub',
      href: GITHUB,
      external: true,
      onClick: undefined,
    },
    {
      target: 'email',
      icon: <Mail size={18} />,
      label: 'Email',
      href: `mailto:${EMAIL}`,
      external: false,
      onClick: undefined,
    },
    {
      target: 'copy',
      icon: copied ? <Check size={18} /> : <Copy size={18} />,
      label: copied
        ? (language === 'en' ? 'Copied!' : '已复制')
        : t('social.copyEmail'),
      href: undefined,
      external: false,
      onClick: handleCopy,
    },
    {
      target: 'home',
      icon: <Home size={18} />,
      label: t('social.backHome'),
      href: undefined,
      external: false,
      onClick: handleClick('home'),
    },
  ] as const;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Overlay — split into a cheap tint layer and a backdrop-blur layer.
              Fullscreen backdrop-filter resamples the page every frame, which
              janks the genie warp while the card is still moving, so the blur
              only fades in after the card has settled (and leaves first). */}
          <motion.div
            className="absolute inset-0 bg-night/40 dark:bg-black/50"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.1 } }}
          />
          <motion.div
            className="absolute inset-0 backdrop-blur-md"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
          />

          {/* Card — scales + spins out of / back into the logo */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="social-tree-title"
            className="relative z-10 w-[min(90vw,360px)] rounded-[24px] bg-paper dark:bg-night-panel border border-hairline/60 dark:border-white/10 shadow-2xl p-6"
            style={{ transformOrigin: 'center', willChange: 'transform, opacity, filter' }}
            initial={genie ? genie.initial : { opacity: 0 }}
            animate={
              genie ? genie.animate : { opacity: 1, transition: { duration: 0.2 } }
            }
            exit={genie ? genie.exit : { opacity: 0, transition: { duration: 0.2 } }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-full text-ink-soft dark:text-mist hover:text-ink dark:hover:text-paper hover:bg-paper-raised dark:hover:bg-night-hover transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <h2
                id="social-tree-title"
                className="font-sans text-lg font-semibold text-ink dark:text-paper tracking-tight"
              >
                {t('social.title')}
              </h2>
              <p className="font-sans text-xs text-ink-soft dark:text-mist mt-1">
                {t('social.subtitle')}
              </p>
            </div>

            <ul className="flex flex-col gap-1.5">
              {items.map((item, i) => (
                <motion.li
                  key={item.target}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={reduce ? {} : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.04, duration: 0.25 }}
                >
                  <a
                    {...(item.target === 'github'
                      ? { ref: firstLinkRef as React.RefObject<HTMLAnchorElement> }
                      : {})}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    onClick={item.onClick ?? handleClick(item.target)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-ink dark:text-paper hover:bg-paper-raised dark:hover:bg-night-hover transition-colors group cursor-pointer"
                  >
                    <span className="text-sage dark:text-mint group-hover:scale-110 transition-transform duration-200">
                      {item.icon}
                    </span>
                    <span className="font-sans text-sm font-medium">{item.label}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
