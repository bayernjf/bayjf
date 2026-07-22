/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExperienceItem } from '../types';
import { motion } from 'motion/react';
import { Briefcase, Calendar, MapPin, Building, ChevronRight } from 'lucide-react';
import SkillsGrid from './SkillsGrid';
import { useLanguage } from '../context/LanguageContext';

interface ExperienceCardProps {
  item: ExperienceItem;
  isLeft: boolean;
}

function ExperienceCard({ item, isLeft }: ExperienceCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const listItemVariants = {
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
      className={`bg-[#fbf9f7] dark:bg-[#161716] p-6 md:p-8 rounded-2xl border border-[#e4e2e0] dark:border-white/5 shadow-md hover:-translate-y-1.5 hover:shadow-xl hover:border-[#54615b]/20 dark:hover:border-white/10 transition-all duration-500 flex flex-col h-full`}
    >
      {/* Date & Location Header */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#54615b] dark:text-[#bbcac2] mb-3 justify-start">
        <span className="flex items-center gap-1.5 bg-[#54615b]/10 dark:bg-[#bbcac2]/10 px-2.5 py-1 rounded-full">
          <Calendar size={12} />
          {item.period}
        </span>
        {item.location && (
          <span className="flex items-center gap-1 text-[#444748]/60 dark:text-[#c4c7c7]/60 font-sans">
            <MapPin size={12} />
            {item.location}
          </span>
        )}
      </div>

      {/* Role & Company Header */}
      <h3 className="font-serif text-2xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7] mb-1 tracking-tight">
        {item.role}
      </h3>
      <h4 className="font-sans text-sm font-semibold text-[#444748] dark:text-[#c4c7c7] mb-3 flex items-center gap-1.5">
        <Building size={14} className="text-[#54615b] dark:text-[#bbcac2]" />
        {item.company}
      </h4>

      {/* Company Description */}
      {item.companyDescription && (
        <p className="font-sans text-xs italic text-[#444748]/70 dark:text-[#c4c7c7]/70 border-l-2 border-[#54615b]/30 dark:border-[#bbcac2]/30 pl-3 mb-5 leading-relaxed text-left">
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
            className="font-sans text-sm text-[#444748] dark:text-[#c4c7c7] flex items-start gap-2 leading-relaxed"
          >
            <ChevronRight 
              size={16} 
              className="text-[#54615b] dark:text-[#bbcac2] flex-shrink-0 mt-0.5"
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
    <div className="pt-32 pb-24 min-h-screen px-6 md:px-16 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="mb-20 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-sans text-xs uppercase tracking-widest text-[#54615b] dark:text-[#bbcac2] font-semibold flex items-center justify-center md:justify-start gap-2">
            <Briefcase size={14} /> {t('experience.headerTag')}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7] mt-3 tracking-tight">
            {t('experience.title')}
          </h1>
          <p className="font-sans text-base md:text-lg text-[#444748] dark:text-[#c4c7c7] mt-6 max-w-2xl leading-relaxed">
            {t('experience.desc')}
          </p>
          <div className="w-24 h-1 bg-[#54615b] dark:bg-[#bbcac2] mt-6 mx-auto md:mx-0" />
        </motion.div>
      </div>

      {/* Timeline Section */}
      <div className="relative w-full py-10">
        {/* Center Vertical Line (desktop) or Left Line (mobile) */}
        <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-[#e4e2e0] dark:bg-white/5 rounded-full">
          {/* Animated fill line */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="w-full bg-[#54615b] dark:bg-[#bbcac2] rounded-full shadow-[0_0_10px_rgba(84,97,91,0.5)]"
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
                    className="w-8 h-8 rounded-full bg-[#fbf9f7] dark:bg-[#121212] border-4 border-[#54615b] dark:border-[#bbcac2] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  >
                    <Briefcase size={12} className="text-[#54615b] dark:text-[#bbcac2]" />
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
    </div>
  );
}
