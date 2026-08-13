/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Hourglass, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Project } from '../types';

interface ComingSoonModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ComingSoonModal({ project, onClose }: ComingSoonModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!project) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-night-overlay/75 backdrop-blur-md"
      />

      <motion.div
        id="project-coming-soon-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="relative w-full max-w-md bg-paper dark:bg-night-panel rounded-3xl border border-hairline dark:border-white/5 shadow-2xl text-ink dark:text-paper flex flex-col pointer-events-auto"
      >
        <button
          id="close-coming-soon-btn"
          onClick={onClose}
          className="interactive absolute right-5 top-5 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-ink dark:text-paper transition-all duration-300"
          aria-label={t('bayjf.close')}
        >
          <X size={16} />
        </button>

        <div className="px-8 pt-12 pb-8 flex flex-col items-center text-center gap-4">
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-sage/10 dark:bg-white/5 text-sage dark:text-mint">
            <Hourglass size={24} />
          </span>

          <div className="space-y-1">
            <span className="block font-sans text-[10px] font-bold tracking-widest uppercase text-ink-soft/60 dark:text-mist/50">
              {project.title}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
              {t('bayjf.comingSoon')}
            </h2>
          </div>

          <p className="font-sans text-sm leading-relaxed text-ink-soft dark:text-mist max-w-xs">
            {t('bayjf.comingSoonDesc')}
          </p>

          <div className="mt-2 flex flex-col items-stretch gap-2 w-full max-w-[220px]">
            {project.link && (
              <a
                id={`coming-soon-external-link-${project.id}`}
                href={project.link}
                className="interactive flex items-center justify-center gap-2 py-2.5 px-6 rounded-full bg-sage hover:bg-ink dark:bg-mint dark:hover:bg-paper text-paper dark:text-ink font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-md"
              >
                <span>{t('bayjf.website')}</span>
                <ExternalLink size={13} />
              </a>
            )}
            <button
              id="close-coming-soon-btn-bottom"
              onClick={onClose}
              className="interactive px-6 py-2.5 font-sans text-xs uppercase tracking-widest font-semibold text-ink-soft dark:text-mist bg-hairline/30 dark:bg-white/5 hover:bg-hairline/70 dark:hover:bg-white/10 rounded-full transition-all duration-300"
            >
              {t('bayjf.close')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
