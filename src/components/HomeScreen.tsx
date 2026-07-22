/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScreenType } from '../types';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState } from 'react';
import agent01 from '../assets/ai-agent/01-ai-agent.png';
import agent02 from '../assets/ai-agent/02-agent-orbit.png';
import agent03 from '../assets/ai-agent/03-agent-cubes.png';
import agent04 from '../assets/ai-agent/04-agent-flow.png';
import agent05 from '../assets/ai-agent/05-agent-hand.png';
import agent06 from '../assets/ai-agent/06-agent-network.jpg';
import agent07 from '../assets/ai-agent/07-agent-data.jpg';
import agent08 from '../assets/ai-agent/08-agent-graph.jpg';
import agent09 from '../assets/ai-agent/09-agent-mesh.jpg';
import agent10 from '../assets/ai-agent/10-agent-brain.jpg';
import agent11 from '../assets/ai-agent/11-agent-shards.jpg';
import agent12 from '../assets/ai-agent/12-agent-rings.jpg';
import agent13 from '../assets/ai-agent/13-agent-grid.jpg';
import agent14 from '../assets/ai-agent/14-agent-brain.jpg';
import agent15 from '../assets/ai-agent/15-agent-tower.png';
import agent16 from '../assets/ai-agent/16-agent-cube.png';
import agent17 from '../assets/ai-agent/17-agent-vault.png';
import agent18 from '../assets/ai-agent/18-agent-chip.png';
import agent19 from '../assets/ai-agent/19-agent-core.png';

const agentProjectImages = [
  agent01, agent02, agent03, agent04, agent05, agent06, agent07, agent08, agent09, agent10,
  agent11, agent12, agent13, agent14, agent15, agent16, agent17, agent18, agent19,
].map((src, index) => ({
  src,
  alt: `AI Agent concept visual ${index + 1}`,
}));

interface HomeScreenProps {
  onNavigate: (screen: ScreenType, transitionType?: 'none' | 'push') => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { t } = useLanguage();
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % agentProjectImages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

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
            <br />
            <span className="text-[#82978f] dark:text-[#a7bdb5]">{t('home.hero.title3')}</span>
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
                onNavigate('bayjf', 'push');
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
                  <span className="block font-serif text-4xl md:text-5xl font-bold text-[#54615b] dark:text-[#bbcac2] mb-2">AI</span>
                  <span className="font-sans text-xs uppercase tracking-widest text-[#444748] dark:text-[#c4c7c7] font-semibold">{t('home.philosophy.yearsExp')}</span>
                </div>
                <div>
                  <span className="block font-serif text-4xl md:text-5xl font-bold text-[#54615b] dark:text-[#bbcac2] mb-2">3</span>
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
