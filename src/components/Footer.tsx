/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLanguage } from '../context/LanguageContext';
import { Github, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="w-full py-10 bg-[#f5f3f1] dark:bg-[#1a1b1a] border-t border-[#e4e2e0]/30 dark:border-white/5 transition-colors duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-6 md:px-16">
        <p className="font-sans text-xs tracking-wider text-[#444748] dark:text-[#c4c7c7] mb-4 md:mb-0">
          {t('footer.copyright', { year: currentYear.toString() })}
        </p>
        <div className="flex items-center space-x-6">
          <a
            id="footer-github"
            href="https://github.com/bayernjf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="interactive group flex items-center justify-center w-9 h-9 rounded-full bg-[#e4e2e0]/30 dark:bg-white/5 hover:bg-[#54615b] dark:hover:bg-[#bbcac2] border border-[#e4e2e0]/40 dark:border-white/5 hover:border-transparent dark:hover:border-transparent text-[#444748] dark:text-[#c4c7c7] hover:text-[#fbf9f7] dark:hover:text-[#1b1c1b] transition-all duration-300 transform hover:scale-105"
          >
            <Github size={16} className="transition-transform duration-300 group-hover:scale-110" />
          </a>
          <a
            id="footer-email"
            href="mailto:hello@bayjf.pages.dev"
            aria-label="Email"
            className="interactive group flex items-center justify-center w-9 h-9 rounded-full bg-[#e4e2e0]/30 dark:bg-white/5 hover:bg-[#54615b] dark:hover:bg-[#bbcac2] border border-[#e4e2e0]/40 dark:border-white/5 hover:border-transparent dark:hover:border-transparent text-[#444748] dark:text-[#c4c7c7] hover:text-[#fbf9f7] dark:hover:text-[#1b1c1b] transition-all duration-300 transform hover:scale-105"
          >
            <Mail size={16} className="transition-transform duration-300 group-hover:scale-110" />
          </a>
        </div>
      </div>
    </footer>
  );
}
