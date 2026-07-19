/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScreenType } from '../types';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType, transitionType?: 'none' | 'push') => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden px-6 md:px-16 text-center">
        {/* Ambient Glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ebfaf1]/20 dark:bg-[#54615b]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-[#1b1c1b] dark:text-[#fbf9f7] mb-8 leading-tight">
            {t('home.hero.title1')}
            <br />
            <span className="text-[#54615b] dark:text-[#bbcac2]">{t('home.hero.title2')}</span>
          </h1>

          <p className="font-sans text-lg md:text-xl text-[#444748] dark:text-[#c4c7c7] max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('home.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              id="view-work-btn"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('portfolio', 'push');
              }}
              className="interactive inline-flex items-center justify-center bg-[#1b1c1b] dark:bg-[#fbf9f7] text-[#fbf9f7] dark:text-[#1b1c1b] hover:bg-[#54615b] dark:hover:bg-[#bbcac2] hover:scale-105 hover:shadow-lg transition-all duration-300 px-8 py-4 rounded-full font-sans font-semibold text-sm tracking-wider"
            >
              {t('home.hero.btnWork')}
            </a>
            <a
              id="about-me-btn"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('experience', 'none');
              }}
              className="interactive inline-flex items-center justify-center border border-[#444748] dark:border-[#c4c7c7] text-[#444748] dark:text-[#c4c7c7] hover:bg-[#54615b]/10 hover:scale-105 transition-all duration-300 px-8 py-4 rounded-full font-sans font-semibold text-sm tracking-wider"
            >
              {t('home.hero.btnAbout')}
            </a>
          </div>
        </motion.div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center cursor-pointer">
          <span className="font-sans text-xs tracking-widest text-[#444748] dark:text-[#c4c7c7] uppercase mb-2">{t('home.hero.scroll')}</span>
          <div className="w-8 h-8 rounded-full border border-[#444748]/30 dark:border-[#c4c7c7]/30 flex items-center justify-center">
            <span className="text-xs text-[#1b1c1b] dark:text-[#fbf9f7]">↓</span>
          </div>
        </div>
      </section>

      {/* Intro Section / Philosophy */}
      <section className="py-24 md:py-40 bg-[#f5f3f1] dark:bg-[#161716] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            {/* Image side */}
            <div className="md:col-span-5">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-white/10 p-2 bg-white/5 backdrop-blur-md">
                <div className="w-full h-full rounded-xl overflow-hidden relative group">
                  <img
                    alt="Designer Portrait"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out scale-105 group-hover:scale-100"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUIjKKY_IpX50adzUr3oXUApDyO8LctnMjCdCxK9AhK8N09oSThogr7WniXGq0w7SZbtiohJBMd_vR2QSklU_hEnGE4yM4XFkk4G46iwP5xfThx_I59NDHsJxWvc4rhhRZKREmkCyQYKo6zwKTfC3z29NVrVzhWwFjgQnsynm5qOD5YksuInkxUv6J55QR3KnSN9BGzUAnEEHTLSEt_GoUuIDMpNVYn9jYHN8r707kApTo70dOlM8r3fr0XkJwKW2B1fUEEKdqkCFD"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>
              </div>
            </div>

            {/* Content side */}
            <div className="md:col-span-6 md:col-start-7">
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7] mb-8 leading-tight">
                {t('home.philosophy.title')}
              </h2>
              <div className="space-y-6 font-sans text-base md:text-lg text-[#444748] dark:text-[#c4c7c7] leading-relaxed">
                <p>
                  {t('home.philosophy.p1')}
                </p>
                <p>
                  {t('home.philosophy.p2')}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="mt-12 grid grid-cols-2 gap-8 border-t border-[#e4e2e0] dark:border-white/10 pt-8">
                <div>
                  <span className="block font-serif text-4xl md:text-5xl font-bold text-[#54615b] dark:text-[#bbcac2] mb-2">10+</span>
                  <span className="font-sans text-xs uppercase tracking-widest text-[#444748] dark:text-[#c4c7c7] font-semibold">{t('home.philosophy.yearsExp')}</span>
                </div>
                <div>
                  <span className="block font-serif text-4xl md:text-5xl font-bold text-[#54615b] dark:text-[#bbcac2] mb-2">50+</span>
                  <span className="font-sans text-xs uppercase tracking-widest text-[#444748] dark:text-[#c4c7c7] font-semibold">{t('home.philosophy.projectsShipped')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
