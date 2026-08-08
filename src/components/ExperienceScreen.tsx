/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExperienceItem } from '../types';
import { motion, type Variants } from 'motion/react';
import { Briefcase, Calendar, MapPin, Building, ChevronRight } from 'lucide-react';
import SkillsGrid from './SkillsGrid';
import { useLanguage } from '../context/LanguageContext';

interface ExperienceCardProps {
  item: ExperienceItem;
  isLeft: boolean;
}

function ExperienceCard({ item, isLeft }: ExperienceCardProps) {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  const listContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const listItemVariants: Variants = {
    hidden: { opacity: 0, x: isLeft ? 10 : -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={`bg-paper dark:bg-night-raised p-6 md:p-8 rounded-2xl border border-hairline dark:border-white/5 shadow-md hover:-translate-y-1.5 hover:shadow-xl hover:border-sage/20 dark:hover:border-white/10 transition-all duration-500 flex flex-col h-full`}
    >
      {/* Date & Location Header */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-sage dark:text-mint mb-3 justify-start">
        <span className="flex items-center gap-1.5 bg-sage/10 dark:bg-mint/10 px-2.5 py-1 rounded-full">
          <Calendar size={12} />
          {item.period}
        </span>
        {item.location && (
          <span className="flex items-center gap-1 text-ink-soft/60 dark:text-mist/60 font-sans">
            <MapPin size={12} />
            {item.location}
          </span>
        )}
      </div>

      {/* Role & Company Header */}
      <h3 className="font-serif text-2xl font-bold text-ink dark:text-paper mb-1 tracking-tight">
        {item.role}
      </h3>
      <h4 className="font-sans text-sm font-semibold text-ink-soft dark:text-mist mb-3 flex items-center gap-1.5">
        <Building size={14} className="text-sage dark:text-mint" />
        {item.company}
      </h4>

      {/* Company Description */}
      {item.companyDescription && (
        <p className="font-sans text-xs italic text-ink-soft/70 dark:text-mist/70 border-l-2 border-sage/30 dark:border-mint/30 pl-3 mb-5 leading-relaxed text-left">
          {item.companyDescription}
        </p>
      )}

      {/* Milestones and accomplishments */}
      <motion.ul 
        variants={listContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-3 mt-auto text-left"
      >
        {item.bullets.map((bullet, i) => (
          <motion.li 
            variants={listItemVariants}
            key={i} 
            className="font-sans text-sm text-ink-soft dark:text-mist flex items-start gap-2 leading-relaxed"
          >
            <ChevronRight 
              size={16} 
              className="text-sage dark:text-mint flex-shrink-0 mt-0.5"
            />
            <span>{bullet}</span>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

export default function ExperienceScreen() {
  const { t, experienceItems } = useLanguage();

  return (
    <section aria-label="Experience and skills" className="pt-32 pb-24 min-h-screen px-6 md:px-16 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="mb-20 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-sans text-xs uppercase tracking-widest text-sage dark:text-mint font-semibold flex items-center justify-center md:justify-start gap-2">
            <Briefcase size={14} /> {t('experience.headerTag')}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-ink dark:text-paper mt-3 tracking-tight">
            {t('experience.title')}
          </h1>
          <p className="font-sans text-base md:text-lg text-ink-soft dark:text-mist mt-6 max-w-2xl leading-relaxed">
            {t('experience.desc')}
          </p>
          <div className="w-24 h-1 bg-sage dark:bg-mint mt-6 mx-auto md:mx-0" />
        </motion.div>
      </div>

      {/* Timeline Section */}
      <div className="relative w-full py-10">
        {/* Center Vertical Line (desktop) or Left Line (mobile) */}
        <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-hairline dark:bg-white/5 rounded-full">
          {/* Animated fill line */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="w-full bg-sage dark:bg-mint rounded-full shadow-[0_0_10px_rgba(84,97,91,0.5)]"
          />
        </div>

        {/* Timeline Items */}
        <div className="space-y-16">
          {experienceItems.map((item, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div
                key={item.id}
                className="relative flex flex-col md:grid md:grid-cols-11 items-start w-full group"
              >
                {/* Left Side Content Box (Desktop Only) */}
                <div className="hidden md:block md:col-span-5 w-full pr-12 text-right">
                  {isLeft && (
                    <ExperienceCard item={item} isLeft={true} />
                  )}
                </div>

                {/* Center Node indicator */}
                <div className="absolute left-4 md:relative md:left-auto md:col-span-1 md:flex md:justify-center z-10 top-6 md:top-8">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-8 h-8 rounded-full bg-paper dark:bg-night border-4 border-sage dark:border-mint flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  >
                    <Briefcase size={12} className="text-sage dark:text-mint" />
                  </motion.div>
                </div>

                {/* Right Side / Mobile Content Box */}
                <div className="w-full pl-12 md:pl-12 md:col-span-5">
                  <div className={isLeft ? 'md:hidden' : ''}>
                    <ExperienceCard item={item} isLeft={false} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Skills Grid Section */}
      <SkillsGrid />
    </section>
  );
}
