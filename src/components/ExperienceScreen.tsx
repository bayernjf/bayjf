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
      className={`bg-paper-raised dark:bg-night-raised p-6 md:p-8 rounded-[28px] shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full`}
    >
      {/* Date & Location Header */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-sage dark:text-mint mb-3 justify-start">
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
      <h3 className="font-sans text-xl font-semibold text-ink dark:text-paper mb-1 tracking-tight">
        {item.role}
      </h3>
      <h4 className="font-sans text-sm font-medium text-ink-soft dark:text-mist mb-3 flex items-center gap-1.5">
        <Building size={14} className="text-sage dark:text-mint" />
        {item.company}
      </h4>

      {/* Company Description */}
      {item.companyDescription && (
        <p className="font-sans text-sm text-ink-soft/70 dark:text-mist/70 pl-3 mb-5 leading-relaxed text-left border-l border-sage/20 dark:border-mint/20">
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
          <span className="font-sans text-[13px] uppercase tracking-wider text-sage dark:text-mint font-medium flex items-center justify-center md:justify-start gap-2">
            <Briefcase size={14} /> {t('experience.headerTag')}
          </span>
          <h1 className="font-sans text-4xl md:text-6xl font-semibold text-ink dark:text-paper mt-3 tracking-tight">
            {t('experience.title')}
          </h1>
          <p className="font-sans text-base md:text-lg text-ink-soft dark:text-mist mt-6 max-w-2xl leading-relaxed">
            {t('experience.desc')}
          </p>
        </motion.div>
      </div>

      {/* Timeline Section - Apple-style simple list */}
      <div className="relative w-full py-10">
        <div className="space-y-6">
          {experienceItems.map((item, index) => {
            const isLeft = index % 2 === 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <ExperienceCard item={item} isLeft={isLeft} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Technical Skills Grid Section */}
      <SkillsGrid />
    </section>
  );
}
