/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import {
  ArrowRight,
  SlidersHorizontal,
  Layers,
  CalendarDays,
  Grid,
  ChevronDown,
  BarChart3,
  Tag
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import BlurUpImage from './BlurUpImage';
import TiltCard from './TiltCard';
import LikeButton from './LikeButton';
import { useLanguage, Language } from '../context/LanguageContext';
import { Project } from '../types';
import ProjectDetailModal from './ProjectDetailModal';
import ComingSoonFlipCard from './ComingSoonFlipCard';
import { isComingSoon } from '../data/projectCatalog';

export default function BayjfScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTagGroup, setSelectedTagGroup] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [flippedProjectId, setFlippedProjectId] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'grid' | 'timeline'>('grid');
  const [chartMetric, setChartMetric] = useState<'tech' | 'category'>('tech');
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const { t, projects, language, searchQuery } = useLanguage();

  // Sync active project with URL
  useEffect(() => {
    const checkProjectFromUrl = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get('project') || (hash.startsWith('#project-') ? hash.substring(9) : null);
      
      if (projectId) {
        const found = projects.find(p => p.id === projectId);
        if (found) {
          // soon 项目没有详情弹窗，深链进来就把卡片翻到背面。
          if (isComingSoon(found.id)) {
            setActiveProject(null);
            setFlippedProjectId(found.id);
          } else {
            setActiveProject(found);
          }
        } else {
          setActiveProject(null);
        }
      } else {
        setActiveProject(null);
      }
    };

    checkProjectFromUrl();
    window.addEventListener('hashchange', checkProjectFromUrl);
    return () => {
      window.removeEventListener('hashchange', checkProjectFromUrl);
    };
  }, [projects]);

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    window.location.hash = `project-${project.id}`;
  };

  // soon 项目：点击只在正反面之间翻转，不开详情弹窗。
  const handleCardClick = (project: Project) => {
    if (isComingSoon(project.id)) {
      setFlippedProjectId((current) => (current === project.id ? null : project.id));
      return;
    }
    handleSelectProject(project);
  };

  const handleCloseProjectModal = () => {
    setActiveProject(null);
    setFlippedProjectId(null);
    if (window.location.hash.startsWith('#project-')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.has('project')) {
      params.delete('project');
      const searchStr = params.toString();
      const newUrl = window.location.pathname + (searchStr ? '?' + searchStr : '') + window.location.hash;
      history.replaceState(null, '', newUrl);
    }
  };

  // Categories
  const categories = ['All', 'Productivity', 'Learning', 'Browser Tools'];

  const categoryLabels: Record<Language, Record<string, string>> = {
    en: {
      'All': 'All Categories',
      'Productivity': 'Productivity',
      'Learning': 'Learning',
      'Browser Tools': 'Browser Tools'
    },
    zh: {
      'All': '所有类别',
      'Productivity': '效率工具',
      'Learning': '学习工具',
      'Browser Tools': '浏览器工具'
    }
  };

  // Internal Translations for enhanced features
  const localTxt = {
    en: {
      summaryTitle: 'BayJF Overview',
      totalProjects: 'Total Projects',
      categoriesCount: 'Active Categories',
      latestYear: 'Current Focus',
      coreFocus: 'Delivery Scope',
      techDistribution: 'Project Stack',
      chartToggleTags: 'Technologies',
      chartToggleCats: 'Categories',
      scrollDown: 'Scroll to view projects',
      displayMode: 'Display Mode:',
      viewGrid: 'Grid Gallery',
      viewTimeline: 'Timeline',
      allTags: 'All Tags',
      designTag: 'Product',
      engTag: 'Engineering',
      fullstackTag: 'Browser',
      projectsCount: 'projects',
      chronology: 'Chronology',
      viewDetails: 'VIEW DETAILS',
      filterTags: 'Filter by Tag Group'
    },
    zh: {
      summaryTitle: 'BayJF 概览',
      totalProjects: '项目总数',
      categoriesCount: '活跃类别',
      latestYear: '当前方向',
      coreFocus: '交付范围',
      techDistribution: '项目技术栈',
      chartToggleTags: '技术栈',
      chartToggleCats: '项目类别',
      scrollDown: '向下滚动查看项目',
      displayMode: '显示模式：',
      viewGrid: '网格画廊',
      viewTimeline: '时间线模式',
      allTags: '所有标签',
      designTag: '产品',
      engTag: '工程',
      fullstackTag: '浏览器',
      projectsCount: '个项目',
      chronology: '编年史',
      viewDetails: '查看详情',
      filterTags: '按标签组筛选'
    }
  }[language];



  // Map each project to a general filter category
  const getProjectFilterCategory = (project: Project) => {
    const tags = (project.tags ?? []).map((tag) => tag.toLowerCase());
    if (project.id === 'tab-manager' || tags.some(tag => tag.includes('chrome') || tag.includes('manifest'))) {
      return 'Browser Tools';
    }
    if (project.id === 'word-base') return 'Learning';
    return 'Productivity';
  };

  // Map projects to custom tag groups
  const matchesTagGroup = (project: Project, group: string) => {
    if (group === 'All') return true;
    const projectTags = (project.tags ?? []).map(t => t.toLowerCase());
    
    if (group === 'Product') {
      return project.id === 'soft-desk' || project.id === 'word-base';
    }
    
    if (group === 'Engineering') {
      const engKeywords = ['electron', 'react', 'typescript', 'sqlite', 'supabase', 'next.js', 'tauri', 'hono'];
      return projectTags.some(tag => engKeywords.includes(tag));
    }
    
    if (group === 'Browser') {
      return project.id === 'tab-manager';
    }
    
    return true;
  };

  // Perform full dual-filter logic
  const filteredProjects = projects.filter(project => {
    const tags = project.tags ?? [];
    // 1. Category filter
    const categoryMatches = selectedCategory === 'All' || getProjectFilterCategory(project) === selectedCategory;
    if (!categoryMatches) return false;

    // 2. Tag Group filter
    const tagGroupMatches = matchesTagGroup(project, selectedTagGroup);
    if (!tagGroupMatches) return false;

    // 3. Search Query
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const titleMatches = project.title.toLowerCase().includes(query);
    const tagsMatch = tags.some(tag => tag.toLowerCase().includes(query));
    return titleMatches || tagsMatch;
  });

  // Recharts Data Processing
  const processedChartData = (() => {
    if (chartMetric === 'tech') {
      // Top 6 technologies / tags frequency
      const tagCounts: Record<string, number> = {};
      projects.forEach(p => {
        (p.tags ?? []).forEach(t => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      });
      return Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
    } else {
      // Category distribution count
      const catCounts: Record<string, number> = {};
      projects.forEach(p => {
        const cat = getProjectFilterCategory(p);
        const label = categoryLabels[language][cat] || cat;
        catCounts[label] = (catCounts[label] || 0) + 1;
      });
      return Object.entries(catCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    }
  })();

  const getProjectDate = (project: Project) => project.date || (project.year ? String(project.year) : '');
  const getProjectYear = (project: Project) => getProjectDate(project).slice(0, 4);

  // Sort project timeline list descending by GitHub feature date
  const timelineProjects = [...filteredProjects].sort((a, b) => {
    const dateA = Date.parse(a.date || '') || a.year || 0;
    const dateB = Date.parse(b.date || '') || b.year || 0;
    return dateB - dateA;
  });

  // Sync scroll listener and page overflow check
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    const checkOverflow = () => {
      const overflows = document.documentElement.scrollHeight > window.innerHeight;
      setIsOverflowing(overflows);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkOverflow);

    // Initial check with slight delay to ensure layouts are fully rendered
    checkOverflow();
    const timer = setTimeout(checkOverflow, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkOverflow);
      clearTimeout(timer);
    };
  }, [filteredProjects, displayMode]);

  // Monitor Dark Mode class for Recharts theming
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 45, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    },
    tap: {
      scale: 0.98,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    }
  };

  // Scroll smoothly to showcase grid/timeline anchor
  const handleScrollToGrid = () => {
    const anchor = document.getElementById('showcase-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section aria-label="Selected projects" className="pt-32 pb-24 min-h-screen px-6 md:px-16 max-w-7xl mx-auto">
      {/* Title section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-hairline/20 dark:border-white/5 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="font-sans text-[13px] uppercase tracking-wider text-sage dark:text-mint font-medium flex items-center gap-2">
            <Layers size={14} /> {t('bayjf.headerTag')}
          </span>
          <h1 className="font-sans text-4xl md:text-6xl font-semibold text-ink dark:text-paper mt-3 tracking-tight">
            {t('bayjf.title')}
          </h1>
          <p className="font-sans text-base md:text-lg text-ink-soft dark:text-mist mt-4 leading-relaxed">
            {t('bayjf.desc')}
          </p>
        </motion.div>

        {/* Layout Toggle in the Header */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col gap-2 items-start md:items-end"
        >
          <span className="text-[11px] font-sans uppercase tracking-wider text-ink-soft/60 dark:text-mist/60">
            {localTxt.displayMode}
          </span>
          <div className="flex bg-paper-raised dark:bg-night-raised p-1 rounded-full">
            <button
              onClick={() => setDisplayMode('grid')}
              id="header-display-mode-grid"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-sans font-medium transition-all duration-200 ${displayMode === 'grid' ? 'bg-paper dark:bg-night text-ink dark:text-paper shadow-sm' : 'text-ink-soft dark:text-mist hover:text-ink dark:hover:text-paper'}`}
            >
              <Grid size={14} />
              <span>{localTxt.viewGrid}</span>
            </button>
            <button
              onClick={() => setDisplayMode('timeline')}
              id="header-display-mode-timeline"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-sans font-medium transition-all duration-200 ${displayMode === 'timeline' ? 'bg-paper dark:bg-night text-ink dark:text-paper shadow-sm' : 'text-ink-soft dark:text-mist hover:text-ink dark:hover:text-paper'}`}
            >
              <CalendarDays size={14} />
              <span>{localTxt.viewTimeline}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Subtle Scroll Down Indicator Anchor at the bottom of the header */}
      <AnimatePresence>
        {showScrollIndicator && isOverflowing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.2 }}
            className="flex justify-center -mt-6 mb-10"
          >
            <button
              onClick={handleScrollToGrid}
              className="flex flex-col items-center gap-1 text-[12px] text-ink-soft dark:text-mist hover:text-ink dark:hover:text-paper font-medium tracking-tight transition-colors cursor-pointer active:scale-[0.97]"
            >
              <span>{localTxt.scrollDown}</span>
              <ChevronDown size={14} className="animate-bounce" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Analytics Card with Recharts */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="w-full mb-16 p-6 md:p-8 rounded-[28px] bg-paper-raised dark:bg-night-raised shadow-sm flex flex-col lg:flex-row gap-8 items-stretch overflow-hidden"
      >
        {/* Analytics Metadata Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-sage/10 dark:bg-white/5 text-sage dark:text-mint">
                <BarChart3 size={16} />
              </span>
              <h2 className="font-sans text-xl md:text-2xl font-semibold text-ink dark:text-paper tracking-tight">
                {localTxt.summaryTitle}
              </h2>
            </div>
            <p className="font-sans text-sm text-ink-soft/75 dark:text-mist/70 leading-relaxed mb-6">
              {language === 'en'
                ? 'A compact view of the real products, delivery surfaces, and technologies behind my current work.'
                : '这里汇总真实项目、交付形态与当前使用的技术栈。'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 md:mb-0">
            <div className="p-4 rounded-2xl bg-paper dark:bg-night border border-hairline/20 dark:border-white/5">
              <span className="font-sans text-[11px] uppercase tracking-wider text-ink-soft/60 dark:text-mist/60 block mb-1">
                {localTxt.totalProjects}
              </span>
              <span className="font-sans text-3xl font-semibold text-ink dark:text-paper tracking-tight">
                {projects.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-paper dark:bg-night border border-hairline/20 dark:border-white/5">
              <span className="font-sans text-[11px] uppercase tracking-wider text-ink-soft/60 dark:text-mist/60 block mb-1">
                {localTxt.categoriesCount}
              </span>
              <span className="font-sans text-3xl font-semibold text-ink dark:text-paper tracking-tight">
                {categories.length - 1}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-paper dark:bg-night border border-hairline/20 dark:border-white/5">
              <span className="font-sans text-[11px] uppercase tracking-wider text-ink-soft/60 dark:text-mist/60 block mb-1">
                {localTxt.latestYear}
              </span>
              <span className="font-sans text-3xl font-semibold text-ink dark:text-paper tracking-tight">
                AI Agent
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-paper dark:bg-night border border-hairline/20 dark:border-white/5">
              <span className="font-sans text-[11px] uppercase tracking-wider text-ink-soft/60 dark:text-mist/60 block mb-1">
                {localTxt.coreFocus}
              </span>
              <span className="font-sans text-xs font-medium text-sage dark:text-mint block mt-1 uppercase tracking-wider leading-none">
                {language === 'en' ? 'AI Agent & Full-Stack' : 'AI Agent 与全栈开发'}
              </span>
            </div>
          </div>
        </div>

        {/* Visualized Recharts Graph */}
        <div className="flex-1 min-w-0 min-h-[220px] bg-paper dark:bg-night border border-hairline/20 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-hairline/20 dark:border-white/5 pb-2">
            <span className="font-sans text-[13px] font-medium uppercase tracking-wider text-ink dark:text-paper">
              {localTxt.techDistribution}
            </span>

            {/* Custom Interactive Toggle Inside Card */}
            <div className="flex bg-paper-raised dark:bg-night-raised p-0.5 rounded-full text-[11px] font-sans font-medium">
              <button
                onClick={() => setChartMetric('tech')}
                className={`px-2.5 py-1 rounded-full transition-all duration-200 ${chartMetric === 'tech' ? 'bg-paper dark:bg-night text-ink dark:text-paper shadow-sm' : 'text-ink-soft/70 dark:text-mist/70'}`}
              >
                {localTxt.chartToggleTags}
              </button>
              <button
                onClick={() => setChartMetric('category')}
                className={`px-2.5 py-1 rounded-full transition-all duration-200 ${chartMetric === 'category' ? 'bg-paper dark:bg-night text-ink dark:text-paper shadow-sm' : 'text-ink-soft/70 dark:text-mist/70'}`}
              >
                {localTxt.chartToggleCats}
              </button>
            </div>
          </div>

          {/* Recharts Component */}
          <div className="w-full min-w-0 h-[160px] recharts-host">
            <ResponsiveContainer width="100%" height="100%" minWidth={280}>
              <BarChart data={processedChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: isDark ? 'var(--color-mist)' : 'var(--color-ink-soft)', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: isDark ? 'var(--color-mist)' : 'var(--color-ink-soft)', fontSize: 9 }}
                  axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                  contentStyle={{
                    backgroundColor: isDark ? 'var(--color-night-hover)' : 'var(--color-paper-raised)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'sans-serif'
                  }}
                  itemStyle={{ color: isDark ? 'var(--color-paper)' : 'var(--color-ink)' }}
                />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                  fill={isDark ? 'var(--color-mint)' : 'var(--color-sage)'}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  shape={(props: any) => {
                    const idx = typeof props.index === 'number' ? props.index : 0;
                    const x = typeof props.x === 'number' ? props.x : 0;
                    const y = typeof props.y === 'number' ? props.y : 0;
                    const width = typeof props.width === 'number' ? props.width : 0;
                    const height = typeof props.height === 'number' ? props.height : 0;
                    if (width <= 0 || height <= 0) return null;
                    return (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        rx={4}
                        ry={4}
                        fill={isDark ? 'var(--color-mint)' : 'var(--color-sage)'}
                        fillOpacity={0.85 - (idx * 0.08)}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>



      {/* Grid Showcase anchor */}
      <div id="showcase-anchor" className="scroll-mt-28" />

      {/* Primary Category Filter Menu */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-6 border-b border-hairline/20 dark:border-white/5 pb-6"
      >
        <span className="font-sans text-[13px] uppercase tracking-wider text-ink-soft/60 dark:text-mist/60 mr-2 flex items-center gap-1.5 font-medium">
          <SlidersHorizontal size={12} /> {t('bayjf.filter')}
        </span>
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              id={`filter-btn-${category.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                setSelectedCategory(category);
                setSelectedTagGroup('All'); // Reset tag filter on category change
              }}
              className={`interactive px-4 py-2 rounded-full font-sans text-[13px] uppercase tracking-wider font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-ink dark:bg-paper text-paper dark:text-ink shadow-sm'
                  : 'bg-paper-raised dark:bg-night-raised text-ink-soft dark:text-mist hover:bg-hairline/50 dark:hover:bg-night-hover'
              }`}
            >
              {categoryLabels[language][category] || category}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Navigation Bar to Filter Project Cards by specific Tag Groups */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-paper-raised dark:bg-night-raised rounded-2xl p-4"
      >
        {/* Left: Tag filter tabs */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-ink-soft/50 dark:text-mist/50 flex items-center gap-1">
            <Tag size={10} /> {localTxt.filterTags}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'All', label: localTxt.allTags },
              { id: 'Product', label: localTxt.designTag },
              { id: 'Engineering', label: localTxt.engTag },
              { id: 'Browser', label: localTxt.fullstackTag }
            ].map(group => {
              const isActive = selectedTagGroup === group.id;
              return (
                <button
                  key={group.id}
                  id={`tag-group-${group.id.toLowerCase()}`}
                  onClick={() => setSelectedTagGroup(group.id)}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-sans font-medium tracking-tight transition-all duration-200 ${
                    isActive
                      ? 'bg-sage dark:bg-mint text-paper dark:text-night shadow-sm'
                      : 'bg-transparent text-ink-soft dark:text-mist hover:bg-hairline/40 dark:hover:bg-white/5'
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Display mode toggle & Project counter */}
        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-hairline/20 pt-3 md:pt-0">
          <div className="text-right">
            <span className="font-sans text-sm font-semibold text-ink dark:text-paper block leading-none tracking-tight">
              {filteredProjects.length}
            </span>
            <span className="font-sans text-[11px] uppercase tracking-wider text-ink-soft/55 dark:text-mist/55">
              {localTxt.projectsCount}
            </span>
          </div>

          {/* Premium capsule view toggle selector */}
          <div className="flex items-center gap-2">
            <div className="flex bg-paper dark:bg-night p-1 rounded-full">
            <button
              onClick={() => setDisplayMode('grid')}
              id="display-mode-grid"
              aria-label={localTxt.viewGrid}
              title={localTxt.viewGrid}
              className={`p-2 rounded-full transition-all duration-200 ${displayMode === 'grid' ? 'bg-paper-raised dark:bg-night-raised text-ink dark:text-paper shadow-sm' : 'text-ink-soft/50 dark:text-mist/50 hover:text-ink dark:hover:text-paper'}`}
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setDisplayMode('timeline')}
              id="display-mode-timeline"
              aria-label={localTxt.viewTimeline}
              title={localTxt.viewTimeline}
              className={`p-2 rounded-full transition-all duration-200 ${displayMode === 'timeline' ? 'bg-paper-raised dark:bg-night-raised text-ink dark:text-paper shadow-sm' : 'text-ink-soft/50 dark:text-mist/50 hover:text-ink dark:hover:text-paper'}`}
            >
              <CalendarDays size={15} />
            </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Projects Grid Container / Chronological Timeline */}
      {filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 bg-paper-raised dark:bg-night-raised rounded-[28px] px-6"
        >
          <p className="font-sans text-2xl font-medium text-ink-soft/80 dark:text-mist/80 tracking-tight">
            {language === 'en' ? 'No projects match your criteria' : '没有符合当前条件的项目'}
          </p>
          <p className="font-sans text-sm text-ink-soft/50 dark:text-mist/50 mt-2 max-w-md mx-auto">
            {language === 'en'
              ? 'Try resetting the filters or searching for AI Agent, Full-Stack, Chrome Extension, or Supabase.'
              : '可以重置筛选，或搜索 AI Agent、全栈开发、Chrome 扩展、Supabase 等标签。'}
          </p>
        </motion.div>
      ) : displayMode === 'grid' ? (
        // Standard Grid View with Layout Animations
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
        >
          <AnimatePresence mode="sync">
            {filteredProjects.map((project) => {
              const cardFace = (
                <>
                {/* Hover-effect thumbnail container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-paper dark:bg-night border-b border-hairline/20 dark:border-white/5">
                  <BlurUpImage
                    src={project.image}
                    alt={project.title}
                    className="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Card Body */}
                <div className="flex flex-col flex-grow p-6 md:p-8">
                  {/* Category tag */}
                  <span className="font-sans text-[11px] font-medium tracking-wider text-sage dark:text-mint mb-2 uppercase flex items-center justify-between">
                    <span>{project.category}</span>
                    <span className="flex items-center gap-1">
                      {getProjectDate(project) && (
                        <span className="font-sans text-[8px] text-ink-soft/50 dark:text-mist/50 font-medium whitespace-nowrap shrink-0">{getProjectDate(project)}</span>
                      )}
                      <LikeButton projectId={project.id} source="grid" enlarged />
                    </span>
                  </span>

                  {/* Project Title */}
                  <h3 className="font-sans text-xl font-semibold text-ink dark:text-paper mb-3 tracking-tight group-hover:text-sage dark:group-hover:text-mint transition-colors duration-200">
                    {project.title}
                  </h3>

                  {/* Short Description */}
                  <p className="font-sans text-sm text-ink-soft dark:text-mist mb-6 line-clamp-3 leading-relaxed flex-grow">
                    {project.description}
                  </p>
                </div>
                </>
              );

              const card = (
              <TiltCard
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 32,
                  layout: { type: 'spring', stiffness: 350, damping: 32 }
                }}
                onClick={() => handleCardClick(project)}
                className="group flex flex-col h-full bg-paper-raised dark:bg-night-raised rounded-[28px] shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
              >
                {isComingSoon(project.id) ? (
                  <ComingSoonFlipCard
                    project={project}
                    flipped={flippedProjectId === project.id}
                    className="flex-1"
                    faceClassName="flex flex-col h-full"
                  >
                    {cardFace}
                  </ComingSoonFlipCard>
                ) : cardFace}
              </TiltCard>
              );
              return <Fragment key={project.id}>{card}</Fragment>;
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        // Chronological Interactive Timeline View
        <div className="timeline-container relative mt-8 flex flex-col space-y-16">
          {/* Vertical axis line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-hairline dark:border-white/10 transform md:-translate-x-1/2" />

          <AnimatePresence mode="popLayout">
            {timelineProjects.map((project, index) => {
              const isEven = index % 2 === 0;
              const timelineFace = (
                <>
                    <div className="w-full md:w-2/5 aspect-[16/11] rounded-2xl overflow-hidden bg-paper dark:bg-night flex-shrink-0">
                      <BlurUpImage src={project.image} alt={project.title} className="transition-transform duration-700 ease-out group-hover:scale-105" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-sans text-[11px] font-medium bg-sage/10 dark:bg-white/5 text-sage dark:text-mint px-2.5 py-1 rounded-full">
                            {project.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-sans text-[7px] text-ink-soft/50 dark:text-mist/50 font-medium whitespace-nowrap shrink-0">
                              {getProjectDate(project)}
                            </span>
                            <LikeButton projectId={project.id} source="timeline" enlarged />
                          </span>
                        </div>
                        <h3 className="font-sans text-xl font-semibold text-ink dark:text-paper mb-2 tracking-tight group-hover:text-sage dark:group-hover:text-mint transition-colors duration-200">
                          {project.title}
                        </h3>
                        <p className="font-sans text-sm text-ink-soft dark:text-mist line-clamp-2 mb-4 leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-hairline/20 dark:border-white/5">
                        <div className="flex gap-1">
                          {project.tags.slice(0, 2).map(t => (
                            <span key={t} className="font-sans text-[12px] bg-paper dark:bg-night px-2.5 py-1 rounded-full text-ink-soft dark:text-mist">{t}</span>
                          ))}
                        </div>
                        <a
                          href={`${language === 'zh' ? '/zh' : ''}/products/${project.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="text-[13px] font-medium tracking-tight text-ink dark:text-paper inline-flex items-center gap-1 group/btn active:scale-[0.97]"
                        >
                          {localTxt.viewDetails} <ArrowRight size={12} className="transform group-hover/btn:translate-x-1 transition-transform duration-200" />
                        </a>
                      </div>
                    </div>
                </>
              );
              return (
                <motion.div
                  layout
                  key={`timeline-${project.id}`}
                  initial={{ opacity: 0, x: isEven ? -60 : 60, y: 30 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  transition={{ duration: 0.7, ease: [0.215, 0.610, 0.355, 1.000] }}
                  className={`timeline-item relative w-full md:w-[calc(50%-2rem)] flex flex-col ${
                    isEven ? 'md:self-start md:pr-8' : 'md:self-end md:pl-8'
                  } pl-12 md:pl-0`}
                >
                  {/* Decorative connecting lines (connector physically connecting marker to card) */}
                  {/* Mobile connector: from marker to card */}
                  <div className="absolute left-4 md:hidden top-1/2 -translate-y-1/2 w-8 h-0.5 bg-hairline dark:bg-white/10 z-0" />
                  
                  {/* Desktop connector: from center timeline line to card */}
                  {isEven ? (
                    <div className="hidden md:block absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-0.5 bg-hairline dark:bg-white/10 z-0" />
                  ) : (
                    <div className="hidden md:block absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-0.5 bg-hairline dark:bg-white/10 z-0" />
                  )}

                  {/* Centered Timeline Node Circle with Year */}
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ink dark:bg-paper text-paper dark:text-ink border-4 border-hairline/60 dark:border-white/10 flex items-center justify-center transform -translate-x-1/2 md:translate-x-0 font-mono text-[10px] font-bold z-10 shadow-sm ${
                    isEven ? 'md:left-auto md:right-0 md:-right-12' : 'md:left-0 md:-left-12'
                  }`}>
                    {getProjectYear(project)}
                  </div>

                  {/* Card Content */}
                  <div
                    onClick={() => handleCardClick(project)}
                    className="w-full bg-paper-raised dark:bg-night-raised rounded-[28px] shadow-sm p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col md:flex-row gap-6 cursor-pointer group relative z-10"
                  >
                    {isComingSoon(project.id) ? (
                      <ComingSoonFlipCard
                        project={project}
                        flipped={flippedProjectId === project.id}
                        faceClassName="flex flex-col md:flex-row gap-6 w-full"
                      >
                        {timelineFace}
                      </ComingSoonFlipCard>
                    ) : timelineFace}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modern Expandable Case Study Modal */}
      <AnimatePresence>
        {activeProject && (
          <ProjectDetailModal
            project={activeProject}
            onClose={handleCloseProjectModal}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
