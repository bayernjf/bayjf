/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScreenType } from '../types';
import { Sun, Moon, Monitor, Menu, X, Search, Github } from 'lucide-react';
import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useLanguage, type Language } from '../context/LanguageContext';
import { swapLocale } from '../i18n/routing';
import LogoMark from './LogoMark';
import NavTab from './NavTab';
import SocialTreeModal from './SocialTreeModal';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType, transitionType?: 'none' | 'push') => void;
  theme: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  lang: Language;
}

export default function Header({ currentScreen, onNavigate, theme, toggleTheme, lang }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  // Breathing glow runs on load to draw attention to the logo; once the user
  // has opened (and closed) the social tree, pause it for the rest of the
  // session. A page reload re-enables it. State resets because the header
  // remounts on every full navigation.
  const [breathing, setBreathing] = useState(true);
  const openedOnceRef = useRef(false);
  const logoButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const { language, t, searchQuery, setSearchQuery } = useLanguage();

  useEffect(() => {
    if (socialOpen) {
      openedOnceRef.current = true;
    } else if (openedOnceRef.current) {
      setBreathing(false);
    }
  }, [socialOpen]);

  // 整页导航（如语言切换 = location.href 跳转）后，浏览器会把焦点恢复到
  // header 里的按钮上并显示焦点框。挂载时清掉这个恢复出来的焦点，避免难看的方框。
  useEffect(() => {
    const el = document.activeElement as HTMLElement | null;
    if (el && el.tagName === 'BUTTON' && el.closest('nav')) {
      el.blur();
    }
  }, []);

  // 语言切换走 URL（MPA + URL 语言路由）：在同一屏路径下切换语言前缀。
  const switchLocale = (next: Language) => {
    window.location.href = swapLocale(window.location.pathname, next);
  };

  // Logo opens the social tree modal (home entry is kept via the Home tab and
  // the modal's "back home" action).
  const handleLogoClick = (e: MouseEvent) => {
    e.preventDefault();
    setSocialOpen(true);
  };

  const navItems: { label: string; screen: ScreenType; tooltipKey: string }[] = [
    { label: t('nav.home'), screen: 'home', tooltipKey: 'nav.tip.home' },
    { label: t('nav.bayjf'), screen: 'bayjf', tooltipKey: 'nav.tip.bayjf' },
    { label: t('nav.experience'), screen: 'experience', tooltipKey: 'nav.tip.experience' },
    { label: t('nav.contact'), screen: 'contact', tooltipKey: 'nav.tip.contact' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-paper/70 dark:bg-night/70 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-500">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-16 py-4 h-20">
        {/* Logo: breathing glow + social tree trigger */}
        <div className="relative flex items-center">
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 ml-3 h-12 w-12 rounded-full bg-sage/50 dark:bg-mint/50 blur-[7px]"
            animate={
              reduceMotion
                ? { opacity: 0.4 }
                : socialOpen
                  ? { opacity: 0.15 }
                  : breathing
                    ? { opacity: [0.3, 1, 0.3], scale: [0.85, 1.55, 0.85] }
                    : { opacity: 0.4 }
            }
            transition={
              reduceMotion || socialOpen || !breathing
                ? { duration: 0.2 }
                : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            }
          />
          <button
            id="nav-logo"
            type="button"
            ref={logoButtonRef}
            aria-haspopup="dialog"
            aria-expanded={socialOpen}
            aria-label={t('nav.tip.social')}
            onClick={handleLogoClick}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            className="relative flex items-center gap-2.5 font-sans text-xl font-semibold text-ink dark:text-paper hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 tracking-tight cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40 dark:focus-visible:ring-mint/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-night"
          >
            <LogoMark size={26} />
            BayJF

            {/* 呼吸箭头（指向左下 logo）+ “更多”，二者吸附并同步呼吸，整体上移。弹窗打开时暂停；首次开关后连同光晕一起长时间暂停 */}
            <motion.span
              animate={
                reduceMotion || socialOpen
                  ? { opacity: 0.6 }
                  : breathing
                    ? { opacity: [0.35, 1, 0.35], scale: [0.8, 1.2, 0.8] }
                    : { opacity: 0.6 }
              }
              transition={reduceMotion || socialOpen || !breathing ? { duration: 0.2 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden sm:inline-flex items-start gap-0.5 ml-1 -translate-y-2"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 28 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-sage dark:text-mint inline-block"
              >
                <line x1="24" y1="6" x2="7" y2="23" />
                <path d="M7 23 L7 13" />
                <path d="M7 23 L17 23" />
              </svg>
              <span className="font-sans text-[11px] font-medium tracking-tight text-ink-soft dark:text-mist -mt-1">
                {t('nav.more')}
              </span>
            </motion.span>

            {/* Tooltip（hover 时显示，与导航 tab 对齐） */}
            <AnimatePresence>
              {logoHovered && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-0.5 rounded-md bg-ink/90 dark:bg-paper/90 text-paper dark:text-ink text-[10px] tracking-tight whitespace-nowrap backdrop-blur-sm"
                  role="tooltip"
                >
                  {t('nav.tip.social')}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="relative hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <NavTab
              key={item.screen}
              id={`nav-${item.screen}`}
              label={item.label}
              tooltip={t(item.tooltipKey)}
              href={item.screen === 'home' ? (lang === 'zh' ? '/zh' : '/') : `${lang === 'zh' ? '/zh' : ''}/${item.screen === 'bayjf' ? 'projects' : item.screen}`}
              isActive={currentScreen === item.screen}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.screen, 'none');
              }}
            />
          ))}

          {/* Search bar inside header */}
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-3 text-ink-soft/60 dark:text-mist/60" />
            <input
              id="header-search-input"
              type="text"
              placeholder={t('nav.search')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentScreen !== 'bayjf' && e.target.value.trim() !== '') {
                  onNavigate('bayjf', 'none');
                }
              }}
              className="pl-8 pr-4 py-1.5 w-32 lg:w-40 text-[13px] font-sans rounded-full bg-paper-raised dark:bg-night-raised text-ink dark:text-paper placeholder-ink-soft/70 dark:placeholder-mist/70 focus:outline-none focus:bg-paper dark:focus:bg-night focus:ring-1 focus:ring-sage/30 dark:focus:ring-mint/30 focus:w-44 lg:focus:w-52 transition-all duration-300"
            />
          </div>
        </div>

        {/* Theme and Mobile Menu Toggle */}
        <div className="flex items-center space-x-3">
          {/* Language Toggle */}
          <div className="flex items-center bg-paper-raised dark:bg-night-raised rounded-full p-0.5">
            <button
              id="lang-btn-en"
              onClick={() => switchLocale('en')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-sans font-medium tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40 dark:focus-visible:ring-mint/40 focus-visible:ring-offset-1 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-night ${
                language === 'en'
                  ? 'bg-paper dark:bg-night text-ink dark:text-paper shadow-sm'
                  : 'text-ink-soft dark:text-mist hover:text-ink dark:hover:text-paper'
              }`}
            >
              EN
            </button>
            <button
              id="lang-btn-zh"
              onClick={() => switchLocale('zh')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-sans font-medium tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40 dark:focus-visible:ring-mint/40 focus-visible:ring-offset-1 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-night ${
                language === 'zh'
                  ? 'bg-paper dark:bg-night text-ink dark:text-paper shadow-sm'
                  : 'text-ink-soft dark:text-mist hover:text-ink dark:hover:text-paper'
              }`}
            >
              中
            </button>
          </div>

          <a
            id="nav-github"
            href="https://github.com/bayernjf/bayjf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star on GitHub"
            className="interactive group inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full bg-paper-raised dark:bg-night-raised text-ink dark:text-paper hover:bg-sage hover:text-paper dark:hover:bg-mint dark:hover:text-ink transition-all duration-200 hover:scale-105 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40 dark:focus-visible:ring-mint/40 focus-visible:ring-offset-1 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-night"
          >
            <Github size={15} />
            <span className="hidden sm:inline font-sans text-[11px] font-medium tracking-tight whitespace-nowrap">
              Star on GitHub
            </span>
          </a>

          <button
            id="theme-toggle-btn"
            aria-label="Toggle Theme"
            title={theme === 'light' ? 'Theme: Light' : theme === 'dark' ? 'Theme: Dark' : 'Theme: System'}
            className="p-2 text-ink dark:text-paper hover:scale-105 active:scale-[0.97] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40 dark:focus-visible:ring-mint/40 focus-visible:ring-offset-1 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-night"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={18} /> : theme === 'dark' ? <Sun size={18} /> : <Monitor size={18} />}
          </button>

          <button
            id="mobile-menu-btn"
            aria-label="Toggle Mobile Menu"
            className="md:hidden p-2 text-ink dark:text-paper active:scale-[0.97] transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40 dark:focus-visible:ring-mint/40 focus-visible:ring-offset-1 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-night"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-paper/95 dark:bg-night/95 backdrop-blur-xl border-t border-hairline/20 dark:border-white/5 py-4 px-6 transition-all duration-200">
          <div className="flex flex-col space-y-4">
            {/* Mobile Search input */}
            <div className="relative flex items-center mb-2">
              <Search size={13} className="absolute left-3 text-ink-soft/60 dark:text-mist/60" />
              <input
                id="header-search-input-mobile"
                type="text"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentScreen !== 'bayjf' && e.target.value.trim() !== '') {
                    onNavigate('bayjf', 'none');
                  }
                }}
                className="pl-8 pr-4 py-2 w-full text-[13px] font-sans rounded-full bg-paper-raised dark:bg-night-raised text-ink dark:text-paper placeholder-ink-soft/70 dark:placeholder-mist/70 focus:outline-none focus:ring-1 focus:ring-sage/30 dark:focus:ring-mint/30 transition-all duration-300"
              />
            </div>
            {navItems.map((item) => {
              const isActive = currentScreen === item.screen;
              return (
                <a
                  key={item.screen}
                  id={`nav-mobile-${item.screen}`}
                  href={item.screen === 'home' ? (lang === 'zh' ? '/zh' : '/') : `${lang === 'zh' ? '/zh' : ''}/${item.screen === 'bayjf' ? 'projects' : item.screen}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.screen, 'none');
                    setMobileMenuOpen(false);
                  }}
                  className={`font-sans text-[15px] py-2 tracking-tight block active:scale-[0.98] transition-all duration-200 ${
                    isActive
                      ? 'text-ink dark:text-paper font-medium'
                      : 'text-ink-soft dark:text-mist font-normal'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}

            {/* Mobile Language Switcher Component */}
            <div className="pt-4 mt-2 border-t border-hairline/20 dark:border-white/5 flex items-center justify-between">
              <span className="font-sans text-[13px] font-medium text-ink-soft dark:text-mist">
                {language === 'en' ? 'Language' : '语言选择'}
              </span>
              <div className="flex items-center bg-paper-raised dark:bg-night-raised rounded-full p-0.5">
                <button
                  id="lang-btn-mobile-en"
                  onClick={() => {
                    switchLocale('en');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40 dark:focus-visible:ring-mint/40 focus-visible:ring-offset-1 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-night ${
                    language === 'en'
                      ? 'bg-paper dark:bg-night text-ink dark:text-paper shadow-sm'
                      : 'text-ink-soft dark:text-mist hover:text-ink dark:hover:text-paper'
                  }`}
                >
                  EN
                </button>
                <button
                  id="lang-btn-mobile-zh"
                  onClick={() => {
                    switchLocale('zh');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40 dark:focus-visible:ring-mint/40 focus-visible:ring-offset-1 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-night ${
                    language === 'zh'
                      ? 'bg-paper dark:bg-night text-ink dark:text-paper shadow-sm'
                      : 'text-ink-soft dark:text-mist hover:text-ink dark:hover:text-paper'
                  }`}
                >
                  中
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>

    <SocialTreeModal
      open={socialOpen}
      originEl={logoButtonRef.current}
      onClose={() => setSocialOpen(false)}
      onHome={() => onNavigate('home', 'none')}
      logoButtonRef={logoButtonRef}
    />
    </>
  );
}
