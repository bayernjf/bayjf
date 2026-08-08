/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScreenType } from '../types';
import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState } from 'react';
import type { AgentImage } from './SiteIsland';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType, transitionType?: 'none' | 'push') => void;
  agentImages: AgentImage[];
  lang: 'en' | 'zh';
}

export default function HomeScreen({ onNavigate, agentImages, lang }: HomeScreenProps) {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const [activeImage, setActiveImage] = useState(0);

  // 图片已在中英两版页面入口（IslandRoot.astro）经 astro:assets 优化，这里仅消费。
  const agentProjectImages = agentImages;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % agentProjectImages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="pt-20">
      {/* Hero: asymmetric split - copy left, framed carousel right */}
      <section className="relative min-h-[calc(100dvh-5rem)] flex items-center overflow-hidden px-6 md:px-16">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center py-16 md:py-20">
          {/* Copy side */}
          <div className="lg:col-span-6">
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
              className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-[#1b1c1b] dark:text-[#fbf9f7] leading-[1.1] pb-1 mb-8"
            >
              {t('home.hero.title1')}{' '}
              <span className="text-[#54615b] dark:text-[#bbcac2]">{t('home.hero.title2')}</span>
              <br />
              <em className="italic text-[#82978f] dark:text-[#a7bdb5]">{t('home.hero.title3')}</em>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease }}
              className="font-sans text-lg text-[#444748] dark:text-[#c4c7c7] max-w-xl leading-relaxed mb-10"
            >
              {t('home.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24, ease }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <a
                id="view-work-btn"
                href={`${lang === 'zh' ? '/zh' : ''}/projects`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('bayjf', 'push');
                }}
                className="interactive inline-flex items-center justify-center bg-[#1b1c1b] dark:bg-[#fbf9f7] text-[#fbf9f7] dark:text-[#1b1c1b] hover:bg-[#54615b] dark:hover:bg-[#bbcac2] hover:scale-105 hover:shadow-lg transition-all duration-300 px-8 py-4 rounded-full font-sans font-semibold text-sm tracking-wider"
              >
                {t('home.hero.btnWork')}
              </a>
              <a
                id="about-me-btn"
                href={`${lang === 'zh' ? '/zh' : ''}/contact`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('contact', 'none');
                }}
                className="interactive inline-flex items-center justify-center border border-[#444748] dark:border-[#c4c7c7] text-[#444748] dark:text-[#c4c7c7] hover:bg-[#54615b]/10 hover:scale-105 transition-all duration-300 px-8 py-4 rounded-full font-sans font-semibold text-sm tracking-wider"
              >
                {t('home.hero.btnAbout')}
              </a>
            </motion.div>
          </div>

          {/* Visual side: framed carousel */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.18, ease }}
            className="lg:col-span-5 lg:col-start-8"
          >
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-white/10 p-2 bg-white/5 backdrop-blur-md">
              <div className="w-full h-full rounded-xl overflow-hidden relative group">
                {agentProjectImages.map((image, index) => (
                  <img
                    key={image.src}
                    alt={image.alt}
                    src={image.src}
                    loading={index === activeImage ? 'eager' : 'lazy'}
                    aria-hidden={index !== activeImage}
                    className={`absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out scale-105 group-hover:scale-100 ${
                      index === activeImage ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10" aria-label="Project previews">
                  {agentProjectImages.map((image, index) => (
                    <button
                      key={image.src}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      aria-label={`Show project preview ${index + 1}`}
                      aria-current={index === activeImage}
                      className={`h-1.5 rounded-full transition-all ${index === activeImage ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy: stacked editorial manifesto */}
      <section className="py-24 md:py-40 bg-[#f5f3f1] dark:bg-[#161716] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease }}
            className="max-w-3xl"
          >
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7] mb-8 leading-[1.1] pb-1">
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
                <span className="block font-serif text-4xl md:text-5xl font-bold text-[#54615b] dark:text-[#bbcac2] mb-2">AI</span>
                <span className="font-sans text-xs uppercase tracking-widest text-[#444748] dark:text-[#c4c7c7] font-semibold">{t('home.philosophy.yearsExp')}</span>
              </div>
              <div>
                <span className="block font-serif text-4xl md:text-5xl font-bold text-[#54615b] dark:text-[#bbcac2] mb-2">3</span>
                <span className="font-sans text-xs uppercase tracking-widest text-[#444748] dark:text-[#c4c7c7] font-semibold">{t('home.philosophy.projectsShipped')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
