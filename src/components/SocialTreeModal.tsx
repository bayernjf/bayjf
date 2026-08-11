/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, MouseEvent } from 'react';
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

  // Compute the delta between the logo origin and the viewport centre so the
  // card appears to grow out of the logo (a pragmatic genie approximation:
  // scale + translate from the logo rect, not a true path-morph suck-in).
  const getOriginOffset = () => {
    if (typeof window === 'undefined' || !originEl) return { x: 0, y: 0 };
    const r = originEl.getBoundingClientRect();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    return { x: r.left + r.width / 2 - cx, y: r.top + r.height / 2 - cy };
  };

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

  const offset = getOriginOffset();

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
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-hidden={false}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-night/40 dark:bg-black/50 backdrop-blur-md" />

          {/* Card — genie grow from the logo origin */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="social-tree-title"
            className="relative z-10 w-[min(90vw,360px)] rounded-[24px] bg-paper dark:bg-night border border-hairline/20 dark:border-white/10 shadow-2xl p-6"
            style={{ transformOrigin: 'center' }}
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.15, scaleY: 0.3, x: offset.x, y: offset.y }
            }
            animate={
              reduce
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    scale: [0.15, 1, 1],
                    scaleY: [0.3, 0.82, 1],
                    x: [offset.x, 0, 0],
                    y: [offset.y, 0, 0],
                  }
            }
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.12, scaleY: 0.25, x: offset.x, y: offset.y }
            }
            transition={{
              duration: reduce ? 0.2 : 0.42,
              ease: [0.22, 1, 0.36, 1],
              times: reduce ? undefined : [0, 0.6, 1],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-full text-ink-soft dark:text-mist hover:text-ink dark:hover:text-paper hover:bg-paper-raised dark:hover:bg-night-raised transition-colors"
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
                  transition={{ delay: 0.06 + i * 0.04, duration: 0.25 }}
                >
                  <a
                    {...(item.target === 'github'
                      ? { ref: firstLinkRef as React.RefObject<HTMLAnchorElement> }
                      : {})}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    onClick={item.onClick ?? handleClick(item.target)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-ink dark:text-paper hover:bg-paper-raised dark:hover:bg-night-raised transition-colors group"
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
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
