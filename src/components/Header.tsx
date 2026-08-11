/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScreenType } from '../types';
import { Sun, Moon, Monitor, Menu, X, Search } from 'lucide-react';
import { useState, MouseEvent } from 'react';
import { useLanguage, type Language } from '../context/LanguageContext';
import { swapLocale } from '../i18n/routing';
import LogoMark from './LogoMark';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType, transitionType?: 'none' | 'push') => void;
  theme: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  lang: Language;
}

export default function Header({ currentScreen, onNavigate, theme, toggleTheme, lang }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, t, searchQuery, setSearchQuery } = useLanguage();

  // 语言切换走 URL（MPA + URL 语言路由）：在同一屏路径下切换语言前缀。
  const switchLocale = (next: Language) => {
    window.location.href = swapLocale(window.location.pathname, next);
  };

  // Logo goes to Home screen
  const handleLogoClick = (e: MouseEvent) => {
    e.preventDefault();
    onNavigate('home', 'none');
    setMobileMenuOpen(false);
  };

  const navItems: { label: string; screen: ScreenType }[] = [
    { label: t('nav.home'), screen: 'home' },
    { label: t('nav.bayjf'), screen: 'bayjf' },
    { label: t('nav.experience'), screen: 'experience' },
    { label: t('nav.contact'), screen: 'contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-paper/70 dark:bg-night/70 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-500">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-16 py-4 h-20">
        {/* Logo containing "BayJF" text */}
        <a
          id="nav-logo"
          className="flex items-center gap-2.5 font-sans text-xl font-semibold text-ink dark:text-paper hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 tracking-tight"
          href={lang === 'zh' ? '/zh' : '/'}
          onClick={handleLogoClick}
        >
          <LogoMark size={26} />
          BayJF
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = currentScreen === item.screen;
            return (
              <a
                key={item.screen}
                id={`nav-${item.screen}`}
                href={item.screen === 'home' ? (lang === 'zh' ? '/zh' : '/') : `${lang === 'zh' ? '/zh' : ''}/${item.screen === 'bayjf' ? 'projects' : item.screen}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.screen, 'none');
                }}
                className={`font-sans text-[13px] tracking-tight transition-all duration-200 py-1 hover:text-ink dark:hover:text-paper active:scale-[0.98] ${
                  isActive
                    ? 'text-ink dark:text-paper font-medium'
                    : 'text-ink-soft dark:text-mist font-normal'
                }`}
              >
                {item.label}
              </a>
            );
          })}

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
              className={`px-2.5 py-1 rounded-full text-[11px] font-sans font-medium tracking-tight transition-all duration-200 ${
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
              className={`px-2.5 py-1 rounded-full text-[11px] font-sans font-medium tracking-tight transition-all duration-200 ${
                language === 'zh'
                  ? 'bg-paper dark:bg-night text-ink dark:text-paper shadow-sm'
                  : 'text-ink-soft dark:text-mist hover:text-ink dark:hover:text-paper'
              }`}
            >
              中
            </button>
          </div>

          <button
            id="theme-toggle-btn"
            aria-label="Toggle Theme"
            title={theme === 'light' ? 'Theme: Light' : theme === 'dark' ? 'Theme: Dark' : 'Theme: System'}
            className="p-2 text-ink dark:text-paper hover:scale-105 active:scale-[0.97] transition-all duration-200"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={18} /> : theme === 'dark' ? <Sun size={18} /> : <Monitor size={18} />}
          </button>

          <button
            id="mobile-menu-btn"
            aria-label="Toggle Mobile Menu"
            className="md:hidden p-2 text-ink dark:text-paper active:scale-[0.97] transition-transform duration-200"
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
                  className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium tracking-tight transition-all duration-200 ${
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
                  className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium tracking-tight transition-all duration-200 ${
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
  );
}
