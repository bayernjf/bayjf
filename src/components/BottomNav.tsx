/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import NavTab from './NavTab';
import type { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType, transitionType?: 'none' | 'push') => void;
}

// Mirrors the top nav items (same translation keys).
const NAV_ITEMS = [
  { labelKey: 'nav.home', screen: 'home', tooltipKey: 'nav.tip.home' },
  { labelKey: 'nav.bayjf', screen: 'bayjf', tooltipKey: 'nav.tip.bayjf' },
  { labelKey: 'nav.experience', screen: 'experience', tooltipKey: 'nav.tip.experience' },
  { labelKey: 'nav.contact', screen: 'contact', tooltipKey: 'nav.tip.contact' },
] as const;

// Only show on pages that actually scroll.
const MIN_SCROLLABLE = 200;
// Gap between the pill's bottom edge and the footer's top edge.
const FOOTER_GAP = 16;

export default function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const { t, language } = useLanguage();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [pillBottom, setPillBottom] = useState(FOOTER_GAP);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const footer = document.querySelector('footer');
      if (!footer) {
        setVisible(false);
        return;
      }
      const scrollable = doc.scrollHeight - window.innerHeight > MIN_SCROLLABLE;
      // Show once the footer has entered the viewport (i.e. the user has
      // scrolled down to the bottom region).
      const footerTop = footer.getBoundingClientRect().top;
      const footerHeight = footer.offsetHeight;
      const footerInView = footerTop <= window.innerHeight;
      setVisible(scrollable && footerInView);
      // Keep the pill floating just ABOVE the footer top, in the content area,
      // never on top of the footer itself.
      const bottom = Math.min(
        Math.max(window.innerHeight - footerTop + FOOTER_GAP, FOOTER_GAP),
        footerHeight + 40,
      );
      setPillBottom(bottom);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [currentScreen]);

  const baseHref = (screen: ScreenType) =>
    screen === 'home'
      ? language === 'zh'
        ? '/zh'
        : '/'
      : `${language === 'zh' ? '/zh' : ''}/${screen === 'bayjf' ? 'projects' : screen}`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          aria-label={language === 'zh' ? '底部导航' : 'Bottom navigation'}
          style={{ bottom: `${pillBottom}px` }}
          className="hidden md:flex fixed left-1/2 -translate-x-1/2 z-[95] items-center gap-3 rounded-full border border-hairline/20 dark:border-white/10 bg-paper/70 dark:bg-night/70 backdrop-blur-xl backdrop-saturate-150 shadow-lg px-3 py-2.5"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {NAV_ITEMS.map((item) => (
            <NavTab
              key={item.screen}
              label={t(item.labelKey)}
              tooltip={t(item.tooltipKey)}
              href={baseHref(item.screen)}
              id={`bottom-nav-${item.screen}`}
              isActive={currentScreen === item.screen}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.screen, 'none');
              }}
            />
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
