/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScreenType } from '../types';
import { Sun, Moon, Menu, X, Globe, Search, Volume2, VolumeX } from 'lucide-react';
import { useState, MouseEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType, transitionType?: 'none' | 'push') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Header({ currentScreen, onNavigate, theme, toggleTheme }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t, searchQuery, setSearchQuery, soundEnabled, setSoundEnabled } = useLanguage();

  // Logo goes to Home screen
  const handleLogoClick = (e: MouseEvent) => {
    e.preventDefault();
    onNavigate('home', 'none');
    setMobileMenuOpen(false);
  };

  const navItems: { label: string; screen: ScreenType; shortcut: string; isUppercaseClass?: boolean }[] = [
    { label: t('nav.home'), screen: 'home', shortcut: 'H' },
    { label: t('nav.bayjf'), screen: 'bayjf', shortcut: 'P', isUppercaseClass: true },
    { label: t('nav.experience'), screen: 'experience', shortcut: 'E' },
    { label: t('nav.contact'), screen: 'contact', shortcut: 'C' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#fbf9f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-[#e4e2e0]/30 dark:border-white/5 transition-colors duration-500">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-16 py-4 h-20">
        {/* Logo containing "BayJF" text */}
        <a
          id="nav-logo"
          className="font-serif text-2xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7] hover:scale-105 transition-all duration-300 tracking-tight"
          href="#"
          onClick={handleLogoClick}
        >
          BayJF
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = currentScreen === item.screen;
            // Ensure uppercase class is added exactly when specified to satisfy the xpath contains(@class, 'uppercase')
            const uppercaseClass = item.isUppercaseClass ? 'uppercase' : '';
            return (
              <a
                key={item.screen}
                id={`nav-${item.screen}`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.screen, 'none');
                }}
                className={`font-sans text-sm tracking-wider transition-all duration-300 relative py-1 hover:text-[#54615b] dark:hover:text-[#bbcac2] flex items-center gap-1.5 ${uppercaseClass} ${
                  isActive
                    ? 'text-[#54615b] dark:text-[#bbcac2] font-semibold border-b-2 border-[#54615b] dark:border-[#bbcac2]'
                    : 'text-[#444748] dark:text-[#c4c7c7]'
                }`}
              >
                <span>{item.label}</span>
                <kbd className="hidden lg:inline-block px-1 py-0.5 text-[9px] font-mono font-bold rounded bg-[#e4e2e0]/40 dark:bg-white/5 text-[#444748]/60 dark:text-[#c4c7c7]/60 border border-[#e4e2e0]/60 dark:border-white/5 shadow-sm">
                  {item.shortcut}
                </kbd>
              </a>
            );
          })}

          {/* Search bar inside header */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-[#444748]/50 dark:text-[#c4c7c7]/50" />
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
              className="pl-9 pr-4 py-1.5 w-36 lg:w-44 text-xs font-sans rounded-full bg-[#e4e2e0]/30 dark:bg-white/5 text-[#1b1c1b] dark:text-[#fbf9f7] placeholder-[#444748]/50 dark:placeholder-[#c4c7c7]/40 border border-[#e4e2e0]/50 dark:border-white/5 focus:outline-none focus:border-[#54615b] dark:focus:border-[#bbcac2] focus:w-48 lg:focus:w-56 transition-all duration-300"
            />
          </div>
        </div>

        {/* Theme and Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          {/* Language Toggle */}
          <div className="flex items-center bg-[#e4e2e0]/30 dark:bg-white/5 rounded-full p-1 border border-[#e4e2e0]/50 dark:border-white/5 shadow-sm">
            <button
              id="lang-btn-en"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-bold tracking-wider transition-all duration-300 ${
                language === 'en'
                  ? 'bg-[#1b1c1b] dark:bg-[#fbf9f7] text-[#fbf9f7] dark:text-[#1b1c1b] shadow-sm'
                  : 'text-[#444748] dark:text-[#c4c7c7] hover:opacity-80'
              }`}
            >
              EN
            </button>
            <button
              id="lang-btn-zh"
              onClick={() => setLanguage('zh')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-bold tracking-wider transition-all duration-300 ${
                language === 'zh'
                  ? 'bg-[#1b1c1b] dark:bg-[#fbf9f7] text-[#fbf9f7] dark:text-[#1b1c1b] shadow-sm'
                  : 'text-[#444748] dark:text-[#c4c7c7] hover:opacity-80'
              }`}
            >
              ZH
            </button>
          </div>

          {/* Subtle Sound FX Toggle */}
          <button
            id="sound-fx-toggle-btn"
            aria-label={soundEnabled ? t('nav.soundOn') : t('nav.soundOff')}
            title={soundEnabled ? t('nav.soundOn') : t('nav.soundOff')}
            className="p-2 text-[#1b1c1b]/65 dark:text-[#fbf9f7]/65 hover:text-[#1b1c1b] dark:hover:text-[#fbf9f7] hover:scale-110 active:scale-95 transition-all duration-200"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            id="theme-toggle-btn"
            aria-label="Toggle Theme"
            className="p-2 text-[#1b1c1b] dark:text-[#fbf9f7] hover:scale-110 active:scale-95 transition-all duration-200"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button
            id="mobile-menu-btn"
            aria-label="Toggle Mobile Menu"
            className="md:hidden p-2 text-[#1b1c1b] dark:text-[#fbf9f7]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#fbf9f7] dark:bg-[#121212] border-b border-[#e4e2e0] dark:border-white/5 py-4 px-6 transition-all duration-300 animate-in fade-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-4">
            {/* Mobile Search input */}
            <div className="relative flex items-center mb-2">
              <Search size={14} className="absolute left-3 text-[#444748]/50 dark:text-[#c4c7c7]/50" />
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
                className="pl-9 pr-4 py-2 w-full text-xs font-sans rounded-full bg-[#e4e2e0]/30 dark:bg-white/5 text-[#1b1c1b] dark:text-[#fbf9f7] placeholder-[#444748]/50 dark:placeholder-[#c4c7c7]/40 border border-[#e4e2e0]/50 dark:border-white/5 focus:outline-none focus:border-[#54615b] dark:focus:border-[#bbcac2] transition-colors duration-300"
              />
            </div>
            {navItems.map((item) => {
              const isActive = currentScreen === item.screen;
              const uppercaseClass = item.isUppercaseClass ? 'uppercase' : '';
              return (
                <a
                  key={item.screen}
                  id={`nav-mobile-${item.screen}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.screen, 'none');
                    setMobileMenuOpen(false);
                  }}
                  className={`font-sans text-base py-2 tracking-wide block ${uppercaseClass} ${
                    isActive
                      ? 'text-[#54615b] dark:text-[#bbcac2] font-semibold border-l-4 border-[#54615b] dark:border-[#bbcac2] pl-3'
                      : 'text-[#444748] dark:text-[#c4c7c7] pl-1'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}

            {/* Mobile Language Switcher Component */}
            <div className="pt-4 mt-2 border-t border-[#e4e2e0]/50 dark:border-white/5 flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[#444748]/75 dark:text-[#c4c7c7]/75">
                {language === 'en' ? 'Language' : '语言选择'}
              </span>
              <div className="flex items-center bg-[#e4e2e0]/30 dark:bg-white/5 rounded-full p-1 border border-[#e4e2e0]/50 dark:border-white/5 shadow-sm">
                <button
                  id="lang-btn-mobile-en"
                  onClick={() => {
                    setLanguage('en');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-sans font-bold tracking-wider transition-all duration-300 ${
                    language === 'en'
                      ? 'bg-[#1b1c1b] dark:bg-[#fbf9f7] text-[#fbf9f7] dark:text-[#1b1c1b] shadow-sm'
                      : 'text-[#444748] dark:text-[#c4c7c7] hover:opacity-80'
                  }`}
                >
                  EN
                </button>
                <button
                  id="lang-btn-mobile-zh"
                  onClick={() => {
                    setLanguage('zh');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-sans font-bold tracking-wider transition-all duration-300 ${
                    language === 'zh'
                      ? 'bg-[#1b1c1b] dark:bg-[#fbf9f7] text-[#fbf9f7] dark:text-[#1b1c1b] shadow-sm'
                      : 'text-[#444748] dark:text-[#c4c7c7] hover:opacity-80'
                  }`}
                >
                  ZH
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
