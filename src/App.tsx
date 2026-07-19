/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { ScreenType } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ScrollProgress';
import SEOManager from './components/SEOManager';
import BackToTop from './components/BackToTop';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from './context/LanguageContext';
import { playThemeToggleSound } from './utils/sound';
import { trackPageView } from './utils/analytics';

const HomeScreen = lazy(() => import('./components/HomeScreen'));
const PortfolioScreen = lazy(() => import('./components/PortfolioScreen'));
const ExperienceScreen = lazy(() => import('./components/ExperienceScreen'));
const ContactScreen = lazy(() => import('./components/ContactScreen'));

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('portfolio_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (e) {}
    return 'dark';
  });
  const [transitionDirection, setTransitionDirection] = useState<'none' | 'push'>('none');
  const { soundEnabled } = useLanguage();

  // Handle theme toggling
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('portfolio_theme', nextTheme);
    } catch (e) {}
    if (soundEnabled) {
      playThemeToggleSound(nextTheme);
    }
  };

  // Sync theme with HTML class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Navigate function matching the transitions specified
  const handleNavigate = useCallback((screen: ScreenType, transitionType: 'none' | 'push' = 'none') => {
    setTransitionDirection(transitionType);
    setCurrentScreen(screen);
  }, []);

  // Global keyboard shortcuts for navigation (H, P, E, C)
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
        handleNavigate('portfolio', 'push');
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
        setCurrentScreen('portfolio');
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
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'portfolio':
        return <PortfolioScreen />;
      case 'experience':
        return <ExperienceScreen />;
      case 'contact':
        return <ContactScreen />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  // Variants for push vs none transitions
  const pageVariants = {
    initial: (direction: 'none' | 'push') => ({
      opacity: 0,
      x: direction === 'push' ? '100%' : 0,
      filter: direction === 'push' ? 'blur(4px)' : 'none',
    }),
    animate: {
      opacity: 1,
      x: 0,
      filter: 'none',
      transition: {
        duration: transitionDirection === 'push' ? 0.6 : 0.25,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: (direction: 'none' | 'push') => ({
      opacity: 0,
      x: direction === 'push' ? '-100%' : 0,
      filter: direction === 'push' ? 'blur(4px)' : 'none',
      transition: {
        duration: direction === 'push' ? 0.5 : 0.2,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-[#fbf9f7] text-[#1b1c1b] dark:bg-[#121212] dark:text-[#fbf9f7] selection:bg-[#54615b]/20 dark:selection:bg-[#bbcac2]/25`}>
      {/* Subtle Scroll Progress Bar */}
      <ScrollProgress currentScreen={currentScreen} />

      {/* Dynamic SEO & Accessibility Head Manager */}
      <SEOManager currentScreen={currentScreen} />

      {/* Floating Back to Top Button */}
      <BackToTop currentScreen={currentScreen} />

      {/* Custom Mouse Follower */}
      <CustomCursor />

      {/* Persistent Navigation Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        theme={theme}
        toggleTheme={toggleTheme}
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
                  <span className="text-sm text-[#444748] dark:text-[#c4c7c7]">Loading…</span>
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
  );
}
