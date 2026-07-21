/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';

interface ScrollProgressProps {
  currentScreen: string;
}

export default function ScrollProgress({ currentScreen }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 200,
    restDelta: 0.001,
  });

  const [isVisible, setIsVisible] = useState(false);

  // Monitor scroll height to only show the bar when the page is actually scrollable
  useEffect(() => {
    const handleResizeOrScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      // Show only if there is a scrollable area greater than 100px
      setIsVisible(scrollHeight - clientHeight > 100);
    };

    // Run initially
    handleResizeOrScroll();

    // Observe changes in document body size or resize
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll);

    const observer = new ResizeObserver(handleResizeOrScroll);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll);
      observer.disconnect();
    };
  }, [currentScreen]);

  const targetScreens = ['bayjf', 'experience'];
  if (!targetScreens.includes(currentScreen) || !isVisible) {
    return null;
  }

  return (
    <motion.div
      id="scroll-progress-bar"
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#54615b] dark:bg-[#bbcac2] z-[100] origin-left pointer-events-none shadow-[0_1px_3px_rgba(84,97,91,0.15)] dark:shadow-[0_1px_3px_rgba(187,202,194,0.15)]"
      style={{ scaleX }}
    />
  );
}
