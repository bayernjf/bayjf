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
    },
    'lumina-pay': {
      challenge: 'The primary challenge was designing a billing system that handles multi-currency invoicing without cluttering the screen or confusing freelance creators who need rapid payments.',
      solution: 'We developed a clean, single-screen dashboard using glassmorphism components, enabling instant conversion and invoice creation under 3 taps with deep visual feedback.'
    },
    'aura-analytics': {
      challenge: 'Managing heavy real-time data visualisations for environmental monitoring without high latency, visual cognitive load, or battery drain on mobile devices.',
      solution: 'Leveraged optimized vector-rendering pipelines and designed custom chart palettes using progressive disclosure to keep complex data layers organized.'
    },
    'minimal-notes': {
      challenge: 'Most note-taking applications overload creators with formatting sidebars and deep menus, causing micro-distractions that ruin flow and creative focus.',
      solution: 'Built a completely plain writing interface with dynamic typographic grids and a contextual popover command menu that appears only on demand.'
    },
    'aether-sound': {
      challenge: 'Sensing and rendering fast audio frequencies as smooth visual graphics while maintaining a consistent 60fps framerate on low-end hardware.',
      solution: 'Wrote efficient GPU shaders that directly map incoming audio buffers into dynamic, organic noise fields, avoiding costly CPU recalculations.'
    },
    'forma-studio': {
      challenge: '3D drafting tools usually require professional training and nested desktop controls, making rapid spatial design inaccessible to general product teams.',
      solution: 'Implemented a tactile spatial grid editor using responsive gesture helpers and a single-layer radial action menu for 3D block placements.'
    },
    'komorebi-journal': {
      challenge: 'Journal apps often feel cold and robotic. We wanted to design a digital diary that mirrors the warmth of physical analog paper and adapts to the writer\'s environment.',
      solution: 'Designed a color-interpolation engine that shifts ambient hue palettes smoothly based on local geolocation daylight hours and emotional journaling markers.'
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
    },
    'lumina-pay': {
      challenge: '主要挑战是设计一个多货币发票结算系统，既不能使屏幕显得凌乱，也不能让急需快速结算的自由职业者感到困惑。',
      solution: '我们使用拟玻璃化（Glassmorphism）组件开发了一个干净的单屏仪表盘，用户只需点击 3 次以内即可完成即时兑换和发票创建，并获得深度的视觉反馈。'
    },
    'aura-analytics': {
      challenge: '主要挑战是为环境监测管理繁重的实时数据可视化，同时避免在移动设备上产生高延迟、视觉认知负载或过快消耗电池。',
      solution: '我们利用了优化的矢量渲染流水线，并采用渐进式披露设计了自定义图表调色盘，以保持复杂数据图层的井然有序。'
    },
    'minimal-notes': {
      challenge: '大多数记事软件都向创作者提供过多复杂的格式排版侧边栏和深层菜单，导致微小干扰并破坏心流状态和创作专注力。',
      solution: '我们构建了一个完全纯净的写作界面，配有动态排版网格，并提供了仅在需要时才会出现的上下文气泡命令菜单。'
    },
    'aether-sound': {
      challenge: '在低端硬件上保持 60fps 稳定帧率的同时，将高速音频频率感知并渲染为流畅的视觉图形。',
      solution: 'We wrote efficient GPU shaders that directly map incoming audio buffers into dynamic, organic noise fields, avoiding costly CPU recalculations.'
    },
    'forma-studio': {
      challenge: '3D 建模工具通常需要专业培训和多层嵌套的桌面端控件，这使得普通的项目团队很难进行快速的空间草图绘制。',
      solution: '我们使用响应式手势辅助器和单层径向操作菜单实现了一个触觉空间网格编辑器，用于 3D 模块的快速放置。'
    },
    'komorebi-journal': {
      challenge: '日记类应用往往显得冰冷和机械化。我们希望能设计一款数字日记，不仅能投射出物理模拟纸张的温度，还能自适应创作者的本地环境。',
      solution: '我们设计了一个色彩插值引擎，可根据当地地理位置的日光时间和创作者记录的情感日记标记，平滑地转变环境色调板。'
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
      : 'Se implementaron estructuras visuales ligeras y modulares centradas en paradigmas impulsados por el sistema principal.'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-10">
      {/* Backdrop with elegant glassmorphic blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#121312]/75 backdrop-blur-md"
      />

      {/* Main Modal Container */}
      <motion.div
        id="project-detail-modal"
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-[#fbf9f7] dark:bg-[#151615] rounded-3xl border border-[#e4e2e0] dark:border-white/5 shadow-2xl text-[#1b1c1b] dark:text-[#fbf9f7] flex flex-col pointer-events-auto"
      >
        {/* Absolute Close button */}
        <button
          id="close-modal-btn-top"
          onClick={onClose}
          className="interactive absolute right-6 top-6 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/5 dark:hover:bg-white/10 text-white md:text-[#1b1c1b] md:dark:text-[#fbf9f7] md:bg-transparent md:dark:bg-transparent transition-all duration-300"
          aria-label={t('bayjf.close')}
        >
          <X size={18} />
        </button>

        {/* Hero Section of the Modal */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f5f3f1] dark:bg-[#1a1b1a]">
          <BlurUpImage
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          {/* Subtle bottom gradient to blend image and content in dark mode */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#fbf9f7] via-transparent to-black/20 dark:from-[#151615]" />
          
          <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 pr-12">
            <span className="inline-block px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase bg-[#bbcac2]/90 backdrop-blur-md text-[#1b1c1b] rounded-md mb-2 shadow-sm">
              {project.category}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white md:text-[#1b1c1b] dark:text-[#fbf9f7] tracking-tight drop-shadow-sm">
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
                <h4 className="font-sans text-[11px] font-bold tracking-widest text-[#54615b] dark:text-[#bbcac2] uppercase mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> {t('bayjf.overview')}
                </h4>
                <p className="font-sans text-sm md:text-base leading-relaxed text-[#444748] dark:text-[#c4c7c7]">
                  {project.description}
                </p>
              </div>

              {/* Challenge section */}
              <div>
                <h4 className="font-sans text-[11px] font-bold tracking-widest text-[#54615b] dark:text-[#bbcac2] uppercase mb-2 flex items-center gap-1.5">
                  <Target size={14} /> {language === 'en' ? 'The Challenge' : 'El Desafío'}
                </h4>
                <p className="font-sans text-sm leading-relaxed text-[#444748]/90 dark:text-[#c4c7c7]/90">
                  {caseStudy.challenge}
                </p>
              </div>

              {/* Solution section */}
              <div>
                <h4 className="font-sans text-[11px] font-bold tracking-widest text-[#54615b] dark:text-[#bbcac2] uppercase mb-2 flex items-center gap-1.5">
                  <Lightbulb size={14} /> {language === 'en' ? 'The Solution' : 'La Solución'}
                </h4>
                <p className="font-sans text-sm leading-relaxed text-[#444748]/90 dark:text-[#c4c7c7]/90">
                  {caseStudy.solution}
                </p>
              </div>
            </div>

            {/* Right side: Sidebar (Meta information & action) */}
            <div className="space-y-6 bg-[#e4e2e0]/20 dark:bg-white/[0.02] border border-[#e4e2e0]/40 dark:border-white/5 p-6 rounded-2xl h-fit">
              <div>
                <h4 className="font-sans text-[10px] font-bold tracking-widest text-[#444748]/60 dark:text-[#c4c7c7]/50 uppercase mb-3">
                  {t('bayjf.techUsed')}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-sans text-[11px] bg-[#e4e2e0]/60 dark:bg-white/5 border border-[#e4e2e0]/30 dark:border-white/5 text-[#1b1c1b] dark:text-[#fbf9f7] px-2.5 py-1 rounded-md shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#e4e2e0]/30 dark:border-white/5 space-y-2">
                {project.link && (
                  <a
                    id={`modal-external-link-${project.id}`}
                    href={project.link}
                    className="interactive flex items-center justify-center gap-2 py-2.5 px-4 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-sans text-xs font-bold tracking-wider transition-all duration-300 shadow-md"
                  >
                    <span>{t('bayjf.launchDemo')}</span>
                    <ExternalLink size={13} />
                  </a>
                )}
                <button
                  id={`modal-share-link-${project.id}`}
                  onClick={handleCopyShareLink}
                  className="interactive flex items-center justify-center gap-2 py-2.5 px-4 w-full rounded-xl bg-[#e4e2e0]/40 hover:bg-[#e4e2e0]/85 dark:bg-white/5 dark:hover:bg-white/10 text-[#1b1c1b] dark:text-[#fbf9f7] font-sans text-xs font-bold tracking-wider transition-all duration-300 border border-[#e4e2e0]/55 dark:border-white/5 shadow-sm"
                >
                  <span>{language === 'en' ? 'Copy Share Link' : '复制分享链接'}</span>
                  <Link size={13} />
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Footer Section */}
          <div className="pt-6 border-t border-[#e4e2e0]/40 dark:border-white/5 flex justify-end">
            <button
              id="close-modal-btn-bottom"
              onClick={onClose}
              className="interactive px-5 py-2 font-sans text-xs uppercase tracking-widest font-semibold text-[#444748] dark:text-[#c4c7c7] bg-[#e4e2e0]/30 dark:bg-white/5 hover:bg-[#e4e2e0]/70 dark:hover:bg-white/10 rounded-full transition-all duration-300"
            >
              {t('bayjf.close')}
            </button>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
