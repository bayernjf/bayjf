/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface BackToTopProps {
  currentScreen: string;
}

export default function BackToTop({ currentScreen }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Check if scrolled past 1 full viewport height
      if (window.scrollY > window.innerHeight) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    // Initial check
    toggleVisibility();

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [currentScreen]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Only render on content-heavy screens where scrolling actually happens
  const scrollableScreens = ['bayjf', 'experience', 'contact', 'home'];
  if (!scrollableScreens.includes(currentScreen)) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          id="back-to-top-btn"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back to top"
          className="interactive fixed bottom-8 right-8 z-[90] flex items-center justify-center w-11 h-11 rounded-full shadow-lg bg-[#1b1c1b] dark:bg-[#fbf9f7] text-[#fbf9f7] dark:text-[#1b1c1b] hover:bg-[#54615b] dark:hover:bg-[#bbcac2] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#54615b] dark:focus:ring-[#bbcac2] focus:ring-offset-2"
        >
          <ArrowUp size={18} className="animate-pulse" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
