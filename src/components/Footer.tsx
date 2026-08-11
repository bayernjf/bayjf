/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLanguage } from '../context/LanguageContext';
import { Mail } from 'lucide-react';
import LogoMark from './LogoMark';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t, language } = useLanguage();
  const base = language === 'zh' ? '/zh' : '';

  return (
    <footer className="w-full py-10 bg-paper-raised dark:bg-night-hover border-t border-hairline/30 dark:border-white/5 transition-colors duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-6 md:px-16">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 mb-4 md:mb-0">
          <div className="flex items-center gap-2">
            <LogoMark size={18} />
            <p className="font-sans text-xs tracking-wider text-ink-soft dark:text-mist">
              {t('footer.copyright', { year: currentYear.toString() })}
            </p>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href={`${base}/privacy`}
              className="font-sans text-xs tracking-wider text-ink-soft dark:text-mist hover:text-ink dark:hover:text-paper transition-colors"
            >
              {t('footer.privacy')}
            </a>
            <a
              href={`${base}/terms`}
              className="font-sans text-xs tracking-wider text-ink-soft dark:text-mist hover:text-ink dark:hover:text-paper transition-colors"
            >
              {t('footer.terms')}
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-6">
          <a
            id="footer-github"
            href="https://github.com/bayernjf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="interactive group flex items-center justify-center w-9 h-9 rounded-full bg-hairline/30 dark:bg-white/5 hover:bg-sage dark:hover:bg-mint border border-hairline/40 dark:border-white/5 hover:border-transparent dark:hover:border-transparent text-ink-soft dark:text-mist hover:text-paper dark:hover:text-ink transition-all duration-300 transform hover:scale-105"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:scale-110"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
          </a>
          <a
            id="footer-email"
            href="mailto:b4yernjf@gmail.com"
            aria-label="Email"
            className="interactive group flex items-center justify-center w-9 h-9 rounded-full bg-hairline/30 dark:bg-white/5 hover:bg-sage dark:hover:bg-mint border border-hairline/40 dark:border-white/5 hover:border-transparent dark:hover:border-transparent text-ink-soft dark:text-mist hover:text-paper dark:hover:text-ink transition-all duration-300 transform hover:scale-105"
          >
            <Mail size={16} className="transition-transform duration-300 group-hover:scale-110" />
          </a>
        </div>
      </div>
    </footer>
  );
}
