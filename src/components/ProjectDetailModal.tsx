/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, ExternalLink, ShieldCheck, Target, Lightbulb, Link } from 'lucide-react';
import BlurUpImage from './BlurUpImage';
import { useLanguage, Language } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Project } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

interface CustomCaseStudy {
  challenge: string;
  solution: string;
}

const CUSTOM_CASE_STUDIES: Record<Language, Record<string, CustomCaseStudy>> = {
  en: {
    'soft-desk': {
      challenge: 'Software tools and personal workflows are easy to scatter across folders, bookmarks, and disconnected notes.',
      solution: 'SoftDesk brings software discovery, favorites, workflows, sharing, feedback, and usage views into a desktop application with a companion web interface.'
    },
    'word-base': {
      challenge: 'Vocabulary capture and deliberate practice often happen in separate tools and lose the original reading context.',
      solution: 'WordBase connects word books, contextual practice, cloud sync, and AI-assisted learning across web, desktop, and mobile; WordPicker captures words and source context directly in the browser.'
    },
    'tab-garden': {
      challenge: 'Large tab collections become difficult to navigate, while automatic organization must not overwrite intentional user grouping.',
      solution: 'The extension groups eligible tabs by normalized hostname, preserves native and custom groups, and provides controls for pausing, thresholds, and manual organization.'
    }
  },
  zh: {
    'soft-desk': {
      challenge: '软件工具和个人工作流很容易分散在文件夹、书签与彼此脱节的笔记中。',
      solution: 'SoftDesk 将软件发现、收藏、工作流、分享、反馈与使用统计整合进桌面应用，并提供配套 Web 界面。'
    },
    'word-base': {
      challenge: '词汇采集与刻意练习常发生在不同工具中，原始阅读语境也容易丢失。',
      solution: 'WordBase 在 Web、桌面端和移动端连接单词本、语境练习、云同步与 AI 辅助学习；WordPicker 则直接在浏览器中采集单词及来源语境。'
    },
    'tab-garden': {
      challenge: '标签页数量增多后难以浏览，而自动整理又不能覆盖用户主动创建的分组。',
      solution: '该扩展按标准化 hostname 为符合条件的标签页分组，保留原生与自定义分组，并提供暂停、阈值和手动整理控制。'
    }
  }
};

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleCopyShareLink = () => {
    if (!project) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}#project-${project.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showToast(
          language === 'en' ? 'Project link copied to clipboard!' : '项目链接已复制到剪贴板！',
          'success'
        );
      })
      .catch(() => {
        showToast(
          language === 'en' ? 'Failed to copy project link.' : '复制链接失败。',
          'error'
        );
      });
  };

  useEffect(() => {
    if (!project) return;

    // Scroll lock
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // Keyboard navigation (Escape key to close)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const caseStudy = CUSTOM_CASE_STUDIES[language][project.id] || {
    challenge: language === 'en' 
      ? 'The goal was to create a modern and accessible digital tool satisfying highest quality standards and usability metrics.'
      : '目标是打造一款现代、易用且符合高质量标准的数字工具。',
      solution: language === 'en'
      ? 'Implemented lightweight and modular visual structures centered around core system-driven paradigms.'
      : '以核心系统驱动的范式为中心，实现了轻量且模块化的视觉结构。'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-10">
      {/* Backdrop with elegant glassmorphic blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-night-overlay/75 backdrop-blur-md"
      />

      {/* Main Modal Container */}
      <motion.div
        id="project-detail-modal"
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-paper dark:bg-night-panel rounded-3xl border border-hairline dark:border-white/5 shadow-2xl text-ink dark:text-paper flex flex-col pointer-events-auto"
      >
        {/* Absolute Close button */}
        <button
          id="close-modal-btn-top"
          onClick={onClose}
          className="interactive absolute right-6 top-6 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/5 dark:hover:bg-white/10 text-white md:text-ink md:dark:text-paper md:bg-transparent md:dark:bg-transparent transition-all duration-300"
          aria-label={t('bayjf.close')}
        >
          <X size={18} />
        </button>

        {/* Hero Section of the Modal */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper-raised dark:bg-night-hover">
          <BlurUpImage
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          {/* Subtle bottom gradient to blend image and content in dark mode */}
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-black/20 dark:from-night-panel" />
          
          <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 pr-12">
            <span className="inline-block px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase bg-mint/90 backdrop-blur-md text-ink rounded-md mb-2 shadow-sm">
              {project.category}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white md:text-ink dark:text-paper tracking-tight drop-shadow-sm">
              {project.title}
            </h2>
          </div>
        </div>

        {/* Detailed Description & Structure */}
        <div className="p-6 md:p-10 flex flex-col gap-8">
          
          {/* Grid Layout: Main info and Sidebar info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            
            {/* Left side: Case study details */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h4 className="font-sans text-[11px] font-bold tracking-widest text-sage dark:text-mint uppercase mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> {t('bayjf.overview')}
                </h4>
                <p className="font-sans text-sm md:text-base leading-relaxed text-ink-soft dark:text-mist">
                  {project.description}
                </p>
              </div>

              {/* Challenge section */}
              <div>
                <h4 className="font-sans text-[11px] font-bold tracking-widest text-sage dark:text-mint uppercase mb-2 flex items-center gap-1.5">
                  <Target size={14} /> {language === 'en' ? 'The Challenge' : '挑战'}
                </h4>
                <p className="font-sans text-sm leading-relaxed text-ink-soft/90 dark:text-mist/90">
                  {caseStudy.challenge}
                </p>
              </div>

              {/* Solution section */}
              <div>
                <h4 className="font-sans text-[11px] font-bold tracking-widest text-sage dark:text-mint uppercase mb-2 flex items-center gap-1.5">
                  <Lightbulb size={14} /> {language === 'en' ? 'The Solution' : '解决方案'}
                </h4>
                <p className="font-sans text-sm leading-relaxed text-ink-soft/90 dark:text-mist/90">
                  {caseStudy.solution}
                </p>
              </div>
            </div>

            {/* Right side: Sidebar (Meta information & action) */}
            <div className="space-y-6 bg-hairline/20 dark:bg-white/[0.02] border border-hairline/40 dark:border-white/5 p-6 rounded-2xl h-fit">
              <div>
                <h4 className="font-sans text-[10px] font-bold tracking-widest text-ink-soft/60 dark:text-mist/50 uppercase mb-3">
                  {t('bayjf.techUsed')}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-sans text-[11px] bg-hairline/60 dark:bg-white/5 border border-hairline/30 dark:border-white/5 text-ink dark:text-paper px-2.5 py-1 rounded-md shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-hairline/30 dark:border-white/5 space-y-2">
                {project.link && (
                  <a
                    id={`modal-external-link-${project.id}`}
                    href={project.link}
                    className="interactive flex items-center justify-center gap-2 py-2.5 px-4 w-full rounded-xl bg-sage hover:bg-ink dark:bg-mint dark:hover:bg-paper text-paper dark:text-ink font-sans text-xs font-bold tracking-wider transition-all duration-300 shadow-md"
                  >
                    <span>{t('bayjf.launchDemo')}</span>
                    <ExternalLink size={13} />
                  </a>
                )}
                <button
                  id={`modal-share-link-${project.id}`}
                  onClick={handleCopyShareLink}
                  className="interactive flex items-center justify-center gap-2 py-2.5 px-4 w-full rounded-xl bg-hairline/40 hover:bg-hairline/85 dark:bg-white/5 dark:hover:bg-white/10 text-ink dark:text-paper font-sans text-xs font-bold tracking-wider transition-all duration-300 border border-hairline/55 dark:border-white/5 shadow-sm"
                >
                  <span>{language === 'en' ? 'Copy Share Link' : '复制分享链接'}</span>
                  <Link size={13} />
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Footer Section */}
          <div className="pt-6 border-t border-hairline/40 dark:border-white/5 flex justify-end">
            <button
              id="close-modal-btn-bottom"
              onClick={onClose}
              className="interactive px-5 py-2 font-sans text-xs uppercase tracking-widest font-semibold text-ink-soft dark:text-mist bg-hairline/30 dark:bg-white/5 hover:bg-hairline/70 dark:hover:bg-white/10 rounded-full transition-all duration-300"
            >
              {t('bayjf.close')}
            </button>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
