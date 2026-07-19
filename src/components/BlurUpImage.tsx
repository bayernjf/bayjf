/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';

interface BlurUpImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function BlurUpImage({ src, alt, className = '' }: BlurUpImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If IntersectionObserver is not supported, load immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Once in view, we don't need to observe it anymore
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        });
      },
      {
        rootMargin: '200px 0px', // Pre-load when within 200px of viewport to improve perceived speed
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Generate low-res placeholder URL for Unsplash images
  // We change the width to 40px and quality to 10 for a tiny, fast-loading image
  const lowResSrc = src.includes('unsplash.com')
    ? src.replace(/w=\d+/, 'w=40').replace(/q=\d+/, 'q=10')
    : src;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#f5f3f1] dark:bg-[#1a1b1a]"
    >
      {/* Shimmer effect placeholder whilst not in view or not loaded */}
      {!isLoaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-r from-[#f5f3f1] via-[#eae8e5] to-[#f5f3f1] dark:from-[#1a1b1a] dark:via-[#242524] dark:to-[#1a1b1a] animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
        </div>
      )}

      {/* Low-res blurred background that fades out when loaded */}
      {isInView && (
        <img
          src={lowResSrc}
          alt={alt}
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className={`absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-opacity duration-1000 ease-in-out pointer-events-none z-0 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {/* Main high-res image that fades in and removes blur when loaded */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          className={`relative w-full h-full object-cover transition-all duration-1000 ease-out z-10 ${
            isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'
          } ${className}`}
        />
      )}
    </div>
  );
}

