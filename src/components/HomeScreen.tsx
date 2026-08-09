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
      {/* Hero: centered massive typography, Apple-style */}
      <section className="relative min-h-[calc(100dvh-5rem)] flex flex-col justify-center overflow-hidden px-6 md:px-16">
        <div className="max-w-5xl mx-auto w-full text-center py-16 md:py-20">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="font-sans text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-ink dark:text-paper leading-[1.05] pb-2 mb-6"
          >
            {t('home.hero.title1')}{' '}
            <span className="text-sage dark:text-mint">{t('home.hero.title2')}</span>
            <br />
            <span className="text-ink-faint dark:text-mint-faint">{t('home.hero.title3')}</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="font-sans text-lg md:text-xl text-ink-soft dark:text-mist max-w-2xl mx-auto leading-relaxed mb-10"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              id="view-work-btn"
              href={`${lang === 'zh' ? '/zh' : ''}/projects`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate('bayjf', 'push');
              }}
              className="interactive inline-flex items-center justify-center bg-sage dark:bg-mint text-paper dark:text-night hover:opacity-90 active:scale-[0.97] transition-all duration-200 px-8 py-3.5 rounded-full font-sans font-medium text-[15px] tracking-tight"
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
              className="interactive inline-flex items-center justify-center text-sage dark:text-mint hover:underline active:scale-[0.97] transition-all duration-200 px-8 py-3.5 font-sans font-medium text-[15px] tracking-tight"
            >
              {t('home.hero.btnAbout')}
            </a>
          </motion.div>
        </div>

        {/* Full-width carousel below hero copy */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="max-w-6xl mx-auto w-full px-6 md:px-16 pb-16"
        >
          <div className="relative w-full aspect-[16/9] rounded-[28px] overflow-hidden shadow-2xl">
            <div className="w-full h-full relative group">
              {agentProjectImages.map((image, index) => (
                <img
                  key={image.src}
                  alt={image.alt}
                  src={image.src}
                  loading={index === activeImage ? 'eager' : 'lazy'}
                  aria-hidden={index !== activeImage}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                    index === activeImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10" aria-label="Project previews">
                {agentProjectImages.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show project preview ${index + 1}`}
                    aria-current={index === activeImage}
                    className={`h-1.5 rounded-full transition-all duration-300 ${index === activeImage ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Philosophy: Apple-style quote */}
      <section className="py-24 md:py-40 bg-paper-raised dark:bg-night-raised transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease }}
            className="max-w-3xl"
          >
            <h2 className="font-sans text-3xl md:text-5xl font-semibold text-ink dark:text-paper mb-8 leading-[1.1] tracking-tight pb-1">
              {t('home.philosophy.title')}
            </h2>
            <div className="space-y-6 font-sans text-base md:text-lg text-ink-soft dark:text-mist leading-relaxed">
              <p>
                {t('home.philosophy.p1')}
              </p>
              <p>
                {t('home.philosophy.p2')}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-hairline dark:border-white/10 pt-8">
              <div>
                <span className="block font-sans text-4xl md:text-5xl font-semibold text-sage dark:text-mint mb-2 tracking-tight">AI</span>
                <span className="font-sans text-[13px] uppercase tracking-wider text-ink-soft dark:text-mist font-medium">{t('home.philosophy.yearsExp')}</span>
              </div>
              <div>
                <span className="block font-sans text-4xl md:text-5xl font-semibold text-sage dark:text-mint mb-2 tracking-tight">3</span>
                <span className="font-sans text-[13px] uppercase tracking-wider text-ink-soft dark:text-mist font-medium">{t('home.philosophy.projectsShipped')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
