/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { ScreenType } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useLanguage, type Language } from './context/LanguageContext';
import { LikeProvider } from './context/LikeContext';
import { playThemeToggleSound } from './utils/sound';
import { trackPageView } from './utils/analytics';
import type { AgentImage } from './components/SiteIsland';

const HomeScreen = lazy(() => import('./components/HomeScreen'));
const BayjfScreen = lazy(() => import('./components/BayjfScreen'));
const ExperienceScreen = lazy(() => import('./components/ExperienceScreen'));
const ContactScreen = lazy(() => import('./components/ContactScreen'));

export default function App({ lang, initialScreen = 'home', agentImages = [], turnstileSiteKey = '' }: { lang: Language; initialScreen?: ScreenType; agentImages?: AgentImage[]; turnstileSiteKey?: string }) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(initialScreen);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('bayjf_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch (e) {}
    return 'system';
  });
  // 系统明暗偏好：仅在 theme === 'system' 时决定实际主题
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });
  const isDark = theme === 'system' ? systemDark : theme === 'dark';
  const [transitionDirection, setTransitionDirection] = useState<'none' | 'push'>('none');
  const { soundEnabled } = useLanguage();

  // Follow live system preference changes (only affects visual when in system mode)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Handle theme toggling: light -> dark -> system -> light
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('bayjf_theme', nextTheme);
    } catch (e) {}
    if (soundEnabled) {
      // system 模式按当前系统偏好播放对应主题音效，与视觉变化一致
      const nextIsDark = nextTheme === 'system' ? systemDark : nextTheme === 'dark';
      playThemeToggleSound(nextIsDark ? 'dark' : 'light');
    }
  };

  // Sync effective theme with HTML class
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Navigate function matching the transitions specified
  const handleNavigate = useCallback((screen: ScreenType, transitionType: 'none' | 'push' = 'none') => {
    setTransitionDirection(transitionType);
    setCurrentScreen(screen);
  }, []);

  // Global keyboard shortcuts for navigation (H, B, E, C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing in an input, textarea, select, or editable element
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.hasAttribute('contenteditable') ||
          (activeElement as HTMLElement).isContentEditable)
      ) {
        return;
      }

      // Ignore if helper keys are held down (to avoid messing up browser shortcuts like Command+C or Ctrl+P)
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'h') {
        e.preventDefault();
        handleNavigate('home', 'push');
      } else if (key === 'p') {
        e.preventDefault();
        handleNavigate('bayjf', 'push');
      } else if (key === 'e') {
        e.preventDefault();
        handleNavigate('experience', 'push');
      } else if (key === 'c') {
        e.preventDefault();
        handleNavigate('contact', 'push');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNavigate]);

  // Scroll back to top on screen change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
    trackPageView(currentScreen);
  }, [currentScreen]);

  // Sync screen with URL if a project link is detected
  useEffect(() => {
    const checkUrlForProject = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const projectFromQuery = params.get('project');
      const projectFromHash = hash.startsWith('#project-') ? hash.substring(9) : null;
      
      if (projectFromQuery || projectFromHash) {
        setCurrentScreen('bayjf');
      }
    };
    
    checkUrlForProject();
    window.addEventListener('hashchange', checkUrlForProject);
    return () => {
      window.removeEventListener('hashchange', checkUrlForProject);
    };
  }, []);

  // Screen components mapper
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} agentImages={agentImages} lang={lang} />;
      case 'bayjf':
        return <BayjfScreen />;
      case 'experience':
        return <ExperienceScreen />;
      case 'contact':
        return <ContactScreen turnstileSiteKey={turnstileSiteKey} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} agentImages={agentImages} lang={lang} />;
    }
  };

  // Variants for push vs none transitions
  const pageVariants: Variants = {
    initial: (direction: 'none' | 'push') => ({
      opacity: 0,
      x: direction === 'push' ? 24 : 0,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: transitionDirection === 'push' ? 0.5 : 0.3,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
    exit: (direction: 'none' | 'push') => ({
      opacity: 0,
      x: direction === 'push' ? -24 : 0,
      transition: {
        duration: direction === 'push' ? 0.4 : 0.2,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <LikeProvider>
      <div className={`min-h-screen transition-colors duration-500 bg-paper text-ink dark:bg-night dark:text-paper selection:bg-sage/20 dark:selection:bg-mint/25`}>
      {/* Subtle Scroll Progress Bar */}
      <ScrollProgress currentScreen={currentScreen} />

      {/* Floating Back to Top Button */}
      <BackToTop currentScreen={currentScreen} />

      {/* Persistent Navigation Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        theme={theme}
        toggleTheme={toggleTheme}
        lang={lang}
      />

      {/* Main Content Area with Page Transitions */}
      <main className="flex-grow overflow-hidden">
        <AnimatePresence mode="wait" custom={transitionDirection}>
          <motion.div
            key={currentScreen}
            custom={transitionDirection}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <Suspense
              fallback={
                <div className="min-h-screen grid place-items-center" role="status" aria-live="polite">
                  <span className="text-sm text-ink-soft dark:text-mist">Loading…</span>
                </div>
              }
            >
              {renderScreen()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Footer */}
      <Footer />
      </div>
    </LikeProvider>
  );
}
